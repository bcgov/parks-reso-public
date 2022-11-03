const AWS = require('aws-sdk');
const { dynamodb, TABLE_NAME, getOne } = require('../lambda/dynamoUtil');

const readXlsxFile = require('read-excel-file/node');
const sourcePaths = ['tools/Park Name Comparisons.xlsx'];

const schema = {
  'ORCS Number': {
    prop: 'ORCS Number',
    type: String
  },
  'Bundle': {
    prop: 'Bundle',
    type: String
  },
  'Sub Area ID': {
    prop: 'Sub Area ID',
    type: String
  }
}

exports.up = async function (dbOptions) {
  await addBundles();
};

async function addBundles() {
  try {
    for (const source of sourcePaths) {
      const data = await loadSource(source, schema);
      await updateSubAreas(data);
    }
  } catch (err) {
    console.log(err);
  }
}

async function loadSource(source, schema) {
  console.log('Loading bundles from path:', source);
  try {
    let { rows, errors } = await readXlsxFile(source, { schema });
    return rows;
  } catch (err) {
    console.log(`Unable to load from ${source}:`, err);
  }
};

async function updateSubAreas(data) {
  let successes = [];
  let failures = [];
  try {
    for (const row of data) {
      const subArea = await getOne(`park::${row['ORCS Number']}`, row['Sub Area ID']);
      if (!subArea) {
        throw `Could not get subArea: pk: park::${row['ORCS Number']} sk: ${row['Sub Area ID']}`;
      }
      let bundle = row['Bundle'] ?? 'N/A';
      if (bundle === '#N/A' || bundle === '#ERROR_#N/A') {
        bundle = 'N/A';
      }
      const updateObj = {
        TableName: TABLE_NAME,
        Key: {
          pk: { S: subArea.pk },
          sk: { S: subArea.sk }
        },
        UpdateExpression: 'set bundle = :bundle',

        ExpressionAttributeValues: {
          ':bundle': AWS.DynamoDB.Converter.input(bundle),
        },
        ReturnValues: 'ALL_NEW'
      };
      try {
        await dynamodb.updateItem(updateObj).promise();
        successes.push(subArea.sk);
      } catch (err) {
        console.log(`Update for ${subArea.sk} failed: ${err}`);
        failures.push(row['Sub Area ID']);
      };
    }
  } catch (err) {
    console.log(`Failed to parse data:`, err);
  }
  console.log('Successes:', successes.length);
  console.log('Failures:', failures, `(${failures.length})`);
}

exports.down = async function (dbOptions) { };
