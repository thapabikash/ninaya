"use strict";

const sequelize = require("sequelize");
const {Op} = sequelize;
const fs = require("fs");
const LogService = require("../services/datas/logInfo.data");
// helpers
const {log} = require("../../helpers/logger");
const {pagination} = require("../../helpers/paginationHelper");
const {successResponse} = require("../../helpers/response");
const getCurrentDate = require("../../helpers/getCurrentDate");
const models = require("../models/index");
const {createJob} = require("../../helpers/queue/workers/searchLogs.worker");
const moment = require("moment");
const redisClient = require("../../helpers/redis");

const title = "LogInfo";

/**
 *
 * @param {*} group_by values to group by
 * @param {*} group array of group values that will be used by sequelize query option
 * @param {*} attributes array of attributes that will be used by sequelize query option
 * @param {*} include include array for any values from relation table to be added in sequelize query
 */
function handleLogsGroupBy(
    group_by,
    group,
    attributes,
    include,
    order_by,
    order_direction
) {
    //multiple values for group by
    if (Array.isArray(group_by)) {
        group_by.forEach(value => {
            if (value === "country") {
                group.push(sequelize.literal("geo->>'country'"));
                attributes.push([
                    sequelize.literal("geo->>'country'"),
                    "country",
                ]);
            } else if (value === "provider_id") {
                group.push("provider.id");
                include.push({
                    model: models.providers,
                    attributes: ["id", "name"],
                });
                group.push("log_infos.provider_id");
                attributes.push("provider_id");
            } else if (value === "pid") {
                group.push("publisher.id");
                include.push({
                    model: models.publishers,
                    attributes: ["id", "name"],
                });
                group.push(value);
                attributes.push(value);
            } else if (value === "link_id") {
                group.push("provider_link.id");
                include.push({
                    model: models.provider_links,
                    attributes: ["id", "link"],
                });
                group.push(value);
                attributes.push(value);
            } else {
                group.push(value);
                attributes.push(value);
            }
        });
        return {group, attributes, include};
    }

    //single value for group by
    if (group_by === "country") {
        group.push(sequelize.literal("geo->>'country'"));
        attributes.push([sequelize.literal("geo->>'country'"), "country"]);
    } else if (group_by === "provider_id") {
        group.push("provider.id");
        include.push({
            model: models.providers,
            attributes: ["id", "name"],
        });
        group.push(group_by);
        attributes.push(group_by);
    } else if (group_by === "pid") {
        group.push("publisher.id");
        include.push({
            model: models.publishers,
            attributes: ["id", "name"],
        });
        group.push(group_by);
        attributes.push(group_by);
    } else if (group_by === "link_id") {
        group.push("provider_link.id");
        include.push({
            model: models.provider_links,
            attributes: ["id", "link"],
        });
        group.push(group_by);
        attributes.push(group_by);
    } else {
        group.push(group_by);
        attributes.push(group_by);
    }

    return {group, attributes, include};
}
/**
 * @param {*} req request object
 * @param {*} res response object
 * @param {*} next next function
 */
async function index(req, res, next) {
    try {
        let keyString = "";
        for (let q in req.query) {
            keyString = `${keyString}-${req.query[q]}`;
        }
        let cacheData = await redisClient.get(keyString);
        if (cacheData) {
            return successResponse(
                res,
                "Logs info get success cached!!",
                cacheData
            );
        } else {
            await createJob(req, res, next, fetchSearchLogs);
        }
    } catch (err) {
        log.error(err.message || err);
        next(err);
    }
}

