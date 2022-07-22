"use strict";

module.exports = {
  /**
   * @param {QueryInterface} queryInterface
   * @param {Sequelize} Sequelize
   * @returns
   */
  up: (queryInterface, Sequelize) => {
    // logic for updating columns
    return Promise.all([
      queryInterface.renameColumn(
        "targetings",
        "use_custom",
        "use_custom_domain"
      ),
      queryInterface.addColumn("targetings", "use_custom_fallback", {
        type: Sequelize.BOOLEAN,
        after: "use_custom_domain",
        allowNull: false,
        defaultValue: false,
      }),
    ]);
  },

  down: (queryInterface, Sequelize) => {
    // logic for reverting the changes
    return Promise.all([
      queryInterface.renameColumn(
        "targetings",
        "use_custom_domain",
        "use_custom"
      ),
      queryInterface.removeColumn("targetings", "use_custom_fallback"),
    ]);
  },
};
