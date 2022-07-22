"use strict";

module.exports = {
    async up(queryInterface, Sequelize) {
        return Promise.all([
            queryInterface.removeColumn("skipped_row_csvs", "fields"),
            queryInterface.removeColumn("skipped_row_csvs", "uploaded_fields"),
            queryInterface.addColumn("skipped_row_csvs", "row_index", {
                type: Sequelize.INTEGER,
                allowNull: true,
            }),
            queryInterface.addColumn("skipped_row_csvs", "total_searches", {
                type: Sequelize.INTEGER,
                allowNull: true,
            }),
            queryInterface.addColumn("skipped_row_csvs", "clicks", {
                type: Sequelize.INTEGER,
                allowNull: true,
            }),
            queryInterface.addColumn("skipped_row_csvs", "gross_revenue", {
                type: Sequelize.FLOAT,
                allowNull: true,
            }),
            queryInterface.addColumn("skipped_row_csvs", "monetized_searches", {
                type: Sequelize.INTEGER,
                allowNull: true,
            }),

            queryInterface.addColumn("skipped_row_csvs", "date", {
                type: Sequelize.DATEONLY,
                allowNull: true,
            }),
            queryInterface.addColumn("skipped_row_csvs", "channel", {
                type: Sequelize.STRING,
                allowNull: true,
            }),
            queryInterface.addColumn("skipped_row_csvs", "upload_status", {
                type: Sequelize.BOOLEAN,
                defaultValue: false,
            }),
            queryInterface.addColumn("skipped_row_csvs", "check_sum", {
                type: Sequelize.FLOAT,
                allowNull: true,
            }),
            queryInterface.addColumn("skipped_row_csvs", "sum_in_db", {
                type: Sequelize.FLOAT,
                allowNull: true,
            }),
            queryInterface.addColumn("skipped_row_csvs", "total_uploaded", {
                type: Sequelize.INTEGER,
                allowNull: true,
            }),
        ]);
    },

    async down(queryInterface, Sequelize) {
        return Promise.all([
            queryInterface.addColumn("skipped_row_csvs", "fields", {
                type: Sequelize.JSONB,
            }),
            queryInterface.addColumn("skipped_row_csvs", "uploaded_fields", {
                type: Sequelize.JSONB,
            }),
            queryInterface.removeColumn("skipped_row_csvs", "row_index"),
            queryInterface.removeColumn("skipped_row_csvs", "total_searches"),
            queryInterface.removeColumn("skipped_row_csvs", "clicks"),
            queryInterface.removeColumn("skipped_row_csvs", "gross_revenue"),
            queryInterface.removeColumn(
                "skipped_row_csvs",
                "monetized_searches"
            ),

            queryInterface.removeColumn("skipped_row_csvs", "date"),
            queryInterface.removeColumn("skipped_row_csvs", "channel"),
            queryInterface.removeColumn("skipped_row_csvs", "upload_status"),
            queryInterface.removeColumn("skipped_row_csvs", "check_sum"),
            queryInterface.removeColumn("skipped_row_csvs", "sum_in_db"),
            queryInterface.removeColumn("skipped_row_csvs", "total_uploaded"),
        ]);
    },
};
