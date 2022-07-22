"use strict";
const {Model} = require("sequelize");
module.exports = (sequelize, DataTypes) => {
    class reports extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
            reports.belongsTo(models.providers, {
                foreignKey: "advertiser_id",
            });

            reports.belongsTo(models.publishers, {
                foreignKey: "publisher",
                as: "publisher_id",
            });

            reports.belongsTo(models.targeting_rules, {
                foreignKey: "rule_id",
            });

            reports.belongsTo(models.targetings, {
                foreignKey: "tag_id",
            });
            reports.belongsTo(models.publisher_accounts, {
                foreignKey: "pub_account_id",
            });
            reports.belongsTo(models.provider_links, {
                foreignKey: "link_id",
            });
            reports.belongsTo(models.search_engines, {
                foreignKey: "search_engine_id",
            });
            reports.belongsTo(models.tag_types, {
                foreignKey: "tag_type_id",
            });
            reports.belongsTo(models.platforms, {
                foreignKey: "platform_id",
            });
        }
    }
    reports.init(
        {
            date: DataTypes.DATEONLY,
            rule_id: DataTypes.STRING,
            tag_id: DataTypes.STRING,
            link_id: DataTypes.INTEGER,
            search_counts: DataTypes.INTEGER,
            publisher: DataTypes.STRING,
            tag_description: DataTypes.STRING,
            tag_number: DataTypes.INTEGER,
            geo: DataTypes.STRING,
            total_searches: DataTypes.INTEGER,
            clicks: DataTypes.INTEGER,
            monetized_searches: DataTypes.INTEGER,
            advertiser_id: DataTypes.INTEGER,
            source: DataTypes.ENUM("Mannul", "Api"),
            deleted: DataTypes.BOOLEAN,
            channel: DataTypes.STRING,
            gross_revenue: DataTypes.FLOAT,
            pub_revenue: DataTypes.FLOAT,
            pub_account_id: DataTypes.INTEGER,
            followon_searches: DataTypes.INTEGER,
            initial_searches: DataTypes.INTEGER,
            uploaded_by: DataTypes.INTEGER,
            uploaded_date: DataTypes.DATEONLY,
            createdAt: DataTypes.DATE,
            updatedAt: DataTypes.DATE,
        },
        {
            sequelize,
            modelName: "reports",
        }
    );
    return reports;
};
