'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn(
        'provider_links',
        'description',
        {
          type: Sequelize.STRING,
           defaultValue: null,
        }
      )
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.removeColumn('provider_links', 'description'),
    ])
  }
};