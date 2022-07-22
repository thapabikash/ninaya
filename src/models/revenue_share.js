"use strict";
const {Model} = require("sequelize");
module.exports = (sequelize, DataTypes) => {
    class revenue_share extends Model {
        static associate(models) {
            // define association here
        }
    }
    revenue_share.init(
        {
            share_revenue: DataTypes.FLOAT,
        },
        {
            sequelize,
            modelName: "revenue_share",
        }
    );
    return revenue_share;
};
