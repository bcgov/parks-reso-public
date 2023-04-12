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
// const testSubAreaList = [];

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

  for (let park of PARKSLIST) {
    park.sk = park.sk + suffix;
    park.orcs = park.orcs + suffix;

    let modifiedSubAreas = [];
    for (let subArea of park.subAreas) {
      subArea.id = subArea.id + suffix;
      modifiedSubAreas.push(subArea);
    }
    park.subAreas = modifiedSubAreas;

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
});
