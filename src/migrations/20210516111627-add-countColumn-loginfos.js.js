"use strict";

module.exports = {
  /**
   * @param {QueryInterface} queryInterface
   * @param {Sequelize} Sequelize
   * @returns
   */
  up: (queryInterface, Sequelize) => {
    // logic for adding columns
    return queryInterface.addColumn("log_infos", "provider_no", {
      type: Sequelize.INTEGER,
      after: "redirected_to",
    });
  },

  down: (queryInterface, Sequelize) => {
    // logic for reverting the changes
    return queryInterface.removeColumn("log_infos", "provider_no");
  },
};
