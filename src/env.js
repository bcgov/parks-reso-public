(function (window) {
    window.__env = window.__env || {};

    // Ideally in our app we have a wrapper around our logger class in the angular front ends to
    // turn on/off the console.log's
    window.__env.debugMode = true;

    // Get config from remote host?
    window.__env.configEndpoint = false;

    // Environment name
    window.__env.ENVIRONMENT = 'local';

    window.__env.API_LOCATION = 'http://localhost:3000';
    window.__env.API_PATH = '/api';
    window.__env.API_PUBLIC_PATH = '/api';
    window.__env.ASSETS_S3_URL = 'https://d3ptawfth8sh71.cloudfront.net';

    // Add any feature-toggles
    // window.__env.coolFeatureActive = false;

    // Number of days in advance a pass is available
    window.__env.ADVANCE_BOOKING_LIMIT = 3;

    // Hour of day that booking limit advances by 1 day
    window.__env.ADVANCE_BOOKING_HOUR = 7;

    // Number of people limited on a single trail pass
    window.__env.TRAIL_PASS_LIMIT = 4;

    // Number of vehicles limited on a single parking pass
    window.__env.PARKING_PASS_LIMIT = 1;

}(this));
