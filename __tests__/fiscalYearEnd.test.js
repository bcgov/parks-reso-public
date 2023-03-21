const AWS = require('aws-sdk');
const { DocumentClient } = require('aws-sdk/clients/dynamodb');
const { REGION, ENDPOINT, TABLE_NAME } = require('./global/settings');
const { FISCAL_YEAR_LOCKS2 } = require('./global/data.json');

const jwt = require('jsonwebtoken');
const token = jwt.sign({ resource_access: { 'attendance-and-revenue': { roles: ['sysadmin'] } } }, 'defaultSecret');

async function setupDb() {
  new AWS.DynamoDB({
    region: REGION,
    endpoint: ENDPOINT
  });
  docClient = new DocumentClient({
    region: REGION,
    endpoint: ENDPOINT,
    convertEmptyValues: true
  });

  for (const item of FISCAL_YEAR_LOCKS2) {
    await (genericPutDocument(item));
  }
}

async function genericPutDocument(item) {
  return await docClient
    .put({
      TableName: TABLE_NAME,
      Item: item
    })
    .promise();
}

describe('Fiscal Year End Test', () => {
  const mockedAuthenticatedUserNoRoles = {
    decodeJWT: jest.fn((event) => {
    }),
    resolvePermissions: jest.fn((token) => {
      return {
        isAdmin: false,
        roles: [],
        isAuthenticated: true
      }
    }),
    getParkAccess: jest.fn((orcs, permissionObject) => {
      return {};
    })
  };

  const mockedSysadmin = {
    decodeJWT: jest.fn((event) => {
    }),
    resolvePermissions: jest.fn((token) => {
      return {
        isAdmin: true,
        roles: ['sysadmin'],
        isAuthenticated: true
      }
    }),
    getParkAccess: jest.fn((orcs, permissionObject) => {
      return {};
    })
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

  test('Handler - 200 GET fiscal year end', async () => {
    jest.mock('../lambda/permissionUtil', () => {
      return mockedSysadmin;
    });
    const fiscalYearEndGET = require('../lambda/fiscalYearEnd/GET/index');
    const obj = await fiscalYearEndGET.handler(
      {
        headers: {
          Authorization: "Bearer " + token
        },
        queryStringParameters: {
          fiscalYearEnd: FISCAL_YEAR_LOCKS2[0].sk
        }
      }, null);
    expect(JSON.parse(obj.body)).toMatchObject(FISCAL_YEAR_LOCKS2[0]);
  });

  test('Handler - 200 GET All fiscal year end objects', async () => {
    jest.mock('../lambda/permissionUtil', () => {
      return mockedSysadmin;
    });
    const fiscalYearEndGET = require('../lambda/fiscalYearEnd/GET/index');
    const response = await fiscalYearEndGET.handler({
      headers: {
        Authorization: "Bearer " + token
      },
    }, null);

    expect(response.statusCode).toBe(200);
  });

  test('HandleLock - 200 lock fiscal year', async () => {
    jest.mock('../lambda/permissionUtil', () => {
      return mockedSysadmin;
    });
    const fiscalYearEndPOST = require('../lambda/fiscalYearEnd/POST/index');
    const response = await fiscalYearEndPOST.lockFiscalYear({
      headers: {
        Authorization: "Bearer " + token
      },
      queryStringParameters: {
        fiscalYearEnd: "2017"
      }
    }, null);

    expect(response.statusCode).toBe(200);
  });

  test('HandleLock - 200 unlock fiscal year', async () => {
    jest.mock('../lambda/permissionUtil', () => {
      return mockedSysadmin;
    });
    const fiscalYearEndPOST = require('../lambda/fiscalYearEnd/POST/index');
    const response = await fiscalYearEndPOST.unlockFiscalYear({
      headers: {
        Authorization: "Bearer " + token
      },
      queryStringParameters: {
        fiscalYearEnd: "2017"
      }
    }, null);

    expect(response.statusCode).toBe(200);
  });

  test('HandleLock - 403 unlock fiscal year without perms', async () => {
    jest.mock('../lambda/permissionUtil', () => {
      return mockedAuthenticatedUserNoRoles;
    });
    const fiscalYearEndPOST = require('../lambda/fiscalYearEnd/POST/index');
    const response = await fiscalYearEndPOST.unlockFiscalYear({
      headers: {
        Authorization: "Bearer " + token
      },
      queryStringParameters: {
        fiscalYearEnd: "2017"
      }
    }, null);

    expect(response.statusCode).toBe(403);
  });

});