"use strict";

module.exports = {
    async up(queryInterface, Sequelize) {
        return Promise.all([
            queryInterface.addColumn("providers", "api_credentials", {
                type: Sequelize.JSONB,
                allowNull: true,
            }),
        ]);
    },

    async down(queryInterface, Sequelize) {
        return Promise.all([
            queryInterface.removeColumn("providers", "api_credentials"),
        ]);
    },
};
