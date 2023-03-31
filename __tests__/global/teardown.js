const AWS = require('aws-sdk');

const { REGION, ENDPOINT, TABLE_NAME, CONFIG_TABLE_NAME } = require('./settings');
const { logger } = require('../../lambda/logger');

module.exports = async () => {
  dynamoDb = new AWS.DynamoDB({
    region: REGION,
    endpoint: ENDPOINT
  });

  try {
    await dynamoDb
      .deleteTable({
        TableName: TABLE_NAME
      })
      .promise();
    await dynamoDb
      .deleteTable({
        TableName: CONFIG_TABLE_NAME
      })
      .promise();
  } catch (err) {
    logger.error(err);
  }
};
