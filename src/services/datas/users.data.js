"use strict";
const models = require("../../models/index");
const CipherOperation = require("../operations/cipher.operation");
const {Op} = require("sequelize");
const publisherDisplayFields=require("../datas/publisherDisplayFields.data");

const User = models.users;
const Role = models.roles;

/***
 *
 * @param userParams
 * @returns {Promise.<*>}
 */

//seeding admin
async function seedAdmin(userParams) {
    userParams.password = await CipherOperation.saltHashPassword(
        userParams.password
    );
    let createdUser = await User.create(userParams);

    createdUser = createdUser.get();
    delete createdUser.id;
    delete createdUser.password;
    return createdUser;
}

// updating seed users role

async function assignAdminRole(data) {
    return await User.update(data, {
        where: {
            email: process.env.SUPER_ADMIN_EMAIL,
        },
    });
}

//creating user from clientside
async function createUser(userParams) {
    const existuser = await User.findAll({where: {email: userParams?.email}});
    if (existuser.length > 0) {
        throw new Error("User already exist with this email for this account");
    } else {
        userParams.password = await CipherOperation.saltHashPassword(
            userParams.password
        );

        let createdUser = await User.create(userParams);

        if(createUser){
            await publisherDisplayFields.createDefaultDisplayFields( createdUser.id);
        }

        createdUser = createdUser.get();
        delete createdUser.id;
        delete createdUser.password;
        return createdUser;
    }
}

/**
 *
 * @param params
 * @returns {Promise.<Model>}
 */
async function findOneUser(params) {
    return User.findOne({
        where: params,
        attributes: {
            exclude: ["account_id", "publisher_id", "role_id"],
        },
        include: [
            {
                model: models.publishers,
                attributes: ["id", "name", "details"],
            },
            {
                model: models.roles,
                attributes: ["id", "role"],
            },
        ],
    });
}

/**
 *
 * @param params
 * @returns {Promise.<*>}
 */
async function findAllUser(options = {}) {
    // return await User.findAll(params);
    const {count, rows} = await User.findAndCountAll({
        attributes: {
            exclude: ["account_id", "publisher_id", "role_id"],
        },
        include: [
            {
                model: models.publishers,
                attributes: ["id", "name", "details"],
            },
            {
                model: models.roles,
                attributes: ["id", "role"],
            },
        ],
        ...options,
    });
    const total = count.length || count;
    return {
        total,
        users: rows,
        limit: options.limit,
        pageCount: Math.ceil(total / options.limit),
    };
}

async function findUserByAccountId(params, options = {}) {
    // return await User.findAll({where:params});
    const {count, rows} = await User.findAndCountAll({
        where: params,
        attributes: {
            exclude: ["publisher_id", "account_id", "role_id"],
        },
        include: [
            {
                model: models.account,
                attributes: ["id", "name"],
            },
            {
                model: models.publishers,
            },
            {
                model: models.roles,
                attributes: ["id", "role"],
            },
        ],
        ...options,
    });
    const total = count.length || count;
    return {
        total,
        users: rows,
        limit: options.limit,
        pageCount: Math.ceil(total / options.limit),
    };
}

/**
 *
 * @param params
 * @param data
 * @returns {Promise.<*>}
 */
 async function updateUser(params, data) {
    let where={id: {[Op.ne]: params.id}};
    if(data?.email){
        where={...where,email: data.email}
        const existUserEmail = await User.findAll({
           where:where
       });
       if (existUserEmail.length > 0) {
           throw new Error("User already exist with this email for this account");
       }else{
           return await User.update(data, {where: params});
       }
    }else{
      
       return await User.update(data, {where: params});
    }
 
}

async function updateUserStatus(params, data) {
    return await User.update(data, {where: params});
}

/**
 *
 * @param params
 * @returns {Promise<void | Promise.<number> | Promise | Promise<number> | Promise<void> | *>}
 */
async function deleteUser(params) {
    const user = await findOneUser(params);
    if (
        user.role.role === process.env.SUPER_ADMIN_ROLE ||
        user.role.role === "Admin"
    ) {
        throw new Error("Admin user can't be deleted");
    } else {
        return User.destroy({where: params});
    }
}

module.exports = {
    createUser,
    findOneUser,
    findAllUser,
    updateUser,
    seedAdmin,
    findUserByAccountId,
    deleteUser,
    updateUserStatus,
    assignAdminRole,
};
