"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable("targetings", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      publisher_id: {
        allowNull: false,
        type: Sequelize.INTEGER,
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
        references: {
          model: "publishers",
          key: "id",
        },
      },
      custom_domain: { type: Sequelize.STRING },
      sub_id: { type: Sequelize.STRING },
      client_id: { type: Sequelize.STRING },
      o_id: { type: Sequelize.STRING },
      n: { type: Sequelize.BOOLEAN },
      click_id: { type: Sequelize.BOOLEAN },
      notes: { type: Sequelize.STRING },
      link: { type: Sequelize.STRING },
      is_active: {
        allowNull: false,
        type: Sequelize.BOOLEAN,
      },
      status: {
        allowNull: false,
        type: Sequelize.STRING, //["draft", "published"]
      },
      targeting_type: {
        type: Sequelize.STRING, // ["frequency", "round robin"],
      },
      default_fallback: { type: Sequelize.STRING },
      createdAt: { type: Sequelize.DATE },
      updatedAt: { type: Sequelize.DATE },
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable("targetings");
  },
};
