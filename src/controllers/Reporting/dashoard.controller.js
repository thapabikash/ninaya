const DashboardData = require("../../services/datas/dashboard.data");
const {successResponse} = require("../../../helpers/response");
const fs = require("fs");
const moment = require("moment");
const {Op} = require("sequelize");
const {log} = require("../../../helpers/logger");
const superAdminRole = process.env.SUPER_ADMIN_ROLE;
const getPublisherDisplayFields = require("../../services/datas/publisherDisplayFields.data");
async function findall(req, res, next) {
    const data = await DashboardData.getAll();
    return successResponse(res, "Fetching data success!!", {data});
}

async function formatStartDate(startDate) {
    if (startDate) {
        return new Date(startDate);
    } else {
        return moment().startOf("month").format("YYYY-MM-DD");
    }
}

async function formatEndDate(endDate) {
    if (endDate) {
        const newEndDate = new Date(endDate);
        return new Date(newEndDate.setDate(newEndDate.getDate() + 1));
    } else {
        return moment().endOf("month").format("YYYY-MM-DD");
    }
}

async function index(req, res, next) {
    try {
        const role = req.user.role;
        const user_id = req.user.id;
        const queries = req.query;
        let {
            page,
            size,
            order_by,
            order_direction,
            provider_id,
            start_date,
            end_date,
            geo,
            group_by,
            publisher,
            rule_id,
            tag_id,
            pub_account_id,
        } = req.query;
        let interval = req.query.interval ? req.query.interval : "accumulated";
        let advertiser_id = provider_id; // provider_id received from frontend as advertiser_id is blocked by adblockers
        let start = await formatStartDate(start_date);
        let end = await formatEndDate(end_date);
        if (role.role === superAdminRole || role.role === "SuperAdmin") {
            const stats = await DashboardData.getStats(
                start,
                end,
                advertiser_id,
                geo,
                interval,
                publisher,
                rule_id,
                tag_id,
                null,
                user_id,
                role.role,
                queries,
                pub_account_id
            );
            const total = await DashboardData.getData(
                start,
                end,
                advertiser_id,
                "all",
                size,
                order_by,
                order_direction,
                geo,
                interval,
                group_by,
                publisher,
                rule_id,
                tag_id,
                null,
                user_id,
                role.role,
                queries,
                pub_account_id
            );
            const list = await DashboardData.getData(
                start,
                end,
                advertiser_id,
                page,
                size,
                order_by,
                order_direction,
                geo,
                interval,
                group_by,
                publisher,
                rule_id,
                tag_id,
                null,
                user_id,
                role.role,
                queries,
                pub_account_id
            );
            const chartData = await DashboardData.getChartData(
                start,
                end,
                null,
                geo,
                interval,
                publisher,
                rule_id,
                tag_id,
                null,
                user_id,
                role.role,
                queries,
                pub_account_id
            );
            return successResponse(res, "Fetching data success!!", {
                stats,
                total: total.length,
                list,
                chartData,
            });
        } else {
            const publisherFields = await getPublisherDisplayFields.index(
                user_id
            );
            if (order_by === "channel") {
                order_by = "tag_id";
            }

            if (Array.isArray(group_by)) {
                if (group_by.includes("channel")) {
                    // remove channel from group_by and add tid
                    group_by.splice(group_by.indexOf("channel"), 1);
                    group_by.push("tag_id");
                }
            } else {
                if (group_by === "channel") {
                    group_by = "tag_id";
                }
            }

            const UniqueArray = new Set([...publisherFields?.fields]);
            let publisherAttributes = [];
            if (publisherFields) {
                publisherAttributes.push(...UniqueArray);

                // if publisherAttributes has channel then add tid and remove channel
                if (publisherAttributes.includes("channel")) {
                    publisherAttributes.splice(
                        publisherAttributes.indexOf("channel"),
                        1
                    );
                    publisherAttributes.push("tag_id");
                }
                
                const stats = await DashboardData.getStats(
                    start,
                    end,
                    advertiser_id,
                    geo,
                    interval,
                    publisher,
                    rule_id,
                    tag_id,
                    publisherAttributes,
                    user_id,
                    role.role,
                    queries,
                    pub_account_id
                );
                const total = await DashboardData.getData(
                    start,
                    end,
                    advertiser_id,
                    "all",
                    size,
                    order_by,
                    order_direction,
                    geo,
                    interval,
                    group_by,
                    publisher,
                    rule_id,
                    tag_id,
                    publisherAttributes,
                    user_id,
                    role.role,
                    queries,
                    pub_account_id
                );
                list = await DashboardData.getData(
                    start,
                    end,
                    advertiser_id,
                    page,
                    size,
                    order_by,
                    order_direction,
                    geo,
                    interval,
                    group_by,
                    publisher,
                    rule_id,
                    tag_id,
                    publisherAttributes,
                    user_id,
                    role.role,
                    queries,
                    pub_account_id
                );

                const new_list = [];
                list.forEach(item => {
                    if (item?.dataValues?.tag_id) {
                        new_list.push({
                            ...item.dataValues,
                            channel: item.dataValues.tag_id,
                        });
                    } else {
                        new_list.push(item);
                    }
                });
                // mapping tag_id to channel
                // list = list.dataValues.map(item =>
                //     item.tag_id && item.tag_id !== "null"
                //         ? {
                //               ...item,
                //               channel: item.tag_id,
                //           }
                //         : item
                // );

                const chartData = await DashboardData.getChartData(
                    start,
                    end,
                    null,
                    geo,
                    interval,
                    publisher,
                    rule_id,
                    tag_id,
                    publisherAttributes,
                    user_id,
                    role.role,
                    queries,
                    pub_account_id
                );
                return successResponse(res, "Fetching data success!!", {
                    stats,
                    total: total.length,
                    list: new_list,
                    chartData,
                });
            } else {
                throw new Error("No publisher fields found");
            }
        }
    } catch (error) {
        console.log("========" + error + "===========");
        next(error);
    }
}

