"use strict";

const TargetingRuleSchema = require("../services/validationSchema/targetingRule.schema");
const TargetingRuleServices = require("../services/datas/targetingRule.data");
// logger
const { log } = require("../../helpers/logger");
const { errorResponse, successResponse } = require("../../helpers/response");
const title = "TargetingRules";
/**
 * index: controller to get list of targetingRules
 * @param {*} req request object
 * @param {*} res response object
 * @param {*} next next function
 */
async function index(req, res, next) {
  try {
    let params = { where: { deleted: false }, order: [["id", "ASC"]] };
    const targetingRules = await TargetingRuleServices.findAllTargetingRules(params);
    return successResponse(res, "targetingRules get success!!", {
      targetingRules,
    });
  } catch (err) {
    log.error(err.message || err);
    next(err);
  }
}

async function bulkAdd(req, res, next) {
  try {
    const data = req.body;
    if (!Array.isArray(data)) {
      throw new Error("Array data not provided!!");
    }
    const { error } = TargetingRuleSchema.bulkCreate.validate(data);
    if (error) {
      const errArray = [];
      error.details.forEach(function (err) {
        errArray.push(err.message);
      });
      throw new Error(errArray);
    }
    const targetingRules = await TargetingRuleServices.bulkCreateTargetingRule(data);
    log.info({ req, title }, "targetingRules bulk create success!!");
    return successResponse(res, "TargetingRules created Successfully", {
      targetingRules,
    });
  } catch (err) {
    log.error(err.message || err);
    next(err);
  }
}

async function show(req, res, next) {
  const id = req.params.id;
  try {
    const targetingRule = await TargetingRuleServices.findOneTargetingRule({
      id,
      deleted: false,
    });
    return successResponse(res, "TargetingRule get Successful", {
      targetingRule,
    });
  } catch (err) {
    log.error(err.message || err);
    next(err);
  }
}

async function destroy(req, res, next) {
  const id = req.params.id;
  try {
    const existing = await TargetingRuleServices.findOneTargetingRule(
      {
        id,
        deleted: false,
      },
      { attr: ["id"] }
    );
    if (!existing) {
      return errorResponse(res, "TargetingRule not found!!", { status: 404 });
    }
    const targetingRule = await TargetingRuleServices.deleteTargetingRule({
      id,
    });
    log.info({ req, title, id }, `TargetingRule deleted successfully with id: ${id}`);
    return successResponse(res, `TargetingRule deleted successfully with id: ${id}`, targetingRule);
  } catch (err) {
    log.error(err.message || err);
    next(err);
  }
}

async function bulkUpdate(req, res, next) {
  try {
    const data = req.body;
    if (!Array.isArray(data)) {
      throw new Error("Array data not provided!!");
    }
    const { error } = TargetingRuleSchema.bulkUpdate.validate(data);
    if (error) {
      const errArray = [];
      error.details.forEach(function (err) {
        errArray.push(err.message);
      });
      throw new Error(errArray);
    }
    const targetingRules = await TargetingRuleServices.bulkUpdateTargetingRule(data);
    log.info({ req, title }, "TargetingRules update success!!");
    return successResponse(res, "TargetingRules updated Successfully");
  } catch (err) {
    log.error(err.message || err);
    next(err);
  }
}

module.exports = {
  index,
  bulkAdd,
  show,
  destroy,
  bulkUpdate,
};
