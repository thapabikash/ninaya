"use strict";
const {Model} = require("sequelize");
module.exports = (sequelize, DataTypes) => {
    class publisher_account extends Model {
        static associate(models) {
            publisher_account.belongsTo(models.publishers, {
                foreignKey: "publisher_id",
            });
            publisher_account.belongsTo(models.providers, {
                foreignKey: "provider_id",
            });
            publisher_account.belongsTo(models.targetings, {
                foreignKey: "tid",
            });
            publisher_account.belongsTo(models.provider_links, {
                foreignKey: "link_id",
            });
        }
    }
    publisher_account.init(
        {
            publisher_id: DataTypes.INTEGER,
            provider_id: DataTypes.INTEGER,
            rule_id: DataTypes.INTEGER,
            sin: DataTypes.STRING,
            tid: DataTypes.INTEGER,
            link_id: DataTypes.INTEGER,
            source_identifier: DataTypes.STRING,
            rule_index: DataTypes.INTEGER,
            status: DataTypes.BOOLEAN,
            share_revenue: DataTypes.FLOAT,
            api_key: DataTypes.STRING,
            to_date: DataTypes.DATE,
        },
        {
            sequelize,
            modelName: "publisher_accounts",
        }
    );
    return publisher_account;
};
