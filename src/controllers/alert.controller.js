const {successResponse} = require("../../helpers/response");
const {log} = require("../../helpers/logger");
const {pagination} = require("../../helpers/paginationHelper");
const AlertService = require("../services/datas/alert.data");
const moment = require("moment");
const title = "Alert Save";

//alert constant variables
const {
    PERCENTAGE_AGG_ALERT,
    ZERO_HITS_CURRENT_HOUR_ALERT,
    DEFAULT_ALERT,
    ADVERTISER_API_UPLOAD_ALERT,
    CSV_UPLOAD_ALERT,
} = require("../../helpers/constants/alert/alertType");

async function index(req, res, next) {
    try {
        const {page, size, order_by, order_direction, type, subject, from, to} =
            req.query;
        let endDate = new Date();
        let startDate;
        let order = [];
        let searchq = {};

        if (type) {
            searchq["type"] = type;
        }
        if (subject) {
            searchq["subject"] = subject;
        }

        if (to) {
            const newTo = new Date(to);
            endDate = new Date(newTo.setDate(newTo.getDate() + 1));
        }
        if (from) {
            startDate = new Date(from);
            searchq = {
                ...searchq,
                alerted_at: {
                    [Op.gte]: startDate,
                    [Op.lt]: endDate,
                },
            };
        }
        if (!from && !to) {
            const todayDate = new Date().setHours(0, 0, 0, 0);
            const NOW = new Date();
            searchq = {
                ...searchq,
                alerted_at: {
                    [Op.gt]: todayDate,
                    [Op.lt]: NOW,
                },
            };
        }
        if (req.query.date) {
            const today = new Date(req.query.date);

            searchq = {
                ...searchq,
                alerted_at: {
                    [Op.gte]: new Date(req.query.date),
                    [Op.lt]: new Date(today.setDate(today.getDate() + 1)),
                },
            };
        }

        if (order_by && order_direction) {
            order.push([order_by, order_direction]);
        }
        const paginateData = pagination(page, size, searchq, order);
        const alerts = await AlertService.findAllAlerts(paginateData);
        if (alerts) {
            return successResponse(res, "Alerts get success!", finalData);
        } else {
            throw new Error("Alerts get failed!");
        }
    } catch (error) {
        log.error(err.message || err);
        next(err);
    }
}

async function createAlerts(alerts = {}) {
    try {
        //they are comman for all alert
        let alertSchema = {};
        alertSchema["alerted_at"] = moment()
            .utc()
            .format("YYYY-MM-DD HH:mm:ss");
        alertSchema["is_Alerted"] = true;
        alertSchema["type"] = alerts?.type || DEFAULT_ALERT;
        alertSchema["subject"] = alerts?.subject || DEFAULT_ALERT;
        alertSchema["message"] = alerts?.message || "";
        alertSchema["data"] = {};

        if (alerts.type === ZERO_HITS_CURRENT_HOUR_ALERT) {
            alertSchema["data"] = {
                data: alerts?.response,
            };
        }
        if (alerts.type === PERCENTAGE_AGG_ALERT) {
            alertSchema["data"] = {
                data: alerts?.response,
            };
        }
        if (
            alerts.type === CSV_UPLOAD_ALERT ||
            alerts.type === ADVERTISER_API_UPLOAD_ALERT
        ) {
            alertSchema["data"] = {
                data: alerts?.response,
                advertiser_id: alerts?.advertiser_id,
            };
        }

        const isSaved = await AlertService.create(alertSchema);
        if (isSaved) {
            log.info({title}, "Alert created successfully!");
        } else {
            throw new Error("Alert create failed!");
        }
    } catch (error) {
        console.log("error", error);
        log.error(error.message);
    }
}

module.exports = {
    index,
    createAlerts,
};
