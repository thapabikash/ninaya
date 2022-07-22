"use strict";

module.exports = {
  /**
   * @param {QueryInterface} queryInterface
   * @param {Sequelize} Sequelize
   * @returns
   */
  up: (queryInterface, Sequelize) => {
    // logic for adding columns
    return Promise.all([
      queryInterface.addColumn("log_infos", "os_info", {
        type: Sequelize.STRING,
        defaultValue: null,
        after: "device_info",
      }),
      queryInterface.addColumn("log_infos", "isp_name", {
        type: Sequelize.STRING,
        defaultValue: null,
        after: "ip_address",
      })
    ]);
  },

  down: (queryInterface, Sequelize) => {
    // logic for reverting the changes

    return Promise.all([
      queryInterface.removeColumn("log_infos", "os_info"),
      queryInterface.removeColumn("log_infos", "isp_name")
    ]);
  },
};
