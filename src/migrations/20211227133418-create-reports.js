'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('reports', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      date: {
        type: Sequelize.DATEONLY
      },
      publisher: {
        type: Sequelize.INTEGER,
        allowNull: true,
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
        references: {
          model: "publishers",
          key: "id",
        }
      },
      advertiser_id:{
        type: Sequelize.INTEGER,
        allowNull: true,
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
        references: {
          model: "providers",
          key: "id",
        },
      },
      search_engine_id:{
        type: Sequelize.INTEGER,
        allowNull: true,
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
        references: {
          model: "search_engines",
          key: "id",
        },
      },
      tag_type_id:{
        type: Sequelize.INTEGER,
        allowNull: true,
        onUpdate: "CASCADE",
        onDelete: "SET NULl",
        references: {
          model: "tag_types",
          key: "id",
        },
      },
      platform_id:{
        type: Sequelize.INTEGER,
        allowNull: true,
        onUpdate: "CASCADE",
        onDelete: "SET NULl",
        references: {
          model: "platforms",
          key: "id",
        },
      },
      search_counts:{
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      link_id:{
        type: Sequelize.INTEGER,
        allowNull: true,
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
        references: {
          model: "provider_links",
          key: "id",
        }
      },
      pub_revenue:{
        type: Sequelize.FLOAT,
        allowNull: true
      },
      pub_account_id:{
        type: Sequelize.INTEGER,
        allowNull: true,
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
        references: {
          model: "publisher_accounts",
          key: "id",
        },
      },
      rule_id:{
        type: Sequelize.INTEGER,
        allowNull: true,
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
        references: {
          model: "targeting_rules",
          key: "id",
        },
      },
      tag_id:{
        type: Sequelize.INTEGER,
        allowNull: true,
        onUpdate: "CASCADE",
        onDelete: "SET NULl",
        references: {
          model: "targetings",
          key: "id",
        },
      },
      channel:{
        type: Sequelize.STRING
      },
      gross_revenue:{
        type: Sequelize.FLOAT
      },
      tag_description: {
        type: Sequelize.STRING
      },
      tag_number: {
        type: Sequelize.INTEGER
      },
      geo: {
        type: Sequelize.STRING
      },
      total_searches: {
        type: Sequelize.INTEGER
      },
      clicks: {
        type: Sequelize.INTEGER
      },
      monetized_searches: {
        type: Sequelize.INTEGER
      },
      followon_searches: {
        type: Sequelize.INTEGER
      },
      initial_searches: {
        type: Sequelize.INTEGER
      },
      uploaded_by: {
        type: Sequelize.INTEGER
      },
      uploaded_date: {
        type: Sequelize.DATEONLY
      },
      createdAt: {
        type: Sequelize.DATE
      },
      updatedAt: {
        type: Sequelize.DATE
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('reports');
  }
};