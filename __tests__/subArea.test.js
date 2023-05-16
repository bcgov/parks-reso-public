const AWS = require("aws-sdk");
const { DocumentClient } = require("aws-sdk/clients/dynamodb");
const {
  REGION,
  ENDPOINT,
  TABLE_NAME,
  CONFIG_TABLE_NAME,
} = require("./global/settings");
const { PARKSLIST } = require("./global/data.json");

const jwt = require("jsonwebtoken");
const tokenContent = {
  resource_access: { "attendance-and-revenue": { roles: ["sysadmin"] } },
};
const token = jwt.sign(tokenContent, "defaultSecret");

const suffix = "-subAreaTest";
const testParkList = [];

async function setupDb() {
  new AWS.DynamoDB({
    region: REGION,
    endpoint: ENDPOINT,
  });
  docClient = new DocumentClient({
    region: REGION,
    endpoint: ENDPOINT,
    convertEmptyValues: true,
  });

  for await (let park of PARKSLIST) {
    park.sk = park.sk + suffix;
    park.orcs = park.orcs + suffix;
    subAreaParkIdToDelete = park;

    let modifiedSubAreas = [];
    for await (let subArea of park.subAreas) {
      subArea.id = subArea.id + suffix;
      subAreaToDelete = subArea;
      modifiedSubAreas.push(subArea);

      // Add the sub area record
      console.log("subarea record:", {
        pk: `park::${park.orcs}`,
        sk: `${subArea.id}`,
        activities: docClient.createSet([
          'Day Use'
        ])
      });
      await docClient
        .put({
          TableName: TABLE_NAME,
          Item: {
            pk: `park::${park.orcs}`,
            sk: `${subArea.id}`,
            activities: docClient.createSet([
              'Day Use'
            ])
          }
        })
        .promise();
      
      // Add the activity config
      await docClient
        .put({
          TableName: TABLE_NAME,
          Item: {
            pk: `config::${subArea.id}`,
            sk: `Day Use`
          }
        })
        .promise();

      console.log("activity config", {
        pk: `config::${subArea.id}`,
        sk: `Day Use`
      })

      // Add the activity record
      await docClient
        .put({
          TableName: TABLE_NAME,
          Item: {
            pk: `${subArea.id}::Day Use`,
            sk: `202201`
          }
        })
        .promise();

      console.log("activity record", {
        pk: `${subArea.id}::Day Use`,
        sk: `202201`
      })
    }
    park.subAreas = modifiedSubAreas;

    // Add the park record
    await docClient
      .put({
        TableName: TABLE_NAME,
        Item: park,
      })
      .promise();

    testParkList.push(park);
  }
}

