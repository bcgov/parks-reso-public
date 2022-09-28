const AWS = require('aws-sdk');
const { TABLE_NAME, dynamodb } = require('../../dynamoUtil');
const { sendResponse } = require('../../responseUtil');
const { logger } = require('../../logger');
const { decodeJWT, resolvePermissions } = require('../../permissionUtil');

// lock the fiscal year from further edits
exports.lockFiscalYear = async (event, context) => {
  return await handleLockUnlock(true, event, context);
}

// unlock the fiscal year
exports.unlockFiscalYear = async (event, context) => {
  return await handleLockUnlock(false, event, context);
}

async function handleLockUnlock(isLocked, event, context) {
  const type = isLocked ? 'lock' : 'unlock';
  logger.debug(`POST: ${type} fiscal year`, event);
  try {
    await checkPermissions(event);
    const params = verifyEventParams(event);
    const res = await putFiscalYear(isLocked, params);
    logger.debug('POST result:', res);
    return sendResponse(200, res);
  } catch (error) {
    logger.error(error);
    return sendResponse(error.code ?? 1, { error }, context);
  }
}

async function checkPermissions(event) {
  const token = await decodeJWT(event);
  const permissionObject = resolvePermissions(token);
  if (!permissionObject.isAdmin) {
    throw {
      code: 403,
      msg: 'Unauthorized'
    }
  }
  return permissionObject;
}

function verifyEventParams(event) {
  const params = event?.queryStringParameters || null;
  if (!params || !params.fiscalYearEnd) {
    throw {
      code: 400,
      msg: `Missing parameters. Must provide 'fiscalYearEnd'.`
    };
  }
  const regex = new RegExp('^[0-9]{4}$');
  const validYear = regex.test(params.fiscalYearEnd);
  if (!validYear) {
    throw {
      code: 400,
      msg: `Invalid fiscal year. Format: 'yyyy'`
    };
  }
  return params;
}

async function putFiscalYear(isLocked, params) {
  try {
    const newObject = {
      pk: 'fiscalYearEnd',
      sk: params.fiscalYearEnd,
      isLocked: isLocked
    }
    const putObj = {
      TableName: TABLE_NAME,
      Item: AWS.DynamoDB.Converter.marshall(newObject),
    };
    await dynamodb.putItem(putObj).promise();
    logger.debug('Updated fiscalYearEnd Object:', newObject);
    return newObject;
  } catch (err) {
    logger.error(err);
    throw {
      code: 400,
      msg: 'Error putting object in database.'
    }
  }
}

