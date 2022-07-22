"use strict";

const uuid = require("uuid");
const os = require("os");
const fs = require("fs");
const moment = require("moment");
const path = require("path");
const models = require("../../models/index");
const LogInfo = models.log_infos;
const SystemLogs = models.system_logs;
const sequelize = require("sequelize");

/***
 *
 * @param userParams
 * @returns {Promise.<*>}
 */

async function addLogInfo(params = {}) {
    const addedLog = await LogInfo.create(params);
    return addedLog;
}

/**
 *
 * @param params
 * @returns {Promise.<*>}
 */
async function findAllLogInfos(options = {}) {
    const {count, rows} = await LogInfo.findAndCountAll({...options});

    const total = count.length || count;
    return {
        total,
        logs: rows,
        limit: options.limit,
        pageCount: Math.ceil(total / options.limit),
    };
}

async function findLogsMonthToDate(options = {}) {
    return await models.sequelize.query(
        `SELECT
    count (unique_ip) AS "unique_ip",
    SUM(total_searches) AS "total_searches"
     FROM
     (
        SELECT
            ip_address AS "unique_ip",
            count(q) AS "total_searches"
        FROM
            "log_infos"
        WHERE
            "request_at" >= '${options.firstDay}'
            AND "request_at" < '${options.date}'
        GROUP BY
            1
    ) AS sub2`,
        {
            type: sequelize.QueryTypes.SELECT,
        }
    );
}

async function getAllSystemLogs(options = {}) {
    const includeQuery = {
        attributes: ["id", "level", "msg", "content", "time"],
        ...options,
    };
    const {count, rows} = await SystemLogs.findAndCountAll(includeQuery);
    const total = count.length || count;
    return {
        total,
        logs: rows,
        limit: options.limit,
        pageCount: Math.ceil(total / options.limit),
    };
}

/**
 *
 * @param params
 * @param data
 * @returns {Promise.<*>}
 */
async function updateLogInfo(params, data) {
    return await LogInfo.update(data, {where: params});
}

/** Function that  maps logs column to proper headers*/
function mapLogColumn(column) {
    switch (column) {
        case "country":
            return "Country";
        case "publisher.id":
            return "Publisher ID";
        case "provider.id":
            return "Advertiser ID";
        case "rule_id":
            return "Rule ID";
        case "cid":
            return "Tag ID";
        case "browser_info":
            return "Browser";
        case "device_info":
            return "Platform";
        case "ip_address":
            return "IP Address";
        case "os_info":
            return "OS";
        case "publisher.name":
            return "Publisher Name";
        case "provider.name":
            return "Advertiser Name";
        case "provider_link.id":
            return "Advertiser Link ID";
        case "request_at":
            return "Date";
        case "provider_link.link":
            return "Advertiser Link";
        case "q":
            return "Query";
        case "unique_ip":
            return "Unique IPs";
        case "total_searches":
            return "Total Searches";
        default:
            return column;
    }
}

/**
 * Returns a proper name for database column headers for the search logs
 */
function formatCSVHeaders(headers) {
    let formattedHeaders = [];
    headers.forEach(header => {
        formattedHeaders.push(mapLogColumn(header));
    });
    return formattedHeaders;
}

/** Function that removes duplicate headers while generating CSV File */
function removeDuplicateHeaders(headers) {
    let uniqueHeaders = [];
    headers.forEach(header => {
        if (
            header !== "provider_id" &&
            header !== "pid" &&
            header !== "link_id"
        ) {
            uniqueHeaders.push(header);
        }
    });
    return uniqueHeaders;
}

function csvHeadersListing(headers) {
    headers = headers.filter(
        header => header !== "unique_ip" && header !== "total_searches"
    );
    headers.push("unique_ip");
    headers.push("total_searches");
    return headers;
}

