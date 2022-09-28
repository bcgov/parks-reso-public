const AWS = require('aws-sdk');
const { DocumentClient } = require('aws-sdk/clients/dynamodb');
const { REGION, ENDPOINT, TABLE_NAME } = require('./global/settings');
const { PARKSLIST, SUBAREAS, CONFIG_ENTRIES, SUBAREA_ENTRIES, FISCAL_YEAR_LOCKS } = require('./global/data.json');

const subareaGET = require('../lambda/subarea/GET/index');
const subareaPOST = require('../lambda/subarea/POST/index');

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

  for (const item of PARKSLIST) {
    await (genericPutDocument(item));
  }
  for (const item of SUBAREAS) {
    await (genericPutDocument(item));
  }
  for (const item of SUBAREA_ENTRIES) {
    await (genericPutDocument(item));
  }
  for (const item of CONFIG_ENTRIES) {
    await (genericPutDocument(item));
  }
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

describe('Subarea Test', () => {
  beforeAll(async () => {
    return await setupDb();
  });

  test('Handler - 200 GET specific activity entry', async () => {
    const obj = await subareaGET.handler(
      {
        headers: {
          Authorization: "Bearer " + token
        },
        queryStringParameters: {
          orcs: SUBAREA_ENTRIES[0].orcs,
          subAreaId: SUBAREA_ENTRIES[0].pk.split("::")[0],
          activity: SUBAREA_ENTRIES[0].pk.split("::")[1],
          date: SUBAREA_ENTRIES[0].sk
        }
      }, null);
    expect(JSON.parse(obj.body)).toMatchObject(SUBAREA_ENTRIES[0]);
  });

  test('Handler - 400 GET Bad Request', async () => {
    const response = await subareaGET.handler({
      headers: {
        Authorization: "Bearer " + token
      },
      queryStringParameters: {
        badParam: "oops"
      }
    }, null);

    expect(response.statusCode).toBe(400);
  });

  test('HandlePost - 200 POST handle Activity', async () => {
    const response = await subareaPOST.handlePost(
      {
        headers: {
          Authorization: "Bearer " + token
        },
        body: JSON.stringify({
          orcs: SUBAREA_ENTRIES[0].orcs,
          subAreaId: SUBAREA_ENTRIES[0].pk.split("::")[0],
          activity: SUBAREA_ENTRIES[0].pk.split("::")[1],
          date: "202201"
        })
      }, null);
    expect(response.statusCode).toBe(200);
  });

  // note: CONFIG POST disabled 2022-09-27

  test('HandlePost - 400 POST handle Activity', async () => {
    const response = await subareaPOST.handlePost(
      {
        headers: {
          Authorization: "Bearer " + token
        },
        body: JSON.stringify({
          orcs: SUBAREA_ENTRIES[0].orcs,
        })
      }, null);
    expect(response.statusCode).toBe(400);
  });

  test('HandlePost - 400 POST handle Activity', async () => {
    const response = await subareaPOST.handlePost(
      {
        headers: {
          Authorization: "Bearer " + token
        },
      }, null);
    expect(response.statusCode).toBe(400);
  });

  test('HandlePost - 400 POST handle Activity date', async () => {
    const response = await subareaPOST.handlePost(
      {
        headers: {
          Authorization: "Bearer " + token
        },
        body: JSON.stringify({
          orcs: SUBAREA_ENTRIES[0].orcs,
          subAreaId: SUBAREA_ENTRIES[0].pk.split("::")[0],
          activity: SUBAREA_ENTRIES[0].pk.split("::")[1],
          date: "2022" // Invalid
        })
      }, null);
    expect(response.statusCode).toBe(400);
  });

  test('HandlePost - 400 POST Bad Request', async () => {
    const response = await subareaPOST.handlePost({
      headers: {
        Authorization: "Bearer " + token
      },
      body: {
        badParam: "{xxxxxx}"
      }
    }, null);

    expect(response.statusCode).toBe(400);
  });

  test('HandleLock - 200 POST lock record', async () => {
    const response = await subareaPOST.handleLock(
      {
        headers: {
          Authorization: "Bearer " + token
        },
        body: JSON.stringify({
          orcs: SUBAREA_ENTRIES[3].orcs,
          subAreaId: SUBAREA_ENTRIES[3].pk.split("::")[0],
          activity: SUBAREA_ENTRIES[3].pk.split("::")[1],
          date: "201901"
        })
      }, null);
    expect(response.statusCode).toBe(200);
  });

  test('HandlePost - 409 POST to locked record', async () => {
    const response = await subareaPOST.handlePost(
      {
        headers: {
          Authorization: "Bearer " + token
        },
        body: JSON.stringify({
          orcs: SUBAREA_ENTRIES[3].orcs,
          subAreaId: SUBAREA_ENTRIES[3].pk.split("::")[0],
          activity: SUBAREA_ENTRIES[3].pk.split("::")[1],
          date: "201901" // should be locked as per previous test
        })
      }, null);
    expect(response.statusCode).toBe(409);
  });

  test('HandleUnlock - 200 POST unlock record', async () => {
    const response = await subareaPOST.handleUnlock(
      {
        headers: {
          Authorization: "Bearer " + token
        },
        body: JSON.stringify({
          orcs: SUBAREA_ENTRIES[3].orcs,
          subAreaId: SUBAREA_ENTRIES[3].pk.split("::")[0],
          activity: SUBAREA_ENTRIES[3].pk.split("::")[1],
          date: "201901"
        })
      }, null);
    expect(response.statusCode).toBe(200);
  });

  test('Handler - 403 POST to locked fiscal year', async () => {
    const response = await subareaPOST.handlePost(
      {
        headers: {
          Authorization: "Bearer " + token
        },
        body: JSON.stringify({
          orcs: SUBAREA_ENTRIES[2].orcs,
          subAreaId: SUBAREA_ENTRIES[2].pk.split("::")[0],
          activity: SUBAREA_ENTRIES[2].pk.split("::")[1],
          date: "201801" // Fiscal year is locked
        })
      }, null);
    expect(response.statusCode).toBe(403);
  });
});
