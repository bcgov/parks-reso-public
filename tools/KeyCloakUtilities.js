const readXlsxFile = require('read-excel-file/node');
const axios = require('axios')

const clientIDsDUP = {
  'dev': 'e012cc12-898a-4684-998c-acf96f5dc537',
  'test': 'e135e357-b5d1-4a16-b8ea-7faf53236d85',
  'prod': '098b8101-fb50-492f-9f88-da9b57b85d44'
};

const clientIDsAR = {
  'dev': '447474f3-17a7-4379-a688-e35923be2bbe',
  'test': 'e135e357-b5d1-4a16-b8ea-7faf53236d85',
  'prod': '098b8101-fb50-492f-9f88-da9b57b85d44'
};

let action = ["|", "/", "-", "\\"];
let index = 0;

const schema = {
  'ORCS Number': {
    prop: 'ORCS Number',
    type: String
  },
  'Park': {
    prop: 'Park',
    type: String
  },
  'Park Sub Area': {
    prop: 'Park Sub Area',
    type: String
  },
  'Frontcountry Camping': {
    prop: 'Frontcountry Camping',
    type: String
  },
  'Backcountry Camping': {
    prop: 'Backcountry Camping',
    type: String
  },
  'Group Camping': {
    prop: 'Group Camping',
    type: String
  },
  'Day Use': {
    prop: 'Day Use',
    type: String
  },
  'Boating': {
    prop: 'Boating',
    type: String
  },
  'Frontcountry Cabins': {
    prop: 'Frontcountry Cabins',
    type: String
  },
  'Backcountry Cabins': {
    prop: 'Backcountry Cabins',
    type: String
  },
  'Section': {
    prop: 'Section',
    type: String
  },
  'Management Area': {
    prop: 'Management Area',
    type: String
  },
  'Bundle': {
    prop: 'Bundle',
    type: String
  },
  'Region': {
    prop: 'Region',
    type: String
  }
}

main();

async function main() {
  if (process.argv.length <= 4) {
    console.log("KeyCloak Utilities: Invalid parameters");
    console.log("");
    console.log("Usage: node KeyCloakUtilities.js <filename.xlsx> <env> <product> <token>");
    console.log("");
    console.log("Options");
    console.log("    <filename>: The parks worksheet");
    console.log("    <env>: dev/test/prod");
    console.log("    <product>: ar/dup (A&R or Day Use Parking)");
    console.log("    <token>: Your encoded JWT for the KeyCloak realm.");
    console.log("");
    console.log("example: node KeyCloakUtilities.js myFile.xlsx dev ar xxxx");
    console.log("");
  } else {
    const filename = process.argv[2];
    const env = process.argv[3];
    const environment = env === 'prod' ? '' : env + '.';
    const clientIDs = process.argv[4] === 'ar' ? clientIDsAR : clientIDsDUP;
    const clientID = clientIDs[env];
    const token = process.argv[5];
    const url = `https://${environment}oidc.gov.bc.ca/auth/admin/realms/g7v0xlf4/clients/${clientID}/roles`;
    console.log("Setting KC URL:", url);

    // If parking-pass, we just need the park for now, add role by orcs #
    if (process.argv[4] === 'ar') {
      await new Promise(async function (resolve, reject) {
        let { rows, errors } = await readXlsxFile(`./${filename}`, { schema });
        for (const [idx, row] of rows.entries()) {
          const subAreaNameSplitContent = row['Park Sub Area'].split(" - ");
          const roleName = `${row['ORCS Number']}:${subAreaNameSplitContent[subAreaNameSplitContent.length - 1]}`;
          const description = `${row['Park']}:${subAreaNameSplitContent[subAreaNameSplitContent.length - 1]}`;
          // const roleName = `${row['ORCS Number']}:Garibaldi Lake / Taylor Meadows`;
          // console.log(`SubArea ${idx}: ${subAreaName}`);

          await createRoleFromSubArea({name: roleName, description: description}, url, token);
          // await deleteRoleFromSubArea({name: roleName, description: description}, url, token);

          process.stdout.write(action[index % 4] + " " + index.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',') + "\r");
          index++;
        }
        process.stdout.write(`${index.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')} Roles Processed\r\n`);
        resolve();
      });
    } else {
      let roles = [];
      await new Promise(async function (resolve, reject) {
        let { rows, errors } = await readXlsxFile(`./${filename}`, { schema });
        for (const [idx, row] of rows.entries()) {
          const subAreaNameSplitContent = row['Park Sub Area'].split(" - ");
          const roleName = `${row['ORCS Number']}`;
          const description = `${row['Park']}`;
          roles.push({name: roleName, description: description});
          process.stdout.write(action[index % 4] + " " + index.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',') + "\r");
          index++;
        }
        process.stdout.write(`${index.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')} Subareas Processed\r\n`);
        resolve();
      });

      index = 0;

      const uniqueSet = new Set(roles);
      const uniqueArrayOfRoles = [...uniqueSet];
      for (const [idx, role] of uniqueArrayOfRoles.entries()) {
        // await createRoleFromSubArea(role, url, token);
        await deleteRoleFromSubArea(role, url, token);

        process.stdout.write(action[index % 4] + " " + index.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',') + "\r");
        index++;
      }
      process.stdout.write(`${index.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')} Roles Processed\r\n`);
    }
  }
}

async function createRoleFromSubArea(role, url, token) {
  // console.log(`Adding subarea: ${role}`);

  const json = {
    "name": role.name,
    "composite": false,
    "clientRole": true,
    "description": role.description
  };

  try {
    const res = await axios.post(encodeURI(url), json, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token,
        'Accept': 'application/json'
      }
    });
  } catch (err) {
    console.log('Add Role Error:', err.response.data);
  }
}

async function deleteRoleFromSubArea(role, url, token) {
  // console.log(`Deleting subarea: ${role}`);
  try {
    const res = await axios.delete(encodeURI(url) + '/' + role.name, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token,
        'Accept': 'application/json'
      }
    });
  } catch (err) {
    console.log('Delete Role Error:', err.response);
  }
}