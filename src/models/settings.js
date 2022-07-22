"use strict";
/**
 * model to store system default values
 */

module.exports = (sequelize, DataTypes) => {
  const setting = sequelize.define("settings", {
    key: { type: DataTypes.STRING, unique: true },
    value: { type: DataTypes.STRING },
    deleted: { type: DataTypes.BOOLEAN },
    created_by: { type: DataTypes.INTEGER },
    updated_by: { type: DataTypes.INTEGER },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  });
  setting.associate = function (models) {
    // define assosiations here
  };
  return setting;
};
