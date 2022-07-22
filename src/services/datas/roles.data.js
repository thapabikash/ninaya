"use strict";
const models = require("../../models/index");

const Role = models.roles;
const User = models.users;
const { Op } = require("sequelize");
/***
 *
 * @param userParams
 * @returns {Promise.<*>}
 */

async function   createRole(data){
    try{
        const createdrole= await Role.create(data);  
        return createdrole
    }catch(error){
           throw new Error(error)
    }

}

 async function findOneRole(params) {
    return Role.findOne({ where: params,
    //      include: [{
    //     model: User,
    //     as: 'users'
    // }]
 });
  }

  async function findAllRoles(options = {}) {
    const roles=await Role.findAll({
      where: {
          [Op.not]: [
              { role: ['superAdmin','SuperAdmin','Admin','admin'] }
            ]
      }})
  //   const { count, rows } = await Role.findAndCountAll({
  //       where: {
  //           [Op.not]: [
  //               { role: ['SuperAdmin','Admin','admin'] }
  //             ]
  //       },
  //     ...options,
  // });
  // const total = count.length || count;
  return {
     roles: roles,
    };
  }

  async function updateRole(params, data) {
    const role= await Role.findByPk(params.id);
    if (!role) {
     throw new Error("Role not found")
    }else{
        return await Role.update(data, { where: params });
    }

  }

  async function deleteRole(params) {
    return Role.destroy({ where: params });
  }
  
  module.exports = {
    createRole,
    findOneRole,
    findAllRoles,
    updateRole,
    deleteRole
  };