const EXPORT_NOTE_KEYS = {
  "Frontcountry Camping": "notes_frontcountryCamping",
  "Frontcountry Cabins": "notes_frontcountryCabins",
  "Group Camping": "notes_groupCamping",
  "Day Use": "notes_dayUse",
  "Backcountry Camping": "notes_backcountryCamping",
  "Backcountry Cabins": "notes_backcountryCabins",
  Boating: "notes_boating",
};

const EXPORT_MONTHS = {
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

const STATE_DICTIONARY = {
  FETCHING: 1,
  FETCHED: 2,
  GROUP_BY_SUBAREA_AND_DATE: 3,
  GROUP_BY_SUBAREA_AND_DATE: 3,
  GENERATE_ROWS: 4,
  GENERATE_REPORT: 5,
  UPLOAD_TO_S3: 6,
  COMPLETE: 7,
};

const CSV_SYSADMIN_SCHEMA = [
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
  {
    column: "Frontcountry Cabins - Parties - Total Attendance",
    type: Number,
    width: 63,
    value: (report) => report.calc_frontCountryCabins_parties_totalAttendance,
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
  // Backcountry Camping - Variance Notes
  {
    column: "Backcountry Camping - Variance Notes",
    type: String,
    width: 63,
    backgroundColor: "#fff3cd",
    value: (report) => report.notes_backcountryCamping,
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

module.exports = {
  EXPORT_NOTE_KEYS,
  EXPORT_MONTHS,
  CSV_SYSADMIN_SCHEMA,
  STATE_DICTIONARY
};
