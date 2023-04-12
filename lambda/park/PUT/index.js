exports.handler = async (event, context) => {
  logger.debug("Park put:", event);
  return sendResponse(501, { msg: "Error: Not implemented." }, context);
};
