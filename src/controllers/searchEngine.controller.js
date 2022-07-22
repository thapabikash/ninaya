"use strict";

const {Op} = require("sequelize");
const SearchEngineSchema = require("../services/validationSchema/search_engine.schema");
const SearchEngineService = require("../services/datas/searchEngine.data");

//helpers
const {log} = require("../../helpers/logger");
const {pagination} = require("../../helpers/paginationHelper");
const {errorResponse, successResponse} = require("../../helpers/response");

const title = "Search Enginne"; // title while saving logs

/**
 * @description Get all search engines
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
        const searchEngines = await SearchEngineService.findAllSearchEngines(
            paginateData
        );
        return successResponse(res, 200, searchEngines);
    } catch (err) {
        log.error(err.message || err);
        next(err);
    }
}

async function add(req, res, next) {
    try {
        const data = req.body;
        const {error} = SearchEngineSchema.create.validate(data);
        if (error) {
            const errArray = [];
            error.details.forEach(err => {
                errArray.push(err.message);
            });
            throw new Error(errArray);
        }

        //check for unique search engine
        const exists = await SearchEngineService.findOneSearchEngine(
            {name: data.name},
            {attr: ["id", "name", "deleted"]}
        );

        if (exists) {
            if (exists?.dataValues?.deleted) {
                throw new Error(
                    `Archived Search Engine with name ${data.name} already exists`
                );
            }
            throw new Error(
                `Search Engine with name ${data.name} already exists`
            );
        }

        const searchEngine = await SearchEngineService.createSearchEngine(data);
        log.info(
            {
                req,
                title,
                id: searchEngine.id,
            },
            `Search Engine create with name ${searchEngine.name} and id ${searchEngine.id}`
        );

        return successResponse(res, `Search engine create successfully`, {
            searchEngine,
        });
    } catch (err) {
        log.error(err.message || err);
        next(err);
    }
}

async function show(req, res, next) {
    const id = req.params.id;
    try {
        const searchEngine = await SearchEngineService.findOneSearchEngine({
            id,
            deleted: false,
        });
        return successResponse(res, "Search engine get success!", {
            searchEngine,
        });
    } catch (err) {
        log.error(err.message || err);
        next(err);
    }
}

async function update(req, res, next) {
    try {
        const data = req.body;
        const id = req.params.id;
        const {error} = SearchEngineSchema.update.validate(data);
        if (error) {
            const errArray = [];
            error.details.forEach(err => {
                errArray.push(err.message);
            });
            throw new Error(errArray);
        }

        if (data.name) {
            //check for unique search engine
            const exists = await SearchEngineService.findOneSearchEngine(
                {id: {[Op.ne]: id}, name: data.name},
                {attr: ["id", "name", "deleted"]}
            );

            if (exists) {
                if (exists?.dataValues?.deleted) {
                    throw new Error(
                        `Archived Search Engine with name ${data.name} already exists`
                    );
                }
                throw new Error(
                    `Search Engine with name ${data.name} already exists`
                );
            }
        }

        if (req.query.archive && req.query.archive === "false") {
            data.deleted = false;
        }

        const searchEngine = await SearchEngineService.updateSearchEngine(
            {id},
            data
        );
        log.info(
            {req, title, id},
            `Search Engine update success with id ${id}`
        );
        return successResponse(res, "Search engine update success!", {
            searchEngine,
        });
    } catch (err) {
        log.error(err.message || err);
        next(err);
    }
}

async function destroy(req, res, next) {
    try {
        const id = req.params.id;
        let perm = false; //permanent delete
        let findParams = {id, deleted: false};

        if (req.query.permanent && req.query.permanent == "true") {
            perm = true;
            findParams = {id};
        }

        const existing = await SearchEngineService.findOneSearchEngine(
            findParams,
            {
                attr: ["id"],
            }
        );

        if (!existing) {
            return errorResponse(res, "Search Engine not found", {status: 404});
        }

        if (perm) {
            const destroyed = await SearchEngineService.destroySearchEngine({
                id,
            });
            log.info(
                {req, title, id},
                `Search Engine permanently deleted with id ${id}`
            );
            return successResponse(
                res,
                "Search engine permanently deleted!",
                destroyed
            );
        }

        const searchEngine = await SearchEngineService.deleteSearchEngine({id});
        log.info({req, title, id}, `Search Engine deleted with id ${id}`);
        return successResponse(
            res,
            `Search engine deleted successfully with id: ${id}!`,
            searchEngine
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
