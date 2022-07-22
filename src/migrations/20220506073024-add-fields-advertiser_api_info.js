"use strict";

module.exports = {
    async up(queryInterface, Sequelize) {
        return Promise.all([
            queryInterface.addColumn(
                "advertiser_api_infos",
                "skippedSubIdWithValidation",
                {
                    type: Sequelize.ARRAY(Sequelize.STRING),
                    allowNull: true,
                }
            ),
            queryInterface.addColumn(
                "advertiser_api_infos",
                "skippedSubIdWithNotFoundPubAccount",
                {
                    type: Sequelize.ARRAY(Sequelize.STRING),
                    allowNull: true,
                }
            ),
        ]);
    },

    async down(queryInterface, Sequelize) {
        return Promise.all([
            queryInterface.removeColumn(
                "advertiser_api_infos",
                "skippedSubIdWithValidation"
            ),
            queryInterface.removeColumn(
                "advertiser_api_infos",
                "skippedSubIdWithNotFoundPubAccount"
            ),
        ]);
    },
};
