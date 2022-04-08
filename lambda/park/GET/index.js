const AWS = require('aws-sdk');
const { runQuery, TABLE_NAME } = require('../../dynamoUtil');
const { sendResponse } = require('../../responseUtil');

exports.handler = async (event, context) => {
  console.log('GET: Park', event);

  let queryObj = {
    TableName: TABLE_NAME
  };

  try {
    if (!event.queryStringParameters) {
      // Get me a list of parks, with subareas
      queryObj.ExpressionAttributeValues = {};
      queryObj.ExpressionAttributeValues[':pk'] = { S: 'park' };
      queryObj.KeyConditionExpression = 'pk =:pk';

      const parkData = await runQuery(queryObj);
      return sendResponse(200, parkData, context);
    } else if (event.queryStringParameters?.orcs){
      // Get me a list of this parks' subareas with activities details, including config details
      queryObj.ExpressionAttributeValues = {};
      queryObj.ExpressionAttributeValues[':pk'] = { S: 'park::' + event.queryStringParameters?.orcs };
      queryObj.KeyConditionExpression = 'pk =:pk';

      const parkData = await runQuery(queryObj);
      return sendResponse(200, parkData, context);
    }
  } catch (err) {
    console.log(err);
    return sendResponse(400, err, context);
  }
};