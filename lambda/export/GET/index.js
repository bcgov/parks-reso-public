const AWS = require("aws-sdk");
const s3 = new AWS.S3();

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

const EXPIRY_TIME = process.env.EXPORT_EXPIRY_TIME || 60 * 15; // 15 minutes

exports.handler = async (event, context) => {
  console.log("GET: Export", event.queryStringParameters);

  let queryObj = {
    TableName: TABLE_NAME,
    ExpressionAttributeValues: {},
  };

  try {
    const tokenObj = await checkPermissions(event);
    if (tokenObj.decoded !== true) {
      return sendResponse(403, { msg: "Unauthorized" });
    }
    let roles = tokenObj.data.resource_access["attendance-and-revenue"].roles;
    roles = roles.includes("sysadmin") ? ["sysadmin"] : roles;
    // This will give us the sk
    const sk = convertRolesToMD5(roles, "export-");

    queryObj.ExpressionAttributeValues[":pk"] = { S: "job" };
    queryObj.ExpressionAttributeValues[":sk"] = { S: sk };
    queryObj.KeyConditionExpression = "pk =:pk and sk =:sk";

    if (event?.queryStringParameters?.getJob) {
      const res = (await runQuery(queryObj))[0];
      // If the getJob flag is set, that means we are trying to download the report
      if (!res) {
        // Job does not exist.
        return sendResponse(200, { status: "Job not found" }, context);
      } else if (res.progressPercentage === 100) {
        // Job is 100% complete, return signed url
        const URL = await s3.getSignedUrl("getObject", {
          Bucket: process.env.S3_BUCKET_DATA,
          Expires: EXPIRY_TIME,
          Key: res.key,
        });

        return sendResponse(
          200,
          { status: "Job complete", signedURL: URL },
          context
        );
      } else {
        // Send back the latest job obj.
        delete res.pk;
        delete res.sk;
        delete res.key;
        return sendResponse(
          200,
          { status: "Job in progress", jobObj: res },
          context
        );
      }
    } else {
      // We are trying to create a report.
      queryObj.ExpressionAttributeValues[":percent"] = { S: "100" };
      queryObj.FilterExpression = "progressPercentage < :percent";
      const res = await runQuery(queryObj);
      if (res.length === 0) {
        // Check if there's already a report being generated.
        // If there are is no instance of a job or the job is 100% complete, generate a report.
        console.log("Creating a new export job.");

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

        return sendResponse(200, { status: "Export job created" }, context);
      } else {
        // A job already exists.
      }
    }
  } catch (error) {
    console.error(error);
    return sendResponse(400, error, context);
  }
};
