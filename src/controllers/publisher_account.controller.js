const publisherAccountService = require("../services/datas/publisiherAccount.data");
const {errorResponse, successResponse} = require("../../helpers/response");
const {pagination} = require("../../helpers/paginationHelper");
const sequelize = require("sequelize");
const {Op} = sequelize;
const models = require("../models/index");
/**
 * index: controller to get list of users
 * @param {*} req request object
 * @param {*} res response object
 * @param {*} next next function
 */

async function executeWhereClause(query, params) {
    if (query.provider_id) {
        if (Array.isArray(query.provider_id)) {
            params.where.provider_id = {
                [Op.in]: query.provider_id,
            };
        } else {
            params.where.provider_id = query.provider_id;
        }
    }
    if (query.publisher_id) {
        if (Array.isArray(query.publisher_id)) {
            params.where.publisher_id = {
                [Op.in]: query.publisher_id,
            };
        } else {
            params.where.publisher_id = query.publisher_id;
        }
    }

    if (query.tid) {
        if (Array.isArray(query.tid)) {
            params.where.tid = {
                [Op.in]: query.tid,
            };
        } else {
            params.where.tid = query.tid;
        }
    }

    if (query.link_id) {
        if (Array.isArray(query.link_id)) {
            params.where.link_id = {
                [Op.in]: query.link_id,
            };
        } else {
            params.where.link_id = query.link_id;
        }
    }

    if (query.sin) {
        if (Array.isArray(query.sin)) {
            params.where.sin = {
                [Op.in]: query.sin,
            };
        } else {
            params.where.sin = query.sin;
        }
    }

    if (query.rule_id) {
        if (Array.isArray(query.rule_id)) {
            params.where.rule_id = {
                [Op.in]: query.rule_id,
            };
        } else {
            params.where.rule_id = query.rule_id;
        }
    }

    if (query.status) {
        params.where.status = query.status;
    }
    if (query.q) {
        params.where.sin = {
            [Op.iLike]: `%${query.q}%`,
        };
    }

    return params.where;
}

async function index(req, res, next) {
    const {q, page, size, order_by, order_direction} = req.query;

    try {
        let params = {
            where: {},
            include: [
                {
                    model: models.publishers,
                    attributes: ["id", "name"],
                },
                {
                    model: models.providers,
                    attributes: ["id", "name"],
                },
                {
                    model: models.targetings,
                    attributes: ["id"],
                },
            ],
            attributes: {
                exclude: ["createdAt", "updatedAt"],
            },
            group: [],
            order: [],
        };

        // for where clause
        params.where = await executeWhereClause(req.query, params);

        // for order
        if (order_by && order_direction) {
            let paramsGroupBy = req.query.group_by;
            if (Array.isArray(paramsGroupBy)) {
                paramsGroupBy.includes(order_by) &&
                    params.order.push([order_by, order_direction]);
            } else {
                params.order.push([order_by, order_direction]);
            }
        }

        //for pagination
        let paginateData = {};
        if (page === "all") {
            paginateData = params;
        } else {
            paginateData = pagination(
                page,
                size,
                params.where,
                params.order,
                params.attributes,
                params.group,
                params.include
            );
        }

        const accounts = await publisherAccountService.findAllMappers(
            paginateData
        );
        return successResponse(
            res,
            "Publisher Account get success!!",
            accounts
        );
    } catch (err) {
        next(err);
    }
}

async function getAccountByTargetingId(req, res, next) {
    const publisher_id = req.params.pid;
    const tid = req.params.tid;
    const rule_id = req.params.rid;
    try {
        const accounts = await publisherAccountService.findAccountByTargeting({
            publisher_id,
            tid,
            rule_id,
        });
        return successResponse(
            res,
            "Publisher Account get success!!",
            accounts
        );
    } catch (error) {
        next(error);
    }
}

async function findAccountById(req, res, next) {
    const {id} = req.params;
    try {
        const accounts = await publisherAccountService.findAccountsById(id);
        return successResponse(
            res,
            "Publisher Account get success!!",
            accounts
        );
    } catch (error) {
        next(error);
    }
}

async function updateAccount(req, res, next) {
    const {id} = req.params;
    const data = req.body;
    try {
        const accounts = await publisherAccountService.updatePublisherAccount(
            id,
            data
        );
        return successResponse(
            res,
            "Publisher account updated successfully!!",
            accounts
        );
    } catch (error) {
        next(error);
    }
}

async function verifyPubAccounts(req, res, next) {
    const linkIds = req.body.linkIds;
    try {
        const accounts =
            await publisherAccountService.verifyIsAccountExistWithLinkIdSubId(
                linkIds
            );
        return successResponse(res, "Existing publisher ad accounts", accounts);
    } catch (error) {
        next(error);
    }
}

module.exports = {
    index,
    getAccountByTargetingId,
    findAccountById,
    updateAccount,
    verifyPubAccounts,
};
