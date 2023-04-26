const AWS = require('aws-sdk');

const data = require('./dump.json');

const TABLE_NAME = process.env.TABLE_NAME || 'ar-tests';
const MAX_TRANSACTION_SIZE = 25;

const options = {
  region: 'ca-central-1',
  endpoint: process.env.IS_OFFLINE == 'true' ? 'http://localhost:8000' : 'https://dynamodb.ca-central-1.amazonaws.com'
};

console.log("USING CONFIG:", options);

const dynamodb = new AWS.DynamoDB(options);

function formatTime(time) {
  let sec = parseInt(time / 1000, 10);
  let hours = Math.floor(sec / 3600);
  let minutes = Math.floor((sec - (hours * 3600)) / 60);
  let seconds = sec - (hours * 3600) - (minutes * 60);
  if (hours < 10) { hours = "0" + hours; }
  if (minutes < 10) { minutes = "0" + minutes; }
  if (seconds < 10) { seconds = "0" + seconds; }
  return hours + ':' + minutes + ':' + seconds;
}

function updateConsoleProgress(intervalStartTime, text, complete = 0, total = 1, modulo = 1) {
  if (complete === 1 || complete % modulo === 0 || complete === total) {
    const currentTime = new Date().getTime();
    let currentElapsed = currentTime - intervalStartTime;
    let remainingTime = NaN;
    if (complete !== 0) {
      let totalTime = (total / complete) * currentElapsed;
      remainingTime = totalTime - currentElapsed;
    }
    const percent = (complete / total) * 100;
    process.stdout.write(` ${text}: ${complete}/${total} (${percent.toFixed(1)}%) completed in ${formatTime(currentElapsed)} (~${formatTime(remainingTime)} remaining)\r`);
  }
}

async function run() {
  console.log("Running importer");
  let startTime = new Date().getTime();
  try {
    for (let i = 0; i < data.Items.length; i += MAX_TRANSACTION_SIZE) {
      updateConsoleProgress(startTime, "Importing", i + 1, data.Items.length, 1);
      let dataChunk = data.Items.slice(i, i + MAX_TRANSACTION_SIZE);
      let batchWriteChunk = { RequestItems: {[TABLE_NAME]: []} };
      for (const item of dataChunk) {
        batchWriteChunk.RequestItems[TABLE_NAME].push({
          PutRequest: {
            Item: item
          }
        });
      }
      await dynamodb.batchWriteItem(batchWriteChunk).promise();
    }
  } catch (error) {
    console.log("\nERROR:", error);
  }
  console.log("\nImport complete.");
}

run();
