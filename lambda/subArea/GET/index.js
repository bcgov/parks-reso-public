// TODO: Decouple subArea get from park get endpoint.
exports.handler = async (event, context) => {
  logger.debug("Subarea get:", event);
  return sendResponse(501, { msg: "Error: Not implemented." }, context);
};
