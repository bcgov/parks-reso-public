
describe("keycloak utility tests", () => {
  beforeEach(async () => {
    jest.resetModules();
  });

  test("Creates keycloak role", async () => {
    const axios = require('axios');
    jest.mock("axios");
    axios.post.mockImplementation(() => Promise.resolve({ statusCode: 200, data: {} }));
    const utils = require("../lambda/keycloakUtil");
    const response = await utils.createKeycloakRole('http://localhost/', 'client-id', 'sometoken', '0001:0001', 'Some description');
    expect(response).toEqual({});
  });

  test("Fails to create keycloak role", async () => {
    const axios = require('axios');
    jest.mock("axios");
    axios.post.mockImplementation(() => Promise.reject({ statusCode: 400, data: {} }));
    const utils = require("../lambda/keycloakUtil");
    try {
      await utils.createKeycloakRole('http://localhost/', 'client-id', 'sometoken', '0001:0001', 'Some description');
    } catch (error) {
      expect(error.message).toEqual('Operation Failed.');
    }
  });

  test("Deletes keycloak role", async () => {
    const axios = require('axios');
    jest.mock("axios");
    axios.delete.mockImplementation(() => Promise.resolve({ statusCode: 200, data: { } }));
    const utils = require("../lambda/keycloakUtil");
    const response = await utils.deleteKeycloakRole('http://localhost/', 'client-id', 'sometoken', '0001:0001');
    expect(response).toEqual({});
  });

  test("Fails to delete keycloak role", async () => {
    const axios = require('axios');
    jest.mock("axios");
    axios.delete.mockImplementation(() => Promise.reject({ statusCode: 400, data: {} }));
    const utils = require("../lambda/keycloakUtil");
    try {
      await utils.deleteKeycloakRole('http://localhost/', 'client-id', 'sometoken', '0001:0001', 'Some description');
    } catch (error) {
      expect(error.message).toEqual('Operation Failed.');
    }
  });

  test("Gets keycloak role", async () => {
    const theRole = {
      name: 'some role'
    };
    const axios = require('axios');
    jest.mock("axios");
    axios.get.mockImplementation(() => Promise.resolve({ statusCode: 200, data: theRole }));
    const utils = require("../lambda/keycloakUtil");
    const response = await utils.getKeycloakRole('http://localhost/', 'client-id', 'sometoken', '0001:0001');
    expect(response).toEqual(theRole);
  });

  test("Fails to get keycloak role", async () => {
    const axios = require('axios');
    jest.mock("axios");
    axios.get.mockImplementation(() => Promise.reject({ statusCode: 400, data: {} }));
    const utils = require("../lambda/keycloakUtil");
    try {
      await utils.getKeycloakRole('http://localhost/', 'client-id', 'sometoken', '0001:0001');
    } catch (error) {
      expect(error.message).toEqual('Operation Failed.');
    }
  });
});