async function generateFile(params = {}, fileType, interval = null) {
    const {rows} = await LogInfo.findAndCountAll({
        raw: true,
        ...params,
    });
    let output = [];
    if (rows.length > 0) {
        let headers = Object.keys(rows[0]);
        headers = removeDuplicateHeaders(headers);
        headers = csvHeadersListing(headers);
        output.push(formatCSVHeaders(headers)); //getting initial headers
        rows.forEach(log => {
            const row = [];
            headers.forEach(header => {
                let rowValue = `${log[header]}`;
                rowValue = rowValue.replace(/,/g, "-");
                if (header === "request_at" && interval === "day") {
                    rowValue = moment(rowValue).format("YYYY-MM-DD");
                }
                if (header === "request_at" && interval === "month") {
                    rowValue = moment(rowValue).format("YYYY-MM");
                }
                if (header === "request_at" && interval === "hour") {
                    rowValue = moment(rowValue).format("YYYY-MM-DD HH:mm");
                }
                row.push(rowValue);
            });
            output.push(row.join());
        });
    }

    const filename = uuid.v4() + `.${fileType}`;
    const downloadDir = path.join(__dirname, "../../../data");
    if (!fs.existsSync(downloadDir)) {
        fs.mkdirSync(downloadDir);
    }
    let filepath = path.join(downloadDir, filename);

    fs.writeFileSync(filepath, Buffer.from(output.join(os.EOL)));
    return filepath;
}

// for compairing reports and search logs total searches
async function fetchTotalsearches(reports) {
    let logsWithReports = [];

    for (let report of reports) {
        try {
            const whereQuery = whereClauseHandle(report);
            const {count, rows} = await LogInfo.findAndCountAll({
                where: whereQuery,
            });
            logsWithReports.push({...report, search_counts: count});
        } catch (error) {
            logsWithReports.push({...report, search_counts: 0});
        }
    }
    return logsWithReports;
}

function whereClauseHandle(report) {
    let whereClause = {};

    const {publisher, rule_id, date, advertiser_id, tag_id, link_id, geo} =
        report;

    if (publisher) {
        whereClause.pid = publisher;
    }
    if (tag_id) {
        whereClause.cid = tag_id;
    }
    if (link_id) {
        whereClause.link_id = link_id;
    }
    if (rule_id) {
        whereClause.rule_id = rule_id;
    }
    if (date) {
        const beginningOfDay = moment(date, "YYYY-MM-DD").startOf("day");
        const endOfDay = moment(date, "YYYY-MM-DD").endOf("day");
        whereClause.request_at = {
            [sequelize.Op.gte]: beginningOfDay,
            [sequelize.Op.lte]: endOfDay,
        };
    }
    if (advertiser_id) {
        whereClause.provider_id = advertiser_id;
    }
    if (geo) {
        whereClause.geo = {
            '"country"': {
                [sequelize.Op.eq]: geo,
            },
        };
        // whereClause.geo = {
        //     //contains:geo
        //     [sequelize.Op.in]: [
        //         {
        //             country: geo,
        //         },
        //     ],
        // };
    }
    return whereClause;
}

// async function findAllLogInfosForReports(options = {}) {
//     return await models.sequelize.query(
//         `SELECT total,concatenated_text FROM "optimized_logs" LIMIT ${options.limit} OFFSET ${options.offset}`,
//         {
//             type: sequelize.QueryTypes.SELECT,
//         }
//     );
// }
async function findAllLogInfosForReports(options = {}) {
    return await models.sequelize.query(
        `SELECT SUM(total) AS total FROM "optimized_logs" WHERE concatenated_text = ${options.concatetext}`,
        {
            type: sequelize.QueryTypes.SELECT,
        }
    );
}

module.exports = {
    findAllLogInfos,
    getAllSystemLogs,
    addLogInfo,
    updateLogInfo,
    generateFile,
    fetchTotalsearches,
    findAllLogInfosForReports,
    findLogsMonthToDate,
};
