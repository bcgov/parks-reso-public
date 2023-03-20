const fs = require('fs');
const readline = require('readline');
const { getParks, getSubAreas } = require('../../lambda/dynamoUtil');
const { activitiesEnum } = require('./legacy-data-constants');

let recordFieldsByActivity = {};

function formatTime(time) {
  let sec = parseInt(time / 1000, 10);
  let hours = Math.floor(sec / 3600);
  let minutes = Math.floor((sec - (hours * 3600)) / 60);
  let seconds = sec - (hours * 3600) - (minutes * 60);
  if (hours < 10) { hours = "0" + hours; }
  if (minutes < 10) { minutes = "0" + minutes; }
  if (seconds < 10) { seconds = "0" + seconds; }
  return hours + ':' + minutes + ':' + seconds;
}

function updateConsoleProgress(intervalStartTime, text, complete = 0, total = 1, modulo = 1) {
  if (complete % modulo === 0 || complete === total) {
    const currentTime = new Date().getTime();
    let currentElapsed = currentTime - intervalStartTime;
    let remainingTime = NaN;
    if (complete !== 0) {
      let totalTime = (total / complete) * currentElapsed;
      remainingTime = totalTime - currentElapsed;
    }
    const percent = (complete / total) * 100;
    process.stdout.write(` ${text}: ${complete}/${total} (${percent.toFixed(1)}%) completed in ${formatTime(currentElapsed)} (~${formatTime(remainingTime)} remaining)\r`);
  }
}

async function getConsoleInput(query) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise(resolve => rl.question(query, ans => {
    rl.close();
    resolve(ans);
  }))
}

// The legacy schema is very large - this function is to prevent accidental edits to the schema while building the code.
function validateSchema(schema) {
  console.log('Checking schema...');
  try {
    // Master sheet is 83 columns wide.
    if (Object.keys(schema).length !== 83) {
      throw 'Incorrect schema length.'
    }
    // Ensure all schema entries have the same structure.
    const entryProps = ['prop', 'type', 'activity', 'hasMatch', 'fieldMap', 'fieldName'];
    for (const col in schema) {
      let entry = schema[col];
      for (const prop of entryProps) {
        if (Object.keys(entry).indexOf(prop) === -1) {
          throw `${col}: Malformed schema entry - malformed property`
        }
      }
    }
    // Create fieldmap by activities for future use in legacy record generation.
    createFieldListByActivity(schema);
  } catch (error) {
    throw error;
  }
}

async function getDBSnapshot() {
  console.log('Loading existing DB snapshot...');
  let parks = await getParks();
  let map = {};
  try {
    for (const park of parks) {
      let entry = {};
      let subareas = await getSubAreas(park.orcs);
      for (const subarea of subareas) {
        entry[subarea.sk] = {
          subAreaName: subarea.subAreaName,
          activities: subarea.activities.values
        }
      }
      map[park.orcs] = entry;
    }
    return map;
  } catch (error) {
    throw `Error getting current DB snapshot ` + error;
  }
}

function determineActivities(row, schema) {
  let activityList = [];
  for (const entry in schema) {
    let prop = row[schema[entry].prop];
    let type = schema[entry].type;
    let activity = schema[entry].activity;
    // ignore 'Meta' activity
    if (activityList.indexOf(activity) === -1 && activity !== 'Meta') {
      if (type === String && prop !== '' && prop !== '0') {
        // valid string field
        activityList.push(activity);
      } else if (type === Number && prop && prop !== 0) {
        // valid numerical field
        activityList.push(activity);
      }
    }
  }
  return activityList;
}

function createCSV(header, data, filename) {
  try {
    let csv = header.join(',') + '\n';
    for (const item of data) {
      let row = [];
      for (const field of header) {
        let str = String(item[field]).replaceAll(',', '_');
        row.push(str || '');
      }
      csv += row.join(',') + '\n';
    }
    fs.writeFileSync(`${filename}.csv`, csv);
    console.log(`${filename} created.`);
  } catch (error) {
    console.log(`Failed to create csv: ${filename}: ${error}`);
  }
}

