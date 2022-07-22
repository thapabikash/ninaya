"use strict";

module.exports = {
    async up(queryInterface, Sequelize) {
        return Promise.all([
            queryInterface.addColumn("publisher_accounts", "to_date", {
                type: Sequelize.DATE,
                allowNull: true,
            }),
        ]);
    },

    async down(queryInterface, Sequelize) {
        return Promise.all([
            queryInterface.removeColumn("publisher_accounts", "to_date"),
        ]);
    },
};
