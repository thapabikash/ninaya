'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
   return Promise.all([
    queryInterface.addColumn("publisher_api_details", "old_tokens", {
      type: Sequelize.ARRAY(Sequelize.STRING)
    }),
   ])
  },

  async down (queryInterface, Sequelize) {
    return Promise.all([
      queryInterface.removeColumn(
        "publisher_api_details",
        "old_tokens"
      )
    ])
  }
};
