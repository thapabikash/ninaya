"use strict";

module.exports = (sequelize, DataTypes) => {
  const providerLink = sequelize.define("provider_links", {
    provider_id: { type: DataTypes.INTEGER },
    link: { type: DataTypes.STRING },
    search_engine_type: { type: DataTypes.STRING }, // google, yahoo
    p_sid: { type: DataTypes.INTEGER }, // provider sub id
    searchq_val: { type: DataTypes.STRING }, // for query field
    n_val: { type: DataTypes.STRING }, // for result sets
    sub_id_val: { type: DataTypes.STRING }, // for result sets
    description: { type: DataTypes.STRING },
    click_id_val: { type: DataTypes.STRING }, // for result sets
    disabled: { type: DataTypes.BOOLEAN },
    deleted: { type: DataTypes.BOOLEAN },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  });
  // assosiations here
  providerLink.associate = function (models) {
    providerLink.belongsTo(models.providers, {
      foreignKey: "provider_id",
    });
    providerLink.belongsTo(models.search_engines, {
      foreignKey: "search_engine_id",
    });
    providerLink.belongsTo(models.tag_types, {
      foreignKey: "tag_type_id",
    });
    providerLink.belongsTo(models.platforms, {
      foreignKey: "platform_id",
    });
  };
  return providerLink;
};
