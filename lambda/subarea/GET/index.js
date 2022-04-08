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

      // TODO: sk for month or a range

      queryObj.KeyConditionExpression = 'pk =:pk';

      const parkData = await runQuery(queryObj);
      return sendResponse(200, parkData, context);
    } else {
      return sendResponse(400, { msg: 'Invalid Request' }, context);
    }
  } catch (err) {
    console.log(err);
    return sendResponse(400, err, context);
  }
};