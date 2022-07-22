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
      queryInterface.addColumn("targetings", "use_custom", {
        type: Sequelize.BOOLEAN,
        after: "custom_domain",
        allowNull: false,
        defaultValue: false,
      }),
      queryInterface.addColumn("targetings", "deleted", {
        type: Sequelize.BOOLEAN,
        after: "default_fallback",
        allowNull: false,
        defaultValue: false,
      }),
      queryInterface.addColumn("targetings", "publishedAt", {
        type: Sequelize.DATE,
        after: "deleted",
      }),
    ]);
  },

  down: (queryInterface, Sequelize) => {
    // logic for reverting the changes
    return Promise.all([
      queryInterface.removeColumn("targetings", "use_custom"),
      queryInterface.removeColumn("targetings", "deleted"),
      queryInterface.removeColumn("targetings", "publishedAt"),
    ]);
  },
};
