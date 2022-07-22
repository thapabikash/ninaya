"use strict";
module.exports = (sequelize, DataTypes) => {
  const rule_providers = sequelize.define("rule_providers", {
    provider_id: {
      type: DataTypes.INTEGER,
      references: {
        model: "providers",
        key: "id",
      },
    },
    targeting_rule_id: {
      type: DataTypes.INTEGER,
      references: {
        model: "targeting_rules",
        key: "id",
      },
    },
    provider_link: {
      type: DataTypes.INTEGER,
      references: {
        model: "provider_links",
        key: "id",
      },
    },
    traffic: { type: DataTypes.INTEGER },
  });
  rule_providers.associate = function (models) {
    // associations can be defined here
    rule_providers.belongsTo(models.providers, {
      foreignKey: "provider_id",
    });

    rule_providers.belongsTo(models.targeting_rules, {
      foreignKey: "targeting_rule_id",
    });
  };
  return rule_providers;
};
