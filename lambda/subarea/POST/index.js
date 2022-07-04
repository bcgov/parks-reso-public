const AWS = require("aws-sdk");
const { dynamodb, runQuery, TABLE_NAME } = require("../../dynamoUtil");
const { sendResponse } = require("../../responseUtil");
const { decodeJWT, roleFilter, resolvePermissions } = require('../../permissionUtil');
const { logger } = require('../../logger');

exports.handler = async (event, context) => {
  try {
    const token = await decodeJWT(event);
    const permissionObject = resolvePermissions(token);

    if (!permissionObject.isAuthenticated) {
      logger.debug("**NOT AUTHENTICATED, PUBLIC**")
      return sendResponse(403, { msg: "Error: UnAuthenticated." }, context);
    }

    const body = JSON.parse(event.body);

    if (!permissionObject.isAdmin && permissionObject.roles.includes(`${body.orcs}:${body.subAreaId}`) === false) {
      return sendResponse(403, { msg: 'Unauthorized.' }, context);
    }

    if (event?.queryStringParameters?.type === "config") {
      return await handleConfig(body, context);
    } else if (event?.queryStringParameters?.type === "activity") {
      // Handle standard monthly entry for this orc::subAreaName::activity
      return await handleActivity(body);
    } else {
      throw "Invalid request";
    }
  } catch (err) {
    logger.error(err);
    return sendResponse(400, { msg: "Invalid request" }, context);
  }
};

async function handleActivity(body, context) {
  // Set pk/sk
  try {
    if (!body.subAreaId || !body.activity || !body.date) {
      throw "Invalid request.";
    }

    const pk = `${body.subAreaId}::${body.activity}`;

    // Get config to attach to activity
    const configObj = {
      TableName: TABLE_NAME,
      ExpressionAttributeValues: {
        ":pk": { S: `config::${body.subAreaId}`},
        ":sk": { S: body.activity },
      },
      KeyConditionExpression: "pk =:pk AND sk =:sk",
    };
    const configData = (await runQuery(configObj))[0];
    body["config"] = configData;

    body["pk"] = pk;

    if (body.date.length !== 6 || isNaN(body.date)) {
      throw "Invalid date.";
    }

    body["sk"] = body.date;
    body["lastUpdated"] = new Date().toISOString();

    const newObject = AWS.DynamoDB.Converter.marshall(body);

    let putObject = {
      TableName: TABLE_NAME,
      Item: newObject,
    };

    await dynamodb.putItem(putObject).promise();
    return sendResponse(200, {}, context);
  } catch (err) {
    logger.error(err);
    return sendResponse(400, err, context);
  }
}

async function handleConfig(body, context) {
  try {
    // Set pk/sk

    if (!body.subAreaId || !body.activity) {
      throw "Invalid request.";
    }

    body["pk"] = `config::${body.subAreaId}`;
    body["sk"] = body.activity;

    const newObject = AWS.DynamoDB.Converter.marshall(body);

    let putObject = {
      TableName: TABLE_NAME,
      Item: newObject,
    };

    await dynamodb.putItem(putObject).promise();
    return sendResponse(200, body, context);
  } catch (err) {
    logger.error(err);
    return sendResponse(400, err, context);
  }
}
