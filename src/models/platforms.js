"use strict";

module.exports = (sequelize, DataTypes) => {
  const platforms = sequelize.define("platforms", {
    name: {
      allowNull: false,
      type: DataTypes.STRING,
      unique: {
        args: true,
        msg: "Platform with that name already exists",
      },
    },
    details: { type: DataTypes.STRING },
    status: { type: DataTypes.BOOLEAN },
    deleted: { type: DataTypes.BOOLEAN },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  });
  platforms.associate = function (models) {
    // associations can be defined here
    platforms.hasMany(models.provider_links, {
      foreignKey: "platform_id",
    });
  };
  return platforms;
};
