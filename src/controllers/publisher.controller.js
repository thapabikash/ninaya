"use strict";

const { Op } = require("sequelize");
const PublisherSchema = require("../services/validationSchema/publisher.schema");
const PublisherService = require("../services/datas/publisher.data");
const TargetingService = require("../services/datas/targeting.data");
const publisherApiDetailsService = require("../services/datas/publisherApi/publisherApiDetails.data");
// helpers
const { log } = require("../../helpers/logger");
const { pagination } = require("../../helpers/paginationHelper");
const { errorResponse, successResponse } = require("../../helpers/response");
const {
  generateHashToken
} = require("../../helpers/publisherRevenueApi/tokenEncription");
const title = "Publishers";

/**
 * index: controller to get list of publishers
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
    const publishers = await PublisherService.findAllPublishers(paginateData);
    const finalData = { ...publishers, currentPage: parseInt(page, 10) || 1 };
    return successResponse(res, "Publishers get success!!", finalData);
  } catch (err) {
    log.error(err.message || err);
    next(err);
  }
}

async function add(req, res, next) {
  try {
    const data = req.body;
    const { error } = PublisherSchema.create.validate(data);

    if (error) {
      const errArray = [];
      error.details.forEach(function (err) {
        errArray.push(err.message);
      });
      throw new Error(errArray);
    }
    // check for unique publisher name
    const exists = await PublisherService.findOnePublisher(
      {
        name: data.name,
      },
      { attr: ["id", "name", "deleted"] }
    );
    if (exists) {
      if (exists?.dataValues?.deleted) {
        throw new Error(
          `Archived Publisher with name ${data.name} already exists!!`
        );
      }
      throw new Error(`Publisher with name ${data.name} already exists!!`);
    }
    const publisher = await PublisherService.createPublisher(data);
    log.info(
      { req, title, id: publisher.id },
      `Publisher add success with id:${publisher.id}!!`
    );
    // TODO create token
    const id = publisher.id;
    const fields = [
      "date",
      "total_searches",
      "clicks",
      "tag_id",
      "publisher",
      "monetized_searches",
      "geo",
      "gross_revenue",
    ];
    const tokenData = {
      publisher_id: id,
      api_key: generateHashToken("" + id),
      is_active: true,
      expire_at: new Date(),
      fields: fields,
    };
    const publisherApiDetails =
      await publisherApiDetailsService.postApiDetails(tokenData, id);
    if (publisherApiDetails) {
      return successResponse(res, "Publisher created Successfully", {
        publisher,
      });
    } else {
      return successResponse(res, "Publisher created Successfully but failed to create token", {
        publisher,
      });
    }
    
  } catch (err) {
    log.error(err.message || err);
    next(err);
  }
}

async function show(req, res, next) {
  const id = req.params.id;
  try {
    const publisher = await PublisherService.findOnePublisher({
      id,
      deleted: false,
    });
    return successResponse(res, "Publisher get success!!", { publisher });
  } catch (err) {
    log.error(err.message || err);
    next(err);
  }
}

async function update(req, res, next) {
  const data = req.body;
  const id = req.params.id;
  try {
    const { error } = PublisherSchema.update.validate(data);
    if (error) {
      const errArray = [];
      error.details.forEach((err) => {
        errArray.push(err.message);
      });
      throw new Error(errArray);
    }
    // check for unique publisher name
    if (data.name) {
      const exists = await PublisherService.findOnePublisher(
        {
          id: { [Op.ne]: id },
          name: data.name,
        },
        { attr: ["id", "name", "deleted"] }
      );
      if (exists) {
        if (exists?.dataValues?.deleted) {
          throw new Error(
            `Archived Publisher with name ${data.name} already exists!!`
          );
        }
        throw new Error(`Publisher with name ${data.name} already exists!!`);
      }
    }
    // update targetings status too when changing publisher status
    const pubTargetings = await PublisherService.findPublisherTargetings({
      id,
    });
    if (data.status && data.status !== pubTargetings.status) {
      for (let i = 0; i < pubTargetings.targetings.length; i++) {
        const pt = pubTargetings.targetings[i];
        await TargetingService.updateTargeting(
          { id: pt.id },
          { publisher_id: id, is_active: data.status === "active" }
        );
      }
    }
    if (req.query.archive && req.query.archive === "false") {
      data.deleted = false;
      for (let i = 0; i < pubTargetings.targetings.length; i++) {
        const pt = pubTargetings.targetings[i];
        await TargetingService.updateTargeting(
          { id: pt.id },
          { publisher_id: id, deleted: false }
        );
      }
    }
    const publisher = await PublisherService.updatePublisher({ id }, data);
    log.info({ req, title, id }, `Publisher update success with id: ${id}!!`);
    return successResponse(res, "Publisher updated successfully!!", {
      publisher,
    });
  } catch (err) {
    log.error(err.message || err);
    next(err);
  }
}

async function bulkUpdate(req, res, next) {
  try {
    const queryParams = req.query;
    let targetingsParams = {};
    const key = Object.keys(queryParams);
    if (key.includes("status")) {
      delete Object.assign(targetingsParams, queryParams, {
        ["is_active"]: queryParams["status"] === "active",
      })["status"];
    } else {
      targetingsParams = queryParams;
    }
    const data = req.body.ids;
    if (data) {
      if (Array.isArray(data)) {
        for (let i = 0; i < data.length; i++) {
          await PublisherService.updatePublisher(
            { id: data[i] },
            { ...queryParams }
          );
          // update associated targetings also
          const pubTargetings = await PublisherService.findPublisherTargetings({
            id: data[i],
          });
          for (let j = 0; j < pubTargetings.targetings.length; j++) {
            const pt = pubTargetings.targetings[j];
            await TargetingService.updateTargeting(
              { id: pt.id },
              { publisher_id: data[i], ...targetingsParams }
            );
          }
        }
      } else {
        throw new Error("Invalid ids passed");
      }
    } else {
      throw new Error("Ids should be passed!!");
    }
    log.info({ req, title }, "Publisher bulk update success!!");
    return successResponse(res, "Bulk update publishers status success!!");
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
    const existing = await PublisherService.findOnePublisher(findParams, {
      attr: ["id"],
    });
    if (!existing) {
      return errorResponse(res, "Publisher not found!!", { status: 404 });
    }
    if (perm) {
      const destroyed = await PublisherService.destroyPublisher({ id });
      log.info(
        { req, title, id },
        `Publisher deleted permanently with id: ${id}!!`
      );
      return successResponse(
        res,
        `Publisher deleted permanently with id: ${id}`,
        destroyed
      );
    }
    const publisher = await PublisherService.deletePublisher({ id });
    log.info(
      { req, title, id },
      `Publisher archived successfully with id: ${id}`
    );
    return successResponse(
      res,
      `Publisher archived successfully with id: ${id}`,
      publisher
    );
  } catch (err) {
    log.error(err.message || err);
    next(err);
  }
}

async function bulkDestroy(req, res, next) {
  const ids = req.body.ids;
  let perm = false;
  try {
    if (ids) {
      if (ids === "all") {
        // delete all data
        // await PublisherService.deletePublisher({});
      } else if (Array.isArray(ids)) {
        if (req.query.permanent && req.query.permanent === "true") {
          perm = true;
          for (let i = 0; i < ids.length; i++) {
            await PublisherService.destroyPublisher({ id: ids[i] });
          }
        } else {
          for (let i = 0; i < ids.length; i++) {
            await PublisherService.deletePublisher({ id: ids[i] });
          }
        }
      } else {
        throw new Error("Ids should be of valid type");
      }
    } else {
      throw new Error("Need to pass ids to delete");
    }
    if (perm) {
      log.info({ req, title }, "Publishers bulk deleted permanently!!");
      return successResponse(res, "Publishers bulk deleted permanently!!");
    }
    log.info({ req, title }, "Publishers bulk archive success!!");
    return successResponse(res, "Publishers archived successfully");
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
  bulkUpdate,
  destroy,
  bulkDestroy,
};
