const AWS = require('aws-sdk');
const { dynamodb, TABLE_NAME } = require('../../dynamoUtil');
const { sendResponse } = require('../../responseUtil');

exports.handler = async (event, context) => {
  try {
    let body = JSON.parse(event.body);

    console.log("BO:", body);

    if (body.orcs === undefined) {
      throw "Invalid request.";
    }

    // Set pk/sk
    body["pk"] = "park";
    body["sk"] = body.orcs;
    body['lastUpdated'] = new Date().toISOString();

    let newObject = AWS.DynamoDB.Converter.marshall(body);

    let putObject = {
      TableName: TABLE_NAME,
      ConditionExpression: 'attribute_not_exists(pk) AND attribute_not_exists(sk)',
      Item: newObject
    };

    console.log("PUT:", putObject);
    // Add a basic park
    await dynamodb.putItem(putObject).promise();
    return sendResponse(200, { msg: "Put success"}, context);
  } catch (err) {
    console.error(err);
    return sendResponse(400, err, context);
  }
};