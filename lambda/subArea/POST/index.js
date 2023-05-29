const {
  dynamodb,
  incrementAndGetNextSubAreaID,
  getOne,
} = require("../../dynamoUtil");
const { createKeycloakRole } = require("../../keycloakUtil");
const { createPutFormulaConfigObj } = require("../../formulaUtils");
const { sendResponse } = require("../../responseUtil");
const { decodeJWT, resolvePermissions } = require("../../permissionUtil");
const { logger } = require("../../logger");
const {
  getValidSubareaObj,
  createUpdateParkWithNewSubAreaObj,
  createPutSubAreaObj,
} = require("../../subAreaUtils");

const SSO_ORIGIN = process.env.SSO_ORIGIN;
const SSO_CLIENT_ID = process.env.SSO_CLIENT_ID;

exports.handler = async (event, context) => {
  logger.debug("Subarea POST:", event);
  try {
    const token = await decodeJWT(event);
    const permissionObject = resolvePermissions(token);

    if (!permissionObject.isAuthenticated) {
      logger.info("**NOT AUTHENTICATED, PUBLIC**");
      return sendResponse(403, { msg: "Unauthenticated." }, context);
    }

    // Admins only
    if (!permissionObject.isAdmin) {
      logger.info("Not authorized.");
      return sendResponse(403, { msg: "Unauthorized." }, context);
    }

    const body = JSON.parse(event.body);

    // ensure all madatory fields exist
    if (
      !body.orcs ||
      !body.activities ||
      !body.managementArea ||
      !body.section ||
      !body.region ||
      !body.bundle ||
      !body.subAreaName
    ) {
      return sendResponse(400, { msg: "Invalid body" }, context);
    }

    // Get park
    const park = await getOne("park", body.orcs);
    if (!park) {
      logger.debug("Unable to find park", body.orcs);
      return sendResponse(400, { msg: "Park not found" }, context);
    }

    // Create post obj
    let subAreaObj = getValidSubareaObj(body, park.parkName);

    // Generate subArea id
    const subAreaId = await incrementAndGetNextSubAreaID();

    // Create transaction
    let transactionObj = { TransactItems: [] };

    // Update park
    transactionObj.TransactItems.push({
      Update: createUpdateParkWithNewSubAreaObj(
        subAreaObj.subAreaName,
        subAreaId,
        subAreaObj.isLegacy,
        subAreaObj.orcs
      ),
    });

    // Create subArea
    transactionObj.TransactItems.push({
      Put: createPutSubAreaObj(subAreaObj, subAreaId, park.parkName),
    });

    // Create formula configs
    for (const formulaObj of createPutFormulaConfigObj(
      subAreaObj.activities,
      subAreaId,
      park.parkName,
      subAreaObj.orcs,
      subAreaObj.subAreaName
    )) {
      transactionObj.TransactItems.push({
        Put: formulaObj,
      });
    }

    const res = await dynamodb.transactWriteItems(transactionObj).promise();
    logger.debug("res:", res);

    // Add Keycloak role
    const kcRes = await createKeycloakRole(
      SSO_ORIGIN,
      SSO_CLIENT_ID,
      event.headers.Authorization.replace("Bearer ", ""),
      `${subAreaObj.orcs}:${subAreaId}`,
      `${park.parkName}:${subAreaObj.subAreaName}`
    );
    logger.debug("kcRes:", kcRes);

    return sendResponse(200, { msg: "Subarea created", subArea: res }, context);
  } catch (err) {
    logger.error(err);
    return sendResponse(400, { msg: "Invalid request" }, context);
  }
};
