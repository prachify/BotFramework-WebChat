const generateDirectLineToken = require('../../generateDirectLineToken');

const { DIRECT_LINE_SECRET } = process.env;

// GET /api/directline/token
// Generates a new Direct Line token
module.exports = async (_, res) => {
  debugger;
  console.log('fetching token ------' + DIRECT_LINE_SECRET);
  res.json({ token: await generateDirectLineToken(DIRECT_LINE_SECRET) });
};