async function fetchSearchLogs(req, next) {
    try {
        const {q, page, size, order_by, order_direction, interval} = req.query;
        let order = [];
        let group = [];
        let include = [];
        let searchq = {};
        let startDate = new Date();
        startDate = startDate.setHours(startDate.getHours() - 48);
        let endDate = new Date();
        let daily = false;
        let attributes = [];
        let filtersApplied = false;
        //filters
        if (interval && interval !== "accumulated") {
            filtersApplied = true;
            group.push(
                sequelize.fn(
                    "date_trunc",
                    interval,
                    sequelize.col("request_at")
                )
            );
            attributes.push([
                sequelize.fn(
                    "date_trunc",
                    interval,
                    sequelize.col("request_at")
                ),
                "request_at",
            ]);
        }
        // group by
        if (req.query.group_by) {
            filtersApplied = true;
            const groupByHandler = handleLogsGroupBy(
                req.query.group_by,
                group,
                attributes,
                include,
                order_by,
                order_direction
            );
            group = groupByHandler.group;
            attributes = groupByHandler.attributes;
            include = groupByHandler.include;
        }

        if (order_by && order_direction) {
            let paramsGroupBy = req.query.group_by;
            if (order_by === "country") {
                if (Array.isArray(paramsGroupBy)) {
                    paramsGroupBy.includes("country") &&
                        order.push([
                            sequelize.literal("geo->>'country'"),
                            order_direction,
                        ]);
                } else {
                    paramsGroupBy === "country" &&
                        order.push([
                            sequelize.literal("geo->>'country'"),
                            order_direction,
                        ]);
                }
            } else if (order_by === "request_at") {
                if (interval && interval !== "accumulated") {
                    order.push([
                        sequelize.fn(
                            "date_trunc",
                            interval,
                            sequelize.col("request_at")
                        ),
                        order_direction,
                    ]);
                }
            } else if (order_by === "total_searches") {
                order.push([
                    sequelize.fn("count", sequelize.col("q")),
                    order_direction,
                ]);
            } else if (order_by === "unique_ip") {
                order.push([
                    sequelize.literal("COUNT(DISTINCT(ip_address))"),
                    order_direction,
                ]);
            } else if (order_by === "publisher" || order_by === "pid") {
                if (Array.isArray(paramsGroupBy)) {
                    paramsGroupBy.includes("pid") &&
                        order.push(["pid", order_direction]);
                } else {
                    paramsGroupBy === "pid" &&
                        order.push(["pid", order_direction]);
                }
            } else {
                if (Array.isArray(paramsGroupBy)) {
                    paramsGroupBy.includes(order_by) &&
                        order.push([order_by, order_direction]);
                } else {
                    paramsGroupBy === order_by &&
                        order.push([order_by, order_direction]);
                }
            }
        }

        if (q) {
            filtersApplied = true;
            searchq = {...searchq, q: {[Op.iLike]: `%${q}%`}};
        }
        if (req.query.ip_address) {
            filtersApplied = true;
            searchq = {
                ...searchq,
                ip_address: {[Op.iLike]: `%${req.query.ip_address}%`},
            };
        }
        //filter for device info or platforms
        if (req.query.device_info) {
            filtersApplied = true;
            if (Array.isArray(req.query.device_info)) {
                searchq = {
                    ...searchq,
                    device_info: {[Op.in]: req.query.device_info},
                };
            } else {
                searchq = {
                    ...searchq,
                    device_info: req.query.device_info,
                };
            }
        }
        //filters for browser
        if (req.query.browser_info) {
            filtersApplied = true;
            if (Array.isArray(req.query.browser_info)) {
                let browsers = [];
                req.query.browser_info.forEach(browser => {
                    browsers.push({[Op.iLike]: `%${browser}%`});
                });
                searchq = {
                    ...searchq,
                    browser_info: {
                        [Op.or]: browsers,
                    },
                };
            } else {
                searchq = {
                    ...searchq,
                    browser_info: {[Op.iLike]: `%${req.query.browser_info}%`},
                };
            }
        }

        //filters for os info
        if (req.query.os_info) {
            filtersApplied = true;
            if (Array.isArray(req.query.os_info)) {
                let all_os = [];
                req.query.os_info.forEach(os_name => {
                    all_os.push({[Op.iLike]: `%${os_name}%`});
                });
                searchq = {
                    ...searchq,
                    os_info: {
                        [Op.or]: all_os,
                    },
                };
            } else {
                searchq = {
                    ...searchq,
                    os_info: {[Op.iLike]: `%${req.query.os_info}%`},
                };
            }
        }

        if (req.query.country) {
            filtersApplied = true;
            if (Array.isArray(req.query.country)) {
                searchq = {
                    ...searchq,
                    "geo.country": {[Op.in]: req.query.country},
                };
            } else {
                searchq = {...searchq, "geo.country": req.query.country};
            }
        }
        if (req.query.rule) {
            filtersApplied = true;
            if (Array.isArray(req.query.rule)) {
                searchq = {...searchq, rule_id: {[Op.in]: req.query.rule}};
            } else {
                searchq = {...searchq, rule_id: req.query.rule};
            }
        }
        if (req.query.pid) {
            //publisher
            filtersApplied = true;
            if (Array.isArray(req.query.pid)) {
                searchq = {...searchq, pid: {[Op.in]: req.query.pid}};
            } else {
                searchq = {...searchq, pid: req.query.pid};
            }
        }
        if (req.query.cid) {
            // tag id
            filtersApplied = true;
            if (Array.isArray(req.query.cid)) {
                searchq = {...searchq, cid: {[Op.in]: req.query.cid}};
            } else {
                searchq = {...searchq, cid: req.query.cid};
            }
        }
        if (req.query.rule_id) {
            // from target engine
            filtersApplied = true;
            daily = true;
            const today = getCurrentDate();
            const d = new Date(today);
            const da = new Date(d.setDate(d.getDate() + 1));
            searchq = {
                ...searchq,
                rule_id: {[Op.ne]: null},
                request_at: {
                    [Op.gte]: new Date(today),
                    [Op.lt]: da,
                },
            };
        }
        if (req.query.provider_id) {
            filtersApplied = true;
            if (Array.isArray(req.query.provider_id)) {
                searchq = {
                    ...searchq,
                    provider_id: {[Op.in]: req.query.provider_id},
                };
            } else {
                searchq = {...searchq, provider_id: req.query.provider_id};
            }
        }
        if (req.query.link_id) {
            filtersApplied = true;
            if (Array.isArray(req.query.link_id)) {
                searchq = {...searchq, link_id: {[Op.in]: req.query.link_id}};
            } else {
                searchq = {...searchq, link_id: req.query.link_id};
            }
        }
        if (req.query.to) {
            filtersApplied = true;
            const newTo = new Date(req.query.to);
            endDate = new Date(newTo.setDate(newTo.getDate() + 1));
        }
        if (req.query.from) {
            filtersApplied = true;
            startDate = new Date(req.query.from);
            searchq = {
                ...searchq,
                request_at: {[Op.gte]: startDate, [Op.lt]: endDate},
            };
        } else {
            if (!daily) {
                searchq = {
                    ...searchq,
                    request_at: {
                        [Op.gte]: startDate,
                        [Op.lt]: endDate,
                    },
                };
            }
        }

        attributes.push([
            sequelize.literal("COUNT(DISTINCT(ip_address))"),
            "unique_ip",
        ]);
        attributes.push([
            sequelize.fn("count", sequelize.col("q")),
            "total_searches",
        ]);

        // implement pagination for default logs
        const paginateData =
            req.query.pagination === "false"
                ? {where: searchq, attributes, group}
                : pagination(
                      page,
                      size,
                      searchq,
                      order,
                      attributes,
                      group,
                      include
                  );

        let finalData = {}; // data to be sent

        if (!filtersApplied) {
            // implement pagination for logs from month to date
            var date = new Date();
            var firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
            let endDates = moment().utc().format();
            let startDates = moment.utc(startDate).format();
            let dates = moment.utc(date).format();
            let firstDays = moment.utc(firstDay).format();
            let logs = await LogService.findLogsMonthToDate({
                date: endDates,
                firstDay: startDates,
            });

            const monthToDateLogs = await LogService.findLogsMonthToDate({
                date: dates,
                firstDay: firstDays,
            });

            finalData = {
                logs: logs,
                monthToDate: monthToDateLogs,
                currentPage: parseInt(page, 10) || 1,
            };
        } else {
            let logs = await LogService.findAllLogInfos(paginateData);
            finalData = {
                ...logs,
                currentPage: parseInt(page, 10) || 1,
            };
        }

        return finalData;
    } catch (err) {
        console.log(err);
        log.error(err.message || err);
        next(err);
    }
}

