const ReportingData = require("../../services/datas/reporting.data");
const {pagination} = require("../../../helpers/paginationHelper");
const {successResponse} = require("../../../helpers/response");
const sequelize = require("sequelize");
const models = require("../../models/index");
const {Op} = sequelize;

async function executeWhereClause(query, params) {
    let endDate = new Date();
    let startDate;
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
    if (query.channel) {
        if (Array.isArray(query.channel)) {
            params.where.channel = {
                [Op.in]: query.channel,
            };
        } else {
            params.where.channel = query.channel;
        }
    }
    if (query.file) {
        if (Array.isArray(query.file)) {
            params.where.csvfile = {
                [Op.in]: query.file,
            };
        } else {
            params.where.csvfile = query.file;
        }
    }
    if (query.message) {
        if (query.message === "Validation failed") {
            params.where.message = {
                [Op.notIn]: ["uploaded", "Missing publisher ad account"],
            };
        } else {
            params.where.message = query.message;
        }
    }
    if (query.to) {
        const newTo = new Date(query.to);
        endDate = new Date(newTo.setDate(newTo.getDate() + 1));
    }
    if (query.from) {
        startDate = new Date(query.from);
        params.where.createdAt = {
            [Op.gte]: startDate,
            [Op.lt]: endDate,
        };
    }
    // if (!query?.from && !query?.to) {
    //     const todayDate = new Date().setHours(0, 0, 0, 0);
    //     const NOW = new Date();
    //     params.where.createdAt = {
    //         [Op.gt]: todayDate,
    //         [Op.lt]: NOW,
    //     };
    // }
    if (query.date) {
        const today = new Date(query.date);
        params.where.createdAt = {
            [Op.gte]: new Date(query.date),
            [Op.lt]: new Date(today.setDate(today.getDate() + 1)),
        };
    }

    return params.where;
}

//http://localhost:8080/skippedrows?page=1&size=5&advertiser_id=2&advertiser_id=1&file=1642586460743_test2.csv&channel=4202&channel=4132&status=false

async function fetchAllSkippedRows(req, res, next) {
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
        let csvUploadStatus = null;
        if (
            req.query.provider_id &&
            req.query.file &&
            !Array.isArray(req.query.provider_id) &&
            !Array.isArray(req.query.file)
        ) {
            let provider = req.query.provider_id;
            let filename = req.query.file;
            let where = {
                advertiser_id: provider,
                csv_name: filename,
            };
            csvUploadStatus = await ReportingData.checkCSVuploadStatus(where);
        }
        const skippedRows = await ReportingData.fetchAllSkippedRows(
            paginateData
        );
        return successResponse(res, "Fetching skipped rows success", {
            skippedRows,
            csvUploadStatus,
        });
    } catch (err) {
        next(err);
    }
}

async function fetchSkippedRowsById(req, res, next) {
    try {
        const skippedRows = await ReportingData.fetchSkippedReportsById({
            id: req.params.id,
        });
        return successResponse(res, "Fetching skipped rows by ID success", {
            skippedRows,
        });
    } catch (err) {
        next(err);
    }
    mo;
}

async function fetchfilesByAdvertiser(req, res, next) {
    try {
        let whereClause = {
            where: {},
            attributes: [["csv_name", "csvfile"]],
            group: ["csvfile"],
        };
        const {provider_id} = req.query;
        if (provider_id) {
            if (Array.isArray(provider_id)) {
                whereClause.where.advertiser_id = {
                    [Op.in]: provider_id,
                };
            } else {
                whereClause.where.advertiser_id = provider_id;
            }
        }
        whereClause.where.uploaded_status = {
            [Op.notIn]: ["Processing", "Failed", "Constant"],
        };
        const files = await ReportingData.fetchCSVfiles(whereClause);
        return successResponse(res, "Fetching csv files", {
            files,
        });
    } catch (err) {
        next(err);
    }
}

async function executeWhereClauseForAllStatus(query, params) {
    let endDate = new Date();
    let startDate;
    if (query.provider_id) {
        if (Array.isArray(query.provider_id)) {
            params.where.advertiser_id = {
                [Op.in]: query.provider_id,
            };
        } else {
            params.where.advertiser_id = query.provider_id;
        }
    }
    if (query.status) {
        params.where.uploaded_status = query.status;
    }

    if (query.file) {
        if (Array.isArray(query.file)) {
            params.where.csv_name = {
                [Op.in]: query.file,
            };
        } else {
            params.where.csv_name = query.file;
        }
    }
    if (query.to) {
        const newTo = new Date(query.to);
        endDate = new Date(newTo.setDate(newTo.getDate() + 1));
    }
    if (query.from) {
        startDate = new Date(query.from);
        params.where.createdAt = {
            [Op.gte]: startDate,
            [Op.lt]: endDate,
        };
    }
    if (query.date) {
        const today = new Date(query.date);
        params.where.createdAt = {
            [Op.gte]: new Date(query.date),
            [Op.lt]: new Date(today.setDate(today.getDate() + 1)),
        };
    }

    return params.where;
}

async function fetchAllRevenueReportUploadStatus(req, res, next) {
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
        params.where = await executeWhereClauseForAllStatus(req.query, params);
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
        const skippedRows = await ReportingData.fetchAllUploadCsvStatus(
            paginateData
        );
        return successResponse(
            res,
            "Fetching skipped rows success",
            skippedRows
        );
    } catch (error) {
        console.log(error);
        next(error);
    }
}

// http://localhost:8080/upload/csvstatus?csv_status_id=1&csv_status_id=2
async function fetchCSVuploadStatus(req, res, next) {
    const {csv_status_id, csv_name} = req.query;
    let where = {};
    try {
        where.id = csv_status_id;
        where.csv_name = csv_name;
        const updated = await ReportingData.checkCSVuploadStatus(where);
        return successResponse(res, "CSVs status info", updated);
    } catch (error) {
        next(error);
    }
}

module.exports = {
    fetchAllSkippedRows,
    fetchSkippedRowsById,
    fetchfilesByAdvertiser,
    fetchAllRevenueReportUploadStatus,
    fetchCSVuploadStatus,
};
