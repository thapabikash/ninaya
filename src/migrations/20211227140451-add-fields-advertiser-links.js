"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn("provider_links", "platform_id", {
        allowNull: true,
        type: Sequelize.INTEGER,
        references: {
          model: "platforms",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      }),
      queryInterface.addColumn("provider_links", "search_engine_id", {
        allowNull: true,
        type: Sequelize.INTEGER,
        references: {
          model: "search_engines",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      }),
      queryInterface.addColumn("provider_links", "tag_type_id", {
        allowNull: true,
        type: Sequelize.INTEGER,
        references: {
          model: "tag_types",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      }),
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.removeColumn("provider_links", "platform_id"),
      queryInterface.removeColumn("provider_links", "tag_type_id"),
      queryInterface.removeColumn("provider_links", "search_engine_id"),
    ]);
  },
};
