"use strict";
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("Publisher_display_fields", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      user_id: {
        allowNull: false,
        type: Sequelize.INTEGER,
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
        references: {
          model: "users",
          key: "id",
        },
      },
      fields: {
        allowNull: true,
        type: Sequelize.ARRAY(Sequelize.STRING),
      },
      Publisher_display_fields:{
        type: Sequelize.ARRAY(Sequelize.STRING),
        defaultValue: [
            "date",
            "channel",
            "geo",
            "total_searches",
            "clicks",
            "ctr",
            "net_revenue",
        ],
        allowNull: true,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("Publisher_display_fields");
  },
};
