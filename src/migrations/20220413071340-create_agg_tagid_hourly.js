"use strict";

module.exports = {
    async up(queryInterface, Sequelize) {
        /*
      Creating table with columns 
      targeting_id : Reference to id of the targetings table
      hour: Hour of the day , value from 0 - 23
      today_hits: Number of hits for the hour of the targeting_id , default : 0
      yesterday_hits: Number of hits for the hour of the targeting_id, default : 0
      total_hits: Total Number of hits for the targeting_id, default : 0
      publisher_id: Reference to id of the publisher table
      (targeting_id , hour) must be unique
      add index on targeting_id and hour
      add index on targeting_id
      add index on publisher_id
    */
        await queryInterface.createTable("agg_tagid_hourly", {
            targeting_id: {
                type: Sequelize.INTEGER,
                references: {
                    model: "targetings",
                    key: "id",
                },
                onUpdate: "CASCADE",
                onDelete: "CASCADE",
                allowNull: false,
            },
            hour: {
                type: Sequelize.INTEGER,
                allowNull: false,
            },
            today_hits: {
                type: Sequelize.INTEGER,
                allowNull: false,
                defaultValue: 0,
            },
            yesterday_hits: {
                type: Sequelize.INTEGER,
                allowNull: false,
                defaultValue: 0,
            },
            total_hits: {
                type: Sequelize.INTEGER,
                allowNull: false,
                defaultValue: 0,
            },
            publisher_id: {
                type: Sequelize.INTEGER,
                references: {
                    model: "publishers",
                    key: "id",
                },
                onUpdate: "CASCADE",
                onDelete: "CASCADE",
                allowNull: false,
            },
            createdAt: {
                allowNull: false,
                type: Sequelize.DATE,
                defaultValue: Sequelize.fn("NOW"),
            },
            updatedAt: {
                allowNull: false,
                type: Sequelize.DATE,
                defaultValue: Sequelize.fn("NOW"),
            },
        });

        // Adding unique constraint on (targeting_id , hour) using fields
        await queryInterface.addConstraint("agg_tagid_hourly", {
            fields: ["targeting_id", "hour"],
            type: "unique",
        });

        // Creating Index on targeting_id and hour
        await queryInterface.addIndex("agg_tagid_hourly", {
            name: "agg_tagid_hourly_targeting_id_hour_unique",
            unique: true,
            fields: ["targeting_id", "hour"],
        });

        // Creating Index on targeting_id using fields
        await queryInterface.addIndex("agg_tagid_hourly", {
            name: "agg_tagid_hourly_targeting_id_unique",
            unique: false,
            fields: ["targeting_id"],
        });

        // Creating Index on publisher_id using fields
        await queryInterface.addIndex("agg_tagid_hourly", {
            name: "agg_tagid_hourly_publisher_id_unique",
            unique: false,
            fields: ["publisher_id"],
        });
    },

    async down(queryInterface, Sequelize) {
        /**
         * Add reverting commands here.
         *
         * Example:
         * await queryInterface.dropTable('users');
         */
        await queryInterface.dropTable("agg_tagid_hourly");
    },
};
