"use strict";

module.exports = {
    async up(queryInterface, Sequelize) {
        return Promise.all([
            queryInterface.addColumn("reports", "source", {
                type: Sequelize.ENUM,
                values: ["Mannul", "Api"],
                defaultValue: "Mannul",
            }),
        ]);
    },

    async down(queryInterface, Sequelize) {
        return Promise.all([queryInterface.removeColumn("reports", "source")]);
    },
};
