const { dynamodb, TABLE_NAME } = require("../../dynamoUtil");
const { decodeJWT, resolvePermissions } = require("../../permissionUtil");
const { logger } = require("../../logger");
const { sendResponse } = require("../../responseUtil");

exports.handler = async (event, context) => {
  logger.debug("Park POST:", event);
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

    if (!body.orcs || !body.parkName) {
      return sendResponse(400, { msg: "Invalid request" }, context);
    }

    const postObj = {
      TableName: TABLE_NAME,
      ConditionExpression: "attribute_not_exists(sk)",
      Item: {
        pk: { S: `park` },
        sk: { S: body.orcs },
        orcs: { S: body.orcs },
        parkName: { S: body.parkName },
        isLegacy: { BOOL: body.isLegacy ? body.isLegacy : false },
        roles: { SS: ["sysadmin", body.orcs] },
        subAreas: { L: [] },
      },
    };

    logger.debug("Creating park:", postObj);
    const res = await dynamodb.putItem(postObj).promise();
    logger.info("Park Created");
    logger.debug("Result:", res);
    return sendResponse(200, res);
  } catch (err) {
    logger.error(err);
    return sendResponse(400, { msg: "Invalid request" }, context);
  }
};
