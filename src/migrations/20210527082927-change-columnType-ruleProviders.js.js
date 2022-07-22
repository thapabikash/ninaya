"use strict";

module.exports = {
  /**
   * @param {QueryInterface} queryInterface
   * @param {Sequelize} Sequelize
   * @returns
   */
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.removeColumn("rule_providers", "provider_link"),
      queryInterface.addColumn("rule_providers", "provider_link", {
        type: Sequelize.INTEGER,
      }),
    ]);
  },

  down: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.removeColumn("rule_providers", "provider_link"),
      queryInterface.addColumn("rule_providers", "provider_link", {
        type: Sequelize.STRING,
      }),
    ]);
  },
};
