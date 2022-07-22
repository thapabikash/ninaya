"use strict";
const {Model} = require("sequelize");
module.exports = (sequelize, DataTypes) => {
    class skipped_row_csv extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
            skipped_row_csv.belongsTo(models.providers, {
                foreignKey: "advertiser_id",
            });
        }
    }
    skipped_row_csv.init(
        {
            advertiser_id: DataTypes.INTEGER,
            csvfile: DataTypes.STRING,
            total_excluded: DataTypes.INTEGER,
            total_uploaded: DataTypes.INTEGER,
            message: DataTypes.STRING,
            channel: DataTypes.STRING,
            date: DataTypes.STRING,
            total_searches: DataTypes.STRING,
            clicks: DataTypes.STRING,
            monetized_searches: DataTypes.STRING,
            row_index: DataTypes.INTEGER,
            gross_revenue: DataTypes.STRING,
            upload_status: DataTypes.BOOLEAN,
            check_sum: DataTypes.FLOAT,
            sum_in_db: DataTypes.FLOAT,
            createdAt: DataTypes.DATE,
            updatedAt: DataTypes.DATE,
        },
        {
            sequelize,
            modelName: "skipped_row_csv",
        }
    );
    return skipped_row_csv;
};
