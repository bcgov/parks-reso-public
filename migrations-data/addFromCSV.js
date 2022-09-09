const AWS = require('aws-sdk');
const { dynamodb, TABLE_NAME, getOne } = require('../lambda/dynamoUtil');

const readXlsxFile = require('read-excel-file/node');

// copied from convertParksSheet.js, we can use this modified code in migrations to add new 
// parks/subareas in the future. 

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

async function doMigration(filePath) {
  console.log('path:', process.cwd())
  console.log('filePath:', filePath);
  let { rows, errors } = await readXlsxFile(filePath, { schema });
  for (const row of rows) {
    process.stdout.write('.');
    // Row is an instance of a subarea and it's activities.
    let activities = [];
    if (row['Frontcountry Camping'] == 'Yes') {
      activities.push('Frontcountry Camping');
    }
    if (row['Backcountry Camping'] == 'Yes') {
      activities.push('Backcountry Camping');
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

    // Remove everything to the left of and including " - ".  The right most part of this
    // string is the subarea name itself.
    const subAreaNameSplitContent = row['Park Sub Area'].split(" - ");
    const subAreaName = subAreaNameSplitContent[subAreaNameSplitContent.length - 1];
    const subAreaId = row['Sub Area ID'];

    const subAreaObj = {
      id: subAreaId,
      name: subAreaName
    }

    // 1. Add the park record
    const parkRecord = {
      pk: AWS.DynamoDB.Converter.input('park'),
      sk: AWS.DynamoDB.Converter.input(row['ORCS Number']),
      orcs: AWS.DynamoDB.Converter.input(row['ORCS Number']),
      roles: AWS.DynamoDB.Converter.input(['sysadmin', row['ORCS Number']]),
      parkName: AWS.DynamoDB.Converter.input(row['Park']),
      subAreas: {
        'L': [
          {
            'M': {
              'id': { 'S': subAreaId },
              'name': { 'S': subAreaName }
            }
          }
        ]
      }
    };
    if (await putItem(parkRecord) == false) {
      // Record already existed, lets add the subarea to the object.
      await updateItem(parkRecord, subAreaObj);
    }

    // 2. Add the subarea /w activities record
    const parkSubAreaRecord = {
      pk: AWS.DynamoDB.Converter.input('park::' + parkRecord.sk.S),
      sk: AWS.DynamoDB.Converter.input(subAreaId),
      region: AWS.DynamoDB.Converter.input(row['Region']),
      section: AWS.DynamoDB.Converter.input(row['Section']),
      managementArea: AWS.DynamoDB.Converter.input(row['Management Area']),
      bundle: row['Bundle'] !== '#N/A' ? AWS.DynamoDB.Converter.input(row['Bundle']) : AWS.DynamoDB.Converter.input('N/A'),
      activities: { SS: activities, },
      parkName: AWS.DynamoDB.Converter.input(parkRecord.parkName.S),
      orcs: AWS.DynamoDB.Converter.input(parkRecord.sk.S),
      subAreaName: AWS.DynamoDB.Converter.input(subAreaName),
      roles: AWS.DynamoDB.Converter.input(['sysadmin', `${parkRecord.sk.S}:${subAreaId}`])
    };
    await putItem(parkSubAreaRecord, true);

    // 3. For each activity, add the config for that subAreaId::activity
    for (const activity of activities) {
      let activityRecord = {
        pk: { S: 'config::' + subAreaId },
        sk: AWS.DynamoDB.Converter.input(activity),
        parkName: AWS.DynamoDB.Converter.input(parkRecord.parkName.S),
        orcs: AWS.DynamoDB.Converter.input(parkRecord.sk.S),
        subAreaId: AWS.DynamoDB.Converter.input(subAreaId),
        subAreaName: AWS.DynamoDB.Converter.input(subAreaName),
      };

      // Default configs
      switch (activity) {
        case 'Frontcountry Camping': {
          activityRecord['attendanceModifier'] = AWS.DynamoDB.Converter.input(3.2);
        } break;
        case 'Day Use': {
          activityRecord['attendanceVehiclesModifier'] = AWS.DynamoDB.Converter.input(3.5);
          activityRecord['attendanceBusModifier'] = AWS.DynamoDB.Converter.input(40);
        } break;
        case 'Backcountry Cabins': {
          activityRecord['attendanceModifier'] = AWS.DynamoDB.Converter.input(3.2);
        } break;
        case 'Boating': {
          activityRecord['attendanceModifier'] = AWS.DynamoDB.Converter.input(3.2);
        } break;
        case 'Frontcountry Cabins': {
          activityRecord['attendanceModifier'] = AWS.DynamoDB.Converter.input(3.2);
        } break;
      }

      await putItem(activityRecord, true);
    }
  }
  return rows.length;
}

async function updateItem(record, subarea) {
  // we have to check that the subarea isnt already on the park record.
  try {
    const park = await getOne(record.pk.S, record.sk.S);
    const subAreas = AWS.DynamoDB.Converter.output(park.subAreas);
    let exists = subAreas.filter(s => s.id === subarea.id);
    if (exists.length > 0) {
      throw 'Subarea already exists on park.'
    }
  } catch (err) {
    console.log('err:', err);
    return;
  }
  let putParkObj = {
    TableName: TABLE_NAME,
    Key: {
      pk: record.pk,
      sk: record.sk
    },
    UpdateExpression: 'SET #subAreas = list_append(#subAreas, :subAreas)',
    ExpressionAttributeNames: {
      '#subAreas': 'subAreas'
    },
    ExpressionAttributeValues: {
      ':subAreas': {
        'L': [{
          'M': {
            'id': { 'S': subarea.id },
            'name': { 'S': subarea.name }
          }
        }]
      }
    }
  };

  try {
    const res = await dynamodb.updateItem(putParkObj).promise();
  } catch (err) {
    console.error(err);
  }
}

async function putItem(record, overwrite = false) {
  let putObject = {};

  if (overwrite) {
    putObject = {
      TableName: TABLE_NAME,
      Item: record
    }
  } else {
    putObject = {
      TableName: TABLE_NAME,
      ConditionExpression: 'attribute_not_exists(pk) AND attribute_not_exists(sk)',
      Item: record
    }
  }

  try {
    const res = await dynamodb.putItem(putObject).promise();
    // If we get here, the park didn't exist already.
    return true;
  } catch (err) {
    if (record.sk.S == 'Halkett Bay') {
      console.error(err);
    }
    return false;
    // Fall through, it already existed.
  }
}

module.exports = {
  doMigration
}