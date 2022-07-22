"use strict";

module.exports = {
    async up(queryInterface, Sequelize) {
        return Promise.all([
            queryInterface.addColumn("reports", "deleted", {
                type: Sequelize.BOOLEAN,
                defaultValue: false,
            }),
        ]);
    },

    async down(queryInterface, Sequelize) {
        return Promise.all([queryInterface.removeColumn("reports", "deleted")]);
    },
};
