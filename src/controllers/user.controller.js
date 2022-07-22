"use strict";
const fs = require("fs");
const path = require("path");
const { Op } = require("sequelize");
const UserSchema = require("../services/validationSchema/user.schema");
const UserService = require("../services/datas/users.data");
const cipherOperation = require("../services/operations/cipher.operation");

// helpers
const { log } = require("../../helpers/logger");
const { errorResponse } = require("../../helpers/response");
const successResponse = require("../../helpers/response/success.response");
const { deleteObjS3 } = require("../../helpers/s3helper");
const title = "Users";
const { pagination } = require("../../helpers/paginationHelper");
/**
 * index: controller to get list of users
 * @param {*} req request object
 * @param {*} res response object
 * @param {*} next next function
 */
async function index(req, res, next) {
  const {
    q,
    page,
    size,
    order_by,
    status,
    account,
    order_direction,
  } = req.query;
  let order = [];
  let searchq = {};
  try {
    if (order_by && order_direction) {
      order.push([order_by, order_direction]);
    }
    if (q) {
      searchq = {
        ...searchq,
        [Op.or]: [
          {
            email: {
              [Op.iLike]: `%${q}%`,
            },
          },
        ],
      };
    }
    if (status) {
      searchq["blocked"] = status === "active" ? false : true;
    }
    if (account) {
      searchq["account_id"] = account;
    }

    const paginateData = pagination(page, size, searchq, order);
    const users = await UserService.findAllUser(paginateData);
    res.send({
      data: users,
      success: true,
    });
  } catch (err) {
    log.error(err.message || err);
    next(err);
  }
}

async function add(req, res, next) {
  const data = req.body;
  const userdata = { ...data, role: process.env.USER_ROLE || "Publisher" };
  try {
    const { error } = UserSchema.create.validate(userdata);

    if (error) {
      const errArray = [];
      error.details.forEach(function (err) {
        errArray.push(err.message);
      });
      throw new Error(errArray);
    }
    // store file data in db
    if (req.file) {
      userdata.profile_image = req.file.filename;
      userdata.profile_link = req.file.location;
    }
    const user = await UserService.createUser(userdata);
    log.info(
      { req, title, id: user.id },
      `User add success with id: ${user.id}!!`
    );
    res.send({
      data: { user },
      message: "User added Successfully",
      success: true,
    });
  } catch (err) {
    log.error(err.message || err);
    next(err);
  }
}

async function show(req, res, next) {
  try {
    const id = req.params.id;
    const user = await UserService.findOneUser({ id });
    res.send({
      data: { user },
      success: true,
    });
  } catch (err) {
    log.error(err.message || err);
    next(err);
  }
}

async function getuserByaccountId(req, res, next) {
  const { q, page, size, order_by, status, order_direction } = req.query;
  let order = [];
  let searchq = {};
  try {
    if (order_by && order_direction) {
      order.push([order_by, order_direction]);
    }
    if (q) {
      searchq = {
        ...searchq,
        [Op.or]: [
          {
            name: {
              [Op.iLike]: `%${q}%`,
            },
          },
        ],
      };
    }
    if (status) {
      searchq["status"] = status;
    }
    const paginateData = pagination(page, size, searchq, order);
    const account_id = req.params.accountId;
    const user = await UserService.findUserByAccountId(
      { account_id: +account_id },
      paginateData
    );
    res.send({
      data: user,
      success: true,
    });
  } catch (err) {
    log.error(err.message || err);
    next(err);
  }
}

async function editStatus(req, res, next) {
  const id = req.params.id;
  const data = req.body;
  try {
    const user = await UserService.updateUserStatus({ id }, data);
    log.info({ req, title, id }, `User status update success with id: ${id}!!`);
    res.send({
      data: { user },
      message: " Updated Successfully",
      success: true,
    });
  } catch (err) {
    log.error(err.message || err);
    next(err);
  }
}

async function update(req, res, next) {
  const id = req.params.id;
  const data = req.body;
  try {
    const { error } = UserSchema.update.validate(data);
    if (error) {
      const errArray = [];
      error.details.forEach(function (err) {
        errArray.push(err.message);
      });
      throw new Error(errArray);
    }
    const existing = await UserService.findOneUser({ id });
    if (!existing) {
      throw new Error("User does not exists!!");
    }
    // store file data in db
    if (req.file) {
      data.profile_image = req.file.filename;
      data.profile_link = req.file.location;
      // replace file in s3
      await deleteObjS3(`uploads/${existing.profile_image}`);
    }
    const user = await UserService.updateUser({ id }, data);
    log.info({ req, title, id }, `User update success with id: ${id}!!`);
    res.send({
      data: { user },
      message: "User Updated Successfully",
      success: true,
    });
  } catch (err) {
    log.error(err.message || err);
    next(err);
  }
}

async function changePassword(req, res, next) {
  try {
    const { oldPassword, newPassword } = req.body;
    const user = await UserService.findOneUser({ id: req.params.id });
    const hash = await cipherOperation.saltHashPassword(oldPassword);
    if (hash !== user.password) {
      return errorResponse(res, "Incorrect old password!!");
    }
    const newHash = await cipherOperation.saltHashPassword(newPassword);
    const newUser = await UserService.updateUser(
      { id: req.params.id },
      { password: newHash }
    );
    delete newUser.password;
    return successResponse(res, "Password change success!!", newUser);
  } catch (err) {
    log.error(err.message || err);
    next(err);
  }
}

async function destroy(req, res, next) {
  try {
    const id = req.params.id;
    const user = await UserService.deleteUser({ id });
    if (user === 0) {
      return res.status(404).send({
        error: {
          code: 404,
          message: "User not found",
        },
        success: false,
      });
    }

    log.info({ req, title, id }, `User delete success with id: ${id}!!`);
    res.send({
      status: user,
      message: "User Deleted Successfully",
      success: true,
    });
  } catch (err) {
    log.error(err.message || err);
    next(err);
  }
}

module.exports = {
  index,
  add,
  show,
  update,
  changePassword,
  destroy,
  getuserByaccountId,
  editStatus,
};
