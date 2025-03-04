const fetchJSON = require('./utils/fetchJSON');

// Generates a new Direct Line token given the secret.
module.exports = async function generateDirectLineToken(secret) {
  // You should consider using Enhanced Direct Line Authentication to protect the user ID.
  // https://blog.botframework.com/2018/09/25/enhanced-direct-line-authentication-features/
  const { token } = await fetchJSON(
    'https://defaultc2983f0e34ee4b438abcc2f460fd26.be.environment.api.powerplatform.com/powervirtualagents/botsbyschema/cr5f7_agent1z0ZbTg/directline/token?api-version=2022-03-01-preview',
    { method: 'GET' }
  );
  console.log('token------' + token);
  return token;
};