describe("Sub Area Test", () => {
  const mockedUnauthenticatedInvalidUser = {
    decodeJWT: jest.fn((event) => {}),
    resolvePermissions: jest.fn((token) => {
      return {
        isAdmin: false,
        roles: [],
        isAuthenticated: false,
      };
    }),
    getParkAccess: jest.fn((orcs, permissionObject) => {
      return {};
    }),
  };

  const mockedLimitedUser = {
    decodeJWT: jest.fn((event) => {}),
    resolvePermissions: jest.fn((token) => {
      return {
        isAdmin: false,
        roles: ["0041:0084"],
        isAuthenticated: true,
      };
    }),
    getParkAccess: jest.fn((orcs, permissionObject) => {
      return {};
    }),
    roleFilter: jest.fn((records, roles) => {
      return records.filter((park) => park.orcs === "0041");
    }),
  };

  const mockedUnauthenticatedUser = {
    decodeJWT: jest.fn((event) => {}),
    resolvePermissions: jest.fn((token) => {
      return {
        isAdmin: false,
        roles: [],
        isAuthenticated: false,
      };
    }),
    getParkAccess: jest.fn((orcs, permissionObject) => {
      return {};
    }),
  };

  const mockedSysadmin = {
    decodeJWT: jest.fn((event) => {}),
    resolvePermissions: jest.fn((token) => {
      return {
        isAdmin: true,
        roles: ["sysadmin"],
        isAuthenticated: true,
      };
    }),
    getParkAccess: jest.fn((orcs, permissionObject) => {
      return {};
    }),
  };

  const OLD_ENV = process.env;
  beforeEach(async () => {
    jest.resetModules();
    process.env = { ...OLD_ENV }; // Make a copy of environment
  });

  afterEach(() => {
    process.env = OLD_ENV; // Restore old environment
  });

  beforeAll(async () => {
    return await setupDb();
  });

  test("Handler - 200 Sub Area POST Success", async () => {
    const axios = require("axios");
    jest.mock("axios");
    axios.post.mockImplementation(() =>
      Promise.resolve({ statusCode: 200, data: {} })
    );

    jest.mock("../lambda/permissionUtil", () => {
      return mockedSysadmin;
    });

    let config = await docClient
      .get({
        TableName: CONFIG_TABLE_NAME,
        Key: {
          pk: "subAreaID",
        },
      })
      .promise();
    const lastID = Object.keys(config).length === 0 ? 0 : config.Item.lastID;

    const subAreaPOST = require("../lambda/subArea/POST/index");
    const response = await subAreaPOST.handler(
      {
        headers: {
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify({
          activities: ["Day Use"],
          orcs: "0041" + suffix,
          managementArea: "South Fraser",
          section: "South Coast",
          region: "South Coast",
          bundle: "South Fraser",
          subAreaName: "Clear Creek",
        }),
      },
      null
    );
    expect(response.statusCode).toBe(200);

    config = await docClient
      .get({
        TableName: CONFIG_TABLE_NAME,
        Key: {
          pk: "subAreaID",
        },
      })
      .promise();

    // check for incremented subAreaID
    expect(config.Item.lastID).toBeGreaterThan(lastID);
  });

  test("Handler - 403 Sub Area POST Unauthenticated", async () => {
    const axios = require("axios");
    jest.mock("axios");
    axios.post.mockImplementation(() =>
      Promise.resolve({ statusCode: 200, data: {} })
    );

    jest.mock("../lambda/permissionUtil", () => {
      return mockedUnauthenticatedInvalidUser;
    });
    const subAreaPOST = require("../lambda/subArea/POST/index");
    const response = await subAreaPOST.handler(
      {
        headers: {
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify({
          activities: ["Day Use"],
          orcs: "0041" + suffix,
          managementArea: "South Fraser",
          section: "South Coast",
          region: "South Coast",
          bundle: "South Fraser",
          subAreaName: "Clear Creek",
        }),
      },
      null
    );
    expect(response.statusCode).toBe(403);
  });

  test("Handler - 403 Sub Area POST Unauthenticated Invalid User", async () => {
    const axios = require("axios");
    jest.mock("axios");
    axios.post.mockImplementation(() =>
      Promise.resolve({ statusCode: 200, data: {} })
    );

    jest.mock("../lambda/permissionUtil", () => {
      return mockedUnauthenticatedInvalidUser;
    });
    const subAreaPOST = require("../lambda/subArea/POST/index");
    const response = await subAreaPOST.handler(
      {
        headers: {
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify({
          activities: ["Day Use"],
          orcs: "0041" + suffix,
          managementArea: "South Fraser",
          section: "South Coast",
          region: "South Coast",
          bundle: "South Fraser",
          subAreaName: "Clear Creek",
        }),
      },
      null
    );
    expect(response.statusCode).toBe(403);
  });

  test("Handler - 403 Sub Area POST Unauthenticated", async () => {
    const axios = require("axios");
    jest.mock("axios");
    axios.post.mockImplementation(() =>
      Promise.resolve({ statusCode: 200, data: {} })
    );

    jest.mock("../lambda/permissionUtil", () => {
      return mockedUnauthenticatedUser;
    });
    const subAreaPOST = require("../lambda/subArea/POST/index");
    const response = await subAreaPOST.handler(
      {
        headers: {
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify({
          activities: ["Day Use"],
          orcs: "0041" + suffix,
          managementArea: "South Fraser",
          section: "South Coast",
          region: "South Coast",
          bundle: "South Fraser",
          subAreaName: "Clear Creek",
        }),
      },
      null
    );
    expect(response.statusCode).toBe(403);
    expect(response.body).toBe('{"msg":"Unauthenticated."}');
  });

  test("Handler - 403 Sub Area POST Not Admin", async () => {
    const axios = require("axios");
    jest.mock("axios");
    axios.post.mockImplementation(() =>
      Promise.resolve({ statusCode: 200, data: {} })
    );

    jest.mock("../lambda/permissionUtil", () => {
      return mockedLimitedUser;
    });
    const subAreaPOST = require("../lambda/subArea/POST/index");
    const response = await subAreaPOST.handler(
      {
        headers: {
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify({
          activities: ["Day Use"],
          orcs: "0041" + suffix,
          managementArea: "South Fraser",
          section: "South Coast",
          region: "South Coast",
          bundle: "South Fraser",
          subAreaName: "Clear Creek",
        }),
      },
      null
    );
    expect(response.statusCode).toBe(403);
    expect(response.body).toBe('{"msg":"Unauthorized."}');
  });

  test("Handler - 400 Sub Area POST Invalid body", async () => {
    const axios = require("axios");
    jest.mock("axios");
    axios.post.mockImplementation(() =>
      Promise.resolve({ statusCode: 200, data: {} })
    );

    jest.mock("../lambda/permissionUtil", () => {
      return mockedSysadmin;
    });
    const subAreaPOST = require("../lambda/subArea/POST/index");
    const response = await subAreaPOST.handler(
      {
        headers: {
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify({
          activities: ["Day Use"],
          managementArea: "South Fraser",
          section: "South Coast",
          region: "South Coast",
          bundle: "South Fraser",
          subAreaName: "Clear Creek",
        }),
      },
      null
    );
    expect(response.statusCode).toBe(400);
    expect(response.body).toBe('{"msg":"Invalid body"}');
  });

  test("Handler - 400 Sub Area POST Park Not Found", async () => {
    const axios = require("axios");
    jest.mock("axios");
    axios.post.mockImplementation(() =>
      Promise.resolve({ statusCode: 200, data: {} })
    );

    jest.mock("../lambda/permissionUtil", () => {
      return mockedSysadmin;
    });
    const subAreaPOST = require("../lambda/subArea/POST/index");
    const response = await subAreaPOST.handler(
      {
        headers: {
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify({
          activities: ["Day Use"],
          orcs: "fakeOrc",
          managementArea: "South Fraser",
          section: "South Coast",
          region: "South Coast",
          bundle: "South Fraser",
          subAreaName: "Clear Creek",
        }),
      },
      null
    );
    expect(response.statusCode).toBe(400);
    expect(response.body).toBe('{"msg":"Invalid request"}');
  });

  test("Handler - 400 Sub Area DELETE Bad Request", async () => {
    // Returns if there are no query string parameters
    const subAreaDELETE = require("../lambda/subArea/DELETE/index");
    const response = await subAreaDELETE.handler(
      {
        headers: {
          Authorization: "Bearer " + token,
        },
    });
    expect(response.statusCode).toBe(400);
  });

  test("Handler - 403 Sub Area DELETE Not Admin", async () => {
    const axios = require("axios");
    jest.mock("axios");
    axios.delete.mockImplementation(() =>
      Promise.resolve({ statusCode: 200, data: {} })
    );

    jest.mock("../lambda/permissionUtil", () => {
      return {
        requirePermissions: () => {
          throw {
            statusCode: 403,
            msg: "Not authorized."
          }
        }
      };
    });
    const subAreaDELETE = require("../lambda/subArea/DELETE/index");
    const response = await subAreaDELETE.handler(
      {
        headers: {
          Authorization: "Bearer " + token,
        },
        queryStringParameters: {
          orcs: "0041" + suffix,
          archive: "false",
          subAreaId: "fakeSubAreaId"
        },
      },
      null
    );
    expect(response.statusCode).toBe(403);
    expect(response.body).toBe("\"Not authorized.\"");
  });

  test("Handler - 403 Sub Area DELETE Unauthenticated", async () => {
    const axios = require("axios");
    jest.mock("axios");
    axios.delete.mockImplementation(() =>
      Promise.resolve({ statusCode: 200, data: {} })
    );

    jest.mock("../lambda/permissionUtil", () => {
      return {
        requirePermissions: () =>  {
          throw {
            statusCode: 403,
            msg: "Unauthenticated."
          }
        }
      };
    });
    const subAreaDELETE = require("../lambda/subArea/DELETE/index");
    const response = await subAreaDELETE.handler(
      {
        headers: {
          Authorization: "Bearer " + token,
        },
        queryStringParameters: {
          orcs: "0041" + suffix,
          archive: "false",
          subAreaId: "fakeSubAreaId"
        },
      },
      null
    );
    expect(response.statusCode).toBe(403);
    expect(response.body).toBe("\"Unauthenticated.\"");
  });

  test("Handler - 404 Sub Area soft DELETE not found", async () => {
    const axios = require("axios");
    jest.mock("axios");
    axios.delete.mockImplementation(() =>
      Promise.resolve({ statusCode: 200, data: {} })
    );

    jest.mock("../lambda/permissionUtil", () => {
      return {
        requirePermissions: () => {
          return {
            isAdmin: true,
            isSysadmin: true,
          };
        },
      };
    });
    const subAreaDELETE = require("../lambda/subArea/DELETE/index");
    const response = await subAreaDELETE.handler(
      {
        headers: {
          Authorization: "Bearer " + token,
        },
        queryStringParameters: {
          orcs: "0041" + suffix,
          archive: "true",
          subAreaId: "fakeSubAreaId"
        },
      },
      null
    );
    expect(response.statusCode).toBe(404);
    expect(response.body).toBe("{\"msg\":\"SubAreaId fakeSubAreaId not found\"}");
  });

  test("Handler - 200 Sub Area soft DELETE success", async () => {
    const axios = require("axios");
    jest.mock("axios");
    axios.delete.mockImplementation(() =>
      Promise.resolve({ statusCode: 200, data: {} })
    );

    jest.mock("../lambda/permissionUtil", () => {
      return {
        requirePermissions: () => {
          return {
            isAdmin: true,
            isSysadmin: true,
          };
        },
      };
    });
    const subAreaDELETE = require("../lambda/subArea/DELETE/index");
    const parkObject = PARKSLIST[1];
    const qsp = {
      orcs: parkObject.orcs,
      archive: "true",
      subAreaId: parkObject.subAreas[0].id
    };
    const response = await subAreaDELETE.handler(
      {
        headers: {
          Authorization: "Bearer " + token,
        },
        queryStringParameters: qsp,
      },
      null
    );
    expect(response.statusCode).toBe(200);
    expect(response.body).toBe("{\"msg\":\"SubArea archived\"}");
  });

  test("Handler - 200 Sub Area hard DELETE Success", async () => {
    const axios = require("axios");
    jest.mock("axios");
    axios.delete.mockImplementation(() =>
      Promise.resolve({ statusCode: 200, data: {} })
    );

    jest.mock("../lambda/permissionUtil", () => {
      return {
        requirePermissions: () => {
          return {
            isAdmin: true,
            isSysadmin: true,
          };
        },
      };
    });
    const subAreaDELETE = require("../lambda/subArea/DELETE/index");

    // Delete the first subarea from PARKSLIST
    const parkObject = PARKSLIST[0];
    const qsp = {
      orcs: parkObject.orcs,
      archive: "false",
      subAreaId: parkObject.subAreas[0].id
    };
    const response = await subAreaDELETE.handler(
      {
        headers: {
          Authorization: "Bearer " + token,
        },
        queryStringParameters: qsp,
      },
      null
    );
    expect(response.statusCode).toBe(200);
  });
});
