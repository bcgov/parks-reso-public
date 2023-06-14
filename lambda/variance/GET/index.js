exports.handler = async (event, context) => {
  logger.debug("Variance get:", event);
  return sendResponse(501, { msg: "Error: Not implemented." }, context);
};
