"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable("targeting_rules", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      priority: { type: Sequelize.INTEGER },
      daily_cap: { type: Sequelize.INTEGER },
      daily_frequency: { type: Sequelize.INTEGER },
      targeting_id: {
        allowNull: false,
        type: Sequelize.INTEGER,
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
        references: {
          model: "targetings",
          key: "id"
        }
      },
      comment: { type: Sequelize.STRING },
      provider_details: { type: Sequelize.JSON },
      createdAt: { type: Sequelize.DATE },
      updatedAt: { type: Sequelize.DATE }
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable("targeting_rules");
  }
};
