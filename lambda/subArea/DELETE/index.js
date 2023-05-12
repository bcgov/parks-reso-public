const AWS = require("aws-sdk");
const { logger } = require("../../logger");
const { sendResponse } = require("../../responseUtil");
const { requirePermissions } = require("../../permissionUtil");
const { getOne, TABLE_NAME, dynamodb, runQuery } = require("../../dynamoUtil");

exports.handler = async (event, context) => {
  logger.info("SubArea delete");
  logger.info(event.queryStringParameters)
  // Check if there are any query string parameters
  if (!event.queryStringParameters
    || (event.queryStringParameters.archive !== "true" && event.queryStringParameters.archive !== "false")
    || !event.queryStringParameters.subAreaId
    || !event.queryStringParameters.orcs
  ) {
    return sendResponse(400, { msg: "Bad Request." }, context);
  }

  // Check if the user is authenticated and has admin permissions.
  try {
    await requirePermissions(event, { "isAuthenticated": true, "isAdmin": true});
  } catch (e) {
    logger.error(e)
    return sendResponse(e.statusCode || 400, e.msg, context);
  }

  // Check if query string has archive flag set to true
  try {
    if (event.queryStringParameters.archive === "true") {
      logger.info("Archiving")
      return await archiveSubArea(event.queryStringParameters.subAreaId, event.queryStringParameters.orcs, context);
    } else {
      logger.info("Deleting")
      return await deleteSubArea(event.queryStringParameters.subAreaId, event.queryStringParameters.orcs, context);
    }
  } catch (e) {
    logger.error(e)
    return sendResponse(e.statusCode || 400, { msg: e.msg }, context);
  }
};

// Delete all sub area records, including activities and configurations.
async function deleteSubArea(subAreaId, orcs, context) {
  // Update the park object.
  await deleteSubAreaFromPark(subAreaId, orcs, context);

  // Remove subarea records.
  const activitiesSet = await deleteSubAreaRecords(subAreaId, orcs, context);
  let activities = [...activitiesSet];
  logger.info("activities:", activities);

  // Remove activity records.
  if (activities.length > 0) {
    await deleteActivityRecords(subAreaId, activities, context);
  }

  logger.info("Done removing activity and activity configs");
  return sendResponse(200, { msg: "SubArea deleted" }, context);
};

async function deleteActivityRecords(subAreaId, activities, context) {
  // delete all items in dynamodb matching pk = `config::${subAreaId}` and sk = `${activity}`
  for (activity of activities) {
    const params = {
      TableName: TABLE_NAME,
      Key: {
        pk: { S: `config::${subAreaId}` },
        sk: { S: `${activity}` }
      }
    }
    logger.info("Deleting activity config:", params);
    const response = await dynamodb.deleteItem(params).promise();
    logger.info("Response:", response);
  }

  // Get all the activity records for the subarea in dynamodb
  let queryObj = {
    TableName: TABLE_NAME,
    KeyConditionExpression: "pk = :pk",
    ExpressionAttributeValues: {
      ':pk': { S: `${subAreaId}::${activity}` },
    }
  };

  let activityrecords = await runQuery(queryObj);

  // Loop through all the items in the activity records
  for (let i = 0; i < activityrecords.length; i++) {
    logger.info("activityrecord:", activityrecords[i])
    await deleteActivityRecord(activityrecords[i].pk, activityrecords[i].sk);
  }
  logger.info("All done deleting activity records")
}

async function deleteActivityRecord(pk, sk) {
  // delete all items in dynamodb matching pk = `${pk}` and sk = `${sk}`
  const params = {
    TableName: TABLE_NAME,
    Key: {
      pk: { S: pk },
      sk: { S: sk }
    }
  }

  logger.info("Deleting activity record:", params);

  const response = await dynamodb.deleteItem(params).promise();

  logger.info("Response:", response);
  return response;
}
async function deleteSubAreaRecords(subAreaId, orcs, context) {
  // delete all items in dynamodb matching pk = `park::${orcs}` and sk = `${subAreaId}`
  const params = {
    TableName: TABLE_NAME,
    Key: {
      pk: { S: `park::${orcs}` },
      sk: { S: `${subAreaId}` }
    },
    ReturnValues: 'ALL_OLD'
  }
  logger.info("Deleting subArea records:", params);
  const response = await dynamodb.deleteItem(params).promise();
  logger.info("Activities deleted:", response.Attributes?.activities.SS);
  return response.Attributes?.activities.SS;
}

async function deleteSubAreaFromPark(subAreaId, orcs, context) {
  const parkObject = await getOne('park', orcs);
  logger.info("ParkObject:", parkObject)
  // Get the index of the subarea in the park object.
  const subAreaIdIndex = parkObject.subAreas.findIndex(element => element.id === subAreaId);
  if (subAreaIdIndex === -1) {
    throw { statusCode: 404, msg: `SubAreaId ${subAreaId} not found` };
  }

  logger.info(`Removing ${JSON.stringify(parkObject.subAreas[subAreaIdIndex])}`);
  logger.info("Current size:", parkObject.subAreas.length)
  // Remove the subarea from the park object.
  const updateParkObject = {
    TableName: TABLE_NAME,
    Key: {
      pk: { S: 'park' },
      sk: { S: orcs }
    },
    ExpressionAttributeValues: {
      ":subAreaSize": AWS.DynamoDB.Converter.input(parkObject.subAreas.length)
    },
    UpdateExpression: `REMOVE subAreas[${subAreaIdIndex}]`,

    // TODO: This should be based on last updated date
    ConditionExpression: `size(subAreas) = :subAreaSize`,
    ReturnValues: 'ALL_NEW'
  };

  const response = await dynamodb.updateItem(updateParkObject).promise();
  const newParkObject = AWS.DynamoDB.Converter.unmarshall(response.Attributes);
  logger.info("Park Object after update:", newParkObject)
  return newParkObject;
}

async function archiveSubArea(subAreaId, orcs, context) {
  // TODO: Implement
  return sendResponse(501, { msg: "SubArea archived" }, context);
};