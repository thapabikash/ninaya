"use strict";
const models = require("../../models/index");
const Setting = models.settings;

/***
 *
 * @param options
 * @returns {Promise.<*>}
 */

async function findAllSettings(params = {}) {
  return await Setting.findAll({ where: params });
}

/**
 *
 * @param {*} params
 * @returns {Promise.<*>}
 */
async function createSetting(params) {
  const createdSetting = await Setting.create(params);
  return createdSetting;
}

/**
 *
 * @param {*} params
 * @returns {Promise.<*>}
 */
async function findOneSetting(params, options = {}) {
  let attributes = options.attr ? { attributes: options.attr } : "";
  const setting = await Setting.findOne({
    where: params,
    ...attributes,
  });
  return setting;
}

/**
 *
 * @param {*} params params to check for update
 * @param {*} data data to ipdate
 * @returns {Promise.<*>}
 */
async function updateSetting(params = {}, data) {
  // check if setting exists
  const setting = await Setting.findByPk(params.id, {
    where: { deleted: false },
  });
  if (!setting) {
    throw new Error("setting not found!!");
  }
  const updatedSetting = await Setting.update(data, { where: params });
  return updatedSetting;
}

/**
 *
 * @param params
 * @returns {Promise.<*>}
 */
async function deleteSetting(params = {}) {
  const destroyed = await Setting.update({ deleted: true }, { where: params });
  return destroyed;
}

module.exports = {
  findAllSettings,
  createSetting,
  findOneSetting,
  updateSetting,
  deleteSetting,
};
