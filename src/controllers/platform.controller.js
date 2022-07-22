"use strict";

const {Op} = require("sequelize");
const PlatformSchema = require("../services/validationSchema/platform.schema");
const PlatformService = require("../services/datas/platform.data");

//helpers
const {log} = require("../../helpers/logger");
const {pagination} = require("../../helpers/paginationHelper");
const {errorResponse, successResponse} = require("../../helpers/response");

const title = "Platform"; // title while saving logs

/**
 * @description Get all platforms
 */
async function index(req, res, next) {
    try {
        const {
            q,
            page,
            size,
            order_by,
            order_direction,
            archived,
            status,
        } = req.query;
        let order = [];
        let searchq = {deleted: false};

        if (order_by && order_direction) {
            order.push([order_by, order_direction]);
        }
        if (archived) {
            searchq = {...searchq, deleted: true};
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

        //implement pagination
        const paginateData = pagination(page, size, searchq, order);
        const platforms = await PlatformService.findAllPlatforms(paginateData);
        const finalData = {...platforms, currentPage: parseInt(page, 10) || 1};
        return successResponse(res, "Platforms get success!", finalData);
    } catch (err) {
        log.error(err.message || err);
        next(err);
    }
}

/**
 *
 * @param {#} req
 * @param {*} res
 * @param {*} next
 * @returns newly created platform
 */
async function add(req, res, next) {
    try {
        const data = req.body;
        const {error} = PlatformSchema.create.validate(data);
        if (error) {
            const errArray = [];
            error.details.forEach(function (err) {
                errArray.push(err.message);
            });
            throw new Error(errArray);
        }

        //check for unique platform name
        const exists = await PlatformService.findOnePlatform(
            {name: data.name},
            {attr: ["id", "name", "deleted"]}
        );

        if (exists) {
            if (exists?.dataValues?.deleted) {
                throw new Error(
                    `Archived Platform with name ${data.name} already exists!!`
                );
            }
            throw new Error(`Platform with name ${data.name} already exists!!`);
        }

        const platform = await PlatformService.createPlatform(data);
        log.info(
            {req, title, id: platform.id},
            `Platform created with name ${platform.name} and id ${platform.id}`
        );

        return successResponse(res, "Platform created successfully!", {
            platform,
        });
    } catch (err) {
        log.error(err.message || err);
        next(err);
    }
}

async function show(req, res, next) {
    const id = req.params.id;
    try {
        const platform = await PlatformService.findOnePlatform({
            id,
            deleted: false,
        });
        return successResponse(res, "Platform get success!", {platform});
    } catch (err) {
        log.error(err.message || err);
        next(err);
    }
}

async function update(req, res, next) {
    try {
        const data = req.body;
        const id = req.params.id;
        const {error} = PlatformSchema.update.validate(data);
        if (error) {
            const errArray = [];
            error.details.forEach(function (err) {
                errArray.push(err.message);
            });
            throw new Error(errArray);
        }

        if (data.name) {
            //check for unique platform name
            const exists = await PlatformService.findOnePlatform(
                {id: {[Op.ne]: id}, name: data.name},
                {attr: ["id", "name", "deleted"]}
            );

            if (exists) {
                if (exists?.dataValues?.deleted) {
                    throw new Error(
                        `Archived Platform with name ${data.name} already exists!!`
                    );
                }
                throw new Error(
                    `Platform with name ${data.name} already exists!!`
                );
            }
        }

        if (req.query.archive && req.query.archive === "false") {
            data.deleted = false;
        }

        const platform = await PlatformService.updatePlatform({id}, data);
        log.info({req, title, id}, `Platform update success with id: ${id}`);
        return successResponse(res, "Platform update success!", {platform});
    } catch (err) {
        log.error(err.message || err);
        next(err);
    }
}

async function destroy(req, res, next) {
    try {
        const id = req.params.id;
        let perm = false; //permanent delete status check
        let findParams = {id, deleted: false};
        if (req.query.permanent && req.query.permanent === "true") {
            perm = true;
            findParams = {id};
        }

        const existing = await PlatformService.findOnePlatform(findParams, {
            attr: ["id"],
        });

        if (!existing) {
            return errorResponse(res, "Platform not found!", {status: 400});
        }

        if (perm) {
            const destroyed = await PlatformService.destroyPlatform({id});
            log.info(
                {req, title, id},
                `Platform permanently deleted with id: ${id}`
            );
            return successResponse(
                res,
                `Platform deleted permanently with id: ${id}`,
                destroyed
            );
        }

        const platform = await PlatformService.deletePlatform({id});
        log.info(
            {req, title, id},
            `Platform archived successfully with id: ${id}`
        );
        return successResponse(
            res,
            `Platform archived successfully with id: ${id}`,
            platform
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
    update,
    destroy,
};
