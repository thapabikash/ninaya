"use strict";

module.exports = {
    up: async (queryInterface, Sequelize) => {
        return Promise.all([
            queryInterface.addColumn("providers", "api_source_identifier", {
                type: Sequelize.STRING,
                defaultValue: null,
            }),
        ]);
    },

    down: async (queryInterface, Sequelize) => {
        return Promise.all([
            queryInterface.removeColumn("providers", "api_source_identifier"),
        ]);
    },
};
