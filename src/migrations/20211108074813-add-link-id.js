"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn("log_infos", "link_id", {
        type: Sequelize.INTEGER,
        allowNull: true,
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
        references: {
          model: "provider_links",
          key: "id",
        },
      }),
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    return Promise.all([queryInterface.removeColumn("log_infos", "link_id")]);
  },
};
