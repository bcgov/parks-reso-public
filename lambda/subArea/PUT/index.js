exports.handler = async (event, context) => {
  logger.debug("Subarea put:", event);
  return sendResponse(501, { msg: "Error: Not implemented." }, context);
};
