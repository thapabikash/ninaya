"use strict";
const {Model} = require("sequelize");
module.exports = (sequelize, DataTypes) => {
    class csv_upload_status extends Model {
        static associate(models) {
            csv_upload_status.belongsTo(models.providers, {
                foreignKey: "advertiser_id",
            });
        }
    }
    csv_upload_status.init(
        {
            csv_name: DataTypes.STRING,
            advertiser_id: DataTypes.INTEGER,
            // status: {
            //     type: DataTypes.ENUM,
            //     values: ["Failed", "Uploaded", "Processing", "Constant"],
            //     defaultValue: "Constant",
            // },
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
            createdAt: DataTypes.DATE,
            updatedAt: DataTypes.DATE,
            notiFy: {
                type: DataTypes.BOOLEAN,
                defaultValue: false,
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

            message: DataTypes.STRING,
            time_taken: DataTypes.STRING,
            total_rows: DataTypes.INTEGER,
            total_uploaded: DataTypes.INTEGER,
            total_skipped: DataTypes.INTEGER,
            check_sum_totalSearches: DataTypes.INTEGER,
            uploaded_sum_totalSearches: DataTypes.INTEGER,
            startDate: DataTypes.DATE,
            endDate: DataTypes.DATE,
        },
        {
            sequelize,
            modelName: "csv_upload_status",
        }
    );
    return csv_upload_status;
};
