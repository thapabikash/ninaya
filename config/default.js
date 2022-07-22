// supplies env for server overridden by process.env

/* eslint no-undef: 0 */ // For allowing process.env

module.exports = {
  apiPort: process.env.API_PORT || 7001,
  logStream: process.env.LogStream || process.stdout,
  loggingFile: `src/log/%Y-%m-%d.log`, // rotate file uses this format
};
