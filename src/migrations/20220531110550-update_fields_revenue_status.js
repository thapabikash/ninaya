"use strict";

module.exports = {
    async up(queryInterface, Sequelize) {
        return Promise.all([
            queryInterface.addColumn(
                "advertiser_api_infos",
                "missing_tags_with_subIds",
                {
                    type: Sequelize.ARRAY(Sequelize.STRING),
                    allowNull: true,
                }
            ),
            queryInterface.addColumn(
                "advertiser_api_infos",
                "exist_tags_with_subIds",
                {
                    type: Sequelize.ARRAY(Sequelize.STRING),
                    allowNull: true,
                }
            ),
            queryInterface.addColumn(
                "csv_upload_statuses",
                "missing_tags_with_subIds",
                {
                    type: Sequelize.ARRAY(Sequelize.STRING),
                    allowNull: true,
                }
            ),
            queryInterface.addColumn(
                "csv_upload_statuses",
                "exist_tags_with_subIds",
                {
                    type: Sequelize.ARRAY(Sequelize.STRING),
                    allowNull: true,
                }
            ),
            queryInterface.addColumn(
                "csv_upload_statuses",
                "skippedSubIdWithValidation",
                {
                    type: Sequelize.ARRAY(Sequelize.STRING),
                    allowNull: true,
                }
            ),
            queryInterface.addColumn(
                "csv_upload_statuses",
                "skippedSubIdWithNotFoundPubAccount",
                {
                    type: Sequelize.ARRAY(Sequelize.STRING),
                    allowNull: true,
                }
            ),
            queryInterface.addColumn("csv_upload_statuses", "skipped_subid", {
                type: Sequelize.ARRAY(Sequelize.STRING),
                allowNull: true,
            }),
            queryInterface.addColumn("csv_upload_statuses", "uploaded_subid", {
                type: Sequelize.ARRAY(Sequelize.STRING),
                allowNull: true,
            }),
        ]);
    },

    async down(queryInterface, Sequelize) {
        return Promise.all([
            queryInterface.removeColumn(
                "advertiser_api_infos",
                "missing_tags_with_subIds"
            ),
            queryInterface.removeColumn(
                "advertiser_api_infos",
                "exist_tags_with_subIds"
            ),
            queryInterface.removeColumn(
                "csv_upload_statuses",
                "missing_tags_with_subIds"
            ),
            queryInterface.removeColumn(
                "csv_upload_statuses",
                "exist_tags_with_subIds"
            ),
            queryInterface.removeColumn(
                "csv_upload_statuses",
                "skippedSubIdWithValidation"
            ),
            queryInterface.removeColumn(
                "csv_upload_statuses",
                "skippedSubIdWithNotFoundPubAccount"
            ),
            queryInterface.removeColumn("csv_upload_statuses", "skipped_subid"),
            queryInterface.removeColumn(
                "csv_upload_statuses",
                "uploaded_subid"
            ),
        ]);
    },
};
