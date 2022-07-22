"use strict";
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable("advertiser_api_infos", {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER,
            },
            advertiser_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                onUpdate: "CASCADE",
                onDelete: "SET NULL",
                references: {
                    model: "providers",
                    key: "id",
                },
            },
            source: {
                type: Sequelize.ENUM,
                values: ["Api", "Mannual"],
                defaultValue: "Api",
            },

            status: {
                type: Sequelize.ENUM,
                values: ["Failed", "Uploaded", "Processing", "Constant"],
                defaultValue: "Constant",
            },

            message: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            last_updated_db: {
                type: Sequelize.DATE,
                allowNull: true,
            },
            called_api_date: {
                type: Sequelize.DATE,
                allowNull: true,
            },
            apply_from_data: {
                type: Sequelize.DATE,
                allowNull: true,
            },
            apply_to_date: {
                type: Sequelize.DATE,
                allowNull: true,
            },
            total_rows: {
                type: Sequelize.INTEGER,
                allowNull: true,
            },
            total_uploaded: {
                type: Sequelize.INTEGER,
                allowNull: true,
            },
            total_skipped: {
                type: Sequelize.INTEGER,
                allowNull: true,
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
        await queryInterface.dropTable("advertiser_api_infos");
    },
};
