const AWS = require("aws-sdk");
const readXlsxFile = require('read-excel-file/node');
const { TABLE_NAME, dynamodb } = require('../../../lambda/dynamoUtil');
const { createCSV, getDBSnapshot, validateSchema, updateConsoleProgress, determineActivities, createLegacySubAreaObject, createLegacyParkObject, getConsoleInput, createLegacyRecordObject, createFieldListByActivity } = require('../legacy-data-functions');
const { schema } = require('../legacy-data-constants');

const MAX_TRANSACTION_SIZE = 25;

let filePath = './20230227140505-legacy2017_2019.xlsx';

let xdb; // Existing DB snapshot
let rows; // Raw historical data rows.
let changes = []; // Rows that will be changed in the migration
let newParks = {}; // Legacy parks to be created in the migration.
let newSubAreas = {}; // Legacy subareas to be created in the migration. 
let newRecordsCount = 0; // Quantity of legacy records to be created.
let failures = []; // List of errors encountered.

async function run() {
  console.log('********************');
  console.log('A&R HISTORICAL DATA MIGRATION\n');
  try {
    // 1. validate schema (safety check).
    validateSchema(schema);
    // 2. Get simplified map of existing db so we don't have to continually hit the db when checking for existing entries. 
    xdb = await getDBSnapshot();
    // 3. Get new data
    rows = await getData();
    // 4. Collect proposed changes in change log for user review.
    await createChangelog();
    // 5. Execute change log changes.
    await executeChangelog();
  } catch (error) {
    console.log('ERROR:', error);
    return;
  }
}

async function getData() {
  console.log('Loading data...');
  try {
    let { rows, errors } = await readXlsxFile(filePath, { schema });
    console.log('Items found:', rows.length);
    return rows;
  } catch (error) {
    throw `Error loading historical data: ` + error;
  }
}

