"use strict";

module.exports = (sequelize, DataTypes) => {
  const tag_types = sequelize.define("tag_types", {
    name: {
      allowNull: false,
      type: DataTypes.STRING,
      unique: {
        args: true,
        msg: "Tag Type with that name already exists",
      },
    },
    details: { type: DataTypes.STRING },
    status: { type: DataTypes.BOOLEAN },
    deleted: { type: DataTypes.BOOLEAN },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  });
  tag_types.associate = function (models) {
    // associations can be defined here
    tag_types.hasMany(models.provider_links, {
      foreignKey: "tag_type_id",
    });
  };
  return tag_types;
};
