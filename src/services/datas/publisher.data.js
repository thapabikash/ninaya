"use strict";
const Sequelize = require("sequelize");
const models = require("../../models/index");
const Publisher = models.publishers;

const TargetingService = require("./targeting.data");

/***
 *
 * @param params
 * @returns {Promise.<*>}
 */

async function findAllPublishers(options = {}) {
  const includeQuery = {
    attributes: {
      include: [
        [
          Sequelize.fn("COUNT", Sequelize.col("targetings.publisher_id")),
          "no_of_targetings",
        ],
      ],
    },
    include: [
      {
        model: models.targetings,
        attributes: [],
      },
    ],
    group: ["publishers.id"],
    subQuery: false,
    ...options,
  };
  const { count, rows } = await Publisher.findAndCountAll(includeQuery);
  const total = count.length || count;
  return {
    total,
    publishers: rows,
    limit: options.limit,
    pageCount: Math.ceil(total / options.limit),
  };
}

/**
 *
 * @param {*} publisherParams
 * @returns {Promise.<*>}
 */
async function createPublisher(publisherParams) {
  const createdPublisher = await Publisher.create(publisherParams);
  return createdPublisher;
}

/**
 *
 * @param {*} params
 * @returns {Promise.<*>}
 */
async function findOnePublisher(params, options = {}) {
  let includeQuery = {
    where: params,
    attributes: {
      include: [
        [
          Sequelize.fn("COUNT", Sequelize.col("targetings.publisher_id")),
          "no_of_targetings",
        ],
      ],
    },
    include: [
      {
        model: models.targetings,
        attributes: [],
      },
    ],
    group: ["publishers.id"],
    subQuery: false,
  };
  if (options.attr) {
    includeQuery.attributes = options.attr;
  }
  const publisher = await Publisher.findOne(includeQuery);
  return publisher;
}

/**
 *
 * @param {*} params params to check for update
 * @param {*} data data to ipdate
 * @returns {Promise.<*>}
 */
async function updatePublisher(params = {}, data) {
  // check if publisher exists
  const publisher = await Publisher.findByPk(params.id, {
    where: { deleted: false },
  });
  if (!publisher) {
    throw new Error("Publisher not found!!");
  }
  const updatedPublisher = await Publisher.update(data, { where: params });
  return updatedPublisher;
}

/**
 *
 * for all data to update
 * @param params
 * @returns {Promise.<*>}
 */
async function bulkUpdateStatus(params = {}, data) {
  return await Publisher.update(data, { where: params });
}
/**
 *
 * @param params
 * @returns {Promise.<*>}
 */
async function deletePublisher(params = {}) {
  // update asssociated targetings
  const pubTargetings = await findPublisherTargetings(params);
  for (let i = 0; i < pubTargetings.targetings.length; i++) {
    const pt = pubTargetings.targetings[i];
    await TargetingService.deleteTargeting({ id: pt.id });
  }
  const destroyed = await Publisher.update(
    { deleted: true },
    { where: params }
  );
  return destroyed;
}

/**
 *
 * @param params
 * @returns {Promise.<*>}
 */
async function findPublisherTargetings(params) {
  const publisher = await Publisher.findOne({
    where: params,
    attributes: ["status"],
    include: [
      {
        model: models.targetings,
        attributes: ["id"],
      },
    ],
  });
  return publisher;
}

/**
 *
 * @param params
 * @returns {Promise.<*>}
 */
async function destroyPublisher(params) {
  const publisher = await Publisher.findByPk(params.id);
  if (!publisher) {
    throw new Error("publisher not found");
  }
  // destroy associated foreign rows too
  const pubTargetings = await findPublisherTargetings(params);
  //  delete associated targetings
  for (let i = 0; i < pubTargetings.targetings.length; i++) {
    const pt = pubTargetings.targetings[i];
    await TargetingService.destroyTargeting({ id: pt.id });
  }
  const destroyed = await Publisher.destroy({ where: params });
  return destroyed;
}

module.exports = {
  findAllPublishers,
  createPublisher,
  findOnePublisher,
  findPublisherTargetings,
  updatePublisher,
  bulkUpdateStatus,
  deletePublisher,
  destroyPublisher,
};
