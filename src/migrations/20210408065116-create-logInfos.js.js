"use strict";

module.exports = {
  /**
   * @param {QueryInterface} queryInterface
   * @param {Sequelize} Sequelize
   * @returns
   */
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable("log_infos", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      request_at: { type: Sequelize.DATE },
      response_period: { type: Sequelize.STRING },
      ip_address: { type: Sequelize.STRING },
      device_info: { type: Sequelize.STRING },
      browser_info: { type: Sequelize.STRING },
      geo: { type: Sequelize.JSONB },
      cid: { type: Sequelize.INTEGER },
      sid: { type: Sequelize.STRING },
      pid: { type: Sequelize.INTEGER },
      rule_id: { type: Sequelize.INTEGER },
      q: { type: Sequelize.STRING },
      n: { type: Sequelize.BOOLEAN },
      click_id: { type: Sequelize.BOOLEAN },
      is_active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable("log_infos");
  },
};
