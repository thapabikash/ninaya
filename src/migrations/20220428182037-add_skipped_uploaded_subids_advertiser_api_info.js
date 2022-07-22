"use strict";

module.exports = {
    async up(queryInterface, Sequelize) {
        return Promise.all([
            queryInterface.addColumn("advertiser_api_infos", "skipped_subid", {
                type: Sequelize.ARRAY(Sequelize.STRING),
                allowNull: true,
            }),
            queryInterface.addColumn("advertiser_api_infos", "uploaded_subid", {
                type: Sequelize.ARRAY(Sequelize.STRING),
                allowNull: true,
            }),
        ]);
    },

    async down(queryInterface, Sequelize) {
        return Promise.all([
            queryInterface.removeColumn(
                "advertiser_api_infos",
                "skipped_subid"
            ),
            queryInterface.removeColumn(
                "advertiser_api_infos",
                "uploaded_subid"
            ),
        ]);
    },
};
