const { dynamodb, TABLE_NAME } = require("../../dynamoUtil");
const { decodeJWT, resolvePermissions } = require("../../permissionUtil");
const { logger } = require("../../logger");
const { sendResponse } = require("../../responseUtil");

exports.handler = async (event, context) => {
  logger.debug("Variance PUT:", event);
  try {
    const token = await decodeJWT(event);
    const permissionObject = resolvePermissions(token);

    if (!permissionObject.isAuthenticated) {
      logger.info("**NOT AUTHENTICATED, PUBLIC**");
      return sendResponse(403, { msg: "Error: Unauthenticated." }, context);
    }

    // Admins only
    if (!permissionObject.isAdmin) {
      logger.info("Not authorized.");
      return sendResponse(403, { msg: "Unauthorized." }, context);
    }

    const body = JSON.parse(event.body);

    if (!body.subAreaId || !body.activity || !body.date) {
      return sendResponse(400, { msg: "Invalid request" }, context);
    }

    let params = {
      TableName: TABLE_NAME,
      ConditionExpression: "attribute_exists(pk) AND attribute_exists(sk)",
      Key: {
        pk: { S: `variance::${body.subAreaId}::${body.activity}` },
        sk: { S: body.date }
      },
      UpdateExpression: `SET notes =:notes, resolved =:resolved, #roles =:roles`,
      ExpressionAttributeValues: {
        ':notes': { S: body.notes },
        ':resolved': { BOOL: body.resolved ? body.resolved : false },
        ':roles': { SS: ["sysadmin"] }
      },
      ExpressionAttributeNames: {
        '#roles': 'roles'
      }
    };

    if (body.fields) {
      params.ExpressionAttributeValues[':fields'] = { L: body.fields.map(item => ({ S: item })) };
      params.UpdateExpression += ', #fields =:fields';
      params.ExpressionAttributeNames['#fields'] = 'fields';
    }

    const res = await dynamodb.updateItem(params).promise();
    logger.info("Variance updated");
    logger.debug("Result:", res);
    return sendResponse(200, res);
  } catch (err) {
    logger.error(err);
    return sendResponse(400, { msg: "Invalid request" }, context);
  }
};
