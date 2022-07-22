"use strict";

module.exports = {
    async up(queryInterface, Sequelize) {
        return Promise.all([
            queryInterface.addColumn("providers", "display_in_upload_screen", {
                type: Sequelize.BOOLEAN,
                defaultValue: false,
            }),
        ]);
    },

    async down(queryInterface, Sequelize) {
        return Promise.all([
            queryInterface.removeColumn(
                "providers",
                "display_in_upload_screen"
            ),
        ]);
    },
};
