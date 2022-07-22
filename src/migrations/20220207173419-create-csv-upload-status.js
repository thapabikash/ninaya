"use strict";
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable("csv_upload_statuses", {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER,
            },
            csv_name: {
                type: Sequelize.STRING,
            },
            advertiser_id: {
                type: Sequelize.INTEGER,
                allowNull: true,
                onUpdate: "CASCADE",
                onDelete: "SET NULL",
                references: {
                    model: "providers",
                    key: "id",
                },
            },
            status: {
                type: Sequelize.ENUM,
                values: ["Failed", "Uploaded", "Processing", "Constant"],
                defaultValue: "Constant",
            },
            notiFy: {
                type: Sequelize.BOOLEAN,
                defaultValue: false,
            },
            total_rows: {
                type: Sequelize.INTEGER,
                allowNull: true,
            },
            total_uploaded: {
                type: Sequelize.INTEGER,
                allowNull: true,
            },
            total_skipped: {
                type: Sequelize.INTEGER,
                allowNull: true,
            },
            check_sum_totalSearches: {
                type: Sequelize.INTEGER,
                allowNull: true,
            },
            uploaded_sum_totalSearches: {
                type: Sequelize.INTEGER,
                allowNull: true,
            },
            startDate: {
                type: Sequelize.DATE,
                allowNull: true,
            },
            endDate: {
                type: Sequelize.DATE,
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
        await queryInterface.dropTable("csv_upload_statuses");
    },
};
