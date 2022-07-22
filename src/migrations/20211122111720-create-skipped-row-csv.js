'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('skipped_row_csvs', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      message: {
        allowNull: true,
        type: Sequelize.STRING
      },
      advertiser_id: {
        type: Sequelize.INTEGER,
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
        references: {
          model: 'providers',
          key: 'id',
        },
      },
      fields:{
        type: Sequelize.JSONB
      },
      uploaded_fields:{
        type: Sequelize.JSONB
      },
      total_excluded:{
        type: Sequelize.INTEGER
      },
      csvfile: {
        type: Sequelize.STRING
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        type: Sequelize.DATE
      },
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('skipped_row_csvs');
  }
};