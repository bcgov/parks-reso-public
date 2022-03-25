const index = require('../lambda/park/index');

describe('Pass Succeeds', () => {
  test('Handler - 200 Received list of parks', async () => {
    expect(await index.handler(null, null)).toMatchObject({
      body: JSON.stringify([{"name":"Alice Lake Provincial Park","orc":123,"subareas":[{"type":"frontcountry-camping","name":"Frontcountry Camping","id":1},{"type":"day-use","name":"Day Use","id":2},{"type":"group-camping","name":"Group Camping","id":3}]},{"name":"Bear Creek Provincial Park","orc":456,"subareas":[{"type":"frontcountry-camping","name":"Frontcountry Camping","id":7},{"type":"day-use","name":"Day Use","id":8},{"type":"group-camping","name":"Group Camping","id":9}]}]),
      headers: {
        'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
        'Access-Control-Allow-Methods': 'OPTIONS,GET',
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      statusCode: 200
    });
  });
});
