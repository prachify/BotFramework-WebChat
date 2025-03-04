const restify = require('restify');
const path = require('path');
const random = require('math-random');

// Setting default environment variables.
process.env = {
  OAUTH_CLIENT_ID:'4a963983-5d27-43eb-a96d-fc9e0a423d27',//'63e9dd92-a797-454b-9ce3-761236559d75',
  OAUTH_REDIRECT_URI:'https://1a2b-2404-f801-8028-3-3ae-81b-8b44-94eb.ngrok-free.app/api/oauth/callback',
  OAUTH_AUTHORIZE_URL: 'https://login.microsoftonline.com/organizations/oauth2/v2.0/authorize',
  OAUTH_ACCESS_TOKEN_URL: 'https://login.microsoftonline.com/organizations/oauth2/v2.0/token',
  OAUTH_PKCE_SALT: random.toString(36).substr(2),
  OAUTH_SCOPE: 'User.Read',
  PORT: '5100',
  STATIC_FILES: 'public',
  ...process.env
};

// Checks for required environment variables.
['OAUTH_CLIENT_ID', 'OAUTH_REDIRECT_URI'].forEach(name => {
  if (!process.env[name]) {
    throw new Error(`Environment variable ${name} must be set.`);
  }
});


const server = restify.createServer();

server.use(restify.plugins.queryParser());

// Registering routes.
server.get('/api/oauth/authorize', require('./routes/oauth/authorize'));
server.get('/api/oauth/callback', require('./routes/oauth/callback'));
server.get('/api/directline/token', require('./routes/directLine/token'));
server.post('/api/messages', require('./routes/botMessages'));

// Ensure the correct directory is used
console.log(`Serving static files from: ${path.join(__dirname, 'public')}`);
console.log('dirname--', __dirname);

const staticDir = path.join(__dirname, 'public');
console.log(`Serving static files from: ${staticDir}`);

server.get(
  '/*',
  restify.plugins.serveStatic({
    directory: staticDir,
    default: 'voicebot.html'
  })
);

server.listen(5100, () => {
  console.log('Server running at http://localhost:5100');
});
