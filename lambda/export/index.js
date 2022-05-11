const writeXlsxFile = require("write-excel-file/node");
const { runScan, runQuery, TABLE_NAME } = require("../dynamoUtil");
const {
  basicNetRevenue,
  frontcountryCampingPartyAttendance,
  frontcountryCampingSecondCarAttendance,
  groupCampingStandardAttendance,
  dayUseVehicleAttendance,
  backcountryCabinsAttendance,
  boatingAttendance,
} = require("../formulaUtils");

const FILE_PATH = process.env.FILE_PATH || "./";

const noteKeys = {
  "Frontcountry Camping": "notes_frontcountryCamping",
  "Frontcountry Cabins": "notes_frontcountryCabins",
  "Group Camping": "notes_groupCamping",
  "Day Use": "notes_dayUse",
  "Backcountry Camping": "notes_backcountryCamping",
  "Backcountry Cabins": "notes_backcountryCabins",
  Boating: "notes_boating",
};

const months = {
  "01": "Jan",
  "02": "Feb",
  "03": "Mar",
  "04": "Apr",
  "05": "May",
  "06": "Jun",
  "07": "Jul",
  "08": "Aug",
  "09": "Sep",
  10: "Oct",
  11: "Nov",
  12: "Dec",
};

const schema = process.env.CSV_SCHEMA || [
  // Shared Data
  {
    column: "Region",
    type: String,
    value: (report) => report.region,
  },
  {
    column: "Section",
    type: String,
    value: (report) => report.section,
  },
  {
    column: "Bundle",
    type: String,
    value: (report) => report.bundle,
  },
  {
    column: "Park",
    type: String,
    value: (report) => report.parkName,
  },
  {
    column: "Park Sub Area",
    type: String,
    value: (report) => report.subAreaName,
  },
  {
    column: "Year",
    type: Number,
    value: (report) => report.year,
  },
  {
    column: "Month",
    type: String,
    value: (report) => report.month,
  },
  // Frontcountry Camping - Camping Party Nights
  {
    column: "Frontcountry Camping - Camping Party Nights - Standard",
    type: Number,
    width: 63,
    value: (report) => report.campingPartyNightsAttendanceStandard,
  },
  {
    column: "Frontcountry Camping - Camping Party Nights - Senior",
    type: Number,
    width: 63,
    value: (report) => report.campingPartyNightsAttendanceSenior,
  },
  {
    column: "Frontcountry Camping - Camping Party Nights - Social",
    type: Number,
    width: 63,
    value: (report) => report.campingPartyNightsAttendanceSocial,
  },
  {
    column: "Frontcountry Camping - Camping Party Night - Long stay",
    type: Number,
    width: 63,
    value: (report) => report.campingPartyNightsAttendanceLongStay,
  },
  {
    column: "Frontcountry Camping - Camping Party Nights - Total attendance",
    type: Number,
    width: 63,
    backgroundColor: "#c7e3fd",
    value: (report) =>
      report.calc_frontCountryCamping_frontCountryCamping_campingPartyNights_totalAttendance,
  },
  {
    column:
      "Frontcountry Camping - Camping Party Nights - Gross camping revenue",
    type: Number,
    width: 63,
    value: (report) => report.campingPartyNightsRevenueGross,
  },
  {
    column: "Frontcountry Camping - Camping Party Nights - Net revenue",
    type: Number,
    width: 63,
    backgroundColor: "#aee5ba",
    value: (report) =>
      report.calc_frontCountryCamping_campingPartyNights_netRevenue,
  },
  // Frontcountry Camping - Second Cars
  {
    column: "Frontcountry Camping - Second Cars - Standard",
    type: Number,
    width: 63,
    value: (report) => report.secondCarsAttendanceStandard,
  },
  {
    column: "Frontcountry Camping - Second Cars - Senior",
    type: Number,
    width: 63,
    value: (report) => report.secondCarsAttendanceSenior,
  },
  {
    column: "Frontcountry Camping - Second Cars - Social",
    type: Number,
    width: 63,
    value: (report) => report.secondCarsAttendanceSocial,
  },
  {
    column: "Frontcountry Camping - Second Cars - Total attendance",
    type: Number,
    width: 63,
    backgroundColor: "#c7e3fd",
    value: (report) =>
      report.calc_frontCountryCamping_secondCars_totalAttendance,
  },
  {
    column: "Frontcountry Camping - Second Cars - Gross 2nd car revenue",
    type: Number,
    width: 63,
    value: (report) => report.secondCarsRevenueGross,
  },
  {
    column: "Frontcountry Camping - Second Cars - Net revenue",
    type: Number,
    width: 63,
    backgroundColor: "#aee5ba",
    value: (report) => report.calc_frontCountryCamping_secondCars_netRevenue,
  },
  // Frontcountry Camping - Other
  {
    column: "Frontcountry Camping - Other - Gross sani revenue",
    type: Number,
    width: 63,
    value: (report) => report.otherRevenueGrossSani,
  },
  {
    column: "Frontcountry Camping - Other - Gross electrical fee revenue",
    type: Number,
    width: 63,
    value: (report) => report.otherRevenueGrossSani,
  },
  {
    column: "Frontcountry Camping - Other - Gross shower revenue",
    type: Number,
    width: 63,
    value: (report) => report.otherRevenueShower,
  },
  {
    column: "Frontcountry Camping - Other - Net revenue",
    type: Number,
    width: 63,
    backgroundColor: "#aee5ba",
    value: (report) => report.calc_frontCountryCamping_other_totalAttendance,
  },
  // Frontcountry Camping - Variance Notes
  {
    column: "Frontcountry Camping - Variance Notes",
    type: String,
    width: 63,
    backgroundColor: "#fff3cd",
    value: (report) => report.notes_frontcountryCamping,
  },
  // Frontcountry Cabins - Parties
  {
    column: "Frontcountry Cabins - Parties",
    type: Number,
    width: 63,
    value: (report) => report.totalAttendanceParties,
  },
  // Frontcountry Cabins - Camping
  {
    column: "Frontcountry Cabins - Camping - Gross camping revenue",
    type: Number,
    width: 63,
    value: (report) => report.revenueGrossCamping,
  },
  {
    column: "Frontcountry Cabins - Camping - Net revenue",
    type: Number,
    width: 63,
    backgroundColor: "#aee5ba",
    value: (report) => report.calc_frontcountryCabins_camping_netRevenue,
  },
  // Frontcountry Cabins - Variance Notes
  {
    column: "Frontcountry Cabins - Variance Notes",
    type: String,
    width: 63,
    backgroundColor: "#fff3cd",
    value: (report) => report.notes_frontcountryCabins,
  },
  // Group Camping - Standard Rate
  {
    column: "Group Camping - Standard Rate - Standard",
    type: Number,
    width: 63,
    value: (report) => report.standardRateGroupsTotalPeopleStandard,
  },
  {
    column: "Group Camping - Standard Rate - Adults",
    type: Number,
    width: 63,
    value: (report) => report.standardRateGroupsTotalPeopleAdults,
  },
  {
    column: "Group Camping - Standard Rate - Youth",
    type: Number,
    width: 63,
    value: (report) => report.standardRateGroupsTotalPeopleYouth,
  },
  {
    column: "Group Camping - Standard Rate - Kids",
    type: Number,
    width: 63,
    value: (report) => report.standardRateGroupsTotalPeopleKids,
  },
  {
    column: "Group Camping - Standard Rate - Total people",
    type: Number,
    width: 63,
    backgroundColor: "#c7e3fd",
    value: (report) => report.calc_groupCamping_standardRate_totalPeople,
  },
  {
    column: "Group Camping - Standard Rate - Gross standard group revenue",
    type: Number,
    width: 63,
    value: (report) => report.standardRateGroupsRevenueGross,
  },
  {
    column: "Group Camping - Standard Rate - Net revenue",
    type: Number,
    width: 63,
    backgroundColor: "#aee5ba",
    value: (report) => report.calc_groupCamping_standardRate_netRevenue,
  },
  // Group Camping - Youth Rate
  {
    column: "Group Camping - Youth Rate - Group nights",
    type: Number,
    width: 63,
    value: (report) => report.youthRateGroupsAttendanceGroupNights,
  },
  {
    column: "Group Camping - Youth Rate - People",
    type: Number,
    width: 63,
    value: (report) => report.youthRateGroupsAttendancePeople,
  },
  {
    column: "Group Camping - Youth Rate - Gross youth group revenue",
    type: Number,
    width: 63,
    value: (report) => report.youthRateGroupsRevenueGross,
  },
  {
    column: "Group Camping - Youth Rate - Net revenue",
    type: Number,
    width: 63,
    backgroundColor: "#aee5ba",
    value: (report) => report.calc_groupCamping_youthRate_netRevenue,
  },
  // Group Camping - Variance Notes
  {
    column: "Group Camping - Variance Notes",
    type: String,
    width: 63,
    backgroundColor: "#fff3cd",
    value: (report) => report.notes_groupCamping,
  },
  // Day Use - People and Vehicles
  {
    column: "Day Use - People and Vehicles - Trail count",
    type: Number,
    width: 63,
    value: (report) => report.peopleAndVehiclesTrail,
  },
  {
    column: "Day Use - People and Vehicles - Vehicle count",
    type: Number,
    width: 63,
    value: (report) => report.peopleAndVehiclesVehicle,
  },
  {
    column: "Day Use - People and Vehicles - Bus count",
    type: Number,
    width: 63,
    value: (report) => report.peopleAndVehiclesBus,
  },
  {
    column: "Day Use - People and Vehicles - Vehicle attendance",
    type: Number,
    width: 63,
    backgroundColor: "#c7e3fd",
    value: (report) => report.calc_dayUse_peopleAndVehicles_vehicleAttendance,
  },
  // Day Use - Picnic Shelters
  {
    column: "Day Use - Picnic Shelters - Picnic shelter rentals",
    type: Number,
    width: 63,
    value: (report) => report.picnicRevenueShelter,
  },
  {
    column: "Day Use - Picnic Shelters - Gross picnic revenue",
    type: Number,
    width: 63,
    value: (report) => report.picnicRevenueGross,
  },
  {
    column: "Day Use - Picnic Shelters - Net revenue",
    type: Number,
    width: 63,
    backgroundColor: "#aee5ba",
    value: (report) => report.calc_dayUse_picnicShelters_netRevenue,
  },
  // Day Use - Other Day Use
  {
    column: "Day Use - Other Day Use - Gross skiing revenue",
    type: Number,
    width: 63,
    value: (report) => report.otherDayUseRevenueSkii,
  },
  {
    column: "Day Use - Other Day Use - Gross hot springs revenue",
    type: Number,
    width: 63,
    value: (report) => report.otherDayUseRevenueHotSprings,
  },
  {
    column: "Day Use - Other Day Use - Net revenue",
    type: Number,
    width: 63,
    backgroundColor: "#aee5ba",
    value: (report) => report.calc_dayUse_otherDayUse_netRevenue,
  },
  // Day Use - Variance Notes
  {
    column: "Day Use - Variance Notes",
    type: String,
    width: 63,
    backgroundColor: "#fff3cd",
    value: (report) => report.notes_dayUse,
  },
  // Backcountry Camping - People
  {
    column: "Backcountry Camping - People - People",
    type: Number,
    width: 63,
    value: (report) => report.people,
  },
  // Backcountry Camping - Camping
  {
    column: "Backcountry Camping - Camping - Gross camping revenue",
    type: Number,
    width: 63,
    value: (report) => report.grossCampingRevenue,
  },
  {
    column: "Backcountry Camping - Camping - Net revenue",
    type: Number,
    width: 63,
    backgroundColor: "#aee5ba",
    value: (report) => report.calc_backcountryCamping_camping_netRevenue,
  },
  // Backcountry Cabins - People
  {
    column: "Backcountry Cabins - People - Adult",
    type: Number,
    width: 63,
    value: (report) => report.peopleAdult,
  },
  {
    column: "Backcountry Cabins - People - Child",
    type: Number,
    width: 63,
    value: (report) => report.peopleChild,
  },
  {
    column: "Backcountry Cabins - People - Family",
    type: Number,
    width: 63,
    value: (report) => report.peopleFamily,
  },
  {
    column: "Backcountry Cabins - People - Total people",
    type: Number,
    width: 63,
    backgroundColor: "#c7e3fd",
    value: (report) => report.calc_backcountryCabins_totalPeople,
  },
  // Backcountry Cabins - Family
  {
    column: "Backcountry Cabins - Family - Gross family revenue",
    type: Number,
    width: 63,
    value: (report) => report.revenueFamily,
  },
  {
    column: "Backcountry Cabins - Family - Net revenue",
    type: Number,
    width: 63,
    backgroundColor: "#aee5ba",
    value: (report) => report.calc_backcountryCabins_family_netRevenue,
  },
  // Backcountry Cabins - Variance Notes
  {
    column: "Backcountry Cabins - Variance Notes",
    type: String,
    width: 63,
    backgroundColor: "#fff3cd",
    value: (report) => report.notes_backcountryCabins,
  },
  // Boating - Boats
  {
    column: "Boating - Boats - Nights on dock",
    type: Number,
    width: 63,
    value: (report) => report.boatAttendanceNightsOnDock,
  },
  {
    column: "Boating - Boats - Nights on buoys",
    type: Number,
    width: 63,
    value: (report) => report.boatAttendanceNightsOnBouys,
  },
  {
    column: "Boating - Boats - Miscellaneous boats",
    type: Number,
    width: 63,
    value: (report) => report.boatAttendanceMiscellaneous,
  },
  {
    column: "Boating - Boats - Boat attendance",
    type: Number,
    width: 63,
    backgroundColor: "#c7e3fd",
    value: (report) => report.calc_boating_boats_boatAttendance,
  },
  {
    column: "Boating - Boats - Gross boating revenue",
    type: Number,
    width: 63,
    value: (report) => report.boatRevenueGross,
  },
  {
    column: "Boating - Boats - Net revenue",
    type: Number,
    width: 63,
    backgroundColor: "#aee5ba",
    value: (report) => report.calc_boating_boats_netRevenue,
  },
  // Boating - Variance Notes
  {
    column: "Boating - Variance Notes",
    type: String,
    width: 63,
    backgroundColor: "#fff3cd",
    value: (report) => report.notes_boating,
  },
];

