"use strict";
const {Model} = require("sequelize");
module.exports = (sequelize, DataTypes) => {
    class roles extends Model {
        static associate(models) {
            roles.hasMany(models.users, {
                foreignKey: "role_id",
                as: "roles",
            });
        }
    }
    roles.init(
        {
            role: {
                allowNull: false,
                type: DataTypes.STRING,
                unique: {
                    args: true,
                    msg: "Role already exist",
                },
            },
        },
        {
            sequelize,
            modelName: "roles",
        }
    );
    return roles;
};
