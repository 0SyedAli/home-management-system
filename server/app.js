// cPanel Node.js Application Startup File (Phusion Passenger entrypoint)
require('dotenv').config();

try {
  // Production: Runs compiled JavaScript from dist/server.js
  require('./dist/server.js');
} catch (error) {
  if (error.code === 'MODULE_NOT_FOUND' && error.message.includes('./dist/server.js')) {
    // Development / fallback: Runs TypeScript via ts-node if dist hasn't been built yet
    require('ts-node/register');
    require('./src/server.ts');
  } else {
    console.error('Failed to initialize server application:', error);
    process.exit(1);
  }
}
