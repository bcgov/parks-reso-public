const { runQuery, TABLE_NAME } = require("../../dynamoUtil");
const { sendResponse } = require("../../responseUtil");
const {
  decodeJWT,
  roleFilter,
  resolvePermissions,
} = require("../../permissionUtil");
const { logger } = require("../../logger");

exports.handler = async (event, context) => {
  logger.debug("Variance get:", event);

  try {
    const token = await decodeJWT(event);
    const permissionObject = resolvePermissions(token);

    // Only admins see this route.
    if (permissionObject.isAdmin) {
      // Sysadmin, they get it all
      logger.info("**Sysadmin**");
    } else {
      logger.info("**Someone else**");
      return sendResponse(403, { msg: "Error: UnAuthenticated." }, context);
    }

    const subAreaId = event.queryStringParameters.subAreaId;
    const activity = event.queryStringParameters.activity;
    const activityDate = event.queryStringParameters.date;
    const lastEvaluatedKey = event.queryStringParameters.lastEvaluatedKey;

    if (!event.queryStringParameters
      || !subAreaId
      || !activity) {
      return sendResponse(400, { msg: "Invalid request." });
    }

    return await getVarianceRecords(subAreaId, activity, activityDate, lastEvaluatedKey)
  } catch (e) {
    console.error(e);
  }

  return sendResponse(400, { msg: "Invalid request." }, context);
};

async function getVarianceRecords(subAreaId, activity, activityDate, lastEvaluatedKey, context) {
  let queryObj = {
    TableName: TABLE_NAME
  };

  queryObj.ExpressionAttributeValues = {};
  queryObj.ExpressionAttributeValues[':pk'] = { S: `variance::${subAreaId}::${activity}` };
  queryObj.KeyConditionExpression = 'pk =:pk';

  if (activityDate) {
    queryObj.ExpressionAttributeValues[':sk'] = { S: `${activityDate}` };
    queryObj.KeyConditionExpression = 'pk =:pk AND sk =:sk';
  }

  if (lastEvaluatedKey) {
    queryObj.ExclusiveStartKey = lastEvaluatedKey;
  }

  try {
    const data = await runQuery(queryObj, true);
    return sendResponse(200, data, context);
  } catch (e) {
    logger.error(e);
    return sendResponse(400, { msg: "Invalid request." }, context);
  }
}
