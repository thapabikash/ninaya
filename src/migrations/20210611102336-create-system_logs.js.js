"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable("system_logs", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      name: Sequelize.STRING,
      level: Sequelize.INTEGER,
      hostname: Sequelize.STRING,
      msg: Sequelize.STRING,
      pid: Sequelize.INTEGER,
      content: Sequelize.JSONB,
      time: { type: Sequelize.DATE },
      createdAt: { type: Sequelize.DATE },
      updatedAt: { type: Sequelize.DATE },
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable("system_logs");
  },
};
