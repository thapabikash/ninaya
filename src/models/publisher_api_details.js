"use strict";
const {Model} = require("sequelize");
module.exports = (sequelize, DataTypes) => {
    class publisher_api_details extends Model {
        static associate(models) {
            publisher_api_details.belongsTo(models.publishers, {
                foreignKey: "publisher_id",
            });
        }
    }
    publisher_api_details.init(
        {
            api_key: DataTypes.STRING,
            expire_at: DataTypes.DATE,
            publisher_id: DataTypes.INTEGER,
            fields: DataTypes.ARRAY(DataTypes.STRING),
            is_active: DataTypes.BOOLEAN,
            old_tokens: DataTypes.ARRAY(DataTypes.STRING)
        },
        {
            sequelize,
            modelName: "publisher_api_details",
        }
    );
    return publisher_api_details;
};