// Quickly generate CSV of current schema to forward for client validation
function createSchemaCSV(schema) {
  try {
    validateSchema(schema);
  } catch (error) {
    console.log('error:', error);
    return;
  }
  const fields = ['Legacy Name', 'fieldName', 'activity', 'type', 'calculated', 'hasMatch', 'fieldMap'];
  const replacer = function (key, value) { return value === null ? '' : value };
  let csv = Object.keys(schema).map(function (entry) {
    let name = JSON.stringify(entry);
    let str = fields.map(function (field) {
      if (field === 'calculated') {
        if (!schema[entry].hasMatch && schema[entry].fieldName !== null) {
          // field is calculated
          return JSON.stringify(true, replacer)
        }
      }
      if (field === 'type') {
        return JSON.stringify(typeof schema[entry][field](), replacer)
      }
      return JSON.stringify(schema[entry][field], replacer)
    }).join(',')
    return name.concat(str)
  })
  csv.unshift(fields.join(','))// add header column
  csv = csv.join('\r\n');
  // console.log("csv:", csv);
  fs.writeFileSync(`ar-fieldmap_${new Date().toISOString()}.csv`, csv);
}

function createFieldListByActivity(schema) {
  for (const activity of Object.keys(activitiesEnum)) {
    let list = [];
    for (const col of Object.keys(schema)) {
      if (schema[col].activity === activitiesEnum[activity]) {
        list.push({ key: schema[col].fieldMap, value: schema[col].prop, hasMatch: schema[col].hasMatch });
      }
    }
    recordFieldsByActivity[activitiesEnum[activity]] = list;
  }
}

function createLegacyParkObject(data) {
  try {
    let obj = {
      pk: 'park',
      sk: data.legacy_orcs,
      parkName: data.legacy_park,
      subAreas: [],
      orcs: data.legacy_orcs,
      roles: ['sysadmin', data.legacy_orcs],
      isLegacy: true,
    }
    return obj;
  } catch (error) {
    throw `Failed to create legacy park object (${data.legacy_orcs}): ` + error;
  }
}

function createLegacySubAreaObject(data, id, subAreaName, activities) {
  try {
    let obj = {
      pk: `park::${data.legacy_orcs}`,
      sk: String(id).padStart(4, '0'),
      parkName: data.legacy_park,
      subAreaName: subAreaName,
      activities: activities || [],
      orcs: data.legacy_orcs,
      roles: ['sysadmin', data.legacy_orcs],
      managementArea: '',
      section: data.legacy_section,
      region: data.legacy_region,
      bundle: data.legacy_bundle,
      isLegacy: true
    }
    return obj;
  } catch (error) {
    throw `Failed to create legacy subarea object ${String(id).padStart(4, '0')} (${data?.legacy_parkSubArea}): ` + error;
  }
}

function createLegacyRecordObject(data, activity, subAreaId) {
  try {
    let obj = createLegacyBaseRecord(data, activity, subAreaId);
    obj = { ...obj, ...createLegacyActivityRecord(data, activity) }
    return obj;
  } catch (error) {
    throw `Failed to create legacy ${activity} record for ${data?.legacy_parkSubArea}, ${data?.legacy_month} ${data.legacy_year}: ${error}`
  }
}

function createLegacyBaseRecord(data, activity, subAreaId) {
  // create date
  const month = new Date(Date.parse(data.legacy_month + ' 1, ' + data.legacy_year)).getMonth() + 1;
  const date = `${data.legacy_year}${String(month).padStart(2, '0')}`;
  return {
    pk: `${subAreaId}::${activity}`,
    sk: date,
    date: date,
    activity: activity,
    orcs: data.legacy_orcs,
    parkName: data.legacy_park,
    subAreaId: subAreaId,
    lastUpdated: new Date().toISOString(),
    isLegacy: true,
    isLocked: true
  }
}

function createLegacyActivityRecord(data, activity) {
  let properties = [...recordFieldsByActivity[activity]];
  let recordObj = {};
  let legacyObj = {};
  for (const prop of properties) {
    if (data[prop.value] || data[prop.value] === 0) {
      if (prop.hasMatch) {
        recordObj[prop.key] = data[prop.value];
      } else {
        legacyObj[prop.key] = data[prop.value];
      }
    }
  }
  if (Object.keys(legacyObj).length) {
    recordObj.legacyData = legacyObj;
  }
  return recordObj;
}

module.exports = {
  updateConsoleProgress,
  createFieldListByActivity,
  validateSchema,
  determineActivities,
  createSchemaCSV,
  createLegacySubAreaObject,
  createLegacyParkObject,
  getConsoleInput,
  createLegacyRecordObject,
  getDBSnapshot,
  createCSV
}
