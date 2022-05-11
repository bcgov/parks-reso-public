const AWS = require("aws-sdk");

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

async function runQuery(query, paginated = false) {
  console.log("query:", query);
  const data = await dynamodb.query(query).promise();
  // console.log('data:', data);
  var unMarshalled = data.Items.map((item) => {
    return AWS.DynamoDB.Converter.unmarshall(item);
  });
  // console.log(unMarshalled);
  if (paginated) {
    return {
      LastEvaluatedKey: data.LastEvaluatedKey,
      data: unMarshalled,
    };
  } else {
    return unMarshalled;
  }
}

async function runScan(query, paginated = false) {
  console.log("query:", query);
  const data = await dynamodb.scan(query).promise();
  // console.log('data:', data);
  var unMarshalled = data.Items.map((item) => {
    return AWS.DynamoDB.Converter.unmarshall(item);
  });
  // console.log(unMarshalled);
  if (paginated) {
    return {
      LastEvaluatedKey: data.LastEvaluatedKey,
      data: unMarshalled,
    };
  } else {
    return unMarshalled;
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
};
