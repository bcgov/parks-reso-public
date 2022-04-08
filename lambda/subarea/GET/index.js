const AWS = require('aws-sdk');
const { runQuery, TABLE_NAME } = require('../../dynamoUtil');
const { sendResponse } = require('../../responseUtil');

exports.handler = async (event, context) => {
  console.log('GET: Subarea', event);

  let queryObj = {
    TableName: TABLE_NAME
  };

  try {
    if (event.queryStringParameters?.orcs && event.queryStringParameters?.subAreaName && event.queryStringParameters?.activity) {
      // Get the subarea details
      const orcs = event.queryStringParameters?.orcs;
      const subAreaName = event.queryStringParameters?.subAreaName;
      const activity = event.queryStringParameters?.activity;

      // Get me a list of this park's subarea details
      queryObj.ExpressionAttributeValues = {};
      queryObj.ExpressionAttributeValues[':pk'] = { S: `${orcs}::${subAreaName}::${activity}` };

      queryObj.KeyConditionExpression = 'pk =:pk';

      if (event.queryStringParameters?.date) {
        // sk for month or a range
        queryObj.ExpressionAttributeValues[':sk'] = { S: `${event.queryStringParameters?.date}` };
        queryObj.KeyConditionExpression += ' AND sk =:sk';
      }
      console.log("Q:", queryObj);
      const parkData = await runQuery(queryObj);
      return sendResponse(200, parkData, context);
    } else {
      return sendResponse(400, { msg: 'Invalid Request' }, context);
    }
  } catch (err) {
    console.log("E:", err);
    return sendResponse(400, err, context);
  }
};