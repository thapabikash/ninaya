"use strict";

module.exports = {
  /**
   * @param {QueryInterface} queryInterface
   * @param {Sequelize} Sequelize
   * @returns
   */
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.changeColumn("log_infos", "n", {
        type: `${Sequelize.INTEGER} USING CAST("n" as ${Sequelize.INTEGER})`,
      }),
      queryInterface.changeColumn("log_infos", "click_id", {
        // type: Sequelize.INTEGER,
        type: `${Sequelize.INTEGER} USING CAST("n" as ${Sequelize.INTEGER})`,
      }),
    ]);
  },

  down: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.changeColumn("log_infos", "n", {
        type: Sequelize.BOOLEAN,
        allowNull: true,
      }),
      queryInterface.changeColumn("log_infos", "click_id", {
        type: Sequelize.BOOLEAN,
        allowNull: true,
      }),
    ]);
  },
};
