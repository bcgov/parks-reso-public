exports.handler = async (event, context) => {
    logger.debug("Activity delete:", event);
    return sendResponse(501, { msg: "Error: Not implemented." }, context);
  };
  