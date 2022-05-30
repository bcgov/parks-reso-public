const AWS = require("aws-sdk");
const s3 = new AWS.S3();
const fs = require("fs");
const writeXlsxFile = require("write-excel-file/node");
const { runScan, runQuery, TABLE_NAME } = require("../../dynamoUtil");
const {
  EXPORT_NOTE_KEYS,
  EXPORT_MONTHS,
  CSV_SYSADMIN_SCHEMA,
  STATE_DICTIONARY,
} = require("../constants");
const { updateJobEntry } = require("../functions");

const {
  basicNetRevenue,
  frontcountryCampingPartyAttendance,
  frontcountryCampingSecondCarAttendance,
  groupCampingStandardAttendance,
  dayUseVehicleAttendance,
  backcountryCabinsAttendance,
  boatingAttendance,
} = require("../../formulaUtils");

const FILE_PATH = process.env.FILE_PATH || "./";
const FILE_NAME = process.env.FILE_NAME || "A&R_Export";

const SYSADMIN_SCHEMA = process.env.CSV_SYSADMIN_SCHEMA
  ? JSON.parse(process.env.CSV_SYSADMIN_SCHEMA)
  : CSV_SYSADMIN_SCHEMA;

const JOB_UPDATE_MODULO = process.env.JOB_UPDATE_MODULO
  ? Number(process.env.JOB_UPDATE_MODULO)
  : 1;

const DISABLE_PROGRESS_UPDATES =
  process.env.DISABLE_PROGRESS_UPDATES &&
  process.env.DISABLE_PROGRESS_UPDATES === "true"
    ? true
    : false;

const DISABLE_HIGH_ACCURACY_PROGRESS_PERCENTAGE =
  process.env.DISABLE_HIGH_ACCURACY_PROGRESS_PERCENTAGE &&
  process.env.DISABLE_HIGH_ACCURACY_PROGRESS_PERCENTAGE === "true"
    ? true
    : false;

let JOB_ID;
let S3_KEY;
let CURRENT_PROGRESS_PERCENT = 0;

exports.handler = async (event, context) => {
  console.log("EXPORT", event || {});

  let queryObj = {
    TableName: TABLE_NAME,
  };

  try {
    if (event?.jobId && event?.roles) {
      JOB_ID = event.jobId;
      S3_KEY = JOB_ID + "/" + FILE_NAME + ".xlsx";
      const roles = event.roles;

      // FEATURE: If we wanted to have different exports for different users we can use the user's role and switch to different schemas accordingly.
      // For now, we are hardcoding to only have the sysadmin version of export
      let schema = SYSADMIN_SCHEMA;

      // Get reports - 0-20
      let scanResults = [];
      if (roles.includes("sysadmin")) {
        await updateJobWithState(
          STATE_DICTIONARY.FETCHING,
          "Feching all entires for Sysadmin."
        );

        // Exporting all data
        console.log("=== Exporting all data ===");
        scanResults = await getAllRecords({ ...queryObj });

        await updateJobWithState(
          STATE_DICTIONARY.FETCHED,
          "Fetch complete. " + scanResults.length + " entries found."
        );
      } else {
        // TODO: Change query according to other roles.
        // 1. get their list of subarea role(s) from token
        // 2. query db filter by subarea name from list of subareas in role(s)
      }
      console.log(scanResults.length + " records found");

      // Combine reports that are part of the same date and subarea - 20-50
      CURRENT_PROGRESS_PERCENT = 30;
      const groupedReports = await groupBySubAreaAndDate(scanResults, 30);

      // Create sorted rows array - 50-80
      CURRENT_PROGRESS_PERCENT = 50;
      const rowsArray = await generateRowsArray(groupedReports, 30);
      console.log(rowsArray.length + " rows generated");

      // 80-90
      await updateJobWithState(STATE_DICTIONARY.GENERATE_REPORT);
      await writeXlsxFile(rowsArray, {
        schema,
        filePath: FILE_PATH + FILE_NAME + ".xlsx",
      });
      console.log("Report generated");

      // This means we are uploading to S3 - 90-100
      if (FILE_PATH === "/tmp/" && process.env.S3_BUCKET_DATA) {
        await updateJobWithState(STATE_DICTIONARY.UPLOAD_TO_S3);
        await uploadToS3();
      }
      await updateJobWithState(STATE_DICTIONARY.COMPLETE);

      // TODO: Log job into separate DB
      console.log("=== Export successful ===");
    }
  } catch (err) {
    console.error(err);
  }
};

async function getAllRecords(queryObj) {
  queryObj.ExpressionAttributeValues = {};
  queryObj.ExpressionAttributeValues[":prefixDate"] = { S: "20" };
  queryObj.FilterExpression = "begins_with(sk, :prefixDate)";
  return await runScan(queryObj);
}

