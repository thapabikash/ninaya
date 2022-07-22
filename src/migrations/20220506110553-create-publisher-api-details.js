"use strict";
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable("publisher_api_details", {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER,
            },
            api_key: {
                type: Sequelize.STRING,
            },
            expire_at: {
                type: Sequelize.DATE,
                allowNull: false,
            },
            publisher_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
            },
            fields: {
                type: Sequelize.ARRAY(Sequelize.STRING),
                allowNull: false,
            },
            is_active: {
                type: Sequelize.BOOLEAN,
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
        await queryInterface.dropTable("publisher_api_details");
    },
};
