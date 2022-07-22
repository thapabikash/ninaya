"use strict";

module.exports = {
    async up(queryInterface, Sequelize) {
        return Promise.all([
            queryInterface.addColumn("advertiser_api_infos", "check_sum", {
                type: Sequelize.FLOAT,
                allowNull: true,
            }),
            queryInterface.addColumn(
                "advertiser_api_infos",
                "check_sum_in_db",
                {
                    type: Sequelize.FLOAT,
                    allowNull: true,
                }
            ),
        ]);
    },

    async down(queryInterface, Sequelize) {
        return Promise.all([
            queryInterface.removeColumn("advertiser_api_infos", "check_sum"),
            queryInterface.removeColumn(
                "advertiser_api_infos",
                "check_sum_in_db"
            ),
        ]);
    },
};
