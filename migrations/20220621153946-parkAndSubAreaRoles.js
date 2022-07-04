'use strict';
const AWS = require('aws-sdk');
const { runQuery, TABLE_NAME, dynamodb } = require('../lambda/dynamoUtil');

const readXlsxFile = require('read-excel-file/node');

const schema = {
  'ORCS Number': {
    prop: 'ORCS Number',
    type: String
  },
  'Park': {
    prop: 'Park',
    type: String
  },
  'Park Sub Area': {
    prop: 'Park Sub Area',
    type: String
  },
  'Frontcountry Camping': {
    prop: 'Frontcountry Camping',
    type: String
  },
  'Backcountry Camping': {
    prop: 'Backcountry Camping',
    type: String
  },
  'Group Camping': {
    prop: 'Group Camping',
    type: String
  },
  'Day Use': {
    prop: 'Day Use',
    type: String
  },
  'Boating': {
    prop: 'Boating',
    type: String
  },
  'Frontcountry Cabins': {
    prop: 'Frontcountry Cabins',
    type: String
  },
  'Backcountry Cabins': {
    prop: 'Backcountry Cabins',
    type: String
  },
  'Section': {
    prop: 'Section',
    type: String
  },
  'Management Area': {
    prop: 'Management Area',
    type: String
  },
  'Bundle': {
    prop: 'Bundle',
    type: String
  },
  'Region': {
    prop: 'Region',
    type: String
  },
  'Sub Area ID': {
    prop: 'Sub Area ID',
    type: String
  }
}

let parkErrors = []
let subAreaErrors = []
let completedParks = [];
let completedSubAreas = [];

exports.up = async function (dbOptions) {
  await updateAllParks();
};

async function updateAllParks() {
  try {
    const parks = await getParks();

    console.log("parks:", parks);

    for(const park of parks) {
      await processPark(park);
    }
  } catch (err) {
    console.log(err);
    throw err;
  }
  console.log("------------------------------------------------------------------");
  console.log(`Successfully updated ${completedParks.length} parks.\n`);
  console.log(`Successfully updated ${completedSubAreas.length} subAreas.\n`);
  process.stdout.write(`Failed to update ${parkErrors.length} parks.\n`);
  process.stdout.write(`Failed to update ${subAreaErrors.length} subAreas.\n`);
  let firstTime = true;
  for (const item of parkErrors) {
    if (firstTime) {
      console.log("Failed Items:");
      firstTime = false;
    }
    process.stdout.write(`${item} `);
  }
  process.stdout.write(`\n `);
  firstTime = true;
  for (const item of subAreaErrors) {
    if (firstTime) {
      console.log("Failed Items:");
      firstTime = false;
    }
    process.stdout.write(`${item} `);
  }
  console.log();
  console.log("------------------------------------------------------------------");
}

async function processPark(park) {
  console.log("Park:", park);

  await setParkRoleProperty(park);

  for(const subArea of park.subAreas) {
    await processSubArea(park, subArea);
  }
}

async function processSubArea(park, subArea) {
  console.log("SubArea:", subArea);

  const roles = ['sysadmin', `${park.sk}:${subArea.id}`];

  // Update the pk=park/sk=orcs
  const updateObj = {
    TableName: TABLE_NAME,
    Key: {
      pk: { S: `park::${park.sk}` },
      sk: { S: `${subArea.id}` }
    },
    UpdateExpression: 'set orcs = :orcs, #roles = :roles',
    ExpressionAttributeNames: {
      '#roles': 'roles'
    },
    ExpressionAttributeValues: {
      ':orcs': AWS.DynamoDB.Converter.input(park.sk),
      ':roles': AWS.DynamoDB.Converter.input(roles)
    },
    ReturnValues: 'ALL_NEW'
  };
  try {
    await dynamodb.updateItem(updateObj).promise();
    console.log("Updated SubArea:", subArea.id);
    completedSubAreas.push(subArea.id);
  } catch (e) {
    console.log("E:", e)
    console.log("Failed to update subarea: ", subArea.id);
    subAreaErrors.push(subArea.name);
  }
}

async function setParkRoleProperty(park) {
  const roles = ['sysadmin', `${park.sk}`];
  const updateObj = {
    TableName: TABLE_NAME,
    Key: {
      pk: { S: park.pk },
      sk: { S: park.sk }
    },
    UpdateExpression: 'set orcs = :orcs, #roles = :roles',
    ExpressionAttributeNames: {
      '#roles': 'roles'
    },
    ExpressionAttributeValues: {
      ':orcs': AWS.DynamoDB.Converter.input(park.sk),
      ':roles': AWS.DynamoDB.Converter.input(roles)
    },
    ReturnValues: 'ALL_NEW'
  };
  try {
    const parkData = await dynamodb.updateItem(updateObj).promise();
    console.log("Updated Park:", parkData.Attributes?.orcs.S);
    completedParks.push(parkData.Attributes?.orcs.S);
  } catch (e) {
    console.log("E:", e)
    console.log("Failed to update park/subarea: ", park.parkName);
    parkErrors.push(park.parkName);
  }
}

async function getParks() {
   const queryObj = {
    TableName: TABLE_NAME,
    ConsistentRead: true,
    ExpressionAttributeValues: {
      ':pk': {
        S: 'park'
      }
    },
    KeyConditionExpression: 'pk =:pk'
  };
  return await runQuery(queryObj);
}

async function getOrcsToAdd(parkName) {
  console.log("getting for:", parkName);
  let { rows } = await readXlsxFile('tools/Park Name Comparisons.xlsx', { schema });
  for (const row of rows) {
    if (row['Park'] === parkName) {
      // Grab the ORCS
      return row['ORCS Number'] + ":" + row['Sub Area ID'];
    }
  }
}

exports.down = async function (dbOptions) { };
