//  Takes the environemnt variables from the env file and defaultConfig
const defaultConfig = require("./default");
const postgresConfig = require("./postgres");
const awsConfig = require("./aws");

module.exports = {
  ...defaultConfig,
  ...postgresConfig,
  ...awsConfig,
};