async function getSystemLogs(req, res, next) {
    const {q, page, size, from, to, order_by, order_direction} = req.query;
    let endDate = new Date();
    let startDate;
    let searchq;
    let order = [];
    try {
        if (order_by && order_direction) {
            order.push([order_by, order_direction]);
        } else {
            order.push(["time", "DESC"]);
        }
        if (to) {
            const newTo = new Date(to);
            endDate = new Date(newTo.setDate(newTo.getDate() + 1));
        }
        if (from) {
            startDate = new Date(from);
            searchq = {
                ...searchq,
                time: {[Op.gte]: startDate, [Op.lt]: endDate},
            };
        }
        if (q) {
            searchq = {...searchq, msg: {[Op.iLike]: `%${q}%`}};
        }
        if (req.query.date) {
            const today = new Date(req.query.date);

            searchq = {
                ...searchq,
                time: {
                    [Op.gte]: new Date(req.query.date),
                    [Op.lt]: new Date(today.setDate(today.getDate() + 1)),
                },
            };
        }

        // implement pagination
        const paginateData = pagination(page, size, searchq, order);
        const systemLogs = await LogService.getAllSystemLogs(paginateData);
        const finalData = {...systemLogs, currentPage: parseInt(page, 10) || 1};
        return successResponse(res, "All system logs get success!!", finalData);
    } catch (err) {
        log.error(err.message || err);
        next(err);
    }
}

