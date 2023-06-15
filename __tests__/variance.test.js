const AWS = require("aws-sdk");
const { DocumentClient } = require("aws-sdk/clients/dynamodb");
const {
  REGION,
  ENDPOINT,
  TABLE_NAME
} = require("./global/settings");
const { PARKSLIST } = require("./global/data.json");

const jwt = require("jsonwebtoken");
const tokenContent = {
  resource_access: { "attendance-and-revenue": { roles: ["sysadmin"] } },
};
const token = jwt.sign(tokenContent, "defaultSecret");

const suffix = "-varianceTest";
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

  await docClient
    .put({
      TableName: TABLE_NAME,
      Item: {
        pk: `variance::0001::Day Use`,
        sk: `2022-01-01`,
        fields: docClient.createSet([
          'peopleAndVehiclesVehicle'
        ]),
        note: 'A Note',
        resolved: false
      }
    })
    .promise();

  await docClient
    .put({
      TableName: TABLE_NAME,
      Item: {
        pk: `variance::0001::Day Use`,
        sk: `2022-01-02`,
        fields: docClient.createSet([
          'peopleAndVehiclesVehicle'
        ]),
        note: 'A Note',
        resolved: false
      }
    })
    .promise();
}

describe("Variance Test", () => {
  const mockedUnauthenticatedInvalidUser = {
    decodeJWT: jest.fn((event) => { }),
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
    decodeJWT: jest.fn((event) => { }),
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
    decodeJWT: jest.fn((event) => { }),
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
    decodeJWT: jest.fn((event) => { }),
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

  test("Variance GET Single SK Success", async () => {
    const axios = require("axios");
    jest.mock("axios");
    axios.post.mockImplementation(() =>
      Promise.resolve({ statusCode: 200, data: {} })
    );

    jest.mock("../lambda/permissionUtil", () => {
      return mockedSysadmin;
    });

    const varianceGET = require("../lambda/variance/GET/index");
    const response = await varianceGET.handler(
      {
        headers: {
          Authorization: "Bearer " + token,
        },
        queryStringParameters: {
          activity: "Day Use",
          date: "2022-01-01",
          subAreaId: "0001"
        }
      },
      null
    );
    const body = JSON.parse(response.body);
    expect(response.statusCode).toBe(200);
    expect(body.data.length === 1);
  });

  test("Variance GET FAIL 403 limited user", async () => {
    const axios = require("axios");
    jest.mock("axios");
    axios.post.mockImplementation(() =>
      Promise.resolve({ statusCode: 200, data: {} })
    );

    jest.mock("../lambda/permissionUtil", () => {
      return mockedLimitedUser;
    });

    const varianceGET = require("../lambda/variance/GET/index");
    const response = await varianceGET.handler(
      {
        headers: {
          Authorization: "Bearer " + token,
        },
        queryStringParameters: {
          activity: "Day Use",
          date: "2022-01-01",
          subAreaId: "0001"
        }
      },
      null
    );
    const body = JSON.parse(response.body);
    expect(response.statusCode).toBe(403);
    expect(response.body === "{ msg: 'Error: UnAuthenticated.' }")
  });

  test("Variance GET FAIL 403 public user", async () => {
    const axios = require("axios");
    jest.mock("axios");
    axios.post.mockImplementation(() =>
      Promise.resolve({ statusCode: 200, data: {} })
    );

    jest.mock("../lambda/permissionUtil", () => {
      return mockedUnauthenticatedInvalidUser;
    });

    const varianceGET = require("../lambda/variance/GET/index");
    const response = await varianceGET.handler(
      {
        headers: {
          Authorization: "Bearer " + token,
        },
        queryStringParameters: {
          activity: "Day Use",
          date: "2022-01-01",
          subAreaId: "0001"
        }
      },
      null
    );
    const body = JSON.parse(response.body);
    expect(response.statusCode).toBe(403);
    expect(response.body === "{ msg: 'Error: UnAuthenticated.' }")
  });

  test("Variance GET FAIL invalid params", async () => {
    const axios = require("axios");
    jest.mock("axios");
    axios.post.mockImplementation(() =>
      Promise.resolve({ statusCode: 200, data: {} })
    );

    jest.mock("../lambda/permissionUtil", () => {
      return mockedSysadmin;
    });

    const varianceGET = require("../lambda/variance/GET/index");
    const response = await varianceGET.handler(
      {
        headers: {
          Authorization: "Bearer " + token,
        },
        queryStringParameters: {
        }
      },
      null
    );
    const body = JSON.parse(response.body);
    expect(response.statusCode).toBe(400);
    expect(response.body === "{ msg: 'Invalid request.' }")
  });
});
