"use strict";

module.exports = (sequelize, DataTypes) => {
  const targetingRule = sequelize.define("targeting_rules", {
    priority: { type: DataTypes.INTEGER },
    daily_cap: { type: DataTypes.INTEGER },
    daily_frequency: { type: DataTypes.INTEGER },
    comment: { type: DataTypes.STRING },
    targeting_id: { type: DataTypes.INTEGER },
    provider_details: { type: DataTypes.JSONB },
    disabled: { type: DataTypes.BOOLEAN },
    deleted: { type: DataTypes.BOOLEAN },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  });
  // define associations here
  targetingRule.associate = function (models) {
    targetingRule.belongsTo(models.targetings, {
      foreignKey: "targeting_id",
    });
    // association for provider pending
    targetingRule.belongsToMany(models.providers, {
      through: models.rule_providers,
      foreignKey: "targeting_rule_id",
      as: "provider_info",
    });
  };
  return targetingRule;
};
