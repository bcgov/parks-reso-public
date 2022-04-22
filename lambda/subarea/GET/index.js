const AWS = require('aws-sdk');
const { runQuery, TABLE_NAME } = require('../../dynamoUtil');
const { sendResponse } = require('../../responseUtil');

exports.handler = async (event, context) => {
  console.log('GET: Subarea', event);

  let queryObj = {
    TableName: TABLE_NAME
  };

  try {
    if (event?.queryStringParameters?.orcs
        && event?.queryStringParameters?.subAreaName
        && event?.queryStringParameters?.activity
        && event?.queryStringParameters?.date) {
      // Get the subarea details
      const orcs = event.queryStringParameters?.orcs;
      const subAreaName = event.queryStringParameters?.subAreaName;
      const activity = event.queryStringParameters?.activity;
      const date = event.queryStringParameters?.date;

      // Get me a list of this park's subarea details
      queryObj.ExpressionAttributeValues = {};
      queryObj.ExpressionAttributeValues[':pk'] = { S: `${orcs}::${subAreaName}::${activity}` };
      queryObj.ExpressionAttributeValues[':sk'] = { S: `${date}` };

      queryObj.KeyConditionExpression = 'pk =:pk AND sk =:sk';
      // Get record (if exists)
      const parkDataRaw = await runQuery(queryObj);
      const parkData = parkDataRaw.length > 0 ? parkDataRaw[0] : {};
      console.log("parkData:", parkData);

      // Attach current config
      let configObj = {
        TableName: TABLE_NAME,
        ExpressionAttributeValues: {
          ':pk':  { S: `${orcs}::${subAreaName}::${activity}` },
          ':sk': { S: 'config' }
        },
        KeyConditionExpression: 'pk =:pk AND sk =:sk'
      };
      const configData = (await runQuery(configObj))[0];

      const { pk, sk, ...otherProps } = configData;
      return sendResponse(200, { ...parkData, config: otherProps }, context);
    } else {
      throw "Invalid parameter call.";
    }
  } catch (err) {
    console.error(err);
    return sendResponse(400, err, context);
  }
};