exports.handler = async (event, context) => {
  console.log("EXPORT", event?.queryStringParameters);

  let queryObj = {
    TableName: TABLE_NAME,
  };

  try {
    if (!event?.queryStringParameters) {
      // Exporting all data
      console.log("=== Exporting all data ===");

      // Get reports
      const scanResults = await getAllRecords({ ...queryObj });
      console.log(scanResults.length + " records found");

      // Combine reports that are part of the same date and subarea
      const groupedReports = await groupBySubAreaAndDate(scanResults);

      // Create sorted rows array
      const rowsArray = generateRowsArray(groupedReports);
      console.log(rowsArray.length + " rows generated");

      await writeXlsxFile(rowsArray, {
        schema,
        filePath: FILE_PATH + "data.xlsx",
      });
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

async function groupBySubAreaAndDate(scanResults) {
  let result = {};
  for (let i = 0; i < scanResults.length; i++) {
    let report = scanResults[i];

    // Prepare report obj with calc fields populated
    report = await modifyReportForCSV(report);

    // Merge report with existing report obj for row in CSV
    result = await mergeReports(result, report);
  }
  return result;
}

async function modifyReportForCSV(report) {
  const activity = report.pk.split("::").pop();

  // Give unique key for variance notes
  report[noteKeys[activity]] = report.notes;
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
      month: months[report.date.slice(-2)],
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

function generateRowsArray(groupedReports) {
  let keys = Object.keys(groupedReports);
  keys.sort();

  let rowsArray = [];
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    delete groupedReports[key].date;
    rowsArray.push(groupedReports[key]);
  }

  return rowsArray;
}
