"use strict";

module.exports = {
  /**
   * @param {QueryInterface} queryInterface
   * @param {Sequelize} Sequelize
   * @returns
   */
  up: (queryInterface, Sequelize) => {
    // logic for adding columns
    return queryInterface.addColumn("publishers", "deleted", {
      type: Sequelize.BOOLEAN,
      after: "status",
      allowNull: false,
      defaultValue: false,
    });
  },

  down: (queryInterface, Sequelize) => {
    // logic for reverting the changes
    return queryInterface.removeColumn("publishers", "deleted");
  },
};