async function createChangelog() {
  console.log('********************');
  console.log('CREATING CHANGE LOG');

  // Get largest subareaId in the system so we can dynamically generate new subareaIds.
  let ids = [];
  for (const park in xdb) {
    for (const subarea in xdb[park]) {
      ids.push(parseInt(subarea, 10) ? parseInt(subarea, 10) : 0)
    }
  }
  let nextSubAreaId = Math.max(...ids) + 1;

  try {
    let intervalStartTime = new Date().getTime();
    for (const row of rows) {
      let subAreaId;
      updateConsoleProgress(intervalStartTime, 'Collecting', rows.indexOf(row) + 1, rows.length, 1);

      // Check data for fatal errors and omissions (missing orcs, names, etc).
      // We can't load these in, so we should flag them. 
      if (!validateRow(row)) {
        failures.push({ item: { data: row }, reason: `Invalid row - critical data error or omission` });
        continue;
      }

      // Determine legacy record activities by field presence.
      let activities = [];
      try {
        activities = determineActivities(row, schema);
        if (activities.length === 0) {
          throw 'No activities found.';
        }
        newRecordsCount += activities.length ? activities.length : 0;
      } catch (error) {
        // Failed to determine activities.
        failures.push({ item: { data: row }, reason: `Error collecting activities from historical data. ${error}`, error: error });
        continue;
      }

      // Check if park exists for legacy record.
      try {
        if (!xdb.hasOwnProperty(row.legacy_orcs) && !newParks.hasOwnProperty(row.legacy_orcs)) {
          // Park doesn't exist, create new
          let newPark = createLegacyParkObject(row);
          newParks[row.legacy_orcs] = newPark;
        }
      } catch (error) {
        // Failed to create new park.
        failures.push({ item: { data: row }, reason: `An error occurred while creating a legacy park: ${error}`, error: error });
        continue;
      }

      try {
        // Check if subarea exists. Get subarea name.
        // We must also store the existing or newly created subarea id for the row 
        let subAreaNameArray = row.legacy_parkSubArea.split(' - ');
        subAreaNameArray.splice(0, 1);
        let checkSubAreaName = subAreaNameArray.join(" - ");
        let existingSubArea = [];
        // Determine if subarea already exists in xdb.
        if (xdb[row.legacy_orcs]) {
          existingSubArea = Object.keys(xdb[row.legacy_orcs]).filter((id) =>
            xdb[row.legacy_orcs]?.[id].subAreaName === checkSubAreaName
          );
          subAreaId = existingSubArea[0] ? existingSubArea[0] : null
        }
        // Determine if subarea is already in legacy subarea list.
        if (!existingSubArea.length) {
          existingSubArea = Object.keys(newSubAreas).filter((id) =>
            newSubAreas?.[id].subAreaName === checkSubAreaName
          )
          subAreaId = existingSubArea[0] ? existingSubArea[0] : null;
        }
        // If nothing found, subarea doesn't exist. Create legacy.
        if (!existingSubArea.length) {
          let newSubArea;
          if (row.legacy_orcs === 'HIST') {
            newSubArea = createLegacySubAreaObject(row, 'HIST', checkSubAreaName, activities);
            subAreaId = 'HIST';
          } else {
            newSubArea = createLegacySubAreaObject(row, nextSubAreaId, checkSubAreaName, activities);
            subAreaId = nextSubAreaId;
            nextSubAreaId++;
          }
          newSubAreas[newSubArea.sk] = newSubArea;
        }
      } catch (error) {
        // Failed to create new subarea.
        failures.push({ item: { data: row }, reason: `An error occurred while creating a legacy subarea: ${error}`, error: error });
        continue;
      }

      if (!subAreaId) {
        // Something occurred with collecting the subarea id.
        failures.push({ item: { data: row }, reason: `An error occurred determining a subarea id for the historical data` });
        continue;
      }
      // If we get here, the row is vetted and can be migrated.
      changes.push({ data: row, activities: activities, subAreaId: subAreaId });
    }

    // Get user to review and approve change log.
    process.stdout.write('\n')
    console.log('********************');
    console.log('CHANGE LOG CREATED:');
    console.log('Please review and approve the following change log. The migration will commence once the change log is approved.');
    console.log('Note: The changes listed below will be captured in an output file for future review.\n');

    // Review new parks.
    if (Object.keys(newParks).length) {
      let viewParks = await getConsoleInput(`There are ${Object.keys(newParks).length || 0} legacy parks to be created.\nDo you want to review these parks? [Y/N] >>> `)
      process.stdout.write('\n');
      if (viewParks === 'Y' || viewParks === 'y') {
        console.log('New Parks:', newParks);
        await awaitContinue();
        process.stdout.write('\n');
      }
    }

    // Review new subareas.
    if (Object.keys(newSubAreas).length) {
      let viewSubAreas = await getConsoleInput(`There are ${Object.keys(newSubAreas).length || 0} legacy subareas to be created.\nDo you want to review these subareas? [Y/N] >>> `)
      process.stdout.write('\n');
      if (viewSubAreas === 'Y' || viewSubAreas === 'y') {
        console.log('New Subareas:', newSubAreas);
        await awaitContinue();
        process.stdout.write('\n');
      }
    }

    // Review failures.
    if (failures.length) {
      process.stdout.write('\n');
      let viewErrors = await getConsoleInput(`There were ${failures.length} rows containing errors that will prevent their contained data from being migrated.\nThey will not be migrated, but they will be captured for future processing.\nDo you want to review these failures? [Y/N] >>> `);
      process.stdout.write('\n');
      if (viewErrors === 'Y' || viewErrors === 'y') {
        let failureList = [];
        for (const failure of failures) {
          let failureString = `FAILURE: ${failure?.item?.legacy_parkSubArea} (${failure?.item?.legacy_month / failure?.item?.legacy_year}): ${failure?.reason}`;
          let index = failureList.findIndex((item) =>
            item.string == failureString
          );
          if (index !== -1) {
            failureList[index].count++;
          } else {
            failureList.push({ string: failureString, count: 1 });
          }
        }
        for (const item of failureList) {
          console.log(`${item.string} (${item.count} INSTANCE(S))`);
        }
        process.stdout.write('\n');
        await awaitContinue();
      }
    }

    // Approve change log.
    process.stdout.write('\n');
    console.log('********************');
    console.log('CHANGE LOG COMPLETE.');
    let viewRecords = await getConsoleInput(`Legacy records to be created: ${newRecordsCount}\nDo you approve the proposed change log? Responding "Y" will begin the migration process. [Y/N] >>> `);
    if (viewRecords !== 'Y' && viewRecords !== 'y') {
      throw 'User must approve of the change log (enter "Y"). Migration process cancelled.'
    }
    process.stdout.write('\n');
    // Change log is approved.
    return;
  } catch (error) {
    process.stdout.write('\n')
    throw `Failed to create change log: ${error}`;
  }
}

