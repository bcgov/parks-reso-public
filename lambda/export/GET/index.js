const AWS = require("aws-sdk");
const s3 = new AWS.S3();

const IS_OFFLINE =
  process.env.IS_OFFLINE && process.env.IS_OFFLINE === "true" ? true : false;

const options = {};
if (IS_OFFLINE) {
  options.region = "local-env";
  // For local we use port 3002 because we're hitting an invokable
  options.endpoint = "http://localhost:3002";
}
const lambda = new AWS.Lambda(options);

const { runQuery, dynamodb, TABLE_NAME } = require("../../dynamoUtil");
const { sendResponse } = require("../../responseUtil");
const { decodeJWT, resolvePermissions } = require('../../permissionUtil');
const { convertRolesToMD5 } = require("../functions");
const { logger } = require('../../logger');

const EXPORT_FUNCTION_NAME =
  process.env.EXPORT_FUNCTION_NAME || "bcparks-ar-api-api-exportInvokable";

const EXPIRY_TIME = process.env.EXPORT_EXPIRY_TIME
  ? Number(process.env.EXPORT_EXPIRY_TIME)
  : 60 * 15; // 15 minutes

exports.handler = async (event, context) => {
  logger.debug("GET: Export", event.queryStringParameters);

  try {
    const token = await decodeJWT(event);
    const permissionObject = resolvePermissions(token);

    if (!permissionObject.isAdmin) {
      logger.debug("**NOT AUTHENTICATED, PUBLIC**")
      return sendResponse(403, { msg: "Error: UnAuthenticated." }, context);
    }

    // This will give us the sk
    const sk = convertRolesToMD5(permissionObject.roles, "export-");

    if (event?.queryStringParameters?.getJob) {
      let queryObj = {
        TableName: TABLE_NAME,
        ExpressionAttributeValues: {
          ":pk": { S: "job" },
          ":sk": { S: sk },
        },
        KeyConditionExpression: "pk =:pk and sk =:sk",
      };
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
        delete res.pk;
        delete res.sk;
        delete res.key;
        return sendResponse(
          200,
          { status: "Job complete", signedURL: URL, jobObj: res },
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
      const putObject = {
        TableName: TABLE_NAME,
        ExpressionAttributeValues: {
          ":percent": { N: "100" },
        },
        ConditionExpression:
          "(attribute_not_exists(pk) AND attribute_not_exists(sk)) OR progressPercentage = :percent",
        Item: AWS.DynamoDB.Converter.marshall({
          pk: "job",
          sk: sk,
          progressPercentage: 0,
          progressDescription: "Initializing job.",
        }),
      };
      logger.debug(putObject);
      let res;
      try {
        res = await dynamodb.putItem(putObject).promise();
        // Check if there's already a report being generated.
        // If there are is no instance of a job or the job is 100% complete, generate a report.
        logger.debug("Creating a new export job.");

        const params = {
          FunctionName: EXPORT_FUNCTION_NAME,
          InvocationType: "Event",
          LogType: "None",
          Payload: JSON.stringify({
            jobId: sk,
            roles: permissionObject.roles,
          }),
        };
        // Invoke generate report function
        await lambda.invoke(params).promise();

        return sendResponse(200, { status: "Export job created" }, context);
      } catch (error) {
        // A job already exists.
        logger.error(error);
        return sendResponse(200, { status: "Job is already running" }, context);
      }
    }
  } catch (error) {
    logger.error(error);
    return sendResponse(400, { error: error }, context);
  }
};
