const AWS = require('aws-sdk');
const { runQuery, TABLE_NAME } = require('../../dynamoUtil');
const { sendResponse } = require('../../responseUtil');
const { decodeJWT, roleFilter, resolvePermissions } = require('../../permissionUtil');
const { logger } = require('../../logger');

exports.handler = async (event, context) => {
  logger.info('GET: Park');
  logger.debug(event);

  let queryObj = {
    TableName: TABLE_NAME
  };

  try {
    const token = await decodeJWT(event);
    const permissionObject = resolvePermissions(token);

    if (!permissionObject.isAuthenticated) {
      logger.info("**NOT AUTHENTICATED, PUBLIC**")
      return sendResponse(403, {msg: "Error: UnAuthenticated."}, context);
    }

    if (!event.queryStringParameters) {
      // Get me a list of parks, with subareas
      queryObj.ExpressionAttributeValues = {};
      queryObj.ExpressionAttributeValues[':pk'] = { S: 'park' };
      queryObj.ExpressionAttributeValues[':isLegacy'] = { BOOL: false };
      queryObj.KeyConditionExpression = 'pk =:pk';
      queryObj.FilterExpression = 'attribute_not_exists(isLegacy) OR isLegacy = :isLegacy';
      let results = [];
      let parkData;
      do {
        parkData = await runQuery(queryObj, true);
        parkData.data.forEach((item) => results.push(item));
        queryObj.ExclusiveStartKey = parkData.LastEvaluatedKey;
      } while (typeof parkData.LastEvaluatedKey !== "undefined");

      if (permissionObject.isAdmin) {
        // Sysadmin, they get it all
        logger.info("**Sysadmin**")
      } else {
        // Some other authenticated role
        logger.info("**Some other authenticated person with attendance-and-revenue roles**")
        logger.debug("permissionObject.roles:", permissionObject.roles);
        // We're getting parks, so take their role and grab the orcs id from the front
        const parkRoles = permissionObject.roles.map(item => {
          return item.split(":")[0]
        });
        logger.debug("Effective park roles:", parkRoles)
        results = await roleFilter(results, parkRoles);
        results = await filterSubAreaAccess(permissionObject, results);
        logger.debug(results);
      }
      logger.debug("RES:", results);
      return sendResponse(200, results, context);
    } else if (event.queryStringParameters?.orcs) {
      // Get me a list of this parks' subareas with activities details, including config details
      queryObj.ExpressionAttributeValues = {};
      queryObj.ExpressionAttributeValues[':pk'] = { S: 'park::'+ event.queryStringParameters?.orcs };
      queryObj.KeyConditionExpression = 'pk =:pk';

      if (event?.queryStringParameters?.subAreaId) {
        // get specific subarea by subAreaId
        queryObj.ExpressionAttributeValues[':sk'] = { S: `${event.queryStringParameters?.subAreaId}` };
        queryObj.KeyConditionExpression += ' AND sk =:sk';
      }

      let results = [];
      let parkData;
      do {
        parkData = await runQuery(queryObj, true);
        parkData.data.forEach((item) => results.push(item));
        queryObj.ExclusiveStartKey = parkData.LastEvaluatedKey;
      } while (typeof parkData.LastEvaluatedKey !== "undefined");

      if (permissionObject.isAdmin) {
        // Sysadmin, they get it all
        logger.info("**Sysadmin**")
      } else {
        // Some other authenticated role
        logger.info("**Some other authenticated person with attendance-and-revenue roles**")
        logger.debug("permissionObject.roles:", permissionObject.roles);
        const parkRoles = permissionObject.roles.map(item => {
          return item.split(":")[0]
        });
        results = await roleFilter(results, parkRoles);
        // TODO: Filter park, don't give everything
        results = await filterSubAreaAccess(permissionObject, results);
        logger.debug(JSON.stringify(parkData));
      }

      return sendResponse(200, parkData, context);
    } else {
      throw "Invalid parameters for call.";
    }
  } catch (err) {
    logger.error(err);
    return sendResponse(400, err, context);
  }
};

async function filterSubAreaAccess(permissionObject, parks) {
  logger.debug("filterSubAreaAccess:", permissionObject);

  let newParks = [];
  for (let park of parks) {
    let parkSubAreaAccess = [];
    let results = [];
    logger.info("filterSubAreaAccess:", park.orcs);
    let queryObj = {
      TableName: TABLE_NAME
    };
    queryObj.ExpressionAttributeValues = {};
    queryObj.ExpressionAttributeValues[':pk'] = { S: `park::${park.orcs}` };
    queryObj.KeyConditionExpression = 'pk =:pk';

    let parkData;

    do {
      parkData = await runQuery(queryObj, true);
      parkData.data.forEach((item) => results.push(item));
      queryObj.ExclusiveStartKey = parkData.LastEvaluatedKey;
    } while (typeof parkData.LastEvaluatedKey !== "undefined");

    results = await roleFilter(results, permissionObject.roles);
    results.forEach((item) => {
      parkSubAreaAccess.push({name: item.subAreaName, id: item.sk});
    });
    park.subAreas = parkSubAreaAccess
    newParks.push(park);
  }

  logger.debug("newParks:", newParks);
  return newParks;
}