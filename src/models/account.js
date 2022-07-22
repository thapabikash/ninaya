'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class account extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      account.hasMany(models.users, {
        foreignKey: 'account_id',
        as: 'users',
      });
    }
  };
  account.init({
    name: {
      allowNull: false,
      type: DataTypes.STRING,
      unique: {
        args: true,
        msg: 'Account name already exist',
      }
    }
  }, {
    sequelize,
    modelName: 'account',
  });
  return account;
};