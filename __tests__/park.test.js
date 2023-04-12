const AWS = require("aws-sdk");
const { DocumentClient } = require("aws-sdk/clients/dynamodb");
const { REGION, ENDPOINT, TABLE_NAME } = require("./global/settings");
const { PARKSLIST, SUBAREAS } = require("./global/data.json");

const jwt = require("jsonwebtoken");
const tokenContent = {
  resource_access: { "attendance-and-revenue": { roles: ["sysadmin"] } },
};
const token = jwt.sign(tokenContent, "defaultSecret");

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

  for (const park of PARKSLIST) {
    await docClient
      .put({
        TableName: TABLE_NAME,
        Item: park,
      })
      .promise();
  }

  for (const subarea of SUBAREAS) {
    await docClient
      .put({
        TableName: TABLE_NAME,
        Item: subarea,
      })
      .promise();
  }
}

describe("Park Test", () => {
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

  test("Handler - 200 Received list of parks", async () => {
    const event = {
      headers: {
        Authorization: "Bearer " + token,
      },
      httpMethod: "GET",
    };
    // Ignore legacy parks for now.
    let modifiedParksList = [...PARKSLIST];
    for (const [index, park] of modifiedParksList.entries()) {
      if (park.hasOwnProperty("isLegacy")) {
        modifiedParksList.splice(index, 1);
      }
    }
    jest.mock("../lambda/permissionUtil", () => {
      return mockedSysadmin;
    });
    const parkGET = require("../lambda/park/GET/index");
    const response = await parkGET.handler(event, null);
    expect(response.statusCode).toBe(200);
  });

  test("Handler - 200 Receive list of parks with limited role", async () => {
    let specificSubAreas = [];
    for (const area of SUBAREAS) {
      if (area.pk === "park::0041") {
        specificSubAreas.push(area);
      }
    }
    jest.mock("../lambda/permissionUtil", () => {
      return mockedLimitedUser;
    });
    const parkGET = require("../lambda/park/GET/index");
    const response = await parkGET.handler(
      {
        headers: {
          Authorization: "Bearer " + token,
        },
      },
      null
    );

    const body = JSON.parse(response.body);
    // Body should be empty
    expect(body).toMatchObject([
      {
        orcs: "0041",
        parkName: "Cultus Lake Park",
        pk: "park",
        sk: "0041",
        subAreas: [],
      },
    ]);
  });

  test("Handler - 200 Receive park specific information", async () => {
    let specificSubAreas = [];
    for (const area of SUBAREAS) {
      if (area.pk === "park::0041") {
        specificSubAreas.push(area);
      }
    }
    jest.mock("../lambda/permissionUtil", () => {
      return mockedSysadmin;
    });
    const parkGET = require("../lambda/park/GET/index");
    const response = await parkGET.handler(
      {
        headers: {
          Authorization: "Bearer " + token,
        },
        queryStringParameters: {
          orcs: PARKSLIST[0].sk,
          subAreaId: specificSubAreas[0].sk,
        },
      },
      null
    );

    const body = JSON.parse(response.body);
    expect(body.data[0].subAreaName).toMatch(specificSubAreas[0].subAreaName);
    expect(response.statusCode).toBe(200);
  });

  test("Handler - 200 Receive park specific information with limited role", async () => {
    let specificSubAreas = [];
    for (const area of SUBAREAS) {
      if (area.pk === "park::0041") {
        specificSubAreas.push(area);
      }
    }
    jest.mock("../lambda/permissionUtil", () => {
      return mockedLimitedUser;
    });
    const parkGET = require("../lambda/park/GET/index");
    const response = await parkGET.handler(
      {
        headers: {
          Authorization: "Bearer " + token,
        },
        queryStringParameters: {
          orcs: PARKSLIST[0].sk,
          subAreaId: specificSubAreas[0].sk,
        },
      },
      null
    );
    const body = JSON.parse(response.body);
    expect(body.data[0].sk).toMatch(specificSubAreas[0].sk);
    expect(response.statusCode).toBe(200);
  });

  test("Handler - 403 GET Invalid", async () => {
    jest.mock("../lambda/permissionUtil", () => {
      return mockedUnauthenticatedInvalidUser;
    });
    const parkGET = require("../lambda/park/GET/index");
    const response = await parkGET.handler(
      {
        headers: {
          Authorization: "Bearer " + token + "invalid",
        },
      },
      null
    );

    expect(response.statusCode).toBe(403);
    expect(response.body).toBe('{"msg":"Error: UnAuthenticated."}');
  });

  test("Handler - 400 GET Bad Request", async () => {
    jest.mock("../lambda/permissionUtil", () => {
      return mockedSysadmin;
    });
    const parkGET = require("../lambda/park/GET/index");
    const response = await parkGET.handler(
      {
        headers: {
          Authorization: "Bearer " + token + "invalid",
        },
        queryStringParameters: {
          badParam: "oops",
        },
      },
      null
    );

    expect(response.statusCode).toBe(400);
  });

  test("Handler - 400 POST Bad Request", async () => {
    jest.mock("../lambda/permissionUtil", () => {
      return mockedSysadmin;
    });
    const parkPOST = require("../lambda/park/POST/index");
    const response = await parkPOST.handler(
      {
        headers: {
          Authorization: "Bearer " + token + "invalid",
        },
        body: JSON.stringify({
          badParam: "{xxxxxx}",
        }),
      },
      null
    );

    expect(response.statusCode).toBe(400);
  });

  test("Handler - 400 POST Park", async () => {
    jest.mock("../lambda/permissionUtil", () => {
      return mockedSysadmin;
    });
    const parkPOST = require("../lambda/park/POST/index");
    const response = await parkPOST.handler(
      {
        headers: {
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify({
          orcs: "0000",
          someconfig: "test",
        }),
      },
      null
    );

    expect(response.statusCode).toBe(400);
  });

  test("Handler - 200 POST Park", async () => {
    jest.mock("../lambda/permissionUtil", () => {
      return mockedSysadmin;
    });
    const parkPOST = require("../lambda/park/POST/index");
    const response = await parkPOST.handler(
      {
        headers: {
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify({
          orcs: "0000",
          parkName: "test",
        }),
      },
      null
    );

    expect(response.statusCode).toBe(200);
  });

  test("Handler - 403 POST Park Invalid User", async () => {
    jest.mock("../lambda/permissionUtil", () => {
      return mockedUnauthenticatedInvalidUser;
    });
    const parkPOST = require("../lambda/park/POST/index");
    const response = await parkPOST.handler(
      {
        headers: {
          Authorization: "Bearer " + token + "invalid",
        },
      },
      null
    );

    expect(response.statusCode).toBe(403);
  });

  test("Handler - 403 POST Park Unauthorized User", async () => {
    jest.mock("../lambda/permissionUtil", () => {
      return mockedUnauthenticatedUser;
    });
    const parkPOST = require("../lambda/park/POST/index");
    const response = await parkPOST.handler(
      {
        headers: {
          Authorization: "Bearer " + token + "invalid",
        },
      },
      null
    );

    expect(response.statusCode).toBe(403);
  });
});
