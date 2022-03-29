const AWS = require('aws-sdk');
const { sendResponse } = require('../responseUtil');

exports.handler = async (event, context) => {
  console.log('GET: Park', event);
  return sendResponse(200,
    [
      {
        name: 'Alice Lake Provincial Park',
        orc: 123,
        subareas: [
          {
            type: 'frontcountry-camping',
            name: 'Frontcountry Camping',
            id: 1
          },
          {
            type: 'day-use',
            name: 'Day Use',
            id: 2
          },
          {
            type: 'group-camping',
            name: 'Group Camping',
            id: 3
          }
        ]
      },
      {
        name: 'Bear Creek Provincial Park',
        orc: 456,
        subareas: [
          {
            type: 'frontcountry-camping',
            name: 'Frontcountry Camping',
            id: 7
          },
          {
            type: 'day-use',
            name: 'Day Use',
            id: 8
          },
          {
            type: 'group-camping',
            name: 'Group Camping',
            id: 9
          }
        ]
      }
    ]
  );
};