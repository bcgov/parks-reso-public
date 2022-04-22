const AWS = require('aws-sdk');
const { dynamodb, TABLE_NAME } = require('../../dynamoUtil');
const { sendResponse } = require('../../responseUtil');
const format = require('date-fns/format')

exports.handler = async (event, context) => {
  
  try {
    console.log('POST: subarea', event);
    if (event?.queryStringParameters?.type === 'config') {
      return await handleConfig(JSON.parse(event.body), context);
    } else if (event?.queryStringParameters?.type === 'activity') {
      // Handle standard monthly entry for this orc::subAreaName::activity
      return await handleActivity(JSON.parse(event.body));
    } else {
      throw "Invalid request";
    }
  } catch (err) {
    console.error(err);
    return sendResponse(400, { msg: 'Invalid request'}, context);
  }
};

async function handleActivity(body, context) {
  // Set pk/sk
  try {
    if (!body.orcs || !body.subAreaName || !body.activity || !body.date) {
    throw "Invalid request.";
    }

    body["pk"] = `${body.orcs}::${body.subAreaName}::${body.activity}`;
    
    if (body.date.length !== 6 || isNaN(body.date)) {
      throw "Invalid date.";
    }

    body["sk"] = body.date;
    body['lastUpdated'] = new Date().toISOString();

    const newObject = AWS.DynamoDB.Converter.marshall(body);

    let putObject = {
      TableName: TABLE_NAME,
      Item: newObject
    };

    await dynamodb.putItem(putObject).promise();
    return sendResponse(200, {}, context);
  } catch (err) {
    console.error(err);
    return sendResponse(400, err, context);
  }
}

async function handleConfig(body, context) {
  try {
    // Set pk/sk

    if (!body.orcs || !body.subAreaName || !body.activity) {
      throw "Invalid request.";
    }

    body["pk"] = `${body.orcs}::${body.subAreaName}::${body.activity}`;
    body["sk"] = 'config';

    const newObject = AWS.DynamoDB.Converter.marshall(body);

    let putObject = {
      TableName: TABLE_NAME,
      Item: newObject,
    };

    await dynamodb.putItem(putObject).promise();
    return sendResponse(200, body, context);
  } catch (err) {
    console.error(err);
    return sendResponse(400, err, context);
  }
}
