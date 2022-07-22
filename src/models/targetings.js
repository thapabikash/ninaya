"use strict";

module.exports = (sequelize, DataTypes) => {
  const targeting = sequelize.define("targetings", {
    publisher_id: { type: DataTypes.INTEGER },
    custom_domain: { type: DataTypes.STRING },
    use_custom_domain: { type: DataTypes.BOOLEAN },
    use_custom_fallback: { type: DataTypes.BOOLEAN },
    use_sid: { type: DataTypes.BOOLEAN },
    sub_id: { type: DataTypes.STRING },
    client_id: { type: DataTypes.INTEGER },
    o_id: { type: DataTypes.INTEGER },
    n: { type: DataTypes.BOOLEAN },
    click_id: { type: DataTypes.BOOLEAN },
    notes: { type: DataTypes.STRING },
    tag_description: { type: DataTypes.STRING },
    link: { type: DataTypes.STRING },
    history: { type: DataTypes.JSON },
    is_active: { type: DataTypes.BOOLEAN },
    status: { type: DataTypes.STRING }, //["draft", "published"]
    targeting_type: { type: DataTypes.STRING }, //["frequency", "round robin"]
    default_fallback: { type: DataTypes.STRING }, // default fallback url
    deleted: { type: DataTypes.BOOLEAN },
    publishedAt: DataTypes.DATE,
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  });
  // define associations here
  targeting.associate = function (models) {
    targeting.belongsTo(models.publishers, {
      as: "publisher_info",
      foreignKey: "publisher_id",
    });
    targeting.hasMany(models.targeting_rules, {
      foreignKey: "targeting_id",
    });
  };
  return targeting;
};
