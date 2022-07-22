"use strict";

module.exports = {
  /**
   * @param {QueryInterface} queryInterface
   * @param {Sequelize} Sequelize
   * @returns
   */
  up: (queryInterface, Sequelize) => {
    // logic for updating user columns
    return Promise.all([
      queryInterface.renameColumn("users", "name", "first_name"),
      queryInterface.addColumn("users", "last_name", {
        type: Sequelize.STRING,
        after: "first_name",
      }),
      queryInterface.addColumn("users", "contact_number", {
        type: Sequelize.STRING,
        after: "password",
      }),
      queryInterface.addColumn("users", "skype_details", {
        type: Sequelize.STRING,
        after: "contact_number",
      }),
    ]);
  },

  down: (queryInterface, Sequelize) => {
    // logic for reverting the changes
    return Promise.all([
      queryInterface.renameColumn("users", "first_name", "name"),
      queryInterface.removeColumn("users", "last_name"),
      queryInterface.removeColumn("users", "contact_number"),
      queryInterface.removeColumn("users", "skype_details"),
    ]);
  },
};