async function groupBySubAreaAndDate(
  scanResults,
  allottedProgressPercent = 30
) {
  if (DISABLE_HIGH_ACCURACY_PROGRESS_PERCENTAGE) {
    await updateJobWithState(STATE_DICTIONARY.GROUP_BY_SUBAREA_AND_DATE);
  }
  let result = {};
  const increment = allottedProgressPercent / scanResults.length;
  for (let i = 0; i < scanResults.length; i++) {
    let report = scanResults[i];

    // Prepare report obj with calc fields populated
    report = await modifyReportForCSV(report);

    // Merge report with existing report obj for row in CSV
    result = await mergeReports(result, report);

    if (
      !DISABLE_HIGH_ACCURACY_PROGRESS_PERCENTAGE &&
      (i + 1) % JOB_UPDATE_MODULO === 0
    ) {
      await updateJobWithState(
        STATE_DICTIONARY.GROUP_BY_SUBAREA_AND_DATE,
        "Grouping activities by subarea and date: " +
          (i + 1) +
          " of " +
          scanResults.length,
        CURRENT_PROGRESS_PERCENT + increment
      );
    }
  }
  return result;
}

async function modifyReportForCSV(report) {
  const activity = report.pk.split("::").pop();

  // Give unique key for variance notes
  report[EXPORT_NOTE_KEYS[activity]] = report.notes;
  delete report.notes;

  // Perform calcs according to activity
  switch (activity) {
    case "Frontcountry Camping":
      // Camping Party Nights - TOTAL ATTENDANCE
      report.calc_frontCountryCamping_frontCountryCamping_campingPartyNights_totalAttendance =
        frontcountryCampingPartyAttendance(
          [
            report.campingPartyNightsAttendanceStandard,
            report.campingPartyNightsAttendanceSenior,
            report.campingPartyNightsAttendanceSocial,
            report.campingPartyNightsAttendanceLongStay,
          ],
          report.config.attendanceModifier
        ).result;

      // Camping Party Nights - NET REVENUE
      report.calc_frontCountryCamping_campingPartyNights_netRevenue =
        frontcountryCampingSecondCarAttendance([
          report.secondCarsAttendanceStandard,
          report.secondCarsAttendanceSenior,
          report.secondCarsAttendanceSocial,
        ]).result;

      // Second cars / additional vehicles - TOTAL ATTENDANCE
      report.calc_frontCountryCamping_secondCars_totalAttendance =
        basicNetRevenue([report.campingPartyNightsRevenueGross]).result;

      // Second cars / additional vehicles - NET REVENUE
      report.calc_frontCountryCamping_secondCars_netRevenue = basicNetRevenue([
        report.secondCarsRevenueGross,
      ]).result;

      // Other frontcountry camping revenue - NET REVENUE
      report.calc_frontCountryCamping_other_totalAttendance = basicNetRevenue([
        report.otherRevenueGrossSani,
        report.otherRevenueElectrical,
        report.otherRevenueShower,
      ]).result;
      break;
    case "Frontcountry Cabins":
      // NET REVENUE
      report.calc_frontcountryCabins_camping_netRevenue = basicNetRevenue([
        report.revenueGrossCamping,
      ]).result;
      break;
    case "Group Camping":
      // Standard rate groups - TOTAL PEOPLE
      report.calc_groupCamping_standardRate_totalPeople =
        groupCampingStandardAttendance([
          report.standardRateGroupsTotalPeopleAdults,
          report.standardRateGroupsTotalPeopleYouth,
          report.standardRateGroupsTotalPeopleKids,
        ]).result;

      // Standard rate groups - NET REVENUE
      report.calc_groupCamping_standardRate_netRevenue = basicNetRevenue([
        report.standardRateGroupsRevenueGross,
      ]).result;

      // Youth rate groups - NET REVENUE
      report.calc_groupCamping_youthRate_netRevenue = basicNetRevenue([
        report.youthRateGroupsRevenueGross,
      ]).result;
      break;
    case "Day Use":
      // People and vehicles - VEHICLE ATTENDANCE
      report.calc_dayUse_peopleAndVehicles_vehicleAttendance =
        dayUseVehicleAttendance(
          [report.peopleAndVehiclesVehicle],
          [report.peopleAndVehiclesBus],
          report.config.attendanceVehiclesModifier,
          report.config.attendanceBusModifier
        ).result;

      // Picnic Shelters - NET REVENUE
      report.calc_dayUse_picnicShelters_netRevenue = basicNetRevenue([
        report.picnicRevenueGross,
      ]).result;

      // Other day use - NET REVENUE
      report.calc_dayUse_otherDayUse_netRevenue = basicNetRevenue([
        report.otherDayUseRevenueSkii,
        report.otherDayUseRevenueHotSprings,
      ]).result;
      break;
    case "Backcountry Camping":
      // NET REVENUE
      report.calc_backcountryCamping_camping_netRevenue = basicNetRevenue([
        report.grossCampingRevenue,
      ]).result;
      break;
    case "Backcountry Cabins":
      // TOTAL PEOPLE
      report.calc_backcountryCabins_totalPeople = backcountryCabinsAttendance(
        [report.peopleAdult, report.peopleChild],
        [report.peopleFamily],
        report.config.attendanceModifier
      ).result;

      // NET REVENUE
      report.calc_backcountryCabins_family_netRevenue = basicNetRevenue([
        report.revenueFamily,
      ]).result;
      break;
    case "Boating":
      // BOAT ATTENDANCE
      report.calc_boating_boats_boatAttendance = boatingAttendance(
        [
          report.boatAttendanceNightsOnDock,
          report.boatAttendanceNightsOnBouys,
          report.boatAttendanceMiscellaneous,
        ],
        report.config.attendanceModifier
      ).result;

      // NET REVENUE
      report.calc_boating_boats_netRevenue = basicNetRevenue([
        report.boatRevenueGross,
      ]).result;
      break;
    default:
      break;
  }
  return report;
}

