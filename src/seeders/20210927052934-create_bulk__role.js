'use strict';
const models = require("../models/index");
const Roles=require("../../helpers/role")
const UserService = require("../services/datas/users.data");
const Role= models.roles;
module.exports = {
  up: async (queryInterface, Sequelize) => {

    return Role.findOne({
      where: { role: process.env.SUPER_ADMIN_ROLE },
    }).then(async (role) => {
      if (role) {
        return true;
      } else {
        const roles=  await  Role.bulkCreate(Roles);
        if(roles){
          return UserService.assignAdminRole({role_id:roles[0].dataValues.id});
        }
         return true;
      }
    })

  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete("roles", null, {});
  }
};
