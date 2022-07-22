"use strict";
const {Model} = require("sequelize");
module.exports = (sequelize, DataTypes) => {
    class EmailConfig extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
        }
    }
    EmailConfig.init(
        {
            email: DataTypes.STRING,
            type: {
                type: DataTypes.STRING,
                allowNull: false,
                unique: true,
            },
            isDeleted: {
                type: DataTypes.BOOLEAN,
                defaultValue: false,
            },
        },
        {
            sequelize,
            modelName: "EmailConfig",
        }
    );
    return EmailConfig;
};
