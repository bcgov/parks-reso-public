const AWS = require("aws-sdk");
const { DocumentClient } = require("aws-sdk/clients/dynamodb");
const { REGION, ENDPOINT, TABLE_NAME } = require("./global/settings");
const {
  PARKSLIST,
  SUBAREAS,
  CONFIG_ENTRIES,
  SUBAREA_ENTRIES,
  FISCAL_YEAR_LOCKS,
} = require("./global/data.json");

const jwt = require("jsonwebtoken");
const token = jwt.sign(
  { resource_access: { "attendance-and-revenue": { roles: ["sysadmin"] } } },
  "defaultSecret"
);
const emptyRole = {
  resource_access: { "attendance-and-revenue": { roles: [""] } },
};

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

  for (const item of PARKSLIST) {
    await genericPutDocument(item);
  }
  for (const item of SUBAREAS) {
    await genericPutDocument(item);
  }
  for (const item of SUBAREA_ENTRIES) {
    await genericPutDocument(item);
  }
  for (const item of CONFIG_ENTRIES) {
    await genericPutDocument(item);
  }
  for (const item of FISCAL_YEAR_LOCKS) {
    await genericPutDocument(item);
  }
}

async function genericPutDocument(item) {
  return await docClient
    .put({
      TableName: TABLE_NAME,
      Item: item,
    })
    .promise();
}

