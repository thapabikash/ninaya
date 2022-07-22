"use strict";
const models = require("../models/index");

const User = models.users;
const Role = models.roles;
const UserService = require("../services/datas/users.data");
// logger
const { log } = require("../../helpers/logger");
const Roles=require("../../helpers/role")

module.exports = {
  up: (queryInterface, Sequelize) => {
    return User.findOne({
      where: { email: process.env.SUPER_ADMIN_EMAIL },
    }).then(async (user) => {
      if (user) {
        log.info("Admin already exists.");
        return true;
      } else {

        let data = {
          first_name: process.env.SUPER_ADMIN_FIRST_NAME,
          last_name: process.env.SUPER_ADMIN_LAST_NAME,
          password: process.env.SUPER_ADMIN_PASSWORD,
          email: process.env.SUPER_ADMIN_EMAIL,
        };

        return UserService.seedAdmin(data);
      }
    });
  },

  down: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.bulkDelete("roles", null, {}),
      queryInterface.bulkDelete("users", null, {})
    ])
   
  },
};
