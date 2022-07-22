"use strict";

const {Model} = require("sequelize");

module.exports = (sequelize, DataTypes) => {
    class agg_tagid_hourly extends Model {
        static associate(models) {
            agg_tagid_hourly.belongsTo(models.targetings, {
                foreignKey: "targeting_id",
            });

            agg_tagid_hourly.belongsTo(models.publishers, {
                foreignKey: "publisher_id",
            });
        }
    }

    agg_tagid_hourly.init(
        {
            targeting_id: {
                type: DataTypes.INTEGER,
                references: {
                    model: "targetings",
                    key: "id",
                },
                onUpdate: "CASCADE",
                onDelete: "CASCADE",
                allowNull: false,
            },
            hour: {
                type: DataTypes.INTEGER,
                defaultValue: 0,
                allowNull: false,
            },
            today_hits: {
                type: DataTypes.INTEGER,
                defaultValue: 0,
                allowNull: false,
            },
            yesterday_hits: {
                type: DataTypes.INTEGER,
                defaultValue: 0,
                allowNull: false,
            },
            total_hits: {
                type: DataTypes.INTEGER,
                defaultValue: 0,
                allowNull: false,
            },
            publisher_id: {
                type: DataTypes.INTEGER,
                references: {
                    model: "publishers",
                    key: "id",
                },
                onUpdate: "CASCADE",
                onDelete: "CASCADE",
                allowNull: false,
            },
        },
        {
            sequelize,
            modelName: "agg_tagid_hourly",
        }
    );
    return agg_tagid_hourly;
};
