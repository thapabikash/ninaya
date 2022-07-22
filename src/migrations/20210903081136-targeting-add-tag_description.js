"use strict";

module.exports = {
  /**
   * @param {QueryInterface} queryInterface
   * @param {Sequelize} Sequelize
   * @returns
   */
  up: (queryInterface, Sequelize) => {
    // logic for adding tag_description column
    return queryInterface.addColumn("targetings", "tag_description", {
      type: Sequelize.STRING,
      defaultValue: null,
      after: "notes",
    });
  },

  down: (queryInterface, Sequelize) => {
    // logic for reverting the changes
    return queryInterface.removeColumn("targetings", "tag_description");
  },
};
