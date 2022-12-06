const AWS = require('aws-sdk');
const { runQuery, TABLE_NAME } = require('../../dynamoUtil');
const { sendResponse } = require('../../responseUtil');
const { decodeJWT, roleFilter, resolvePermissions } = require('../../permissionUtil');
const { logger } = require('../../logger');

exports.handler = async (event, context) => {
  logger.debug('GET: Subarea', event);

  let queryObj = {
    TableName: TABLE_NAME
  };

  try {
    const token = await decodeJWT(event);
    const permissionObject = resolvePermissions(token);

    if (!permissionObject.isAuthenticated) {
      logger.info("**NOT AUTHENTICATED, PUBLIC**")
      return sendResponse(403, { msg: "Error: UnAuthenticated." }, context);
    }

    if (event?.queryStringParameters?.subAreaId
        && event?.queryStringParameters?.activity
        && event?.queryStringParameters?.date
        && event?.queryStringParameters?.orcs) {
      // Get the subarea details
      const subAreaId = event.queryStringParameters?.subAreaId;
      const activity = event.queryStringParameters?.activity;
      const date = event.queryStringParameters?.date;
      const orcs = event.queryStringParameters?.orcs;

      if (!permissionObject.isAdmin && permissionObject.roles.includes(`${orcs}:${subAreaId}`) === false) {
        logger.info("Not authorized.");
        logger.debug(permissionObject);
        return sendResponse(403, { msg: 'Unauthorized.'}, context);
      }

      // Get me a list of this park's subarea details
      queryObj.ExpressionAttributeValues = {};
      queryObj.ExpressionAttributeValues[':pk'] = { S: `${subAreaId}::${activity}` };
      queryObj.ExpressionAttributeValues[':sk'] = { S: `${date}` };

      queryObj.KeyConditionExpression = 'pk =:pk AND sk =:sk';
      // Get record (if exists)
      const parkDataRaw = await runQuery(queryObj);
      const parkData = parkDataRaw.length > 0 ? parkDataRaw[0] : {};

      // Attach current config
      let configObj = {
        TableName: TABLE_NAME,
        ExpressionAttributeValues: {
          ':pk':  { S: `config::${subAreaId}` },
          ':sk': { S: activity }
        },
        KeyConditionExpression: 'pk =:pk AND sk =:sk'
      };
      const configData = (await runQuery(configObj))[0];

      const { pk, sk, ...otherProps } = configData;
      logger.info('Subarea Get returning.');
      return sendResponse(200, { ...parkData, config: otherProps }, context);
    } else {
      throw "Invalid parameter call.";
    }
  } catch (err) {
    logger.error(err);
    return sendResponse(400, err, context);
  }
};