'use strict';
const models = require("../models/index");
const Account= models.account;
module.exports = {
  up: async (queryInterface, Sequelize) => {
     const data= [{
      name: 'Ninaya',
    },
    {
     name: 'Reporting',
   }];

   return Account.findAll().then(async (account) => {
    if (account.length>0) {
      return true;
    } else {
      const acc=  await  Account.bulkCreate(data);
      if(acc){
        return true;
      }
       return true;
    }
  })
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete("accounts", null, {});
  }
};
