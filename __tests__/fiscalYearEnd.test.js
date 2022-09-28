const AWS = require('aws-sdk');
const { DocumentClient } = require('aws-sdk/clients/dynamodb');
const { REGION, ENDPOINT, TABLE_NAME } = require('./global/settings');
const { FISCAL_YEAR_LOCKS } = require('./global/data.json');

const fiscalYearEndGET = require('../lambda/fiscalYearEnd/GET/index');
const fiscalYearEndPOST = require('../lambda/fiscalYearEnd/POST/index');

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

  for (const item of FISCAL_YEAR_LOCKS) {
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
  beforeAll(async () => {
    return await setupDb();
  });

  test('Handler - 200 GET fiscal year end', async () => {
    const obj = await fiscalYearEndGET.handler(
      {
        headers: {
          Authorization: "Bearer " + token
        },
        queryStringParameters: {
          fiscalYearEnd: FISCAL_YEAR_LOCKS[0].sk
        }
      }, null);
    expect(JSON.parse(obj.body)).toMatchObject(FISCAL_YEAR_LOCKS[0]);
  });

  test('Handler - 400 GET Bad Request', async () => {
    const response = await fiscalYearEndGET.handler({
      headers: {
        Authorization: "Bearer " + token
      },
      queryStringParameters: {
        badParam: "oops"
      }
    }, null);

    expect(response.statusCode).toBe(400);
  });

  test('HandleLock - 200 lock fiscal year', async () => {
    const response = await fiscalYearEndPOST.lockFiscalYear({
      headers: {
        Authorization: "Bearer " + token
      },
      queryStringParameters: {
        fiscalYearEnd: "2018"
      }
    }, null);

    expect(response.statusCode).toBe(200);
  });

  test('HandleLock - 200 unlock fiscal year', async () => {
    const response = await fiscalYearEndPOST.unlockFiscalYear({
      headers: {
        Authorization: "Bearer " + token
      },
      queryStringParameters: {
        fiscalYearEnd: "2018"
      }
    }, null);

    expect(response.statusCode).toBe(200);
  });

});