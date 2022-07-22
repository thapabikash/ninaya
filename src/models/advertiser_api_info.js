"use strict";
const {Model} = require("sequelize");
module.exports = (sequelize, DataTypes) => {
    class advertiser_api_info extends Model {
        static associate(models) {
            advertiser_api_info.belongsTo(models.providers, {
                foreignKey: "advertiser_id",
            });
        }
    }
    advertiser_api_info.init(
        {
            // status: {
            //     type: DataTypes.ENUM,
            //     values: ["Failed", "Uploaded", "Processing", "Constant"],
            //     defaultValue: "Constant",
            // },
            //correct status report_status
            uploaded_status: {
                type: DataTypes.ENUM,
                values: [
                    "Failed",
                    "Partially Uploaded",
                    "Processing",
                    "Zero Records Uploaded",
                    "Constant",
                    "Uploaded Successfully",
                ],
                defaultValue: "Constant",
            },
            source: {
                type: DataTypes.ENUM,
                values: ["Api", "Mannual"],
                defaultValue: "Mannual",
            },
            check_sum: {
                type: DataTypes.FLOAT,
            },
            check_sum_in_db: {
                type: DataTypes.FLOAT,
            },
            total_rows: {
                type: DataTypes.INTEGER,
            },
            total_uploaded: {
                type: DataTypes.INTEGER,
            },
            total_skipped: {
                type: DataTypes.INTEGER,
            },
            skipped_subid: {
                type: DataTypes.ARRAY(DataTypes.STRING),
            },
            uploaded_subid: {
                type: DataTypes.ARRAY(DataTypes.STRING),
            },
            skippedSubIdWithValidation: {
                type: DataTypes.ARRAY(DataTypes.STRING),
            },
            skippedSubIdWithNotFoundPubAccount: {
                type: DataTypes.ARRAY(DataTypes.STRING),
            },
            missing_tags_with_subIds: {
                type: DataTypes.ARRAY(DataTypes.STRING),
            },
            exist_tags_with_subIds: {
                type: DataTypes.ARRAY(DataTypes.STRING),
            },
            apply_from_data: DataTypes.DATE,
            apply_to_date: DataTypes.DATE,
            message: DataTypes.STRING,
            advertiser_id: DataTypes.INTEGER,
            called_api_date: DataTypes.DATE,
            last_updated_db: DataTypes.DATE,
        },
        {
            sequelize,
            modelName: "advertiser_api_infos",
        }
    );
    return advertiser_api_info;
};
