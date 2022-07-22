"use strict";

const { Op } = require("sequelize");
const ProviderSchema = require("../services/validationSchema/provider.schema");
const ProviderService = require("../services/datas/provider.data");

// helpers
const { log } = require("../../helpers/logger");
const { pagination } = require("../../helpers/paginationHelper");
const { errorResponse, successResponse } = require("../../helpers/response");

const title = "Advertisers";
/**
 * index: controller to get list of providers
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
    order_direction,
    archived,
  } = req.query;
  let order = [];
  let searchq = { deleted: false };
  try {
    // add the order parameters to the order
    if (order_by && order_direction) {
      order.push([order_by, order_direction]);
    }
    if (archived) {
      searchq = { ...searchq, deleted: true };
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
          {
            details: {
              [Op.iLike]: `%${q}%`,
            },
          },
        ],
      };
    }
    if (status) {
      searchq["status"] = status;
    }
    // implement pagination
    const paginateData = pagination(page, size, searchq, order);
    const providers = await ProviderService.findAllProviders(paginateData);
    return successResponse(res, "Advertisers get success!!", {
      ...providers,
      currentPage: parseInt(page, 10) || 1,
    });
  } catch (err) {
    log.error(err.message || err);
    next(err);
  }
}

async function getLinksById(req, res, next) {
  const id = req.params.id;
  try {
    const provider = await ProviderService.getLinksById({
      id,
      deleted: false,
    });
    return successResponse(res, "Advertiser links get success", {
      provider,
    });
  } catch (err) {
    log.error(err.message || err);
    next(err);
  }
}

async function add(req, res, next) {
  try {
    const data = req.body;
    const { error } = ProviderSchema.create.validate(data);

    if (error) {
      const errArray = [];
      error.details.forEach(function (err) {
        errArray.push(err.message);
      });
      throw new Error(errArray);
    }
    // check for unique provider name
    const exists = await ProviderService.findOneProvider(
      { name: data.name },
      { attr: ["id", "name", "deleted"] }
    );
    if (exists) {
      if (exists?.dataValues?.deleted) {
        throw new Error(
          `Archived Advertiser with name ${data.name} already exists!!`
        );
      }

      throw new Error(`Advertiser with name ${data.name} already exists!!`);
    }
    const provider = await ProviderService.createProvider(data);
    log.info(
      { req, title, id: provider.id },
      `Advertiser add success with id:${provider.id}!!`
    );

    return successResponse(
      res,
      `Advertiser add success with id:${provider.id}!!`,
      {
        provider,
      }
    );
  } catch (err) {
    log.error(err.message || err);
    next(err);
  }
}

async function show(req, res, next) {
  const id = req.params.id;
  try {
    const provider = await ProviderService.findOneProvider({
      id,
      deleted: false,
    });
    return successResponse(res, "Advertiser get success", {
      provider,
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
    const { error } = ProviderSchema.update.validate(data);
    if (error) {
      const errArray = [];
      error.details.forEach((err) => {
        errArray.push(err.message);
      });
      throw new Error(errArray);
    }
    // check for unique publisher name
    if (data.name) {
      const exists = await ProviderService.findOneProvider(
        {
          id: { [Op.ne]: id },
          name: data.name,
        },
        { attr: ["id", "name", "deleted"] }
      );
      if (exists) {
        if (exists?.dataValues?.deleted) {
          throw new Error(
            `Archived Advertiser with name ${data.name} already exists!!`
          );
        }

        throw new Error(`Advertiser with name ${data.name} already exists!!`);
      }
    }
    if (req.query.archive && req.query.archive === "false") {
      data.deleted = false;
    }
    const provider = await ProviderService.updateProvider({ id }, data);
    log.info({ req, title, id }, `Advertiser update success with id:${id}!!`);
    return successResponse(res, `Advertiser update success with id:${id}!!`, {
      provider,
    });
  } catch (err) {
    log.error(err.message || err);
    next(err);
  }
}

async function bulkUpdate(req, res, next) {
  try {
    const queryParams = req.query;
    const data = req.body.ids;
    if (data) {
      if (data === "all") {
        // update all data
        await ProviderService.bulkUpdateStatus({ deleted: false }, { status });
      } else if (Array.isArray(data)) {
        for (let i = 0; i < data.length; i++) {
          await ProviderService.updateProvider(
            { id: data[i] },
            { ...queryParams }
          );
        }
      } else {
        throw new Error("Invalid ids passed");
      }
    } else {
      throw new Error("Ids should be passed!!");
    }
    log.info({ req, title }, "Advertisers bulk update successful!!");
    return successResponse(res, "Advertisers bulk update successful!!");
  } catch (err) {
    log.error(err.message || err);
    next(err);
  }
}

async function destroy(req, res, next) {
  const id = req.params.id;
  let perm = false;
  try {
    let findParams = { id, deleted: false };
    if (req.query.permanent && req.query.permanent === "true") {
      perm = true;
      findParams = { id };
    }
    const existing = await ProviderService.findOneProvider(findParams, {
      attr: ["id"],
    });
    if (!existing) {
      return errorResponse(res, "Advertiser not found!!", { status: 404 });
    }
    if (perm && existing.dataValues.no_of_rules === 0) {
      const destroyed = await ProviderService.destroyProvider({ id });
      log.info(
        { req, title, id },
        `Advertiser deleted permanently with id: ${id}!!`
      );
      return successResponse(
        res,
        `Advertiser deleted permanently with id: ${id}`,
        destroyed
      );
    }
    const provider = await ProviderService.deleteProvider({ id });
    log.info(
      { req, title, id },
      `Advertiser archived successfully with id: ${id}`
    );
    return successResponse(
      res,
      `Advertiser deleted successfully with id: ${id}`,
      provider
    );
  } catch (err) {
    log.error(err.message || err);
    next(err);
  }
}

async function bulkDestroy(req, res, next) {
  const ids = req.body.ids;
  try {
    if (ids) {
      if (ids === "all") {
        // delete all data
        // await ProviderService.deleteProvider({});
      } else if (Array.isArray(ids)) {
        for (let i = 0; i < ids.length; i++) {
          await ProviderService.deleteProvider({ id: ids[i] });
        }
      } else {
        throw new Error("Ids should be of valid type");
      }
    } else {
      throw new Error("Need to pass ids to delete");
    }
    log.info({ req, title }, "Advertisers bulk archive successful!!");
    return successResponse(res, "Advertisers archived successfully");
  } catch (err) {
    log.error(err.message || err);
    next(err);
  }
}

module.exports = {
  index,
  getLinksById,
  add,
  show,
  update,
  bulkUpdate,
  destroy,
  bulkDestroy,
};
