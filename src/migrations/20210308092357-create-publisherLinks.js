"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable("publisher_links", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      publisher_id: {
        allowNull: false,
        type: Sequelize.INTEGER,
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
        references: {
          model: "publishers",
          key: "id"
        }
      },
      sid: { type: Sequelize.INTEGER },
      cid: { type: Sequelize.INTEGER },
      custom_domain: { type: Sequelize.STRING },
      is_activated: {
        allowNull: false,
        type: Sequelize.BOOLEAN
      },
      createdAt: { type: Sequelize.DATE },
      updatedAt: { type: Sequelize.DATE }
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable("publisher_links");
  }
};
