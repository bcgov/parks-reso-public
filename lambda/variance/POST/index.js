exports.handler = async (event, context) => {
  logger.debug("Variance post:", event);
  return sendResponse(501, { msg: "Error: Not implemented." }, context);
};
