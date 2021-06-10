(function (window) {
    window.__env = window.__env || {};

    // Ideally in our app we have a wrapper around our logger class in the angular front ends to
    // turn on/off the console.log's
    window.__env.debugMode = false;

    // Environment name
    window.__env.ENVIRONMENT = 'local';  // local | dev | test | prod

    window.__env.API_LOCATION = 'https://pkqlwkdzka.execute-api.ca-central-1.amazonaws.com';
    window.__env.API_PATH = '/dev';
    window.__env.API_PUBLIC_PATH = '/dev';

    // Add any feature-toggles
    // window.__env.coolFeatureActive = false;
}(this));