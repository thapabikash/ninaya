"use strict";
const models = require("../../models/index");

const Account = models.account;
const User = models.users;
/***
 *
 * @param userParams
 * @returns {Promise.<*>}
 */

async function   createAccount(data){
 return await Account.create(data);  
}

 async function findOneAccount(params) {
    return Account.findOne({ where: params, include: [{
        model: User,
        as: 'users'
    }] });
  }

  async function findAllAccount(options = {}) {
    const { count, rows } = await Account.findAndCountAll({
      include: [{
        model: User,
        as: 'users'
    }],
      ...options,
  });
  const total = count.length || count;
  return {
      total,
     accounts: rows,
      limit: options.limit,
      pageCount: Math.ceil(total / options.limit),
    };
  }

  async function updateAccount(params, data) {
    const account= await Account.findByPk(params.id);
    if (!account) {
      return false
    }else{
        return await Account.update(data, { where: params });
    }

  }

  async function deleteAccount(params) {
    return Account.destroy({ where: params });
  }
  
  module.exports = {
    createAccount,
    findOneAccount,
    findAllAccount,
    updateAccount,
    deleteAccount
  };