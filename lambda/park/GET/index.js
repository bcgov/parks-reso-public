const AWS = require('aws-sdk');
const { runQuery, TABLE_NAME } = require('../../dynamoUtil');
const { sendResponse } = require('../../responseUtil');

exports.handler = async (event, context) => {
  console.log('GET: Park', event.queryStringParameters);

  let queryObj = {
    TableName: TABLE_NAME
  };

  try {
    if (!event.queryStringParameters) {
      // Get me a list of parks, with subareas
      queryObj.ExpressionAttributeValues = {};
      queryObj.ExpressionAttributeValues[':pk'] = { S: 'park' };
      queryObj.KeyConditionExpression = 'pk =:pk';

      let results = [];
      let parkData;
      do {
        parkData = await runQuery(queryObj, true);
        parkData.data.forEach((item) => results.push(item));
        queryObj.ExclusiveStartKey = parkData.LastEvaluatedKey;
      } while (typeof parkData.LastEvaluatedKey !== "undefined");
      return sendResponse(200, results, context);
    } else if (event.queryStringParameters?.orcs) {
      // Get me a list of this parks' subareas with activities details, including config details
      queryObj.ExpressionAttributeValues = {};
      queryObj.ExpressionAttributeValues[':pk'] = { S: 'park::' + event.queryStringParameters?.orcs };
      queryObj.KeyConditionExpression = 'pk =:pk';

      if (event?.queryStringParameters?.subAreaName) {
        // sk for month or a range
        queryObj.ExpressionAttributeValues[':sk'] = { S: `${event.queryStringParameters?.subAreaName}` };
        queryObj.KeyConditionExpression += ' AND sk =:sk';
      }

      let results = [];
      let parkData;
      do {
        parkData = await runQuery(queryObj, true);
        parkData.data.forEach((item) => results.push(item));
        queryObj.ExclusiveStartKey = parkData.LastEvaluatedKey;
      } while (typeof parkData.LastEvaluatedKey !== "undefined");
      return sendResponse(200, parkData, context);
    } else {
      throw "Invalid parameters for call.";
    }
  } catch (err) {
    console.error(err);
    return sendResponse(400, err, context);
  }
};