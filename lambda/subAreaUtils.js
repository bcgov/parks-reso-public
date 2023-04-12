const AWS = require("aws-sdk");
const { TABLE_NAME } = require("./dynamoUtil");

function createUpdateParkWithNewSubAreaObj(
  subAreaName,
  subAreaId,
  isLegacy,
  orcs
) {
  // Return update park obj
  return {
    TableName: TABLE_NAME,
    Key: {
      pk: { S: "park" },
      sk: { S: orcs },
    },
    ExpressionAttributeValues: {
      ":subAreas": {
        L: [
          {
            M: AWS.DynamoDB.Converter.marshall({
              name: subAreaName,
              id: subAreaId,
              isLegacy: isLegacy,
            }),
          },
        ],
      },
    },
    UpdateExpression: "SET subAreas = list_append(subAreas, :subAreas)",
  };
}

function createPutSubAreaObj(subAreaObj, subAreaId, parkName) {
  return {
    TableName: TABLE_NAME,
    ConditionExpression: "attribute_not_exists(sk)",
    Item: {
      pk: { S: `park::${subAreaObj.orcs}` },
      sk: { S: subAreaId },
      activities: { SS: subAreaObj.activities },
      managementArea: { S: subAreaObj.managementArea },
      section: { S: subAreaObj.section },
      region: { S: subAreaObj.region },
      bundle: { S: subAreaObj.bundle },
      subAreaName: { S: subAreaObj.subAreaName },
      parkName: { S: parkName },
      roles: { SS: subAreaObj.roles },
      orcs: { S: subAreaObj.orcs },
    },
  };
}

function getValidSubareaObj(body, parkName) {
  let obj = { parkName: parkName };
  if (body.orcs) {
    obj["orcs"] = body.orcs;
  }
  if (body.activities) {
    let activityArray = [];
    for (let i = 0; i < body.activities.length; i++) {
      const activity = body.activities[i];
      if (validActivities.includes(activity)) {
        activityArray.push(activity);
      }
    }
    obj["activities"] = activityArray;
  }
  if (body.managementArea) {
    obj["managementArea"] = body.managementArea;
  }
  if (body.section) {
    obj["section"] = body.section;
  }
  if (body.region) {
    obj["region"] = body.region;
  }
  if (body.bundle) {
    obj["bundle"] = body.bundle;
  }
  if (body.subAreaName) {
    obj["subAreaName"] = body.subAreaName;
  }
  obj["isLegacy"] = body.isLegacy ? body.isLegacy : false;

  // Add roles
  obj.roles = ["sysadmin", body.orcs];

  return obj;
}

const validActivities = [
  "Frontcountry Camping",
  "Frontcountry Cabins",
  "Group Camping",
  "Backcountry Camping",
  "Backcountry Cabins",
  "Boating",
  "Day Use",
];

module.exports = {
  createPutSubAreaObj,
  createUpdateParkWithNewSubAreaObj,
  getValidSubareaObj,
  validActivities,
};
