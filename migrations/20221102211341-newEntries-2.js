'use strict';
const AWS = require('aws-sdk');
const { TABLE_NAME, dynamodb, runQuery } = require('../lambda/dynamoUtil');
const { doMigration } = require('../migrations-data/addFromCSV');

const dataFile = '20221102211341_data.xlsx';
const dataFolder = 'migrations-data/'

exports.up = async function (dbOptions) {
  // delete subareas that will be updated and their configs
  await deleteEntries();
  // create new parks and subareas
  // recreate deleted subareas to reflect new configs
  await createEntries();
};

async function deleteEntries() {
  console.log('Deleting subareas to be recreated with updates');
  const toDelete = [
    {
      pk: 'park::0382',
      sk: '0473',
    }
  ];
  let configCompleted = 0;
  let subAreaCompleted = 0;
  try {
    for (const obj of toDelete) {
      // collect all config items for the subArea:
      const configQuery = {
        TableName: TABLE_NAME,
        ExpressionAttributeValues: {
          ':pk': { S: `config::${obj.sk}` }
        },
        KeyConditionExpression: 'pk = :pk',
      };
      const configRes = await runQuery(configQuery);
      for (let item of configRes) {
        const deleteObj = {
          TableName: TABLE_NAME,
          Key: {
            pk: { S: item.pk },
            sk: { S: item.sk },
          }
        }
        await dynamodb.deleteItem(deleteObj).promise();
        configCompleted++;
      }
      // delete the subArea
      const deleteSubAreaObj = {
        TableName: TABLE_NAME,
        Key: {
          pk: { S: obj.pk },
          sk: { S: obj.sk },
        }
      }
      await dynamodb.deleteItem(deleteSubAreaObj).promise();
      subAreaCompleted++;
    }
    console.log(`Successfully deleted ${configCompleted} config objects.`);
    console.log(`Successfully deleted ${subAreaCompleted} subArea objects.`);
  } catch (err) {
    console.log('There was an error deleting config objects:', err);
  }
}

async function createEntries() {
  console.log('Creating/updating parks & subareas as of 2022-11-02 (BRS-892)');
  const filePath = dataFolder + dataFile;
  try {
    const results = await doMigration(filePath);
    console.log('\nCreated:', results);
  } catch (err) {
    console.log('Something went wrong creating new items:', err);
  }
};

exports.down = async function (dbOptions) { };
