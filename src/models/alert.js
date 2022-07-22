"use strict";
const {Model} = require("sequelize");
module.exports = (sequelize, DataTypes) => {
    class alert extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
        }
    }
    alert.init(
        {
            subject: DataTypes.STRING,
            type: DataTypes.STRING,
            alerted_at: DataTypes.DATE,
            data: DataTypes.JSONB,
            is_Alerted: DataTypes.BOOLEAN,
            message: DataTypes.STRING,
        },
        {
            sequelize,
            modelName: "alert",
        }
    );
    return alert;
};
