"use strict";
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable("alerts", {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER,
            },
            subject: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            message: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            type: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            alerted_at: {
                type: Sequelize.DATE,
                allowNull: false,
            },
            data: {
                type: Sequelize.JSONB,
                allowNull: false,
            },
            is_Alerted: {
                type: Sequelize.BOOLEAN,
                defaultValue: false,
            },
            createdAt: {
                allowNull: false,
                type: Sequelize.DATE,
            },
            updatedAt: {
                allowNull: false,
                type: Sequelize.DATE,
            },
        });
    },
    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable("alerts");
    },
};
