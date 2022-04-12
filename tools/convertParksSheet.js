const AWS = require('aws-sdk');
const { dynamodb, TABLE_NAME } = require('../lambda/dynamoUtil');

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
  }
}

async function doMigration() {
  return new Promise(async function (resolve, reject) {
    let { rows, errors } = await readXlsxFile('./Park Name Comparisons.xlsx', { schema });
    for (const row of rows) {
      process.stdout.write('.');
      // Row is an instance of a subarea and it's activities.
      let activities = [];
      if (row['Frontcountry Camping'] == 'Yes') {
        activities.push('Frontcountry Camping');
      }
      if (row['Backcountry Camping'] == 'Yes') {
        activities.push('Frontcountry Camping');
      }
      if (row['Group Camping'] == 'Yes') {
        activities.push('Group Camping');
      }
      if (row['Day Use'] == 'Yes') {
        activities.push('Day Use');
      }
      if (row['Boating'] == 'Yes') {
        activities.push('Boating');
      }
      if (row['Frontcountry Cabins'] == 'Yes') {
        activities.push('Frontcountry Cabins');
      }
      if (row['Backcountry Cabins'] == 'Yes') {
        activities.push('Backcountry Cabins');
      }

      // 1. Add the park record
      const parkRecord = {
        pk: AWS.DynamoDB.Converter.input('park'),
        sk: AWS.DynamoDB.Converter.input(row['ORCS Number']),
        parkName: AWS.DynamoDB.Converter.input(row['Park']),
        // subAreas: row['Park Sub Area'], // Add to activities
      };
      await putItem(parkRecord);

      // 2. Add the subarea /w activities record
      const parkSubAreaRecord = {
        pk: AWS.DynamoDB.Converter.input('park::' + parkRecord.sk.S),
        sk: AWS.DynamoDB.Converter.input(row['Park Sub Area']),
        region: AWS.DynamoDB.Converter.input(row['Region']),
        section: AWS.DynamoDB.Converter.input(row['Section']),
        managementArea: AWS.DynamoDB.Converter.input(row['Management Area']),
        bundle: AWS.DynamoDB.Converter.input(row['Bundle']),
        activities: { SS: activities, },
        parkName: AWS.DynamoDB.Converter.input(parkRecord.parkName.S),
        orcs: AWS.DynamoDB.Converter.input(parkRecord.sk.S),
        subAreaName: AWS.DynamoDB.Converter.input(row['Park Sub Area'])
      };
      // console.log("parkSubAreaRecord:", parkSubAreaRecord);
      await putItem(parkSubAreaRecord);

      // 3. For each activity, add the config for that orc::subarea::activity
      for (const activity of activities) {
        const activityRecord = {
          pk: AWS.DynamoDB.Converter.input('park::' + parkRecord.sk.S + '::' + parkSubAreaRecord.subAreaName.S),
          sk: { S: 'config' },
          parkName: AWS.DynamoDB.Converter.input(parkRecord.parkName.S),
          orcs: AWS.DynamoDB.Converter.input(parkRecord.sk.S),
          subAreaName: AWS.DynamoDB.Converter.input(row['Park Sub Area']),
          pplVehicleModifier: AWS.DynamoDB.Converter.input(3.5),
          pplBusModifier: AWS.DynamoDB.Converter.input(40)
        };
        // console.log("activityRecord:", activityRecord);
        await putItem(activityRecord);
      }
    }
    resolve(rows.length);
  });
}

async function putItem(record) {
  let putParkObj = {
    TableName: TABLE_NAME,
    ConditionExpression: 'attribute_not_exists(pk) AND attribute_not_exists(sk)',
    Item: record
  };

  try {
    const res = await dynamodb.putItem(putParkObj).promise();
    // If we get here, the park didn't exist already.
    // console.log("PUT:", record);
  } catch (err) {
    // console.log("Error:", err);
    // Fall through, it already existed.
  }
}

doMigration()
.then((res) => {
  console.log(`Import complete. ${res} records processed.`);
})
.catch((e) => console.log("Error:", e))