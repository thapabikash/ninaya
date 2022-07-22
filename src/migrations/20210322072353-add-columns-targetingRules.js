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
      queryInterface.addColumn("targeting_rules", "disabled", {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      }),
      queryInterface.addColumn("targeting_rules", "deleted", {
        type: Sequelize.BOOLEAN,
        after: "disabled",
        allowNull: false,
        defaultValue: false,
      }),
    ]);
  },

  down: (queryInterface, Sequelize) => {
    // logic for reverting the changes
    return Promise.all([
      queryInterface.removeColumn("targeting_rules", "disabled"),
      queryInterface.removeColumn("targeting_rules", "deleted"),
    ]);
  },
};
