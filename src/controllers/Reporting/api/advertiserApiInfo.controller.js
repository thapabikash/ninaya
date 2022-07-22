const {
    getAdvertiserApiInfo,
    getApiInfoById,
} = require("../../../services/datas/api/advertiserApiInfo.service");
const {log} = require("../../../../helpers/logger");
const {successResponse} = require("../../../../helpers/response");
const {pagination} = require("../../../../helpers/paginationHelper");
const sequelize = require("sequelize");
const {Op} = sequelize;
const models = require("../../../models/index");

async function executeWhereClause(query, params) {
    if (query.provider_id) {
        if (Array.isArray(query.provider_id)) {
            params.where.advertiser_id = {
                [Op.in]: query.provider_id,
            };
        } else {
            params.where.advertiser_id = query.provider_id;
        }
    }
    if (query.to) {
        const newTo = new Date(query.to);
        endDate = new Date(newTo.setDate(newTo.getDate() + 1));
    }
    if (query.from) {
        startDate = new Date(query.from);
        params.where.called_api_date = {[Op.gte]: startDate, [Op.lt]: endDate};
    }
    if (query.status) {
        params.where.uploaded_status = query.status;
    }
    return params.where;
}

async function getAdvertiserApiInfos(req, res, next) {
    try {
        const {page, size, order_by, order_direction} = req.query;
        let params = {
            where: {},
            include: [
                {
                    model: models.providers,
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

        const data = await getAdvertiserApiInfo(paginateData);
        return successResponse(res, "Get success!!", data);
    } catch (error) {
        log.error(error.message || error);
        next(error);
    }
}

async function getAdvertiserApiInfoByID(req, res, next) {
    try {
        const {id} = req.params;
        const data = await getApiInfoById({
            where: {id},
            include: [
                {
                    model: models.providers,
                },
            ],
        });
        return successResponse(res, "Details get success!!", data);
    } catch (error) {
        log.error(error.message || error);
        next(error);
    }
}

module.exports = {
    getAdvertiserApiInfos,
    getAdvertiserApiInfoByID,
};