//Monthly States
async function monthlyStats(req, res, next) {
    try {
        const role = req.user.role;
        const user_id = req.user.id;
        const queries = req.query;
        let {
            page,
            size,
            order_by,
            order_direction,
            provider_id,
            start_date,
            end_date,
            geo,
            group_by,
            publisher,
            rule_id,
            tag_id,
            pub_account_id,
        } = req.query;
        let interval = req.query.interval ? req.query.interval : "accumulated";
        let advertiser_id = provider_id; // provider_id received from frontend as advertiser_id is blocked by adblockers

        let start = await formatStartDate(start_date);
        let end = await formatEndDate(end_date);

        if (role.role === superAdminRole || role.role === "SuperAdmin") {
            const stats = await DashboardData.getStats(
                start,
                end,
                advertiser_id,
                geo,
                interval,
                publisher,
                rule_id,
                tag_id,
                null,
                user_id,
                role.role,
                queries,
                pub_account_id
            );
            return successResponse(res, "Fetching data success!!", {
                stats,
            });
        } else {
            const publisherFields = await getPublisherDisplayFields.index(
                user_id
            );
            const UniqueArray = new Set([...publisherFields?.fields]);
            let publisherAttributes = [];
            if (publisherFields) {
                publisherAttributes.push(...UniqueArray);
                const stats = await DashboardData.getStats(
                    start,
                    end,
                    advertiser_id,
                    geo,
                    interval,
                    publisher,
                    rule_id,
                    tag_id,
                    publisherAttributes,
                    user_id,
                    role.role,
                    queries,
                    pub_account_id
                );

                return successResponse(res, "Fetching data success!!", {
                    stats,
                });
            } else {
                throw new Error("No publisher fields found");
            }
        }
    } catch (error) {
        next(error);
    }
}

//Dowenload load Reports in CSV format
async function reportDownload(req, res, next) {
    const fileType = req.params.fileType;
    const queries = req.query;
    try {
        const role = req.user.role;
        const user_id = req.user.id;
        let {
            page,
            size,
            order,
            order_by,
            order_direction,
            provider_id,
            start_date,
            end_date,
            geo,
            group_by,
            publisher,
            rule_id,
            tag_id,
            fileType,
            pub_account_id,
            tableHeaders,
        } = req.query;
        let interval = req.query.interval ? req.query.interval : "accumulated";
        let advertiser_id = provider_id; // provider_id received from frontend as advertiser_id is blocked by adblockers
        let start = await formatStartDate(start_date);
        let end = await formatEndDate(end_date);

        if (role.role === superAdminRole || role.role === "SuperAdmin") {
            const file = await DashboardData.generateFile(
                start,
                end,
                advertiser_id,
                "all",
                size,
                order_by,
                order_direction,
                geo,
                interval,
                group_by,
                publisher,
                rule_id,
                tag_id,
                fileType,
                null,
                user_id,
                role.role,
                queries,
                pub_account_id,
                tableHeaders
            );
            return res.sendFile(file, function (err) {
                try {
                    fs.unlink(file, () => {});
                } catch (e) {
                    log.error("error removing ", file);
                }
            });
        } else {
            if (Array.isArray(group_by)) {
                if (group_by.includes("channel")) {
                    // remove channel from group_by and add tid
                    group_by.splice(group_by.indexOf("channel"), 1);
                    group_by.push("tag_id");
                }
            } else {
                if (group_by === "channel") {
                    group_by = "tag_id";
                }
            }
            if (tableHeaders.includes("channel")) {
                tableHeaders.splice(tableHeaders.indexOf("channel"), 1);
                tableHeaders.push("tag_id");
            }
            const publisherFields = await getPublisherDisplayFields.index(
                user_id
            );
            const UniqueArray = new Set([...publisherFields?.fields]);
            let publisherAttributes = [];
            if (publisherFields) {
                publisherAttributes.push(...UniqueArray);

                // if publisherAttributes has channel then add tid and remove channel
                if (publisherAttributes.includes("channel")) {
                    publisherAttributes.splice(
                        publisherAttributes.indexOf("channel"),
                        1
                    );
                    publisherAttributes.push("tag_id");
                }
                const file = await DashboardData.generateFile(
                    start,
                    end,
                    advertiser_id,
                    "all",
                    size,
                    order_by,
                    order_direction,
                    geo,
                    interval,
                    group_by,
                    publisher,
                    rule_id,
                    tag_id,
                    fileType,
                    publisherAttributes,
                    user_id,
                    role.role,
                    queries,
                    pub_account_id,
                    tableHeaders
                );
                return res.sendFile(file, async function (err) {
                    try {
                        fs.unlink(file, () => {});
                    } catch (e) {
                        log.error("error removing ", file);
                    }
                });
            }
        }
    } catch (error) {
        next(error);
    }
}

async function getAdvertiserSubIds(req, res, next) {
    try {
        const {advertiser_id, order_by, size, order_direction} = req.query;
        let where = {};
        if (advertiser_id) {
            if (Array.isArray(advertiser_id)) {
                where.advertiser_id = {[Op.in]: advertiser_id};
            } else {
                where.advertiser_id = advertiser_id;
            }
        }
        const subIds = await DashboardData.getChannelsByAdvertiser({
            where: where,
            //order: [order_by, order_direction],
            limit: size,
        });
        return successResponse(res, "Fetching data success!!", subIds);
    } catch (error) {
        next(error);
    }
}

module.exports = {
    index,
    findall,
    reportDownload,
    monthlyStats,
    getAdvertiserSubIds,
};
