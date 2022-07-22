'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn(
        "providers", "csv_source_identifier",
        {
          type: Sequelize.STRING,
          defaultValue: null,
        }
      ),
      queryInterface.addColumn(
         "providers", "link_source_identifier",
        {
          type: Sequelize.STRING,
          defaultValue: null,
        }
      )
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.removeColumn("providers", "csv_source_identifier"),
      queryInterface.removeColumn("providers", "link_source_identifier"),
    ])
  }
};
