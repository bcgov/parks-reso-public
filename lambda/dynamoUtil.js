const AWS = require("aws-sdk");
const { logger } = require("./logger");

const TABLE_NAME = process.env.TABLE_NAME || "ar-tests";
const options = {
  region: "ca-central-1",
};

if (process.env.IS_OFFLINE) {
  options.endpoint = "http://localhost:8000";
}
const ACTIVE_STATUS = "active";
const RESERVED_STATUS = "reserved";
const EXPIRED_STATUS = "expired";
const timeZone = "America/Vancouver";
const PASS_TYPE_AM = "AM";
const PASS_TYPE_PM = "PM";
const PASS_TYPE_DAY = "DAY";
const TIMEZONE = "America/Vancouver";
const PM_ACTIVATION_HOUR = 12;
const PASS_TYPE_EXPIRY_HOURS = {
  AM: 12,
  PM: 0,
  DAY: 0,
};

const dynamodb = new AWS.DynamoDB(options);

exports.dynamodb = new AWS.DynamoDB();

// simple way to return a single Item by primary key.
async function getOne(pk, sk) {
  logger.debug(`getItem: { pk: ${pk}, sk: ${sk} }`);
  const params = {
    TableName: TABLE_NAME,
    Key: AWS.DynamoDB.Converter.marshall({pk, sk})
  };
  let item = await dynamodb.getItem(params).promise();
  return item?.Item || {};
};
// TODO: set paginated to TRUE by default. Query results will then be at most 1 page
// (1MB) unless they are explicitly specified to retrieve more.
// TODO: Ensure the returned object has the same structure whether results are paginated or not. 
async function runQuery(query, paginated = false) {
  logger.debug("query:", query);
  let data = [];
  let pageData = [];
  let page = 0;

  do {
    page++;
    if (pageData?.LastEvaluatedKey) {
      query.ExclusiveStartKey = pageData.LastEvaluatedKey;
    };
    pageData = await dynamodb.query(query).promise();
    data = data.concat(pageData.Items.map(item => {
      return AWS.DynamoDB.Converter.unmarshall(item);
    }));
    if (page < 2) {
      logger.debug(`Page ${page} data:`, data);
    } else {
      logger.debug(`Page ${page} contains ${pageData.Items.length} additional query results...`);
    };
  } while (pageData?.LastEvaluatedKey && !paginated);

  logger.debug(`Query result pages: ${page}, total returned items: ${data.length}`);
  if (paginated) {
    return {
      LastEvaluatedKey: pageData.LastEvaluatedKey,
      data: data,
    };
  } else {
    return data;
  }
}

// TODO: set paginated to TRUE by default. Scan results will then be at most 1 page
// (1MB) unless they are explicitly specified to retrieve more.
// TODO: Ensure the returned object has the same structure whether results are paginated or not. 
async function runScan(query, paginated = false) {
  logger.debug("query:", query);
  let data = [];
  let pageData = [];
  let page = 0;

  do {
    page++;
    if (pageData?.LastEvaluatedKey) {
      query.ExclusiveStartKey = pageData.LastEvaluatedKey;
    };
    pageData = await dynamodb.scan(query).promise();
    data = data.concat(pageData.Items.map(item => {
      return AWS.DynamoDB.Converter.unmarshall(item);
    }));
    if (page < 2) {
      logger.debug(`Page ${page} data:`, data);
    } else {
      logger.debug(`Page ${page} contains ${pageData.Items.length} additional scan results...`);
    };
  } while (pageData?.LastEvaluatedKey && !paginated);

  logger.debug(`Scan result pages: ${page}, total returned items: ${data.length}`);
  if (paginated) {
    return {
      LastEvaluatedKey: pageData.LastEvaluatedKey,
      data: data,
    };
  } else {
    return data;
  }
}

module.exports = {
  ACTIVE_STATUS,
  RESERVED_STATUS,
  EXPIRED_STATUS,
  PASS_TYPE_AM,
  PASS_TYPE_PM,
  PASS_TYPE_DAY,
  TIMEZONE,
  PM_ACTIVATION_HOUR,
  PASS_TYPE_EXPIRY_HOURS,
  timeZone,
  TABLE_NAME,
  dynamodb,
  runQuery,
  runScan,
  getOne
};
