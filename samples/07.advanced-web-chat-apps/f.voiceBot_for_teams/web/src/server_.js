// Setting default environment variables.
process.env = {
  OAUTH_AUTHORIZE_URL: 'https://login.microsoftonline.com/organizations/oauth2/v2.0/authorize',
  OAUTH_ACCESS_TOKEN_URL: 'https://login.microsoftonline.com/organizations/oauth2/v2.0/token',
  //OAUTH_PKCE_SALT: random.toString(36).substr(2),
  OAUTH_SCOPE: 'User.Read',
  PORT: '3978',
  STATIC_FILES: 'public',
  ...process.env
};

const path = require('path');
const restify = require('restify');

const { PORT } = process.env;

const server = restify.createServer();

// Middleware to serve static files from the "public" folder
server.get(
  '/*',
  restify.plugins.serveStatic({
    directory: path.join(__dirname, 'public'),
    default: 'index.html' // Serve index.html for root requests
  })
);

server.listen(PORT, () => {
  console.log('Server running at http://localhost:' + PORT);
});
