const { runScan, TABLE_NAME, dynamodb } = require("../../lambda/dynamoUtil");
const { getConsoleInput, updateConsoleProgress } = require("./legacy-data-functions");

const MAX_TRANSACTION_SIZE = 25;

async function run() {
  console.log('********************');
  console.log('PURGE LEGACY ITEMS\n');
  try {
    const scanObj = {
      TableName: TABLE_NAME,
      FilterExpression: `attribute_exists(isLegacy) AND isLegacy = :isLegacy`,
      ExpressionAttributeValues: {
        ':isLegacy': { BOOL: true }
      }
    }
    console.log('Scanning database...');
    let db = await runScan(scanObj);

    if (db.length === 0) {
      throw 'No legacy items found.';
    }

    console.log('Legacy items found:', db.length);
    let continueOption = await getConsoleInput(`Proceeding will permanently delete all legacy items in the database '${TABLE_NAME}'. Continue? >>> `);
    if (continueOption !== 'Y' && continueOption !== 'y') {
      throw `Legacy item purge aborted by user.`;
    }

    // Proceed with deletion:
    // Create transactions:
    let transactionMap = [];
    let transactionMapChunk = { TransactItems: [] }
    let intervalStartTime = new Date().getTime();
    let successes = 0;
    let failures = 0;
    try {
      for (const item of db) {
        updateConsoleProgress(intervalStartTime, 'Creating legacy deletion transaction', db.indexOf(item) + 1, db.length, 100);
        if (transactionMapChunk.TransactItems.length === MAX_TRANSACTION_SIZE) {
          transactionMap.push(transactionMapChunk);
          transactionMapChunk = { TransactItems: [] };
        }
        const deleteObj = {
          TableName: TABLE_NAME,
          Key: {
            pk: { S: item.pk },
            sk: { S: item.sk }
          }
        }
        transactionMapChunk.TransactItems.push({
          Delete: deleteObj
        })
      }
      if (transactionMapChunk.TransactItems.length) {
        transactionMap.push(transactionMapChunk);
      }
    } catch (error) {
      throw `Error creating deletion transactions: ${error}`;
    }
    process.stdout.write('\n');

    // Execute transactions:
    intervalStartTime = new Date().getTime();
    try {
      for (const transaction of transactionMap) {
        updateConsoleProgress(intervalStartTime, 'Executing legacy deletion transaction', transactionMap.indexOf(transaction) + 1, transactionMap.length, 10);
        try {
          await dynamodb.transactWriteItems(transaction).promise();
          successes += transaction.TransactItems.length;
        } catch (error) {
          console.log('Execution error:', error);
          failures += transaction.TransactItems.length;
        }
      }
    } catch (error) {
      throw `Error executing deletion transactions: ${error}`;
    }

    process.stdout.write('\n');
    console.log('Deletions complete.\n');
    console.log('********************');
    console.log('DELETION SUMMARY:\n');

    console.log(`${successes} legacy items successfully deleted.`);
    console.log(`${failures} failures encountered.`)

  } catch (error) {
    console.log('ERROR:', error);
  }
}

run();