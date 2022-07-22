'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('publisher_accounts', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      publisher_id: {
        type: Sequelize.INTEGER
      },
      rule_id:{
        type:Sequelize.INTEGER
      },
      provider_id: {
        type: Sequelize.INTEGER
      },
      tid: {
        type: Sequelize.INTEGER
      },
      share_revenue:{
        type: Sequelize.FLOAT,
        allowNull: true,
      },
      link_id:{
        type: Sequelize.INTEGER,
        allowNull: true
      },
      rule_index:{
        type: Sequelize.INTEGER,
        allowNull: true
      },
      
      api_key:{
        type: Sequelize.STRING,
        allowNull: true,
      },
      sin: {
        type: Sequelize.STRING
      },
      source_identifier: {
        type: Sequelize.STRING
      },
      status:{
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    },{
      indexes: [
          {
              unique: true,
              fields: ['provider_id', 'sin']
          }
      ]
  });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('publisher_accounts');
  }
};