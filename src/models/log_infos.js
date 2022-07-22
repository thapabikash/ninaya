"use strict";
module.exports = (sequelize, DataTypes) => {
  const logInfo = sequelize.define(
    "log_infos",
    {
      request_at: DataTypes.DATE,
      response_period: DataTypes.STRING,
      redirected_to: DataTypes.STRING,
      provider_no: DataTypes.INTEGER,
      ip_address: DataTypes.STRING,
      device_info: DataTypes.STRING,
      browser_info: DataTypes.STRING,
      geo: DataTypes.JSONB,
      cid: DataTypes.INTEGER, //client id
      sid: DataTypes.STRING, //sub id
      pid: DataTypes.INTEGER, // publisher id
      provider_id: DataTypes.INTEGER,
      rule_id: DataTypes.INTEGER, // rule id
      q: DataTypes.STRING, // search query
      n: DataTypes.INTEGER,
      click_id: DataTypes.INTEGER,
      is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      os_info: DataTypes.STRING,
      isp_name: DataTypes.STRING,
      link_id: DataTypes.INTEGER, // provider(advertiser) link id
    },
    { timestamps: false }
  );
  logInfo.associate = function (models) {
    // associations can be defined here
    logInfo.belongsTo(models.publishers, {
      foreignKey: "pid",
    });
    logInfo.belongsTo(models.providers, {
      foreignKey: "provider_id",
    });
    logInfo.belongsTo(models.provider_links, {
      foreignKey: "link_id",
    });
  };
  return logInfo;
};
