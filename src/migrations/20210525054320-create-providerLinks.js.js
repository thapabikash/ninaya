"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable("provider_links", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      provider_id: {
        allowNull: false,
        type: Sequelize.INTEGER,
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
        references: {
          model: "providers",
          key: "id",
        },
      },
      link: { type: Sequelize.STRING },
      search_engine_type: { type: Sequelize.STRING },
      p_sid: { type: Sequelize.INTEGER },
      searchq_val: { type: Sequelize.STRING },
      n_val: { type: Sequelize.STRING },
      sub_id_val: { type: Sequelize.STRING },
      click_id_val: { type: Sequelize.STRING },
      disabled: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      deleted: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      createdAt: { type: Sequelize.DATE },
      updatedAt: { type: Sequelize.DATE },
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable("provider_links");
  },
};
