'use strict';
const AWS = require('aws-sdk');

const { doMigration } = require('../migrations-data/addFromCSV');

const dataFile = '20221102211341_data.xlsx';
const dataFolder = 'migrations-data/'

exports.up = async function (dbOptions) {
  // create new parks and subareas
  await createEntries();
};

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