async function add(req, res, next) {
    let data = req.body;
    try {
        const addedLog = await LogService.addLogInfo(data);
        log.info(
            {req, title, id: addedLog.id},
            `Log add success with id:${addedLog.id}!!`
        );
        return successResponse(res, "Logs added successfully!!", addedLog);
    } catch (err) {
        log.error(err.message || err);
        next(err);
    }
}

async function logInfoDownload(req, res, next) {
    const fileType = req.params.fileType;
    const {q, page, size, order_by, order_direction, interval} = req.query;
    let order = [];
    let group = [];
    let include = [];
    let searchq = {};
    let startDate = new Date();
    startDate = startDate.setHours(startDate.getHours() - 48);
    let endDate = new Date();
    let daily = false;
    let attributes = [];
    // let group = ["ip_address"];
    try {
        //filters
        if (interval && interval !== "accumulated") {
            group.push(
                sequelize.fn(
                    "date_trunc",
                    interval,
                    sequelize.col("request_at")
                )
            );
            attributes.push([
                sequelize.fn(
                    "date_trunc",
                    interval,
                    sequelize.col("request_at")
                ),
                "request_at",
            ]);
        }
        // group by
        if (req.query.group_by) {
            const groupByHandler = handleLogsGroupBy(
                req.query.group_by,
                group,
                attributes,
                include
            );
            group = groupByHandler.group;
            attributes = groupByHandler.attributes;
            include = groupByHandler.include;
        }

        if (q) {
            searchq = {...searchq, q: {[Op.iLike]: `%${q}%`}};
        }
        if (req.query.ip_address) {
            searchq = {
                ...searchq,
                ip_address: {[Op.iLike]: `%${req.query.ip_address}%`},
            };
        }
        //filter for device info or platforms
        if (req.query.device_info) {
            if (Array.isArray(req.query.device_info)) {
                searchq = {
                    ...searchq,
                    device_info: {[Op.in]: req.query.device_info},
                };
            } else {
                searchq = {
                    ...searchq,
                    device_info: req.query.device_info,
                };
            }
        }
        //filters for browser
        if (req.query.browser_info) {
            if (Array.isArray(req.query.browser_info)) {
                let browsers = [];
                req.query.browser_info.forEach(browser => {
                    browsers.push({[Op.iLike]: `%${browser}%`});
                });
                searchq = {
                    ...searchq,
                    browser_info: {
                        [Op.or]: browsers,
                    },
                };
            } else {
                searchq = {
                    ...searchq,
                    browser_info: {[Op.iLike]: `%${req.query.browser_info}%`},
                };
            }
        }

        //filters for os info
        if (req.query.os_info) {
            if (Array.isArray(req.query.os_info)) {
                let all_os = [];
                req.query.os_info.forEach(os_name => {
                    all_os.push({[Op.iLike]: `%${os_name}%`});
                });
                searchq = {
                    ...searchq,
                    os_info: {
                        [Op.or]: all_os,
                    },
                };
            } else {
                searchq = {
                    ...searchq,
                    os_info: {[Op.iLike]: `%${req.query.os_info}%`},
                };
            }
        }

        if (req.query.country) {
            if (Array.isArray(req.query.country)) {
                searchq = {
                    ...searchq,
                    "geo.country": {[Op.in]: req.query.country},
                };
            } else {
                searchq = {...searchq, "geo.country": req.query.country};
            }
        }
        if (req.query.rule) {
            if (Array.isArray(req.query.rule)) {
                searchq = {...searchq, rule_id: {[Op.in]: req.query.rule}};
            } else {
                searchq = {...searchq, rule_id: req.query.rule};
            }
        }
        if (req.query.pid) {
            //publisher
            if (Array.isArray(req.query.pid)) {
                searchq = {...searchq, pid: {[Op.in]: req.query.pid}};
            } else {
                searchq = {...searchq, pid: req.query.pid};
            }
        }
        if (req.query.cid) {
            // tag id
            if (Array.isArray(req.query.cid)) {
                searchq = {...searchq, cid: {[Op.in]: req.query.cid}};
            } else {
                searchq = {...searchq, cid: req.query.cid};
            }
        }
        if (req.query.rule_id) {
            // from target engine
            daily = true;
            const today = getCurrentDate();
            const d = new Date(today);
            const da = new Date(d.setDate(d.getDate() + 1));
            searchq = {
                ...searchq,
                rule_id: {[Op.ne]: null},
                request_at: {
                    [Op.gte]: new Date(today),
                    [Op.lt]: da,
                },
            };
        }
        if (req.query.provider_id) {
            if (Array.isArray(req.query.provider_id)) {
                searchq = {
                    ...searchq,
                    provider_id: {[Op.in]: req.query.provider_id},
                };
            } else {
                searchq = {...searchq, provider_id: req.query.provider_id};
            }
        }
        if (req.query.link_id) {
            if (Array.isArray(req.query.link_id)) {
                searchq = {...searchq, link_id: {[Op.in]: req.query.link_id}};
            } else {
                searchq = {...searchq, link_id: req.query.link_id};
            }
        }
        if (req.query.to) {
            const newTo = new Date(req.query.to);
            endDate = new Date(newTo.setDate(newTo.getDate() + 1));
        }
        if (req.query.from) {
            startDate = new Date(req.query.from);
            searchq = {
                ...searchq,
                request_at: {[Op.gte]: startDate, [Op.lt]: endDate},
            };
        } else {
            if (!daily) {
                searchq = {
                    ...searchq,
                    request_at: {
                        [Op.gte]: startDate,
                        [Op.lt]: endDate,
                    },
                };
            }
        }

        let noLimit = true;
        attributes.push([
            sequelize.literal("COUNT(DISTINCT(ip_address))"),
            "unique_ip",
        ]);
        attributes.push([
            sequelize.fn("count", sequelize.col("q")),
            "total_searches",
        ]);
        // implement pagination
        const paginateData =
            req.query.pagination === "false"
                ? {where: searchq, attributes, group}
                : pagination(
                      page,
                      size,
                      searchq,
                      order,
                      attributes,
                      group,
                      include,
                      noLimit
                  );

        const file = await LogService.generateFile(
            paginateData,
            fileType,
            interval
        );
        res.sendFile(file, function (err) {
            try {
                fs.unlink(file, () => {});
            } catch (e) {
                log.error("error removing ", file);
            }
        });
    } catch (err) {
        log.error(err.message || err);
        next(err);
    }
}

module.exports = {
    index,
    getSystemLogs,
    add,
    logInfoDownload,
};
