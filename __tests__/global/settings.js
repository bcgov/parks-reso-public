const REGION = process.env.AWS_REGION || 'local-env';
const ENDPOINT = 'http://localhost:8000';
const TABLE_NAME = process.env.TABLE_NAME || 'ar-tests';

module.exports = {
  REGION,
  ENDPOINT,
  TABLE_NAME
};