async function mergeReports(result, report) {
  // We can use the report.date for sorting in a later step
  const key = report.date + "_" + report.subAreaName;
  if (!result[key]) {
    const queryObj = {
      TableName: TABLE_NAME,
      ExpressionAttributeValues: {
        ":pk": { S: "park::" + report.orcs },
      },
      KeyConditionExpression: "pk = :pk",
    };
    const park = (await runQuery(queryObj))[0];

    // Set up common attributes
    result[key] = {
      region: park.region,
      section: park.section,
      bundle: park.bundle,
      parkName: report.parkName,
      subAreaName: report.subAreaName,
      year: Number(report.date.substring(0, 4)),
      month: EXPORT_MONTHS[report.date.slice(-2)],
    };
  }

  // Remove unneeded attributes
  delete report.config;
  delete report.orcs;
  delete report.pk;
  delete report.sk;
  delete report.activity;
  delete report.lastUpdated;

  result[key] = { ...result[key], ...report };
  return result;
}

async function generateRowsArray(groupedReports, allottedProgressPercent = 30) {
  if (DISABLE_HIGH_ACCURACY_PROGRESS_PERCENTAGE) {
    await updateJobWithState(STATE_DICTIONARY.GENERATE_ROWS);
  }

  let keys = Object.keys(groupedReports);
  keys.sort();
  const increment = allottedProgressPercent / keys.length;

  let rowsArray = [];
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    delete groupedReports[key].date;
    rowsArray.push(groupedReports[key]);

    if (
      !DISABLE_HIGH_ACCURACY_PROGRESS_PERCENTAGE &&
      (i + 1) % JOB_UPDATE_MODULO === 0
    ) {
      await updateJobWithState(
        STATE_DICTIONARY.GENERATE_ROWS,
        "Generating rows: " + (i + 1) + " of " + keys.length,
        CURRENT_PROGRESS_PERCENT + increment
      );
    }
  }

  return rowsArray;
}

async function uploadToS3() {
  // Get file as buffer
  const buffer = fs.readFileSync(FILE_PATH + FILE_NAME + ".xlsx");

  const params = {
    Bucket: process.env.S3_BUCKET_DATA,
    Key: S3_KEY,
    Body: buffer,
  };

  await s3.putObject(params).promise();
  console.log("File successfully uploaded to S3");
}

async function updateJobWithState(
  state,
  messageOverride = null,
  percentageOverride = null
) {
  let jobObj = {
    sk: JOB_ID,
    progressPercentage: 0,
    key: S3_KEY,
    progressDescription: "",
  };
  if (!DISABLE_PROGRESS_UPDATES) {
    switch (state) {
      case 1:
        jobObj.progressPercentage = percentageOverride || 0;
        jobObj.progressDescription =
          messageOverride || "Fetching entries from Database.";
        break;
      case 2:
        jobObj.progressPercentage = percentageOverride || 20;
        jobObj.progressDescription = messageOverride || "Fetch complete.";
        break;
      case 3:
        jobObj.progressPercentage = percentageOverride || 35;
        jobObj.progressDescription =
          messageOverride || "Grouping activities by subarea and date.";
        break;
      case 4:
        jobObj.progressPercentage = percentageOverride || 65;
        jobObj.progressDescription =
          messageOverride || "Generating rows for report.";
        break;
      case 5:
        jobObj.progressPercentage = 80;
        jobObj.progressDescription = "Generating report.";
        break;
      case 6:
        jobObj.progressPercentage = 90;
        jobObj.progressDescription = "Uploading document to S3.";
        break;
      case 7:
        jobObj.progressPercentage = 100;
        jobObj.progressDescription = "Job Complete. Your document is ready.";
      default:
        break;
    }
    await updateJobEntry(jobObj, TABLE_NAME);
  } else if (state === 7) {
    jobObj.progressPercentage = 100;
    jobObj.progressDescription = "Job Complete. Your document is ready.";
    await updateJobEntry(jobObj, TABLE_NAME);
  }
  CURRENT_PROGRESS_PERCENT = jobObj.progressPercentage;
}
