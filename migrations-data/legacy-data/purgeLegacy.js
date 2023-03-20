const AWS = require("aws-sdk");
const { runScan, TABLE_NAME, dynamodb } = require("../../lambda/dynamoUtil");
const { getConsoleInput, updateConsoleProgress, clientIDsAR, removeRoleFromKeycloak, isTokenExpired } = require("./legacy-data-functions");

const MAX_TRANSACTION_SIZE = 25;

async function run() {
  console.log('********************');
  console.log('PURGE LEGACY ITEMS\n');

  let env;
  let token;
  let kcURL;

  if (process.argv.length <= 3) {
    console.log("Invalid parameters.");
    console.log("");
    console.log("Usage: node purgeLegacy.js <env> <token>");
    console.log("");
    console.log("Options");
    console.log("    <env>: dev/test/prod");
    console.log("    <token>: Your encoded JWT for the KeyCloak realm.");
    console.log("");
    console.log("example: node purgeLegacy.js dev xxxx");
    console.log("");
    return;
  } else {
    env = process.argv[2];
    token = process.argv[3];
    const environment = env === 'prod' ? '' : env + '.';
    const clientID = clientIDsAR[env];
    kcURL = `https://${environment}loginproxy.gov.bc.ca/auth/admin/realms/bcparks-service-transformation/clients/${clientID}/roles`;
    console.log("Setting KC URL:", kcURL);
  }

  try {
    if (isTokenExpired(token)){
      throw 'KeyCloak token has expired.'
    }
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
    let continueOption = await getConsoleInput(`Proceeding will permanently delete all legacy items in the database '${TABLE_NAME}', and will permanently delete the related KC roles to those legacy items. Continue? [Y/N] >>> `);
    if (continueOption !== 'Y' && continueOption !== 'y') {
      throw `Legacy item purge aborted by user.`;
    }

    // Proceed with deletion:
    // Create transactions:
    let transactionMap = [];
    let transactionMapChunk = { TransactItems: [] }
    let intervalStartTime = new Date().getTime();
    let successes = [];
    let failures = [];
    let removedRoles = [];

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
          for (const item of transaction.TransactItems) {
            try {
              // determine KC role to delete based on transaction item
              // this way if KC role creation fails, the transaction fails and we can track failures clearer
              const key = AWS.DynamoDB.Converter.unmarshall(item?.Delete?.Key);
              if (key.pk.startsWith('park::')) {
                // The item is a subarea
                const orcs = key.pk.split('::')[1];
                const role = `${orcs}:${key.sk}`
                await removeRoleFromKeycloak(role, kcURL, token);
                removedRoles.push(role);
              }
            } catch (error) {
              if (error?.response?.status === 404) {
                // Role doesnt exist
                continue;
              }
              throw `Failed to delete KeyCloak role: ${error}`;
            }
          }
          await dynamodb.transactWriteItems(transaction).promise();
          successes.push(transaction.TransactItems);
        } catch (error) {
          console.log('Execution error:', error);
          failures.push(transaction.TransactItems);
        }
      }
    } catch (error) {
      throw `Error executing deletion transactions: ${error}`;
    }

    process.stdout.write('\n');
    console.log('Deletions complete.\n');
    console.log('********************');
    console.log('DELETION SUMMARY:\n');

    console.log(`${successes.length} legacy items successfully deleted.`);
    console.log(`${removedRoles.length} KC roles successfully deleted.`);
    console.log(`${failures.length} failures encountered.`);

    const viewFailures = await getConsoleInput('Review failures? [Y/N] >>> ');
    if (viewFailures === 'Y' || viewFailures === 'y'){
      console.log('Failures:', Object.entries(failures));
    }

  } catch (error) {
    console.log('ERROR:', error);
  }
}

run();