const AWS = require("aws-sdk");
const { logger } = require("./logger");

const TABLE_NAME = process.env.TABLE_NAME || "ar-tests";
const CONFIG_TABLE_NAME = process.env.CONFIG_TABLE_NAME || "ar-config";
const options = {
  region: "ca-central-1",
};

if (process.env.IS_OFFLINE) {
  options.endpoint = "http://localhost:8000";
}
const ACTIVE_STATUS = "active";
const RESERVED_STATUS = "reserved";
const EXPIRED_STATUS = "expired";
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

const FISCAL_YEAR_FINAL_MONTH = 3; // March

const RECORD_ACTIVITY_LIST = [
  "Frontcountry Camping",
  "Frontcountry Cabins",
  "Backcountry Camping",
  "Backcountry Cabins",
  "Group Camping",
  "Day Use",
  "Boating",
];

const dynamodb = new AWS.DynamoDB(options);

exports.dynamodb = new AWS.DynamoDB();

// simple way to return a single Item by primary key.
async function getOne(pk, sk) {
  logger.debug(`getItem: { pk: ${pk}, sk: ${sk} }`);
  const params = {
    TableName: TABLE_NAME,
    Key: AWS.DynamoDB.Converter.marshall({ pk, sk }),
  };
  let item = await dynamodb.getItem(params).promise();
  if (item?.Item) {
    return AWS.DynamoDB.Converter.unmarshall(item.Item);
  }
  return {};
}
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
    }
    pageData = await dynamodb.query(query).promise();
    data = data.concat(
      pageData.Items.map((item) => {
        return AWS.DynamoDB.Converter.unmarshall(item);
      })
    );
    if (page < 2) {
      logger.debug(`Page ${page} data:`, data);
    } else {
      logger.debug(
        `Page ${page} contains ${pageData.Items.length} additional query results...`
      );
    }
  } while (pageData?.LastEvaluatedKey && !paginated);

  logger.debug(
    `Query result pages: ${page}, total returned items: ${data.length}`
  );
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
    }
    pageData = await dynamodb.scan(query).promise();
    data = data.concat(
      pageData.Items.map((item) => {
        return AWS.DynamoDB.Converter.unmarshall(item);
      })
    );
    if (page < 2) {
      logger.debug(`Page ${page} data:`, data);
    } else {
      logger.debug(
        `Page ${page} contains ${pageData.Items.length} additional scan results...`
      );
    }
  } while (pageData?.LastEvaluatedKey && !paginated);

  logger.debug(
    `Scan result pages: ${page}, total returned items: ${data.length}`
  );
  if (paginated) {
    return {
      LastEvaluatedKey: pageData.LastEvaluatedKey,
      data: data,
    };
  } else {
    return data;
  }
}

// returns all parks in the database.
// includeLegacy = false will only return parks that are not marked as legacy.
async function getParks(includeLegacy = true) {
  const parksQuery = {
    TableName: TABLE_NAME,
    KeyConditionExpression: "pk = :pk",
    ExpressionAttributeValues: {
      ":pk": { S: "park" },
    },
  };
  if (!includeLegacy) {
    parksQuery.FilterExpression = "isLegacy = :legacy OR attribute_not_exists(isLegacy)";
    parksQuery.ExpressionAttributeValues[":legacy"] = { BOOL: false };
  }
  return await runQuery(parksQuery);
}

// returns all subareas within an ORCS.
// includeLegacy = false will only return subareas that are not marked as legacy.
async function getSubAreas(orcs, includeLegacy = true) {
  const subAreaQuery = {
    TableName: TABLE_NAME,
    KeyConditionExpression: "pk = :pk",
    ExpressionAttributeValues: {
      ":pk": { S: `park::${orcs}` },
    },
  };
  if (!includeLegacy) {
    subAreaQuery.FilterExpression = "isLegacy = :legacy OR attribute_not_exists(isLegacy)";
    subAreaQuery.ExpressionAttributeValues[":legacy"] = { BOOL: false };
  }
  return await runQuery(subAreaQuery);
}

// returns all records within a subarea.
// pass the full subarea object.
// pass filter = false to look for every possible activity
// includeLegacy = false will only return records that are not marked as legacy.
async function getRecords(subArea, filter = true, includeLegacy = true) {
  let records = [];
  let filteredActivityList = RECORD_ACTIVITY_LIST;
  if (filter && subArea.activites) {
    filteredActivityList = AWS.DynamoDB.Converter.unmarshall(subArea.activites);
  }
  for (let activity of filteredActivityList) {
    const recordQuery = {
      TableName: TABLE_NAME,
      KeyConditionExpression: `pk = :pk`,
      ExpressionAttributeValues: {
        ":pk": { S: `${subArea.sk}::${activity}` },
      },
    };
    if (!includeLegacy) {
      recordQuery.FilterExpression = "isLegacy = :legacy OR attribute_not_exists(isLegacy)";
      recordQuery.ExpressionAttributeValues[":legacy"] = { BOOL: false };
    }
    // will return at most 1 record.
    const record = await runQuery(recordQuery);
    records = records.concat(record);
  }
  return records;
}

async function incrementAndGetNextSubAreaID() {
  const configUpdateObj = {
    TableName: CONFIG_TABLE_NAME,
    Key: {
      pk: { S: "subAreaID" },
    },
    UpdateExpression: "ADD lastID :incrVal",
    ExpressionAttributeValues: {
      ":incrVal": { N: "1" },
    },
    ReturnValues: "UPDATED_NEW",
  };
  const response = await dynamodb.updateItem(configUpdateObj).promise();
  return response?.Attributes?.lastID?.N;
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
  FISCAL_YEAR_FINAL_MONTH,
  TABLE_NAME,
  dynamodb,
  runQuery,
  runScan,
  getOne,
  getParks,
  getSubAreas,
  getRecords,
  incrementAndGetNextSubAreaID,
};
