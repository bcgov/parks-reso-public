const AWS = require("aws-sdk");
const { dynamodb } = require("../dynamoUtil");
const crypto = require("crypto");

function convertRolesToMD5(roles, prefix = "") {
  const codedRoles = prefix + roles.join("-");
  const hash = crypto.createHash("md5").update(codedRoles).digest("hex");
  return hash;
}

module.exports = {
  convertRolesToMD5,
  updateJobEntry,
};

// {
//     jobId: String,
//     progressPercentage: Number,
//     key: String,
//     progressDescription: String
// }
async function updateJobEntry(jobObj, tableName) {
  jobObj.pk = "job";
  jobObj.progressPercentage = Math.floor(Number(jobObj.progressPercentage));

  let newObject = AWS.DynamoDB.Converter.marshall(jobObj);
  let putObject = {
    TableName: tableName,
    Item: newObject,
  };
  await dynamodb.putItem(putObject).promise();
}
