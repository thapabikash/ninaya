"use strict";

module.exports = {
  /**
   * @param {QueryInterface} queryInterface
   * @param {Sequelize} Sequelize
   * @returns
   */
  up: (queryInterface, Sequelize) => {
    // logic for adding use_sid column
    return queryInterface.addColumn("targetings", "use_sid", {
      type: Sequelize.BOOLEAN,
      after: "use_custom",
      allowNull: false,
      defaultValue: false,
    });
  },

  down: (queryInterface, Sequelize) => {
    // logic for reverting the changes
    return queryInterface.removeColumn("targetings", "use_sid");
  },
};
