const AWS = require('aws-sdk');
const { DocumentClient } = require('aws-sdk/clients/dynamodb');
const { REGION, ENDPOINT, TABLE_NAME } = require('./global/settings');
const { PARKSLIST, SUBAREAS, CONFIG_ENTRIES, SUBAREA_ENTRIES } = require('./global/data.json');

const subareaGET = require('../lambda/subarea/GET/index');
const subareaPOST = require('../lambda/subarea/POST/index');

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
      queryStringParameters: {
        badParam: "oops"
      }
    }, null);

    expect(response.statusCode).toBe(400);
  });

  test('Handler - 200 POST handle Activity', async () => {
    const response = await subareaPOST.handler(
      {
        queryStringParameters: {
          type: "activity"
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

  test('Handler - 200 POST handle Config', async () => {
    const response = await subareaPOST.handler(
      {
        queryStringParameters: {
          type: "config"
        },
        body: JSON.stringify(CONFIG_ENTRIES[0])
      }, null);
    expect(response.statusCode).toBe(200);
  });

  test('Handler - 400 POST handle Activity', async () => {
    const response = await subareaPOST.handler(
      {
        queryStringParameters: {
          type: "activity"
        },
        body: JSON.stringify({
          orcs: SUBAREA_ENTRIES[0].orcs,
        })
      }, null);
    expect(response.statusCode).toBe(400);
  });

  test('Handler - 400 POST handle Config', async () => {
    const response = await subareaPOST.handler(
      {
        queryStringParameters: {
          type: "config"
        },
        body: JSON.stringify({
          orcs: SUBAREA_ENTRIES[0].orcs,
        })
      }, null);
    expect(response.statusCode).toBe(400);
  });

  test('Handler - 400 POST handle Activity', async () => {
    const response = await subareaPOST.handler(
      {
        queryStringParameters: {
          type: "activity"
        }
      }, null);
    expect(response.statusCode).toBe(400);
  });

  test('Handler - 400 POST handle Activity date', async () => {
    const response = await subareaPOST.handler(
      {
        queryStringParameters: {
          type: "activity"
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

  test('Handler - 400 POST Bad Request', async () => {
    const response = await subareaPOST.handler({
      body: {
        badParam: "{xxxxxx}"
      }
    }, null);

    expect(response.statusCode).toBe(400);
  });
});
