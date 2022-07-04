const AWS = require('aws-sdk');
const { sendResponse } = require('../../responseUtil');

exports.handler = async (event, context) => {
  return sendResponse(400, { msg: "Not Implemented." }, context);
};