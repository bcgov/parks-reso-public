const { getOne } = require('../../dynamoUtil');
const { sendResponse } = require('../../responseUtil');
const { logger } = require('../../logger');

exports.handler = async (event, context) => {
  logger.debug('GET: dateConfig', event);
  try {
    const year = getDate(event);
    const fiscalYearEnd = await getDateConfig(year);
    logger.debug('fiscalYearEnd Object:', fiscalYearEnd);
    return sendResponse(200, fiscalYearEnd);
  } catch (err) {
    logger.error(err);
    return sendResponse(err.code ?? 1, { msg: err.msg ?? err }, context);
  }
}

function getDate(event) {
  if (!event?.queryStringParameters?.fiscalYearEnd) {
    throw {
      code: 400,
      msg: "Error: Must provide a fiscal year. Format: yyyy"
    };
  }
  return event.queryStringParameters.fiscalYearEnd;
}

async function getDateConfig(year) {
  // check db for fiscalYearEnd object
  try {
    let fiscalYearEnd = await getOne('fiscalYearEnd', year);
    logger.debug('fiscalYearEnd object:', fiscalYearEnd);
    return fiscalYearEnd;
  } catch (err) {
    throw {
      code: 400,
      msg: err
    }
  }
}
