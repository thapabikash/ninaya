"use strict";

const {Op} = require("sequelize");
const TagTypeSchema = require("../services/validationSchema/tag_type.schema");
const TagTypeService = require("../services/datas/tagType.data");

//helpers
const {log} = require("../../helpers/logger");
const {pagination} = require("../../helpers/paginationHelper");
const {errorResponse, successResponse} = require("../../helpers/response");

const title = "Tag Type"; // title while saving logs

/**
 * @description Get all tag types
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
        const tagTypes = await TagTypeService.findAllTagTypes(paginateData);
        const finalData = {...tagTypes, currentPage: parseInt(page, 10) || 1};
        return successResponse(res, "Tag Types get success", finalData);
    } catch (err) {
        log.error(err.message || err);
        next(err);
    }
}

async function add(req, res, next) {
    try {
        const data = req.body;
        const {error} = TagTypeSchema.create.validate(data);

        if (error) {
            const errArray = [];
            error.details.map(err => {
                errArray.push(err.message);
            });
            throw new Error(errArray);
        }

        //check for unique tag type name
        const exists = await TagTypeService.findOneTagType(
            {name: data.name},
            {attr: ["id", "name", "deleted"]}
        );

        if (exists) {
            if (exists?.dataValues?.deleted) {
                throw new Error(
                    `Archived Tag Type with name ${data.name} already exists!!`
                );
            }
            throw new Error(`Tag Type with name ${data.name} already exists!!`);
        }

        const tagType = await TagTypeService.createTagType(data);
        log.info(
            {req, title, id: tagType.id},
            `Tag Type created with name ${tagType.name} and id ${tagType.id}`
        );

        return successResponse(res, "Tag Type created successfully", {tagType});
    } catch (err) {
        log.error(err.message || err);
        next(err);
    }
}

async function show(req, res, next) {
    try {
        const id = req.params.id;
        const tagType = await TagTypeService.findOneTagType({
            id,
            deleted: false,
        });
        return successResponse(res, "Tag Type get success", {tagType});
    } catch (err) {
        log.error(err.message || err);
        next(err);
    }
}

async function update(req, res, next) {
    try {
        const data = req.body;
        const id = req.params.id;
        const {error} = TagTypeSchema.update.validate(data);
        if (error) {
            const errArray = [];
            error.details.map(err => {
                errArray.push(err.message);
            });
            throw new Error(errArray);
        }

        if (data.name) {
            //check for unique tag type name
            const exists = await TagTypeService.findOneTagType(
                {name: data.name, id: {[Op.ne]: id}},
                {attr: ["id", "name", "deleted"]}
            );

            if (exists) {
                if (exists?.dataValues?.deleted) {
                    throw new Error(
                        `Archived Tag Type with name ${data.name} already exists!!`
                    );
                }
                throw new Error(
                    `Tag Type with name ${data.name} already exists!!`
                );
            }
        }

        if (req.query.archive && req.query.archive === "false") {
            data.deleted = false;
        }

        const tagType = await TagTypeService.updateTagType({id}, data);

        log.info(
            {req, title, id: tagType.id},
            `Tag Type updated with name ${tagType.name} and id ${tagType.id}`
        );

        return successResponse(res, "Tag Type updated successfully", {tagType});
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

        const existing = await TagTypeService.findOneTagType(findParams, {
            attr: ["id"],
        });

        if (!existing) {
            return errorResponse(res, "Tag Type not found", {status: 404});
        }

        if (perm) {
            const destroyed = await TagTypeService.destroyTagType({id});
            log.info(
                {req, title, id},
                `Tag Type permanently deleted with name ${existing.name} and id ${id}`
            );

            return successResponse(
                res,
                "Tag Type permanently deleted successfully",
                destroyed
            );
        }

        const tagType = await TagTypeService.deleteTagType({id});
        log.info({req, title, id}, `Tag Type deleted with id ${id}`);
        return successResponse(res, "Tag Type deleted successfully", tagType);
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
