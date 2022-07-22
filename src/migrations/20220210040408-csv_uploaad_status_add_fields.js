"use strict";

module.exports = {
    async up(queryInterface, Sequelize) {
        return Promise.all([
            queryInterface.addColumn("csv_upload_statuses", "message", {
                type: Sequelize.STRING,
                defaultValue: null,
            }),
            queryInterface.addColumn("csv_upload_statuses", "time_taken", {
                type: Sequelize.STRING,
                defaultValue: null,
            }),
        ]);
    },

    async down(queryInterface, Sequelize) {
        return Promise.all([
            queryInterface.removeColumn("csv_upload_statuses", "message"),
            queryInterface.removeColumn("csv_upload_statuses", "time_taken"),
        ]);
    },
};
