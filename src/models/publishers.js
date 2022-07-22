"use strict";

module.exports = (sequelize, DataTypes) => {
    const publisher = sequelize.define("publishers", {
        name: {
            allowNull: false,
            type: DataTypes.STRING,
            unique: {
                args: true,
                msg: "Publisher name already exist",
            },
        },
        details: {type: DataTypes.STRING},
        status: {type: DataTypes.STRING}, // active, inactive
        deleted: {type: DataTypes.BOOLEAN},
        createdAt: DataTypes.DATE,
        updatedAt: DataTypes.DATE,
    });
    // define assosiations here
    publisher.associate = function (models) {
        publisher.hasMany(models.targetings, {
            foreignKey: "publisher_id",
        });
    };
    return publisher;
};
