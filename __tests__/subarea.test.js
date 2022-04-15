const AWS = require('aws-sdk');
const { DocumentClient } = require('aws-sdk/clients/dynamodb');
const { REGION, ENDPOINT, TABLE_NAME } = require('./global/settings');
const { PARKSLIST, SUBAREAS, CONFIG_ENTRIES, SUBAREA_ENTRIES } = require('./global/data.json');

const subareaGET = require('../lambda/subarea/GET/index');

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

  test('Handler - 200 Get specific activity entry', async () => {
    const obj = await subareaGET.handler(
      {
        queryStringParameters: {
          orcs: SUBAREA_ENTRIES[0].orcs,
          subAreaName: SUBAREA_ENTRIES[0].subAreaName,
          activity: SUBAREA_ENTRIES[0].pk.split("::")[2],
          date: SUBAREA_ENTRIES[0].sk
        }
      }, null);
    expect(JSON.parse(obj.body)).toMatchObject(SUBAREA_ENTRIES[0]);
  });
});
