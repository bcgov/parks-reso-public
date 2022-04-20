const AWS = require('aws-sdk');
const { DocumentClient } = require('aws-sdk/clients/dynamodb');
const { REGION, ENDPOINT, TABLE_NAME } = require('./global/settings');
const { PARKSLIST, SUBAREAS, SUBAREA_INFORMATION } = require('./global/data.json');

const parkGET = require('../lambda/park/GET/index');

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

  for(const park of PARKSLIST) {
    await docClient
      .put({
        TableName: TABLE_NAME,
        Item: park
      })
      .promise();
  }

  for (const subarea of SUBAREAS) {
    await docClient
      .put({
        TableName: TABLE_NAME,
        Item: subarea
      })
      .promise();
  }
}

describe('Pass Succeeds', () => {
  beforeAll(async () => {
    return await setupDb();
  });

  test('Handler - 200 Received list of parks', async () => {
    expect(await parkGET.handler({}, null)).toMatchObject({
      body: JSON.stringify(PARKSLIST),
      headers: {
        'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
        'Access-Control-Allow-Methods': 'OPTIONS,GET,POST',
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      statusCode: 200
    });
  });
});
