const AWS = require("aws-sdk");
const { DocumentClient } = require("aws-sdk/clients/dynamodb");
const { REGION, ENDPOINT, TABLE_NAME } = require("./global/settings");
const { PARKSLIST, SUBAREAS, SUBAREA_ENTRIES} = require("./global/data.json");

const utils = require("../lambda/dynamoUtil");

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

  for (const subEntry of SUBAREA_ENTRIES) {
    await docClient
      .put({
        TableName: TABLE_NAME,
        Item: subEntry,
      })
      .promise();
  }
}

describe("Pass Succeeds", () => {
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

  test("dynamoUtil - runScan", async () => {
    let queryObj = {
        TableName: TABLE_NAME
    };
    queryObj.FilterExpression = "pk = :pk";
    queryObj.ExpressionAttributeValues = {};
    queryObj.ExpressionAttributeValues[':pk'] = { S: `park` };

    const result = await utils.runScan(queryObj, null)

    expect(result).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          parkName: PARKSLIST[0].parkName
        }),
        expect.objectContaining({
          parkName: PARKSLIST[1].parkName
        }),
      ])
    );
  });

  test("dynamoUtil - getParks", async () => {
    const result = await utils.getParks()

    expect(result).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          parkName: PARKSLIST[0].parkName
        }),
        expect.objectContaining({
          parkName: PARKSLIST[1].parkName
        }),
      ])
    );
  });

  test("dynamoUtil - getSubAreas", async () => {
    let orc = '0041'
    let specificSubAreas = [];
    for (const area of SUBAREAS) {
      if (area.pk === `park::${orc}`) {
        specificSubAreas.push(area);
      }
    }
    const result = await utils.getSubAreas(orc)

    expect(result).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          subAreaName: specificSubAreas[0].subAreaName
        }),
        expect.objectContaining({
          subAreaName: specificSubAreas[1].subAreaName
        }),
      ])
    );
  });

  test("dynamoUtil - getRecords", async () => {
    const result = await utils.getRecords(SUBAREAS[0])

    expect(result).toEqual(
      expect.not.arrayContaining([
        expect.not.objectContaining({
          orcs: SUBAREAS[0].pk.split("::")[1]
        })
      ])
    );
  });

  test("dynamoUtil - incrementAndGetNextSubAreaID works with and without an entry in the DB", async () => {
    const result = await utils.incrementAndGetNextSubAreaID();
    expect(result).toEqual('1');

    const result2 = await utils.incrementAndGetNextSubAreaID();
    expect(result2).toEqual('2');
  });
});
