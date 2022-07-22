"use strict";
module.exports = (sequelize, DataTypes) => {
  const users = sequelize.define(
    "users",
    {
      first_name: DataTypes.STRING,
      last_name: DataTypes.STRING,
      email: {
        type: DataTypes.STRING,
        unique: {
          args: true,
          msg: "Email already exist",
        },
        set(value) {
          this.setDataValue("email", value.toLowerCase());
        },
      },
      role_id: { type: DataTypes.INTEGER },
      publisher_id: { type: DataTypes.INTEGER },
      account_id: { type: DataTypes.INTEGER },

      password: DataTypes.STRING,
      contact_number: DataTypes.STRING,
      skype_details: DataTypes.STRING,
      profile_image: DataTypes.STRING,
      profile_link: DataTypes.STRING,
      blocked: DataTypes.BOOLEAN,
      token: DataTypes.STRING,
      remember_token: DataTypes.STRING,
    },
    {}
  );
  users.associate = function (models) {
    
    users.belongsTo(models.roles, {foreignKey: 'role_id'});
    users.belongsTo(models.account, {foreignKey: 'account_id'});
    users.belongsTo(models.publishers, {foreignKey: 'publisher_id'});
    
  };
  return users;
};
