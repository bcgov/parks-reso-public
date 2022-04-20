const AWS = require('aws-sdk');
const { dynamodb, TABLE_NAME } = require('../../dynamoUtil');
const { sendResponse } = require('../../responseUtil');
const format = require('date-fns/format')

exports.handler = async (event, context) => {
  console.log('POST: subarea', event);

  if (event.queryStringParameters.type === 'config') {
    return await handleConfig(JSON.parse(event.body), context);
  } else if (event.queryStringParameters.type === 'activity') {
    // Handle standard monthly entry for this orc::subAreaName::activity
    return await handleActivity(JSON.parse(event.body));
  } else {
    return sendResponse(400, { msg: 'Invalid request'}, context);
  }
};

async function handleActivity(body, context) {
// Set pk/sk
  body["pk"] = `${body.orcs}::${body.subAreaName}::${body.activity}`;
  
  if (body.date.length !== 6 || isNaN(body.date)) {
    return sendResponse(400, { msg: "Invalid date."}, context);
  }

  body["sk"] = body.date;

  const newObject = AWS.DynamoDB.Converter.marshall(body);

  let putObject = {
    TableName: TABLE_NAME,
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

async function handleConfig(body, context) {
  // Set pk/sk
  body["pk"] = `${body.orcs}::${body.subAreaName}::${body.activity}`;
  body["sk"] = 'config';

  const newObject = AWS.DynamoDB.Converter.marshall(body);

  let putObject = {
    TableName: TABLE_NAME,
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
