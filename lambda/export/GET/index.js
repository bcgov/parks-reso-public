const AWS = require("aws-sdk");

const options = {};
if (process.env.IS_OFFLINE) {
  options.region = "local-env";
  // For local we use port 3002 because we're hitting an invokable
  options.endpoint = "http://localhost:3002";
}
const lambda = new AWS.Lambda(options);

const { runQuery, TABLE_NAME } = require("../../dynamoUtil");
const { sendResponse } = require("../../responseUtil");
const { checkPermissions } = require("../../permissionUtil");
const { convertRolesToMD5 } = require("../functions");

const EXPORT_FUNCTION_NAME =
  process.env.EXPORT_FUNCTION_NAME || "bcparks-ar-api-api-exportInvokable";

exports.handler = async (event, context) => {
  console.log("GET: Export", event.queryStringParameters);

  let queryObj = {
    TableName: TABLE_NAME,
  };

  try {
    const tokenObj = await checkPermissions(event);
    if (tokenObj.decoded !== true) {
      return sendResponse(403, { msg: "Unauthorized" });
    }
    let roles = tokenObj.data.resource_access["attendance-and-revenue"].roles;
    roles = roles.includes("sysadmin") ? ["sysadmin"] : roles;
    const sk = convertRolesToMD5(roles, "export-");

    queryObj.ExpressionAttributeValues = {};
    queryObj.ExpressionAttributeValues[":pk"] = { S: "job" };
    queryObj.ExpressionAttributeValues[":sk"] = { S: sk };
    queryObj.ExpressionAttributeValues[":percent"] = { S: "100" };
    queryObj.KeyConditionExpression = "pk =:pk and sk =:sk";
    queryObj.FilterExpression = "progressPercentage < :percent";

    // Do a query to look for the existing report
    const res = await runQuery(queryObj);
    if (res.length === 0) {
      // TODO: We need a flag here for if we actually want to make a new job or download the file.
      console.log("Job not found. Making new export job.");

      const params = {
        FunctionName: EXPORT_FUNCTION_NAME,
        InvocationType: "Event",
        LogType: "None",
        Payload: JSON.stringify({
          jobId: sk,
          roles: roles,
        }),
      };
      // Invoke generate report function
      await lambda.invoke(params).promise();

      return sendResponse(200, {}, context);
    } else {
      console.log("Job found.");
      // TODO:
      // We have a worker id
      // query database for worker id
      // match requesterID with jwt from queryStringParameters
      //   if requesterID and jwt does not match, throw error
      //   return the worker object
    }
  } catch (error) {
    console.error(error);
    return sendResponse(400, error, context);
  }
};
