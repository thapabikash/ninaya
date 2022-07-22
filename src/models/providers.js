"use strict";

module.exports = (sequelize, DataTypes) => {
    const providers = sequelize.define("providers", {
        name: {
            allowNull: false,
            type: DataTypes.STRING,
            unique: {
                args: true,
                msg: "Provider name already exist",
            },
        },
        details: {type: DataTypes.STRING},
        csv_source_identifier: {
            type: DataTypes.STRING,
        },
        api_source_identifier: {
            type: DataTypes.STRING,
        },
        link_source_identifier: {
            type: DataTypes.STRING,
        },
        api_credentials: {
            type: DataTypes.JSONB,
        },
        display_in_upload_screen: {
            type: DataTypes.BOOLEAN,
        },
        status: {type: DataTypes.STRING}, // active, inactive
        deleted: {type: DataTypes.BOOLEAN},
        createdAt: DataTypes.DATE,
        updatedAt: DataTypes.DATE,
    });
    providers.associate = function (models) {
        // associations can be defined here
        providers.belongsToMany(models.targeting_rules, {
            through: models.rule_providers,
            foreignKey: "provider_id",
            as: "rule_info",
        });
        providers.hasMany(models.provider_links, {
            foreignKey: "provider_id",
        });
        providers.hasOne(models.mapping, {
            foreignKey: "advertiser_id",
        });
    };
    return providers;
};
