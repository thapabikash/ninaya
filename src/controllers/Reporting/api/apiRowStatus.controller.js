const {pagination} = require("../../../../helpers/paginationHelper");
const {successResponse} = require("../../../../helpers/response");
const AdvertiserApiRowStatus = require("../../../services/datas/api/apiRowStatus.service");
const sequelize = require("sequelize");
const models = require("../../../models/index");
const {Op} = sequelize;

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
    if (query.q) {
        params.where.channel = {
            [Op.iLike]: `%${query.q}%`,
        };
    }
    if (query.status) {
        params.where.upload_status = query.status;
    }
    if(query.message){
        if(query.message==="Validation failed"){
            params.where.message = {
                [Op.notIn]:["uploaded","Missing publisher ad account"]
            }
        }else{
            params.where.message = query.message;  
        }
      
    }
    if (query.channel) {
        if (Array.isArray(query.channel)) {
            params.where.channel = {
                [Op.in]: query.channel,
            };
        } else {
            params.where.channel = query.channel;
        }
    }

    return params.where;
}

async function index(req, res, next) {
    try {
        const {page, size, order_by, order_direction} = req.query;
        let params = {
            where: {},
            include: [
                {
                    model: models.providers,
                    attributes: ["name", "id"],
                },
            ],
            group: [],
            order: [],
        };
        params.where = await executeWhereClause(req.query, params);
        if (order_by && order_direction) {
            let paramsGroupBy = req.query.group_by;

            if (order_by === "provider") {
                if (Array.isArray(paramsGroupBy)) {
                    paramsGroupBy.includes("advertiser_id") &&
                        params.order.push(["advertiser_id", order_direction]);
                } else {
                    params.order.push(["advertiser_id", order_direction]);
                }
            } else {
                if (Array.isArray(paramsGroupBy)) {
                    paramsGroupBy.includes(order_by) &&
                        params.order.push([order_by, order_direction]);
                } else {
                    params.order.push([order_by, order_direction]);
                }
            }
        }
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
        const rows = await AdvertiserApiRowStatus.findAll(paginateData);
        return successResponse(res, "Get success", rows);
    } catch (error) {
        next(error);
    }
}

module.exports = {
    index,
};
