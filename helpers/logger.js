/**
 * logger.js
 * uses bunyan for logging
 *
 */

const bunyan = require("bunyan");
const { name, version } = require("../package.json");
const config = require("../config");
// const RotatingFileStream = require("bunyan-rotating-file-stream");
const bunyanPostgresStream = require("bunyan-postgres-stream");
let _logger = {};

/**
 * log levels and their codes
 * fatal: 60, error: 50, warn: 40, info: 30, debug: 20, trace: 10
 */

function reqSerializer(req) {
  // make seriaizer function defensive: Guard against req and its properties be null/undefined.
  if (!req || !req.method || !req.url) {
    return req;
  }
  return {
    method: req.method,
    url: req.url,
    remoteAddress: req.connection.remoteAddress,
    remotePort: req.connection.remotePort,
    user: (req.user && req.user.email) || "",
  };
}
const stream = bunyanPostgresStream({
  connection: {
    host: config.host,
    user: config.username,
    password: config.password,
    database: config.database,
  },
  tableName: "system_logs",
});

_logger.log = bunyan.createLogger({
  name,
  version,
  streams: [
    {
      level: "debug", // all log records at debug level and above will be logged
      stream: config.logStream, // for logging on a console
    },
    {
      level: "trace", // all log records at trace level and above will be logged
      stream: stream,
      // stream: new RotatingFileStream({
      //   path: config.loggingFile,
      //   period: "1d", // daily rotation
      //   totalFiles: 5, // keep 5 back copies
      //   rotateExisting: true, // Give ourselves a clean file when we start up, based on period
      //   threshold: "10m", // Rotate log files larger than 10 megabytes
      //   totalSize: "20m", // Don't keep more than 20mb of archived log files
      //   // gzip: true, // Compress the archive log files to save space
      // }),
    },
  ],
  serializers: {
    req: reqSerializer,
  },
});
// child logs
_logger.getChildLogger = function (componentName) {
  return this.log.child({
    component: componentName,
  });
};

module.exports = _logger;
