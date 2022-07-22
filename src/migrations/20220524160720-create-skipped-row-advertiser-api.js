"use strict";
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable("skipped_row_advertiser_apis", {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER,
            },
            advertiser_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
            },
            source: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            total_excluded: {
                type: Sequelize.INTEGER,
                allowNull: true,
            },
            total_uploaded: {
                type: Sequelize.INTEGER,
                allowNull: true,
            },
            message: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            channel: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            date: {
                type: Sequelize.DATE,
                allowNull: true,
            },
            total_searches: {
                type: Sequelize.INTEGER,
                allowNull: true,
            },
            clicks: {
                type: Sequelize.INTEGER,
                allowNull: true,
            },
            monetized_searches: {
                type: Sequelize.INTEGER,
                allowNull: true,
            },
            row_index: {
                type: Sequelize.INTEGER,
                allowNull: true,
            },
            gross_revenue: {
                type: Sequelize.FLOAT,
                allowNull: true,
            },
            upload_status: {
                type: Sequelize.BOOLEAN,
                allowNull: true,
            },
            check_sum: {
                type: Sequelize.FLOAT,
                allowNull: true,
            },
            sum_in_db: {
                type: Sequelize.FLOAT,
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
    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable("skipped_row_advertiser_apis");
    },
};
