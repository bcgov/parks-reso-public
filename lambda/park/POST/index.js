const AWS = require('aws-sdk');
const { dynamodb, TABLE_NAME } = require('../../dynamoUtil');
const { sendResponse } = require('../../responseUtil');

exports.handler = async (event, context) => {
  console.log('POST: Park', event.body);

  // Set pk/sk
  event.body["pk"] = "park";
  event.body["sk"] = event.body.orcs;
  event.body['lastUpdated'] = new Date();

  let newObject = AWS.DynamoDB.Converter.marshall(event.body);

  let putObject = {
    TableName: TABLE_NAME,
    ConditionExpression: 'attribute_not_exists(pk) AND attribute_not_exists(sk)',
    Item: newObject
  };

  try {
    // Add a basic park
    const addParkResponse = await dynamodb.putItem(putObject).promise();
    return sendResponse(200, { msg: "Put success"}, context);
  } catch (err) {
    console.log("Error:", err);
    return sendResponse(400, err, context);
  }
};