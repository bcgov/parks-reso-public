(function (window) {
    window.__env = window.__env || {};

    // Ideally in our app we have a wrapper around our logger class in the angular front ends to
    // turn on/off the console.log's
    window.__env.debugMode = false;

    // Environment name
    window.__env.ENVIRONMENT = 'test';  // local | dev | test | prod

    window.__env.API_LOCATION = 'https://idk06gtie9.execute-api.ca-central-1.amazonaws.com';
    window.__env.API_PATH = '/test';
    window.__env.API_PUBLIC_PATH = '/test';

    // Add any feature-toggles
    // window.__env.coolFeatureActive = false;

    // Number of days in advance a pass is available
    window.__env.ADVANCE_BOOKING_LIMIT = 1;

    // Hour of day that booking limit advances by 1 day
    window.__env.ADVANCE_BOOKING_HOUR = 7;

    // Number of people limited on a single trail pass
    window.__env.TRAIL_PASS_LIMIT = 4;

    // Number of vehicles limited on a single parking pass
    window.__env.PARKING_PASS_LIMIT = 1;

}(this));