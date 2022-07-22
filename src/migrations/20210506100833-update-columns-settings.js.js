"use strict";

module.exports = {
  /**
   * @param {QueryInterface} queryInterface
   * @param {Sequelize} Sequelize
   * @returns
   */
  up: (queryInterface, Sequelize) => {
    // logic for updating settings columns
    return Promise.all([
      queryInterface.renameColumn("settings", "system_fallback", "key"),
      queryInterface.renameColumn("settings", "default_domain", "value"),

      queryInterface.addColumn("settings", "created_by", {
        type: Sequelize.INTEGER,
        references: {
          model: "users",
          key: "id",
        },
      }),
      queryInterface.addColumn("settings", "updated_by", {
        type: Sequelize.INTEGER,
        references: {
          model: "users",
          key: "id",
        },
      }),
    ]);
  },

  down: (queryInterface, Sequelize) => {
    // logic for reverting the changes
    return Promise.all([
      queryInterface.renameColumn("settings", "key", "system_fallback"),
      queryInterface.renameColumn("settings", "value", "default_domain"),
      queryInterface.removeColumn("settings", "created_by"),
      queryInterface.removeColumn("settings", "updated_by"),
    ]);
  },
};
