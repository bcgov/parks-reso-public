// Every column in the legacy data should fall under one of these categories.
// If we can't ascertain one of the first 0-7 categories, assign to cat 8 'Legacy'

const activitiesEnum = {
  0: 'Meta',
  1: 'Frontcountry Camping',
  2: 'Frontcountry Cabins',
  3: 'Backcountry Camping',
  4: 'Backcountry Cabins',
  5: 'Group Camping',
  6: 'Day Use',
  7: 'Boating',
  8: 'Legacy Data'
}

// We must provide a schema to guarantee the matchup of legacy fields to the new system. 
// This schema is the master map of legacy to new.

/**
 * '<legacy_field_name>' : {
 *  prop: '<temp_field_name>',
 *  type: <field_data_type>
 *  activity: <field_activity_type> (which new activity does the legacy field belong to? For sorting legacy data records.) 
 *  hasMatch: <true/false> (does the legacy field have an exact map to the new system?, If no, new legacy field created.)
 *  fieldMap: '<new_system_field_name>'
 * }
 */
const schema = {
  'ORCS': {
    prop: 'legacy_orcs',
    type: String,
    activity: activitiesEnum[0],
    hasMatch: true,
    fieldMap: 'orcs',
    fieldName: 'ORCS'
  },
  'Region': {
    prop: 'legacy_region',
    type: String,
    activity: activitiesEnum[0],
    hasMatch: true,
    fieldMap: 'region',
    fieldName: 'Region'
  },
  'Section': {
    prop: 'legacy_section',
    type: String,
    hasMatch: true,
    activity: activitiesEnum[0],
    fieldMap: 'section',
    fieldName: 'Section'
  },
  'Bundle': {
    prop: 'legacy_bundle',
    type: String,
    activity: activitiesEnum[0],
    hasMatch: true,
    fieldMap: 'bundle',
    fieldName: 'Bundle',
  },
  'Park': {
    prop: 'legacy_park',
    type: String,
    activity: activitiesEnum[0],
    hasMatch: true,
    fieldMap: 'parkName',
    fieldName: 'Park Name'
  },
  'Park Sub Area': {
    prop: 'legacy_parkSubArea',
    type: String,
    activity: activitiesEnum[0],
    hasMatch: true,
    fieldMap: 'subAreaName',
    fieldName: 'Sub Area Name',
  },
  'Year': {
    prop: 'legacy_year',
    type: String,
    activity: activitiesEnum[0],
    hasMatch: false,
    fieldMap: 'legacy_year',
    fieldName: null,
  },
  'Month': {
    prop: 'legacy_month',
    type: String,
    activity: activitiesEnum[0],
    hasMatch: false,
    fieldMap: 'legacy_month',
    fieldName: null,
  },
  'Regular Frontcountry Camping Parties': {
    prop: 'legacy_frontcountryCampingRegularCampingParties',
    type: Number,
    activity: activitiesEnum[1],
    hasMatch: true,
    fieldMap: 'campingPartyNightsAttendanceStandard',
    fieldName: 'Frontcountry Camping - Camping Party Nights - Standard',
  },
  'Senior Frontcountry Camping Parties': {
    prop: 'legacy_frontcountryCampingSeniorCampingParties',
    type: Number,
    activity: activitiesEnum[1],
    hasMatch: true,
    fieldMap: 'campingPartyNightsAttendanceSenior',
    fieldName: 'Frontcountry Camping - Camping Party Nights - Senior',
  },
  'SSCFE Frontcountry Camping Parties': {
    prop: 'legacy_frontcountryCampingSSCFECampingParties',
    type: Number,
    activity: activitiesEnum[1],
    hasMatch: true,
    fieldMap: 'campingPartyNightsAttendanceSocial',
    fieldName: 'Frontcountry Camping - Camping Party Nights - Social',
  },
  'Long-stay Frontcountry Camping Parties': {
    prop: 'legacy_frontcountryCampingLongStayCampingParties',
    type: Number,
    activity: activitiesEnum[1],
    hasMatch: true,
    fieldMap: 'campingPartyNightsAttendanceLongStay',
    fieldName: 'Frontcountry Camping - Camping Party Nights - Long stay',
  },
  'Frontcountry Cabin Parties': {
    prop: 'legacy_frontcountryCabinsCabinParties',
    type: Number,
    activity: activitiesEnum[2],
    hasMatch: true,
    fieldMap: 'totalAttendanceParties',
    fieldName: 'Frontcountry Cabins - Parties',
  },
  // Note necessary additional whitespace in title
  'Total  Frontcountry Camping Parties': {
    prop: 'legacy_frontcountryCampingTotalCampingParties',
    type: Number,
    activity: activitiesEnum[1],
    hasMatch: false,
    fieldMap: 'legacy_frontcountryCampingTotalCampingParties',
    fieldName: 'Frontcountry Camping - Camping Party Nights - Total attendance',
  },
  // Can't ascertain whether both Frontcountry Cabins, Group Camping, and Frontcountry Camping are included in this or not.
  // Note necessary additional whitespace in title
  'Total  Frontcountry Camping People': {
    prop: 'legacy_frontcountryCampingTotalCampingAttendancePeople',
    type: Number,
    activity: activitiesEnum[8],
    hasMatch: false,
    fieldMap: 'legacy_frontcountryCampingTotalCampingAttendancePeople',
    fieldName: null,
  },
  'Total Gross Frontcountry Cabin Revenue': {
    prop: 'legacy_frontcountryCabinsTotalCabinGrossRevenue',
    type: Number,
    activity: activitiesEnum[2],
    hasMatch: true,
    fieldMap: 'revenueGrossCamping',
    fieldName: 'Frontcountry Cabins - Camping - Gross camping revenue'
  },
  'Total Gross Frontcountry Camping Revenue': {
    prop: 'legacy_frontcountryCampingTotalCampingGrossRevenue',
    type: Number,
    activity: activitiesEnum[1],
    hasMatch: false,
    fieldMap: 'legacy_frontcountryCampingTotalCampingGrossRevenue',
    fieldName: 'Frontcountry Camping - Camping Party Nights - Gross camping revenue'
  },
  'Total Net Frontcountry Camping Revenue': {
    prop: 'legacy_frontcountryCampingTotalCampingNetRevenue',
    type: Number,
    activity: activitiesEnum[1],
    hasMatch: false,
    fieldMap: 'legacy_frontcountryCampingTotalCampingNetRevenue',
    fieldName: 'Frontcountry Camping - Camping Party Nights - Net revenue',
  },
  '# Paid Regular 2nd Cars': {
    prop: 'legacy_frontcountryCampingRegularSecondCarsAttendance',
    type: Number,
    activity: activitiesEnum[1],
    hasMatch: true,
    fieldMap: 'secondCarsAttendanceStandard',
    fieldName: 'Frontcountry Camping - Second Cars - Standard'
  },
  // note necessary additional whitespace here
  '# Senior  2nd Cars': {
    prop: 'legacy_frontcountryCampingSeniorSecondCarsAttendance',
    type: Number,
    activity: activitiesEnum[1],
    hasMatch: true,
    fieldMap: 'secondCarsAttendanceSenior',
    fieldName: 'Frontcountry Camping - Second Cars - Senior'

  },
  '# SSCFE 2nd Cars': {
    prop: 'legacy_frontcountryCampingSSCFESecondCarsAttendance',
    type: Number,
    activity: activitiesEnum[1],
    hasMatch: true,
    fieldMap: 'secondCarsAttendanceSocial',
    fieldName: 'Frontcountry Camping - Second Cars - Social'
  },
  'Total # 2nd Cars': {
    prop: 'legacy_frontcountryCampingTotalSecondCarsAttendance',
    type: Number,
    activity: activitiesEnum[1],
    hasMatch: false,
    fieldMap: 'legacy_frontcountryCampingTotalSecondCarsAttendance',
    fieldName: 'Frontcountry Camping - Second Cars - Total attendance'
  },
  'Gross Second Car Revenue': {
    prop: 'legacy_frontcountryCampingSecondCarsGrossRevenue',
    type: Number,
    activity: activitiesEnum[1],
    hasMatch: true,
    fieldMap: 'secondCarsRevenueGross',
    fieldName: 'Frontcountry Camping - Second Cars - Gross 2nd car revenue'
  },
  'Net 2nd Car Revenue': {
    prop: 'legacy_frontcountryCampingSecondCarsNetRevenue',
    type: Number,
    activity: activitiesEnum[1],
    hasMatch: false,
    fieldMap: 'legacy_frontcountryCampingSecondCarsNetRevenue',
    fieldName: null
  },
  'Frontcountry Camping Variance Note': {
    prop: 'legacy_frontcountryCampingVarianceNote',
    type: String,
    activity: activitiesEnum[1],
    hasMatch: true,
    fieldMap: 'notes',
    fieldName: 'Frontcountry Camping - Variance Notes'
  },
  '# Backcountry Persons': {
    prop: 'legacy_backcountryCampingAttendancePeople',
    type: Number,
    activity: activitiesEnum[3],
    hasMatch: true,
    fieldMap: 'people',
    fieldName: 'Backcountry Camping - People - People'
  },
  // Can't ascertain whether both Backcountry Cabins and Backcountry Camping are included in this or not.
  'Gross Backcountry Revenue': {
    prop: 'legacy_backcountryTotalGrossRevenue',
    type: Number,
    activity: activitiesEnum[8],
    hasMatch: false,
    fieldMap: 'legacy_backcountryTotalGrossRevenue',
    fieldName: null
  },
  // Can't ascertain whether both Backcountry Cabins and Backcountry Camping are included in this or not.
  'Net Backcountry Revenue': {
    prop: 'legacy_backcountryTotalNetRevenue',
    type: Number,
    activity: activitiesEnum[8],
    hasMatch: false,
    fieldMap: 'legacy_backcountryTotalNetRevenue',
    fieldName: null
  },
  'Camping Backcountry Variance Note': {
    prop: 'legacy_backcountryCampingVarianceNote',
    activity: activitiesEnum[3],
    type: String,
    hasMatch: true,
    fieldMap: 'notes',
    fieldName: 'Backcountry Camping - Variance Notes'
  },
  '# Backcountry Cabin Adults': {
    prop: 'legacy_backcountryCabinsAttendanceAdults',
    type: Number,
    activity: activitiesEnum[4],
    hasMatch: true,
    fieldMap: 'peopleAdult',
    fieldName: 'Backcountry Cabins - People - Adult'
  },
  '# Backcountry Cabin Child': {
    prop: 'legacy_backcountryCabinsAttendanceKids',
    type: Number,
    activity: activitiesEnum[4],
    hasMatch: true,
    fieldMap: 'peopleChild',
    fieldName: 'Backcountry Cabins - People - Child'
  },
  '# Backcountry Cabin Family': {
    prop: 'legacy_backcountryCabinsAttendanceFamilies',
    type: Number,
    activity: activitiesEnum[4],
    hasMatch: true,
    fieldMap: 'peopleFamily',
    fieldName: 'Backcountry Cabins - People - Family'
  },
  'Total # Backcountry Cabin Persons': {
    prop: 'legacy_backcountryCabinsTotalAttendancePeople',
    type: Number,
    activity: activitiesEnum[4],
    hasMatch: false,
    fieldMap: 'legacy_backcountryCabinsTotalAttendancePeople',
    fieldName: 'Backcountry Cabins - People - Total people'

  },
  'Gross Backcountry Cabin Revenue': {
    prop: 'legacy_backcountryCabinsGrossRevenue',
    type: Number,
    activity: activitiesEnum[4],
    hasMatch: true,
    fieldMap: 'revenueFamily',
    fieldName: 'Backcountry Cabins - Family - Gross family revenue'
  },
  'Net Total Backcountry Cabin Revenue': {
    prop: 'legacy_backcountryCabinsNetRevenue',
    type: Number,
    activity: activitiesEnum[4],
    hasMatch: false,
    fieldMap: 'legacy_backcountryCabinsNetRevenue',
    fieldName: 'Backcountry Cabins - Family - Net revenue'
  },
  'Backcountry Cabin Variance Note': {
    prop: 'legacy_backcountryCabinsVarianceNote',
    type: String,
    activity: activitiesEnum[4],
    hasMatch: true,
    fieldMap: 'notes',
    fieldName: 'Backcountry Cabins - Variance Notes'
  },
  // Can't ascertain whether both Backcountry Cabins and Backcountry Camping are included in this or not.
  'Total Backcountry People': {
    prop: 'legacy_backcountryTotalAttendancePeople',
    type: Number,
    activity: activitiesEnum[8],
    hasMatch: false,
    fieldMap: 'legacy_backcountryTotalAttendancePeople',
    fieldName: null
  },
  '# Youth Group Party Members': {
    prop: 'legacy_groupCampingYouthRateAttendancePeople',
    type: Number,
    activity: activitiesEnum[5],
    hasMatch: true,
    fieldMap: 'youthRateGroupsAttendancePeople',
    fieldName: 'Group Camping - Youth Rate - People'
  },
  '# Youth Group Nights': {
    prop: 'legacy_groupCampingYouthRateNights',
    type: Number,
    activity: activitiesEnum[5],
    hasMatch: true,
    fieldMap: 'youthRateGroupsAttendanceGroupNights',
    fieldName: 'Group Camping - Youth Rate - Group nights'
  },
  'Gross Youth Group Revenue': {
    prop: 'legacy_groupCampingYouthRateGrossRevenue',
    type: Number,
    activity: activitiesEnum[5],
    hasMatch: true,
    fieldMap: 'youthRateGroupsRevenueGross',
    fieldName: 'Group Camping - Youth Rate - Gross youth group revenue'
  },
  '# Group Adults': {
    prop: 'legacy_groupCampingStandardAttendanceAdults',
    type: Number,
    activity: activitiesEnum[5],
    hasMatch: true,
    fieldMap: 'standardRateGroupsTotalPeopleAdults',
    fieldName: 'Group Camping - Standard Rate - Adults'
  },
  '# Group Youth': {
    prop: 'legacy_groupCampingStandardAttendanceYouth',
    type: Number,
    activity: activitiesEnum[5],
    hasMatch: true,
    fieldMap: 'standardRateGroupsTotalPeopleYouth',
    fieldName: 'Group Camping - Standard Rate - Youth'
  },
  '# Group Children': {
    prop: 'legacy_groupCampingStandardAttendanceKids',
    type: Number,
    activity: activitiesEnum[5],
    hasMatch: true,
    fieldMap: 'standardRateGroupsTotalPeopleKids',
    fieldName: 'Group Camping - Standard Rate - Kids'
  },
  'Total # Group Persons': {
    prop: 'legacy_groupCampingStandardTotalAttendancePeople',
    type: Number,
    activity: activitiesEnum[5],
    hasMatch: false,
    fieldMap: 'legacy_groupCampingStandardTotalAttendancePeople',
    fieldName: 'Group Camping Total Attendance (People)'
  },
  '# Regular Group Nights': {
    prop: 'legacy_groupCampingStandardNights',
    type: Number,
    activity: activitiesEnum[5],
    hasMatch: true,
    fieldMap: 'standardRateGroupsTotalPeopleStandard',
    fieldName: 'Group Camping - Standard Rate - Standard'
  },
  'Gross Regular Group Revenue': {
    prop: 'legacy_groupCampingStandardGrossRevenue',
    type: Number,
    activity: activitiesEnum[5],
    hasMatch: true,
    fieldMap: 'standardRateGroupsRevenueGross',
    fieldName: 'Group Camping - Standard Rate - Gross standard group revenue'
  },
  'Net Total Group Camping Revenue': {
    prop: 'legacy_groupCampingTotalNetRevenue',
    type: Number,
    activity: activitiesEnum[5],
    hasMatch: false,
    fieldMap: 'legacy_groupCampingTotalNetRevenue',
    fieldName: 'Net Total Group Camping Revenue'
  },
  'Gross Total Group Camping Revenue': {
    prop: 'legacy_groupCampingTotalGrossRevenue',
    type: Number,
    activity: activitiesEnum[5],
    hasMatch: false,
    fieldMap: 'legacy_groupCampingTotalGrossRevenue',
    fieldName: 'Gross Total Group Camping Revenue'
  },
  'Camping Group Variance Note': {
    prop: 'legacy_groupCampingVarianceNote',
    type: String,
    activity: activitiesEnum[5],
    hasMatch: true,
    fieldMap: 'notes',
    fieldName: 'Group Camping - Variance Notes'
  },
  'Gross Sani Station Revenue': {
    prop: 'legacy_dayUseMiscSaniStationGrossRevenue',
    type: Number,
    activity: activitiesEnum[1],
    hasMatch: true,
    fieldMap: 'otherRevenueGrossSani',
    fieldName: 'Frontcountry Camping - Other - Gross sani revenue'
  },
  'Net Sani Station Revenue': {
    prop: 'legacy_dayUseMiscSaniStationNetRevenue',
    type: Number,
    activity: activitiesEnum[1],
    hasMatch: false,
    fieldMap: 'legacy_dayUseMiscSaniStationNetRevenue',
    fieldName: 'Frontcountry Camping - Other - Net sani revenue'
  },
  'Gross Shower Revenue': {
    prop: 'legacy_dayUseMiscShowerGrossRevenue',
    type: Number,
    activity: activitiesEnum[1],
    hasMatch: true,
    fieldMap: 'otherRevenueShower',
    fieldName: 'Frontcountry Camping - Other - Gross shower revenue'
  },
  'Net Shower Revenue': {
    prop: 'legacy_dayUseMiscShowerNetRevenue',
    type: Number,
    activity: activitiesEnum[1],
    hasMatch: false,
    fieldMap: 'legacy_dayUseMiscShowerNetRevenue',
    fieldName: 'Frontcountry Camping - Other - Net shower revenue'
  },
  'Gross Electrification Revenue': {
    prop: 'legacy_dayUseMiscElectricalGrossRevenue',
    type: Number,
    activity: activitiesEnum[1],
    hasMatch: true,
    fieldMap: 'otherRevenueElectrical',
    fieldName: 'Frontcountry Camping - Other - Gross electrical fee revenue'
  },
  // Total for multiple activities
  'Total Camping Attendance (People)': {
    prop: 'legacy_totalCampingAttendancePeople',
    type: Number,
    activity: activitiesEnum[8],
    hasMatch: false,
    fieldMap: 'legacy_totalCampingAttendancePeople',
    fieldName: 'Total Camping Attendance (People)'
  },
  // Total for multiple activities
  'Total Gross Camping Revenue': {
    prop: 'legacy_totalCampingGrossRevenue',
    type: Number,
    activity: activitiesEnum[8],
    hasMatch: false,
    fieldMap: 'legacy_totalCampingGrossRevenue',
    fieldName: 'Total Camping Gross Revenue'
  },
  // Total for multiple activities
  'Total Net Camping Revenue': {
    prop: 'legacy_totalCampingNetRevenue',
    type: Number,
    activity: activitiesEnum[8],
    hasMatch: false,
    fieldMap: 'legacy_totalCampingNetRevenue',
    fieldName: 'Total Camping Net Revenue'
  },
  'Day Use Vehicles': {
    prop: 'legacy_dayUseVehicles',
    type: Number,
    activity: activitiesEnum[6],
    hasMatch: true,
    fieldMap: 'peopleAndVehiclesVehicle',
    fieldName: 'Day Use - People and Vehicles - Vehicle count'
  },
  'Day Use Busses': {
    prop: 'legacy_dayUseBuses',
    type: Number,
    activity: activitiesEnum[6],
    hasMatch: true,
    fieldMap: 'peopleAndVehiclesBus',
    fieldName: 'Day Use - People and Vehicles - Bus count'
  },
  'Day Use People': {
    prop: 'legacy_dayUseAttendancePeople',
    type: Number,
    activity: activitiesEnum[6],
    hasMatch: true,
    fieldMap: 'peopleAndVehiclesTrail',
    fieldName: 'Day Use - People and Vehicles - Trail count'
  },
  'Total Day Use People': {
    prop: 'legacy_dayUseTotalPeopleAndVehiclesAttendancePeople',
    type: Number,
    activity: activitiesEnum[6],
    hasMatch: false,
    fieldMap: 'legacy_dayUseTotalPeopleAndVehiclesAttendancePeople',
    fieldName: 'Day Use - People and Vehicles - Total attendance (People)'
  },
  'Gross Misc Day Use Revenue': {
    prop: 'legacy_dayUseMiscGrossRevenue',
    type: Number,
    activity: activitiesEnum[6],
    hasMatch: false,
    fieldMap: 'legacy_dayUseMiscGrossRevenue',
    fieldName: null
  },
  'Net Misc Day Use Revenue': {
    prop: 'legacy_dayUseMiscNetRevenue',
    type: Number,
    activity: activitiesEnum[6],
    hasMatch: false,
    fieldMap: 'legacy_dayUseMiscNetRevenue',
    fieldName: null
  },
  'Day Use FC Variance Note': {
    prop: 'legacy_dayUseVarianceNote',
    type: String,
    activity: activitiesEnum[6],
    hasMatch: true,
    fieldMap: 'notes',
    fieldName: 'Day Use - Variance Notes'
  },
  'Total Picnic Shelter People': {
    prop: 'legacy_dayUsePicnicShelterAttendancePeople',
    type: Number,
    activity: activitiesEnum[6],
    hasMatch: true,
    fieldMap: 'picnicShelterPeople',
    fieldName: 'Day Use - Picnic Shelters - Picnic shelter people'
  },
  // (fieldMap) This variable is a quantity, not a revenue
  'Picnic Shelter Rentals': {
    prop: 'legacy_dayUsePicnicShelterRentals',
    type: Number,
    activity: activitiesEnum[6],
    hasMatch: true,
    fieldMap: 'picnicRevenueShelter',
    fieldName: 'Day Use - Picnic Shelters - Picnic shelter rentals'
  },
  'Net Picnic Shelter Revenue': {
    prop: 'legacy_dayUsePicnicShelterNetRevenue',
    type: Number,
    activity: activitiesEnum[6],
    hasMatch: true,
    fieldMap: 'picnicRevenueGross',
    fieldName: 'Day Use - Picnic Shelters - Net revenue'
  },
  'Gross Picnic Shelter Revenue': {
    prop: 'legacy_dayUsePicnicShelterGrossRevenue',
    type: Number,
    activity: activitiesEnum[6],
    hasMatch: false,
    fieldMap: 'picnicRevenueGross',
    fieldName: 'Day Use - Picnic Shelters - Gross picnic revenue'
  },
  'Picnic Shelter Variance Note': {
    prop: 'legacy_dayUsePicnicShelterVarianceNote',
    type: String,
    activity: activitiesEnum[6],
    hasMatch: false,
    fieldMap: 'legacy_dayUsePicnicShelterVarianceNote',
    fieldName: null
  },
  'Total Net Day Use Revenue': {
    prop: 'legacy_dayUseTotalNetRevenue',
    type: Number,
    activity: activitiesEnum[6],
    hasMatch: false,
    fieldMap: 'legacy_dayUseTotalNetRevenue',
    fieldName: 'Day Use Net Revenue'
  },
  'Total Gross Day Use Revenue': {
    prop: 'legacy_dayUseTotalGrossRevenue',
    type: Number,
    activity: activitiesEnum[6],
    hasMatch: false,
    fieldMap: 'legacy_dayUseTotalGrossRevenue',
    fieldName: 'Day Use Gross Revenue'
  },
  'Total Day Use attendance (people)': {
    prop: 'legacy_dayUseTotalAttendancePeople',
    type: Number,
    activity: activitiesEnum[6],
    hasMatch: false,
    fieldMap: 'legacy_dayUseTotalAttendancePeople',
    fieldName: 'Day Use Total Attendance (People)'
  },
  '# Misc Boats': {
    prop: 'legacy_boatingMiscBoatAttendance',
    type: Number,
    activity: activitiesEnum[7],
    hasMatch: true,
    fieldMap: 'boatAttendanceMiscellaneous',
    fieldName: 'Boating - Boats - Miscellaneous boats'
  },
  // (fieldMap) Note typo in 'buoys'
  '# Boats on Buoys': {
    prop: 'legacy_boatingBoatsOnBuoy',
    type: Number,
    activity: activitiesEnum[7],
    hasMatch: true,
    fieldMap: 'boatAttendanceNightsOnBouys',
    fieldName: 'Boating - Boats - Nights on buoys'
  },
  '# Boats on Docks': {
    prop: 'legacy_boatingBoatsOnDock',
    type: Number,
    activity: activitiesEnum[7],
    hasMatch: true,
    fieldMap: 'boatAttendanceNightsOnDock',
    fieldName: 'Boating - Boats - Nights on dock'
  },
  'Total Boating People': {
    prop: 'legacy_boatingTotalAttendancePeople',
    type: Number,
    activity: activitiesEnum[7],
    hasMatch: false,
    fieldMap: 'legacy_boatingTotalAttendancePeople',
    fieldName: 'Boating - Boats - Boat attendance'
  },
  'Total Net Boating Revenue': {
    prop: 'legacy_boatingTotalNetRevenue',
    type: Number,
    activity: activitiesEnum[7],
    hasMatch: false,
    fieldMap: 'legacy_boatingTotalNetRevenue',
    fieldName: 'Boating - Boats - Net revenue'
  },
  'Total Gross Boating Revenue': {
    prop: 'legacy_boatingTotalGrossRevenue',
    type: Number,
    activity: activitiesEnum[7],
    hasMatch: true,
    fieldMap: 'boatRevenueGross',
    fieldName: 'Boating - Boats - Gross boating revenue'
  },
  'Boating Variance Note': {
    prop: 'legacy_boatingVarianceNote',
    type: String,
    activity: activitiesEnum[7],
    hasMatch: true,
    fieldMap: 'notes',
    fieldName: 'Boating - Variance Notes'
  },
  // No parent activity
  'Additional Note': {
    prop: 'legacy_additionalNote',
    type: String,
    activity: activitiesEnum[8],
    hasMatch: false,
    fieldMap: 'legacy_additionalNote',
    fieldName: null
  },
  // No parent activity
  'TOTAL NET REVENUE': {
    prop: 'legacy_totalsTotalNetRevenue',
    type: Number,
    activity: activitiesEnum[8],
    hasMatch: false,
    fieldMap: 'legacy_totalsTotalNetRevenue',
    fieldName: 'Total Net Revenue'
  },
  // No parent activity
  'TOTAL ATTENDANCE (PERSONS)': {
    prop: 'legacy_totalsTotalAttendancePeople',
    type: Number,
    activity: activitiesEnum[8],
    hasMatch: false,
    fieldMap: 'legacy_totalsTotalAttendancePeople',
    fieldName: 'Total Attendance'
  },
  // No parent activity
  'Data Source': {
    prop: 'legacy_dataSource',
    type: String,
    activity: activitiesEnum[8],
    hasMatch: false,
    fieldMap: 'legacy_dataSource',
    fieldName: null
  },
}

module.exports = {
  activitiesEnum,
  schema
}