async function executeChangelog() {
  // Execute the change log via batch transactions to reduce migrations time.
  // We should not need to do any conditional checking for parks/subareas at this point - 
  // All checking should have been done in the createChangeLog step.
  // We still should do conditional check for records, if we want true idempotency
  // where new records are NOT overwritten on re-run =.
  console.log('********************');
  console.log('EXECUTING MIGRATION:');

  let successes = [];

  // 1. Put legacy parks into DB.
  // Create transaction object - We can only transact 25 items at a time.
  if (Object.keys(newParks).length) {
    try {
      console.log('Legacy parks:', Object.keys(newParks).length);
      let parkTransactObjList = [];
      let intervalStartTime = new Date().getTime();
      let legacyParksList = Object.keys(newParks).map((orcs) =>
        newParks[orcs]
      )
      let parkTransactChunk = { TransactItems: [] };
      try {
        for (const park of legacyParksList) {
          updateConsoleProgress(intervalStartTime, 'Creating legacy parks transaction', legacyParksList.indexOf(park) + 1, legacyParksList.length, 1);
          // If MAX_TRANSACTION_SIZE limit reached, start new transaction chunk
          if (parkTransactChunk.TransactItems.length + 1 > MAX_TRANSACTION_SIZE) {
            parkTransactObjList.push(parkTransactChunk);
            parkTransactChunk = { TransactItems: [] };
          }
          let parkObj = {
            TableName: TABLE_NAME,
            Item: AWS.DynamoDB.Converter.marshall(park),
            ConditionExpression: 'attribute_not_exists(pk) AND attribute_not_exists(sk)'
          }
          parkTransactChunk.TransactItems.push({
            Put: parkObj
          })
        }
        // collect the remainder of chunks
        if (parkTransactChunk.TransactItems.length) {
          parkTransactObjList.push(parkTransactChunk);
        }
        process.stdout.write('\n')
      } catch (error) {
        process.stdout.write('\n')
        throw `Failed to create legacy parks transaction. Park transaction must succeed to continue: ${error}`
      }

      // Execute park transaction
      try {
        intervalStartTime = new Date().getTime();
        for (const transaction of parkTransactObjList) {
          updateConsoleProgress(intervalStartTime, 'Executing legacy parks transaction', parkTransactObjList.indexOf(transaction) + 1, parkTransactObjList.length, 1);
          await dynamodb.transactWriteItems(transaction).promise();
        }
      } catch (error) {
        throw `Failed to execute legacy parks transaction. Park transaction must succeed to continue: ${error}`
      }
      process.stdout.write('\n')
      console.log('Legacy parks completed.\n');
    } catch (error) {
      process.stdout.write('\n')
      throw `Failed to execute change log: ${error}`;
    }
  }

  // 2. Put legacy subareas into DB.
  // Create transaction object - We can only transact 25 items at a time.
  if (Object.keys(newSubAreas).length) {
    console.log('Legacy subareas:', Object.keys(newSubAreas).length);
    let subAreaTransactObjList = [];
    let intervalStartTime = new Date().getTime();
    let legacySubAreasList = Object.keys(newSubAreas).map((id) =>
      newSubAreas[id]
    )
    let subAreaTransactChunk = { TransactItems: [] };
    let touchedParksList = [];
    try {
      for (const subArea of legacySubAreasList) {
        updateConsoleProgress(intervalStartTime, 'Creating legacy subarea transaction', legacySubAreasList.indexOf(subArea) + 1, legacySubAreasList.length, 1);
        if (subAreaTransactChunk.TransactItems.length + 2 > MAX_TRANSACTION_SIZE || touchedParksList.indexOf(subArea.orcs) !== -1) {
          // We need to execute 2 transactions per subarea, and ensure both are successful.
          // If MAX_TRANSACTION_SIZE limit reached, start new transaction chunk.
          // Additionally, We have to update the parent park with a list of its subareas.
          // We cannot update the same park twice in the same transaction chunk.
          // Whenever we hit duplicate parks, we have to break the transaction chunk up. 
          subAreaTransactObjList.push(subAreaTransactChunk);
          subAreaTransactChunk = { TransactItems: [] };
          touchedParksList = [];
        }
        let parkUpdateObj = {
          TableName: TABLE_NAME,
          Key: {
            pk: { S: `park` },
            sk: { S: subArea.orcs }
          },
          UpdateExpression: 'SET subAreas = list_append(subAreas, :subAreas)',
          ExpressionAttributeValues: {
            ':subAreas': {
              'L': [{
                'M': {
                  'id': { 'S': subArea.sk },
                  'name': { 'S': subArea.subAreaName },
                  'isLegacy': { 'BOOL': true }
                }
              }]
            }
          }
        }
        subAreaTransactChunk.TransactItems.push({
          Update: parkUpdateObj
        })
        touchedParksList.push(subArea.orcs);

        // Create legacy subarea
        let subAreaObj = {
          TableName: TABLE_NAME,
          Item: Object.assign(AWS.DynamoDB.Converter.marshall(subArea), { activities: { SS: subArea.activities } }),
          ConditionExpression: 'attribute_not_exists(pk) AND attribute_not_exists(sk)',
        }
        subAreaTransactChunk.TransactItems.push({
          Put: subAreaObj
        })

      }
      // collect the remainder of chunks
      if (subAreaTransactChunk.TransactItems.length) {
        subAreaTransactObjList.push(subAreaTransactChunk);
      }
      process.stdout.write('\n')
    } catch (error) {
      process.stdout.write('\n')
      throw `Failed to create legacy subarea transaction. Subarea transaction must succeed to continue: ${error}`
    }

    // Execute subarea transaction
    try {
      let intervalStartTime = new Date().getTime();
      for (const transaction of subAreaTransactObjList) {
        updateConsoleProgress(intervalStartTime, 'Executing legacy subarea transaction', subAreaTransactObjList.indexOf(transaction) + 1, subAreaTransactObjList.length, 1);
        await dynamodb.transactWriteItems(transaction).promise();
      }
      process.stdout.write('\n')
      console.log('Legacy subareas complete.\n');
    } catch (error) {
      process.stdout.write('\n')
      throw `Failed to execute legacy subarea transaction. Subarea transaction must succeed to continue: ${error}`
    }
  }

  // 3. Put legacy records into the DB.
  // Create transaction object - We can only transact 25 items at a time.
  console.log('Legacy records:', newRecordsCount);
  let transactionMap = [];
  let transactionMapChunk = { rows: [], transactions: { TransactItems: [] } }
  let intervalStartTime = new Date().getTime();
  try {
    for (const item of changes) {
      try {
        transactionMapChunk.rows.push(item);
        updateConsoleProgress(intervalStartTime, 'Creating legacy record transaction', changes.indexOf(item) + 1, changes.length, 100);
        if (transactionMapChunk.transactions.TransactItems.length + item.activities.length > MAX_TRANSACTION_SIZE) {
          // Check if there are enough slots left in the transaction chunk to carry out every legacy record in the item.
          // If MAX_TRANSACTION_SIZE limit reached, start new transaction chunk.
          transactionMap.push(transactionMapChunk);
          transactionMapChunk = { rows: [], transactions: { TransactItems: [] } }
        }
        // Create new record for every activity in the time
        for (const activity of item.activities) {
          let activityObj = createLegacyRecordObject(item.data, activity, item.subAreaId);
          let recordObj = {
            TableName: TABLE_NAME,
            Item: AWS.DynamoDB.Converter.marshall(activityObj),
            ConditionExpression: 'attribute_not_exists(pk)',
          }
          transactionMapChunk.transactions.TransactItems.push({
            Put: recordObj
          });
        }
      } catch (error) {
        failures.push({ item: item, reason: `Error in legacy records transaction creation: ${error}`, error: error });
      }
    }
    // collect the remainder of chunks
    if (transactionMapChunk.transactions.TransactItems.length) {
      transactionMap.push(transactionMapChunk);
    }
    process.stdout.write('\n')
  } catch (error) {
    process.stdout.write('\n')
    throw `Failed to create legacy records transaction. The migration cannot continue: ${error}`;
  }

  // Execute record transactions
  successfulRecordCount = 0;
  intervalStartTime = new Date().getTime();
  for (const transaction of transactionMap) {
    try {
      updateConsoleProgress(intervalStartTime, 'Executing legacy record transaction', transactionMap.indexOf(transaction) + 1, transactionMap.length, 10);
      await dynamodb.transactWriteItems(transaction.transactions).promise();
      successes = successes.concat(transaction.rows);
      successfulRecordCount += transaction.transactions.TransactItems.length;
    } catch (error) {
      for (const row of transaction.rows) {
        failures.push({ item: row, reason: `This row failed as part of an aborted bulk transaction and might not include any errors: ${error}`, error: error });
      }
    }
  }
  process.stdout.write('\n')
  console.log('Legacy records complete.\n');

  console.log('********************');
  console.log('MIGRATION SUMMARY:');

  console.log('Legacy records created:', successfulRecordCount);
  console.log('Failures:', failures.length);

  // Review newly created areas.
  let saveAreas = await getConsoleInput(`Do you want to save lists of the successfully created parks and subareas? [Y/N] >>> `)
  if (saveAreas === 'Y' || saveAreas === 'y') {
    // Save parks to file
    if (Object.keys(newParks).length) {
      let parksCSVList = [];
      let parks = Object.keys(newParks)
      let parkSchema = Object.keys(newParks[parks[0]]);
      for (const park in newParks) {
        parksCSVList.push(newParks[park]);
      }
      createCSV(parkSchema, parksCSVList, `legacy_parks${new Date().toISOString()}`);
      process.stdout.write('\n')
    }
    // Save subareas to file
    if (Object.keys(newSubAreas).length) {
      let subAreaCSVList = [];
      let subAreas = Object.keys(newSubAreas)
      let subAreaSchema = Object.keys(newSubAreas[subAreas[0]]);
      for (const subArea in newSubAreas) {
        subAreaCSVList.push(newSubAreas[subArea]);
      }
      createCSV(subAreaSchema, subAreaCSVList, `legacy_subareas${new Date().toISOString()}`);
      process.stdout.write('\n')
    }
  }

  let saveSchema = [];
  for (const entry in schema) {
    saveSchema.push(schema[entry].prop);
  }

  // Review successes.
  let saveSuccesses = await getConsoleInput(`Do you want to save a list of the successfully created legacy records? [Y/N] >>> `)
  if (saveSuccesses === 'Y' || saveSuccesses === 'y') {
    // Save successes to file
    let successData = [];
    for (const success of successes) {
      successData.push(success.data);
    }
    createCSV(saveSchema, successData, `migration_successes${new Date().toISOString()}`);
    process.stdout.write('\n')
  }
  // Review failures.
  let saveFailures = await getConsoleInput(`Do you want to save a list of the items that failed to migrate? [Y/N] >>> `)
  if (saveFailures === 'Y' || saveFailures === 'y') {
    // Save failures to file
    let failureData = [];
    for (const failure of failures) {
      failure.item.data['failureReason'] = failure.reason;
      failureData.push(failure.item.data);
    }
    let failureSchema = [...saveSchema].concat('failureReason');
    createCSV(failureSchema, failureData, `migration_failures${new Date().toISOString()}`);
    process.stdout.write('\n')
  }

  // Sanity check
  const diff = rows.length - successes.length - failures.length;
  if (diff === 0) {
    console.log(`All ${rows.length} items accounted for.`);
  } else if (diff > 0) {
    console.log(`${diff} items unaccounted for.`);
  } else {
    console.log(`${Math.abs(diff)} items accounted for more than once.`);
  }

  console.log('********************');
  console.log('MIGRATION COMPLETE:');
  console.log('********************');

}

function validateRow(row) {
  // Row is invalid under any of the following conditions:
  if (
    // Row is full of test data:
    row.legacy_orcs && row.legacy_orcs === 'HIST'
  ) {
    return true;
  }
  if (
    // Missing ORCS
    !row.legacy_orcs ||
    // ORCS is not a number
    !parseInt(row.legacy_orcs, 10) ||
    // Missing Park Name
    !row.legacy_park ||
    // Missing Subarea Name 
    !row.legacy_parkSubArea ||
    // Missing Year
    !row.legacy_year ||
    // Missing Month 
    !row.legacy_month
  ) {
    return false;
  }
  return true;
}

async function awaitContinue() {
  await getConsoleInput('Press ENTER to continue. >>>');
}

run();