"use strict";

module.exports = (sequelize, DataTypes) => {
  const search_engines = sequelize.define("search_engines", {
    name: {
      allowNull: false,
      type: DataTypes.STRING,
      unique: {
        args: true,
        msg: "Search Engine that name already exists",
      },
    },
    details: { type: DataTypes.STRING },
    status: { type: DataTypes.BOOLEAN },
    deleted: { type: DataTypes.BOOLEAN },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  });
  search_engines.associate = function (models) {
    // associations can be defined here
    search_engines.hasMany(models.provider_links, {
      foreignKey: "search_engine_id",
    });
  };
  return search_engines;
};
