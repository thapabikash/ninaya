"use strict";

const { Op } = require("sequelize");
const SettingSchema = require("../services/validationSchema/setting.schema");
const SettingService = require("../services/datas/setting.data");
// helpers
const { log } = require("../../helpers/logger");
const { errorResponse, successResponse } = require("../../helpers/response");
const title = "Settings";
/**
 * index: controller to get list of publishers
 * @param {*} req request object
 * @param {*} res response object
 * @param {*} next next function
 */
async function index(req, res, next) {
  try {
    const settings = await SettingService.findAllSettings({ deleted: false });
    return successResponse(res, "Settings get success!!", {
      settings: settings,
    });
  } catch (err) {
    log.error(err.message || err);
    next(err);
  }
}

async function add(req, res, next) {
  try {
    let data = req.body;
    const userID = req.user.id;
    if (!Array.isArray(data)) {
      if (typeof data === "object") {
        data = [data];
      } else {
        throw new Error("Valid data not provided!!");
      }
    }
    const { error } = SettingSchema.create.validate(data);

    if (error) {
      const errArray = [];
      error.details.forEach(function (err) {
        errArray.push(err.message);
      });
      throw new Error(errArray);
    }
    // check unique key
    for (let e = 0; e < data.length; e++) {
      const obj = data[e];
      let paramObj = { key: obj.key, deleted: false };
      if (obj.id) {
        paramObj = { ...paramObj, id: { [Op.ne]: obj.id } };
      }
      const exists = await SettingService.findOneSetting(paramObj);
      if (exists) {
        throw new Error(`Setting key already exists. key: ${obj.key}`);
      }
    }
    let newSettings = [];
    for (let i = 0; i < data.length; i++) {
      const d = data[i];
      if (d.id) {
        //update
        d.updated_by = userID;
        const updatedSetting = await SettingService.updateSetting(
          { id: d.id },
          d
        );
        newSettings.push(updatedSetting);
      } else {
        //add
        d.created_by = userID;
        d.updated_by = userID;
        const setting = await SettingService.createSetting(d);
        newSettings.push(setting);
      }
    }
    log.info({ req, title }, "Setting create/update success!!");
    return successResponse(res, "Setting created/updated successfully", {
      setting: newSettings,
    });
  } catch (err) {
    log.error(err.message || err);
    next(err);
  }
}

async function show(req, res, next) {
  const id = req.params.id;
  try {
    const setting = await SettingService.findOneSetting({
      id,
      deleted: false,
    });
    return successResponse(res, "Setting get success!!", { setting });
  } catch (err) {
    log.error(err.message || err);
    next(err);
  }
}

async function destroy(req, res, next) {
  const id = req.params.id;
  try {
    const existing = await SettingService.findOneSetting(
      {
        id,
        deleted: false,
      },
      { attr: ["id"] }
    );
    if (!existing) {
      return errorResponse(res, "Setting not found!!", { status: 404 });
    }
    const setting = await SettingService.deleteSetting({ id });
    log.info({ req, title, id }, `Setting archive success with id:${id}!!`);
    return successResponse(
      res,
      `Setting archived successfully with id: ${id}`,
      setting
    );
  } catch (err) {
    log.error(err.message || err);
    next(err);
  }
}

module.exports = {
  index,
  add,
  show,
  destroy,
};
