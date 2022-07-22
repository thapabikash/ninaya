"use strict";
const {Model} = require("sequelize");
module.exports = (sequelize, DataTypes) => {
    class mapping extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
            mapping.belongsTo(models.providers, {
                foreignKey: "advertiser_id",
            });
        }
    }
    mapping.init(
        {
            advertiser_id: DataTypes.INTEGER,
            fields: DataTypes.JSONB,
            uploaded_by: DataTypes.INTEGER,
            updated_by: DataTypes.INTEGER,
            createdAt: DataTypes.DATE,
            updatedAt: DataTypes.DATE,
        },
        {
            sequelize,
            modelName: "mapping",
        }
    );
    return mapping;
};
