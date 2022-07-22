"use strict";
module.exports = (sequelize, DataTypes) => {
  const logInfo = sequelize.define(
    "system_logs",
    {
      name: DataTypes.STRING,
      level: DataTypes.INTEGER,
      hostname: DataTypes.STRING,
      msg: DataTypes.STRING,
      pid: DataTypes.INTEGER,
      content: DataTypes.JSONB,
    },
    { timestamps: false }
  );
  logInfo.associate = function (models) {
    // associations can be defined here
  };
  return logInfo;
};
