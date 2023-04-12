describe("keycloak utility tests", () => {
  beforeEach(async () => {
    jest.resetModules();
  });

  const testSubAreaObj = {
    activities: ["Day Use"],
    managementArea: "test-managementArea",
    section: "test-section",
    region: "test-region",
    bundle: "test-bundle",
    subAreaName: "test-subAreaName",
    parkName: "test-parkName",
    roles: ["sysadmin"],
    orcs: "test-orcs",
  };

  test("Creates Update Park with New Sub Area Object", async () => {
    const utils = require("../lambda/subAreaUtils");
    const response = await utils.createUpdateParkWithNewSubAreaObj(
      "test-name",
      "test-id",
      false,
      "test-orcs"
    );

    expect(response).toEqual({
      TableName: "bcparks-ar-tests",
      Key: { pk: { S: "park" }, sk: { S: "test-orcs" } },
      ExpressionAttributeValues: {
        ":subAreas": {
          L: [
            {
              M: {
                id: {
                  S: "test-id",
                },
                isLegacy: {
                  BOOL: false,
                },
                name: {
                  S: "test-name",
                },
              },
            },
          ],
        },
      },
      UpdateExpression: "SET subAreas = list_append(subAreas, :subAreas)",
    });
  });

  test("Creates Put Sub Area Obj", async () => {
    const utils = require("../lambda/subAreaUtils");
    const response = await utils.createPutSubAreaObj(
      testSubAreaObj,
      "test-id",
      "test-name"
    );

    expect(response).toEqual({
      TableName: "bcparks-ar-tests",
      ConditionExpression: "attribute_not_exists(sk)",
      Item: {
        pk: { S: "park::test-orcs" },
        sk: { S: "test-id" },
        activities: { SS: ["Day Use"] },
        managementArea: { S: "test-managementArea" },
        section: { S: "test-section" },
        region: { S: "test-region" },
        bundle: { S: "test-bundle" },
        subAreaName: { S: "test-subAreaName" },
        parkName: { S: "test-name" },
        roles: { SS: ["sysadmin"] },
        orcs: { S: "test-orcs" },
      },
    });
  });

  test("Creates Valid Sub Area Object", async () => {
    const utils = require("../lambda/subAreaUtils");
    const garbage = { test: "fake", whatever: [] };
    const testSubAreaObjWithGarbage = { ...testSubAreaObj, ...garbage };

    const response = await utils.getValidSubareaObj(
      testSubAreaObjWithGarbage,
      "test-name"
    );

    expect(response).toEqual({
      parkName: "test-name",
      orcs: "test-orcs",
      activities: ["Day Use"],
      managementArea: "test-managementArea",
      section: "test-section",
      region: "test-region",
      bundle: "test-bundle",
      subAreaName: "test-subAreaName",
      isLegacy: false,
      roles: ["sysadmin", "test-orcs"],
    });
  });
});
