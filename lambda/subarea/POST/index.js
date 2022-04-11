const AWS = require('aws-sdk');
const { dynamodb, TABLE_NAME } = require('../../dynamoUtil');
const { sendResponse } = require('../../responseUtil');
const format = require('date-fns/format')

exports.handler = async (event, context) => {
  console.log('POST: subarea', event);

  if (event.queryStringParameters.type === 'config') {
    return await handleConfig(event);
  } else if (event.queryStringParameters.type === 'activity') {
    // Handle standard monthly entry for this orc::subAreaName::activity
    return await handleActivity(event);
  } else {
    return sendResponse(400, { msg: 'Invalid request'}, context);
  }
};

async function handleActivity(event) {
// Set pk/sk
  event.body["pk"] = `${event.body.orcs}::${event.body.subAreaName}::${event.body.activity}`;

  if (date.length !== 6 || isNaN(date)) {
    return sendResponse(400, { msg: "Invalid date."}, context);
  }

  event.body["sk"] = event.body.date;

  const newObject = AWS.DynamoDB.Converter.marshall(event.body);

  let putObject = {
    TableName: TABLE_NAME,
    ConditionExpression: 'attribute_not_exists(pk) AND attribute_not_exists(sk)',
    Item: newObject
  };

  try {
    await dynamodb.putItem(putObject).promise();
    return sendResponse(200, {}, context);
  } catch (err) {
    console.log("Error:", err);
    return sendResponse(400, err, context);
  }
}

async function handleConfig(event) {
  // Set pk/sk
  event.body["pk"] = `${event.body.orcs}::${event.body.subAreaName}::${event.body.activity}`;
  event.body["sk"] = 'config';

  const newObject = AWS.DynamoDB.Converter.marshall(event.body);

  let putObject = {
    TableName: TABLE_NAME,
    ConditionExpression: 'attribute_not_exists(pk) AND attribute_not_exists(sk)',
    Item: newObject
  };

  try {
    const res = await dynamodb.putItem(putObject).promise();
    return sendResponse(200, res, context);
  } catch (err) {
    console.log("Error:", err);
    return sendResponse(400, err, context);
  }
}