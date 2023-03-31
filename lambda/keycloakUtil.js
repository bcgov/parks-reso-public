const axios = require('axios');
const { mainModule } = require('process');
const { logger } = require("./logger");

const config = {
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
};

/**
 * Creates a new role in the specified Keycloak realm's client.
 * @async
 * @function createKeycloakRole
 * @param {string} ssoURL - The URL of the Keycloak server.
 * @param {string} ssoClientID - The ID of the client in the Keycloak realm.
 * @param {string} token - An access token for authentication.
 * @param {string} role - The name of the new role.
 * @param {string=} description - An optional description for the new role.
 * @returns {Promise<AxiosResponse>} The HTTP response from the server.
 * @throws {Error} If the operation fails.
 */
createKeycloakRole = async function (ssoURL, ssoClientID, token, role, description) {
  const url = `${ssoURL}/auth/admin/realms/bcparks-service-transformation/clients/${ssoClientID}/roles`;
  const postBody = {
    "name": `${role}`,
    "composite": false,
    "clientRole": true,
    "description": description
  };
  try {
    logger.info('Calling Keycloak Service');
    const res = await axios.post(url,
                                 postBody,
                                 { ...config, headers: { ...config.headers, 'Authorization': 'Bearer ' + token }});
    return res.data;
  } catch (error) {
    logger.error(error);
    throw new Error('Operation Failed.')
  }
};


/**
 * Deletes an existing role from the specified Keycloak realm's client.
 * @async
 * @function deleteKeycloakRole
 * @param {string} ssoURL - The URL of the Keycloak server.
 * @param {string} ssoClientID - The ID of the client in the Keycloak realm.
 * @param {string} token - An access token for authentication.
 * @param {string} role - The name of the role to be deleted.
 * @returns {Promise<AxiosResponse>} The HTTP response from the server.
 * @throws {Error} If the operation fails.
 */
deleteKeycloakRole = async function (ssoURL, ssoClientID, token, role) {
  const url = `${ssoURL}/auth/admin/realms/bcparks-service-transformation/clients/${ssoClientID}/roles/${role}`;
  try {
    logger.info('Calling Keycloak Service');
    const res = await axios.delete(url,
                                  { ...config, headers: { ...config.headers, 'Authorization': 'Bearer ' + token } });
    return res.data;
  } catch (error) {
    logger.error(error);
    throw new Error('Operation Failed.')
  }
}


/**
 * Retrieves information about an existing role from the specified Keycloak realm's client.
 * @async
 * @function getKeycloakRole
 * @param {string} ssoURL - The URL of the Keycloak server.
 * @param {string} ssoClientID - The ID of the client in the Keycloak realm.
 * @param {string} token - An access token for authentication.
 * @param {string} role - The name of the role to be retrieved.
 * @returns {Promise<AxiosResponse>} The HTTP response from the server.
 * @throws {Error} If the operation fails.
 */
getKeycloakRole = async function (ssoURL, ssoClientID, token, role) {
  const url = `${ssoURL}/auth/admin/realms/bcparks-service-transformation/clients/${ssoClientID}/roles/${role}`;
  try {
    logger.info('Calling Keycloak Service');
    const res = await axios.get(url,
                                { ...config, headers: { ...config.headers, 'Authorization': 'Bearer ' + token } });
    return res.data;
  } catch (error) {
    logger.error(error);
    throw new Error('Operation Failed.')
  }
}

module.exports = {
  getKeycloakRole,
  deleteKeycloakRole,
  createKeycloakRole
};