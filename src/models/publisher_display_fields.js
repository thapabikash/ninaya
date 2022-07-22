"use strict";
const {Model} = require("sequelize");
module.exports = (sequelize, DataTypes) => {
    class Publisher_display_fields extends Model {
        static associate(models) {
            Publisher_display_fields.belongsTo(models.users, {
                foreignKey: "user_id",
            });
        }
    }
    Publisher_display_fields.init(
        {
            user_id: DataTypes.INTEGER,
            fields: DataTypes.ARRAY(DataTypes.STRING),
        },
        {
            sequelize,
            modelName: "Publisher_display_fields",
        }
    );
    return Publisher_display_fields;
};
