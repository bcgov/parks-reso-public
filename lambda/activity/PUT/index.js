exports.handler = async (event, context) => {
  logger.debug("Activity put:", event);
  return sendResponse(501, { msg: "Error: Not implemented." }, context);
};