describe("Activity Test", () => {
  const OLD_ENV = process.env;
  beforeEach(async () => {
    jest.resetModules();
    process.env = { ...OLD_ENV }; // Make a copy of environment
  });

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

  afterEach(() => {
    process.env = OLD_ENV; // Restore old environment
  });

  beforeAll(async () => {
    return await setupDb();
  });

  test("Handler - 200 GET specific activity entry", async () => {
    jest.mock("../lambda/permissionUtil", () => {
      return mockedSysadmin;
    });
    const activityGET = require("../lambda/activity/GET/index");
    const obj = await activityGET.handler(
      {
        headers: {
          Authorization: "Bearer " + token,
        },
        queryStringParameters: {
          orcs: SUBAREA_ENTRIES[0].orcs,
          subAreaId: SUBAREA_ENTRIES[0].pk.split("::")[0],
          activity: SUBAREA_ENTRIES[0].pk.split("::")[1],
          date: SUBAREA_ENTRIES[0].sk,
        },
      },
      null
    );
    expect(JSON.parse(obj.body)).toMatchObject(SUBAREA_ENTRIES[0]);
  });

  test("Handler - 403 GET Not Authenticated", async () => {
    jest.mock("../lambda/permissionUtil", () => {
      return mockedUnauthenticatedUser;
    });
    const activityGET = require("../lambda/activity/GET/index");
    const response = await activityGET.handler(
      {
        headers: {
          Authorization: "Bearer " + token,
        },
        queryStringParameters: {
          orcs: SUBAREA_ENTRIES[0].orcs,
          subAreaId: SUBAREA_ENTRIES[0].pk.split("::")[0],
          activity: SUBAREA_ENTRIES[0].pk.split("::")[1],
          date: SUBAREA_ENTRIES[0].sk,
        },
      },
      null
    );

    expect(response.statusCode).toBe(403);
  });

  test("Handler - 403 GET Unauthorized role", async () => {
    jest.mock("../lambda/permissionUtil", () => {
      return mockedUnauthenticatedUser;
    });
    const activityGET = require("../lambda/activity/GET/index");
    const response = await activityGET.handler(
      {
        headers: {
          Authorization: "Bearer " + token,
          PsuedoToken: emptyRole,
        },
        queryStringParameters: {
          orcs: SUBAREA_ENTRIES[0].orcs,
          subAreaId: SUBAREA_ENTRIES[0].pk.split("::")[0],
          activity: SUBAREA_ENTRIES[0].pk.split("::")[1],
          date: SUBAREA_ENTRIES[0].sk,
        },
      },
      null
    );

    expect(response.statusCode).toBe(403);
  });

  test("Subarea Handler - 400 GET Bad Request", async () => {
    jest.mock("../lambda/permissionUtil", () => {
      return mockedSysadmin;
    });
    const activityGET = require("../lambda/activity/GET/index");
    const response = await activityGET.handler(
      {
        headers: {
          Authorization: "Bearer " + token,
        },
        queryStringParameters: {
          badParam: "oops",
        },
      },
      null
    );

    expect(response.statusCode).toBe(400);
  });

  test("HandlePost - 200 POST handle Activity/Variances", async () => {
    jest.mock("../lambda/permissionUtil", () => {
      return mockedSysadmin;
    });
    const activityPOST = require("../lambda/activity/POST/index");
    // Setup the first record
    const response = await activityPOST.handlePost(
      {
        headers: {
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify({
          orcs: SUBAREA_ENTRIES[0].orcs,
          parkName: SUBAREA_ENTRIES[0].parkName,
          subAreaId: SUBAREA_ENTRIES[0].pk.split("::")[0],
          activity: SUBAREA_ENTRIES[0].pk.split("::")[1],
          date: "202201",
          peopleAndVehiclesTrail: 3,
          picnicRevenueGross: 50,
          peopleAndVehiclesVehicle: 5,
          peopleAndVehiclesBus: 5,
          picnicRevenueShelter: 5,
          picnicShelterPeople: 5,
          otherDayUsePeopleHotSprings: 5,
          otherDayUseRevenueHotSprings: 5,
          subAreaName: "TBD"
        }),
      },
      null
    );
    expect(response.statusCode).toBe(200);

    // Expect no variance to be created
    const doc = await docClient.get({
      TableName: TABLE_NAME,
      Key: {
        pk: `variance::${SUBAREA_ENTRIES[0].pk.split("::")[0]}::${SUBAREA_ENTRIES[0].pk.split("::")[1]}`,
        sk: "202201"
      },
    }).promise();
    expect(doc).toEqual({});

    // Change year and create a new record
    const secondResponse = await activityPOST.handlePost(
      {
        headers: {
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify({
          orcs: SUBAREA_ENTRIES[0].orcs,
          parkName: SUBAREA_ENTRIES[0].parkName,
          subAreaId: SUBAREA_ENTRIES[0].pk.split("::")[0],
          activity: SUBAREA_ENTRIES[0].pk.split("::")[1],
          date: "202301",
          peopleAndVehiclesTrail: 3,
          picnicRevenueGross: 5005,
          peopleAndVehiclesVehicle: 5,
          peopleAndVehiclesBus: 5,
          picnicRevenueShelter: 5,
          picnicShelterPeople: 5,
          otherDayUsePeopleHotSprings: 5,
          otherDayUseRevenueHotSprings: 5,
          subAreaName: "TBD"
        }),
      },
      null
    );
    expect(secondResponse.statusCode).toBe(200);

    // Expect variance to be created
    const doc2 = await docClient.get({
      TableName: TABLE_NAME,
      Key: {
        pk: `variance::${SUBAREA_ENTRIES[0].pk.split("::")[0]}::${SUBAREA_ENTRIES[0].pk.split("::")[1]}`,
        sk: "202301"
      },
    }).promise();
    expect(doc2.Item).toEqual({
      parkName: 'Cultus Lake Park',
      orcs: '0041',
      sk: '202301',
      pk: 'variance::0087::Day Use',
      fields: ['picnicRevenueGross'],
      resolved: false,
      subAreaName: 'TBD'
    });
  });

  test("Handler - 403 POST Not Authenticated", async () => {
    jest.mock("../lambda/permissionUtil", () => {
      return mockedUnauthenticatedUser;
    });
    const activityPOST = require("../lambda/activity/POST/index");
    const response = await activityPOST.handlePost(
      {
        headers: {
          Authorization: "Bearer " + token,
          PsuedoToken: "error", //{ resource_access: { 'attendance-and-revenue': { roles: [''] } } }
        },
        body: JSON.stringify({
          orcs: SUBAREA_ENTRIES[0].orcs,
          subAreaId: SUBAREA_ENTRIES[0].pk.split("::")[0],
          activity: SUBAREA_ENTRIES[0].pk.split("::")[1],
          date: "202201",
        }),
      },
      null
    );

    expect(response.statusCode).toBe(403);
  });

  test("Handler - 403 POST Unauthorized role", async () => {
    jest.mock("../lambda/permissionUtil", () => {
      return mockedUnauthenticatedUser;
    });
    const activityPOST = require("../lambda/activity/POST/index");
    const response = await activityPOST.handlePost(
      {
        headers: {
          Authorization: "Bearer " + token,
          PsuedoToken: emptyRole,
        },
        body: JSON.stringify({
          orcs: SUBAREA_ENTRIES[0].orcs,
          subAreaId: SUBAREA_ENTRIES[0].pk.split("::")[0],
          activity: SUBAREA_ENTRIES[0].pk.split("::")[1],
          date: "202201",
        }),
      },
      null
    );

    expect(response.statusCode).toBe(403);
  });

  // note: CONFIG POST disabled 2022-09-27

  test("HandlePost - 400 POST handle Activity", async () => {
    jest.mock("../lambda/permissionUtil", () => {
      return mockedSysadmin;
    });
    const activityPOST = require("../lambda/activity/POST/index");
    const response = await activityPOST.handlePost(
      {
        headers: {
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify({
          orcs: SUBAREA_ENTRIES[0].orcs,
        }),
      },
      null
    );
    expect(response.statusCode).toBe(400);
  });

  test("HandlePost - 400 POST handle Activity", async () => {
    jest.mock("../lambda/permissionUtil", () => {
      return mockedSysadmin;
    });
    const activityPOST = require("../lambda/activity/POST/index");
    const response = await activityPOST.handlePost(
      {
        headers: {
          Authorization: "Bearer " + token,
        },
      },
      null
    );
    expect(response.statusCode).toBe(400);
  });

  test("HandlePost - 400 POST handle Activity date", async () => {
    jest.mock("../lambda/permissionUtil", () => {
      return mockedSysadmin;
    });
    const activityPOST = require("../lambda/activity/POST/index");
    const response = await activityPOST.handlePost(
      {
        headers: {
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify({
          orcs: SUBAREA_ENTRIES[0].orcs,
          subAreaId: SUBAREA_ENTRIES[0].pk.split("::")[0],
          activity: SUBAREA_ENTRIES[0].pk.split("::")[1],
          date: "2022", // Invalid
        }),
      },
      null
    );
    expect(response.statusCode).toBe(400);
  });

  test("HandlePost - 400 POST Bad Request", async () => {
    jest.mock("../lambda/permissionUtil", () => {
      return mockedSysadmin;
    });
    const activityPOST = require("../lambda/activity/POST/index");
    const response = await activityPOST.handlePost(
      {
        headers: {
          Authorization: "Bearer " + token,
        },
        body: {
          badParam: "{xxxxxx}",
        },
      },
      null
    );

    expect(response.statusCode).toBe(400);
  });

  test("HandleLock - 200 POST lock record", async () => {
    jest.mock("../lambda/permissionUtil", () => {
      return mockedSysadmin;
    });
    const activityPOST = require("../lambda/activity/POST/index");
    const response = await activityPOST.handleLock(
      {
        headers: {
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify({
          orcs: SUBAREA_ENTRIES[3].orcs,
          subAreaId: SUBAREA_ENTRIES[3].pk.split("::")[0],
          activity: SUBAREA_ENTRIES[3].pk.split("::")[1],
          date: "201901",
        }),
      },
      null
    );
    expect(response.statusCode).toBe(200);
  });

  test("HandlePost - 409 POST to locked record", async () => {
    jest.mock("../lambda/permissionUtil", () => {
      return mockedSysadmin;
    });
    const activityPOST = require("../lambda/activity/POST/index");
    const response = await activityPOST.handlePost(
      {
        headers: {
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify({
          orcs: SUBAREA_ENTRIES[3].orcs,
          subAreaId: SUBAREA_ENTRIES[3].pk.split("::")[0],
          activity: SUBAREA_ENTRIES[3].pk.split("::")[1],
          date: "201901", // should be locked as per previous test
        }),
      },
      null
    );
    expect(response.statusCode).toBe(409);
  });

  test("HandleUnlock - 200 POST unlock record", async () => {
    jest.mock("../lambda/permissionUtil", () => {
      return mockedSysadmin;
    });
    const activityPOST = require("../lambda/activity/POST/index");
    const response = await activityPOST.handleUnlock(
      {
        headers: {
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify({
          orcs: SUBAREA_ENTRIES[3].orcs,
          subAreaId: SUBAREA_ENTRIES[3].pk.split("::")[0],
          activity: SUBAREA_ENTRIES[3].pk.split("::")[1],
          date: "201901",
        }),
      },
      null
    );
    expect(response.statusCode).toBe(200);
  });

  test("Handler - 403 POST to locked fiscal year", async () => {
    jest.mock("../lambda/permissionUtil", () => {
      return mockedSysadmin;
    });
    const activityPOST = require("../lambda/activity/POST/index");
    const response = await activityPOST.handlePost(
      {
        headers: {
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify({
          orcs: SUBAREA_ENTRIES[2].orcs,
          subAreaId: SUBAREA_ENTRIES[2].pk.split("::")[0],
          activity: SUBAREA_ENTRIES[2].pk.split("::")[1],
          date: "201801", // Fiscal year is locked
        }),
      },
      null
    );
    expect(response.statusCode).toBe(403);
  });
});
