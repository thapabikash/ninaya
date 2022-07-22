const models = require("../../models/index");
const Report = models.reports;
const User = models.users;
const sequelize = require("sequelize");
const {Op} = require("sequelize");
const {pagination} = require("../../../helpers/paginationHelper");
const uuid = require("uuid");
const os = require("os");
const moment = require("moment");
const fs = require("fs");
const path = require("path");
const {getLatestDisplayMappingData} = require("./displayMapping.data");
const {
    getDashboardAttributes,
    getStateAttributes,
} = require("./dashboardAttributes.data");
const superAdminRole = process.env.SUPER_ADMIN_ROLE;

async function whereCondition(
    start,
    end,
    advertiser_id,
    geo,
    publisher,
    rule_id,
    tag_id,
    user_id = null,
    role = null,
    queries = null,
    pub_account_id
) {
    let where = {
        date: {
            [Op.gte]: start,
            [Op.lt]: end,
        },
    };
    where.deleted = false;
    if (role !== superAdminRole || role !== "SuperAdmin") {
        const currentUser = await User.findByPk(user_id);
        where.publisher = currentUser ? currentUser?.publisher_id : null;
    }

    if (rule_id) {
        if (Array.isArray(rule_id)) {
            where.rule_id = {
                [Op.in]: rule_id,
            };
        } else {
            where.rule_id = rule_id;
        }
    }

    if (tag_id) {
        if (Array.isArray(tag_id)) {
            where.tag_id = {
                [Op.in]: tag_id,
            };
        } else {
            where.tag_id = tag_id;
        }
    }

    if (geo) {
        if (Array.isArray(geo)) {
            where.geo = {[Op.in]: geo};
        } else {
            where.geo = geo;
        }
    }

    if (advertiser_id) {
        if (Array.isArray(geo)) {
            where.advertiser_id = {[Op.in]: advertiser_id};
        } else {
            where.advertiser_id = advertiser_id;
        }
    }

    if (pub_account_id) {
        if (Array.isArray(pub_account_id)) {
            where.pub_account_id = {[Op.in]: pub_account_id};
        } else {
            where.pub_account_id = pub_account_id;
        }
    }

    if (publisher) {
        if (Array.isArray(publisher)) {
            where.publisher = {[Op.in]: publisher};
        } else {
            where.publisher = publisher;
        }
    }

    if (queries?.yesterday) {
        let from = moment()
            .subtract(1, "days")
            .startOf("day")
            .format("YYYY-MM-DD");
        let to = moment().subtract(1, "days").endOf("day").format("YYYY-MM-DD");
        where.date = {
            [Op.between]: [from, to],
        };
    }

    if (queries?.previousmonths) {
        let from = moment()
            .subtract(1, "months")
            .startOf("month")
            .format("YYYY-MM-DD");
        let to = moment()
            .subtract(1, "months")
            .endOf("month")
            .format("YYYY-MM-DD");
        where.date = {
            [Op.between]: [from, to],
        };
    }

    if (queries?.today) {
        let from = moment().startOf("day").toString();
        let to = moment().endOf("day").toString();
        where.date = {
            [Op.between]: [from, to],
        };
    }

    if (queries?.currentmonths) {
        let from = moment().startOf("month").format("YYYY-MM-DD");
        let to = moment().endOf("month").format("YYYY-MM-DD");
        where.date = {
            [Op.between]: [from, to],
        };
    }

    if (queries?.search_engine_id) {
        if (Array.isArray(queries.search_engine_id)) {
            where.search_engine_id = {[Op.in]: queries.search_engine_id};
        } else {
            where.search_engine_id = queries.search_engine_id;
        }
    }
    if (queries?.platform_id) {
        if (Array.isArray(queries.platform_id)) {
            where.platform_id = {[Op.in]: queries.platform_id};
        } else {
            where.platform_id = queries.platform_id;
        }
    }
    if (queries?.tag_type_id) {
        if (Array.isArray(queries.tag_type_id)) {
            where.tag_type_id = {[Op.in]: queries.tag_type_id};
        } else {
            where.tag_type_id = queries.tag_type_id;
        }
    }
    if (queries?.channel) {
        if (Array.isArray(queries.channel)) {
            where.channel = {[Op.in]: queries.channel};
        } else {
            where.channel = queries.channel;
        }
    }
    return where;
}

async function queryHandler(
    params,
    interval,
    start,
    end,
    advertiser_id,
    geo,
    publisher,
    rule_id,
    tag_id,
    user_id = null,
    role = null,
    queries = null,
    pub_account_id
) {
    let newParams = {...params};
    newParams.where = await whereCondition(
        start,
        end,
        advertiser_id,
        geo,
        publisher,
        rule_id,
        tag_id,
        user_id,
        role,
        queries,
        pub_account_id
    );

    return newParams;
}

async function groupByCondition(group_by, params) {
    let newParams = {...params};
    /* handling case when advertiser_id (advertiser), publisher (publisher) 
     is included as we require to add include from the relation table , the name and id
  */
    if (Array.isArray(group_by)) {
        if (group_by.includes("advertiser_id")) {
            newParams.group.push("provider.id");
            newParams.include.push({
                model: models.providers,
                attributes: ["id", "name"],
            });
        }
        if (group_by.includes("publisher")) {
            newParams.group.push("publisher_id.id");
            newParams.include.push({
                model: models.publishers,
                attributes: ["id", "name"],
                as: "publisher_id",
            });
        }
        if (group_by.includes("search_engine_id")) {
            newParams.group.push("search_engine.id");
            newParams.include.push({
                model: models.search_engines,
                attributes: ["id", "name"],
            });
        }
        if (group_by.includes("platform_id")) {
            newParams.group.push("platform.id");
            newParams.include.push({
                model: models.platforms,
                attributes: ["id", "name"],
            });
        }
        if (group_by.includes("tag_type_id")) {
            newParams.group.push("tag_type.id");
            newParams.include.push({
                model: models.tag_types,
                attributes: ["id", "name"],
            });
        }
    } else {
        if (group_by === "advertiser_id") {
            newParams.group.push("provider.id");
            newParams.include.push({
                model: models.providers,
                attributes: ["id", "name"],
            });
        }
        if (group_by === "publisher") {
            newParams.group.push("publisher_id.id");
            newParams.include.push({
                model: models.publishers,
                attributes: ["id", "name"],
                as: "publisher_id",
            });
        }
        if (group_by === "search_engine_id") {
            newParams.group.push("search_engine.id");
            newParams.include.push({
                model: models.search_engines,
                attributes: ["id", "name"],
            });
        }
        if (group_by === "platform_id") {
            newParams.group.push("platform.id");
            newParams.include.push({
                model: models.platforms,
                attributes: ["id", "name"],
            });
        }
        if (group_by === "tag_type_id") {
            newParams.group.push("tag_type.id");
            newParams.include.push({
                model: models.tag_types,
                attributes: ["id", "name"],
            });
        }
    }

    if (Array.isArray(group_by)) {
        group_by.forEach(value => {
            newParams.group.push(value);
            newParams.attributes.push(value);
        });
    } else {
        newParams.group.push(group_by);
        newParams.attributes.push(group_by);
    }

    return newParams;
}

async function tableQueryHandler(
    params,
    interval,
    start,
    end,
    advertiser_id,
    geo,
    publisher,
    rule_id,
    tag_id,
    user_id = null,
    role = null,
    queries = null,
    pub_account_id
) {
    let newParams = {...params};
    newParams.where = await whereCondition(
        start,
        end,
        advertiser_id,
        geo,
        publisher,
        rule_id,
        tag_id,
        user_id,
        role,
        queries,
        pub_account_id
    );
    if (interval && interval !== "accumulated") {
        newParams.group.push(
            sequelize.fn("date_trunc", interval, sequelize.col("date"))
        );
        newParams.attributes.push([
            sequelize.fn("date_trunc", interval, sequelize.col("date")),
            "date",
        ]);
    }
    return newParams;
}

// all function for the reports goes here
//get state of the report
async function getStats(
    start,
    end,
    advertiser_id = null,
    geo = null,
    interval = null,
    publisher,
    rule_id,
    tag_id,
    publisherAttributes = null,
    user_id = null,
    role = null,
    queries = null,
    pub_account_id
) {
    let params = {
        attributes: [],
        where: {},
        group: [],
    };
    params = await queryHandler(
        params,
        interval,
        start,
        end,
        advertiser_id,
        geo,
        publisher,
        rule_id,
        tag_id,
        user_id,
        role,
        queries,
        pub_account_id
    );
    // params.attributes = await getDashboardAttributes(role, publisherAttributes,group_by);
    const returnAttributes = await getStateAttributes(
        role,
        publisherAttributes
    );
    params.attributes.push(...returnAttributes);
    return await Report.findAll(params);
}

//get data for table
async function getData(
    start,
    end,
    advertiser_id = null,
    page,
    size,
    order = "date",
    order_direction = "DESC",
    geo = null,
    interval = "accumulated",
    group_by = null,
    publisher,
    rule_id,
    tag_id,
    publisherAttributes = null,
    user_id = null,
    role = null,
    queries = null,
    pub_account_id
) {
    let params = {
        attributes: [],
        where: {},
        group: [],
        // logging:console.log,
        include: [],
        order: [],
    };

    params = await tableQueryHandler(
        params,
        interval,
        start,
        end,
        advertiser_id,
        geo,
        publisher,
        rule_id,
        tag_id,
        user_id,
        role,
        queries,
        pub_account_id
    );
    const returnAttributes = await getDashboardAttributes(
        role,
        publisherAttributes,
        group_by,
        interval
    );
    params.attributes.push(...returnAttributes);

    if (group_by) {
        params = await groupByCondition(group_by, params);
    }
    if (
        order === "net_revenue" ||
        order === "total_searches" ||
        order === "monetized_searches" ||
        order === "clicks" ||
        order === "ctr" ||
        order === "rpm" ||
        order === "rpmm" ||
        order === "rpc" ||
        order === "gross_revenue" ||
        order === "ad_coverage" ||
        order === "pub_revenue" ||
        order === "pub_account_id"
    ) {
        params.order.push([sequelize.col(order), order_direction]);
    }

    if (
        order === "geo" ||
        order === "publisher" ||
        order === "advertiser_id" ||
        order === "tag_id" ||
        order === "rule_id" ||
        order === "channel" ||
        order === "tag_type_id" ||
        order === "search_engine_id" ||
        order === "platform_id"
    ) {
        let paramsGroupBy = group_by;
        if (Array.isArray(paramsGroupBy)) {
            paramsGroupBy.includes(order) &&
                params.order.push([order, order_direction]);
        } else {
            paramsGroupBy === order &&
                params.order.push([order, order_direction]);
        }
    }

    if (order === "date") {
        if (interval && interval !== "accumulated") {
            params.order.push([
                sequelize.fn("date_trunc", interval, sequelize.col("date")),
                order_direction,
            ]);
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
    return await Report.findAll(paginateData);
}

//chart data
async function getChartData(
    start,
    end,
    advertiser_id = null,
    geo = null,
    interval = null,
    publisher,
    rule_id,
    tag_id,
    publisherAttributes = null,
    user_id = null,
    role = null,
    queries = null,
    pub_account_id
) {
    let params = {
        attributes: [
            "date",
            [sequelize.fn("SUM", sequelize.col("clicks")), "clicks"],
            // [sequelize.fn("SUM", sequelize.col("ctr")), "ctr"],
            [
                sequelize.fn("SUM", sequelize.col("total_searches")),
                "total_searches",
            ],
        ],
        where: {},
        group: ["date"],
        order: [["date", "ASC"]],
    };
    params = await queryHandler(
        params,
        interval,
        start,
        end,
        advertiser_id,
        geo,
        publisher,
        rule_id,
        tag_id,
        user_id,
        role,
        queries,
        pub_account_id
    );
    // params.attributes = await getDashboardAttributes(role, publisherAttributes,group_by);
    return await Report.findAll(params);
}

//csv report genaration with csv

/** Function that  maps logs column to proper headers*/
async function mapLogColumn(column, role) {
    const displayMappingData = await getLatestDisplayMappingData();
    const fields = displayMappingData.fields || {};
    if (role !== "SuperAdmin" && column === "tag_id") return "Channel";
    switch (column) {
        case "provider.id":
            return "Advertiser ID";
        case "provider.name":
            return "Advertiser Name";
        case "publisher_id.id":
            return "Publisher ID";
        case "publisher_id.name":
            return "Publisher Name";
        case "rule_id":
            return "Rule ID";
        case "tag_id":
            return "Tag ID";
        case "ad_coverage":
            return "Ad Coverage (%)";
        case "pub_revenue":
            return "Publisher Revenue";
        case "search_engine.id":
            return "Search Engine ID";
        case "search_engine.name":
            return "Search Engine Name";
        case "tag_type.id":
            return "Tag Type ID";
        case "tag_type.name":
            return "Tag Type Name";
        case "platform.id":
            return "Platform ID";
        case "platform.name":
            return "Platform Name";
        case "server_search_counts":
            return "Server Total Searches";
        case "search_counts":
            return "Server Total Searches";
        case "pub_account_id":
            return "Publisher Ad Account";
        default:
            return fields[column] || column;
    }
}

/* Possible Headers ordered List*/
const orderedHeadersList = [
    "date",
    "tag_id",
    "publisher_id.id",
    "publisher_id.name",
    "publisher",
    "advertiser_id",
    "pub_account_id",
    "channel",
    "search_engine.id",
    "search_engine.name",
    "tag_type.id",
    "tag_type.name",
    "platform.id",
    "platform.name",
    "rule_id",
    "provider.id",
    "provider.name",
    "geo",
    "server_search_counts",
    "search_counts",
    "total_searches",
    "monetized_searches",
    "clicks",
    "ctr",
    "ad_coverage",
    "gross_revenue",
    "pub_revenue",
    "net_revenue",
    "rpm",
    "rpmm",
    "rpc",
    "followon_searches",
    "initial_searches",
];

/* Get values in the headers ordered as per ordered headers list */
async function getOrderedHeadersList(headers) {
    const orderedHeaders = [];
    for (let i = 0; i < orderedHeadersList.length; i++) {
        const header = orderedHeadersList[i];
        if (headers.includes(header)) {
            orderedHeaders.push(header);
        }
    }
    return orderedHeaders;
}

/**
 * Returns a proper name for database column headers for the reports
 */
async function formatCSVHeaders(headers, role) {
    let formattedHeaders = [];
    for (let i = 0; i < headers.length; i++) {
        let mappedHeader = await mapLogColumn(headers[i], role);
        formattedHeaders.push(mappedHeader);
    }
    return formattedHeaders;
}

/** Function that removes duplicate headers while generating CSV File */
async function removeDuplicateHeaders(headers, role) {
    let uniqueHeaders = [];
    headers.forEach(header => {
        if (role === "SuperAdmin") {
            uniqueHeaders.push(header);
        } else {
            let excludedFields = [
                "rule_id",
                "ad_coverage",
                "search_engine.name",
                "search_engine.id",
                "tag_type.name",
                "tag_type.id",
                "platform.name",
                "platform.id",
                "pub_revenue",
                "link_id",
                "search_counts",
                "publisher",
                "tag_description",
                "tag_number",
                "advertiser_id",
                "pub_account_id",
                //"followon_searches",
                //"initial_searches",
                "uploaded_by",
                "uploaded_date",
                "pub_account_id",
                // "rpm",
                // "rpmm",
                //"rpc",
                // "ctr",
            ];
            if (!excludedFields.includes(header)) {
                uniqueHeaders.push(header);
            }
        }
    });

    return uniqueHeaders;
}

async function removeHeadersNotInCols(tableHeaders, headers) {
    if (!tableHeaders) return headers;
    let newHeaders = headers.filter(header => {
        const result = tableHeaders.includes(header);
        if(!result){
            header;
        }
        return result; 
    });
    return newHeaders;
}

async function generateFile(
    start,
    end,
    advertiser_id = null,
    page,
    size,
    order="date",
    order_direction = "DESC",
    geo = null,
    interval = "accumulated",
    group_by = null,
    publisher,
    rule_id,
    tag_id,
    fileType = "csv",
    publisherAttributes = null,
    user_id = null,
    role = null,
    queries = null,
    pub_account_id,
    tableHeaders = null
) {
    let params = {
        attributes: [],
        where: {},
        group: [],
        include: [],
        order: []
    };
    params = await tableQueryHandler(
        params,
        interval,
        start,
        end,
        advertiser_id,
        geo,
        publisher,
        rule_id,
        tag_id,
        user_id,
        role,
        queries,
        pub_account_id
    );
    const returnAttributes = await getDashboardAttributes(
        role,
        publisherAttributes,
        group_by,
        interval
    );
    params.attributes.push(...returnAttributes);
    if (group_by) {
        params = await groupByCondition(group_by, params);
    }
    if (
        order === "net_revenue" ||
        order === "total_searches" ||
        order === "monetized_searches" ||
        order === "clicks" ||
        order === "ctr" ||
        order === "rpm" ||
        order === "rpmm" ||
        order === "rpc" ||
        order === "gross_revenue" ||
        order === "ad_coverage" ||
        order === "pub_revenue" ||
        order === "pub_account_id"
    ) {
        params.order.push([sequelize.col(order), order_direction]);
    }

    if (
        order === "geo" ||
        order === "publisher" ||
        order === "advertiser_id" ||
        order === "tag_id" ||
        order === "rule_id" ||
        order === "channel" ||
        order === "tag_type_id" ||
        order === "search_engine_id" ||
        order === "platform_id"
    ) {
        let paramsGroupBy = group_by;
        if (Array.isArray(paramsGroupBy)) {
            paramsGroupBy.includes(order) &&
                params.order.push([order, order_direction]);
        } else {
            paramsGroupBy === order &&
                params.order.push([order, order_direction]);
        }
    }

    if (order === "date") {
        if (interval && interval !== "accumulated") {
            params.order.push([
                sequelize.fn("date_trunc", interval, sequelize.col("date")),
                order_direction,
            ]);
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

    const {rows} = await Report.findAndCountAll({
        raw: true,
        ...params,
    });
    let output = [];
    if (rows.length > 0) {
        const mappingrows = rows.map(em => {
            const obj = {
                ...em,
                publisher: `${em["publisher_id.name"]}`,
                advertiser_id: `${em["provider.name"]}`,
            };

            return obj;
        });
        const platformIdIndex = tableHeaders.indexOf('platform_id');
        const searchEngineId = tableHeaders.indexOf('search_engine_id');
        const tagId = tableHeaders.indexOf('tag_type_id');
        if(platformIdIndex !== -1){
            tableHeaders[platformIdIndex] = "platform.name";
        }
        if(searchEngineId !==1){
            tableHeaders[searchEngineId] = "search_engine.name"
        }
        if(tagId !== 1){
            tableHeaders[tagId] = "tag_type.name"
        }
        let headers = await getOrderedHeadersList(Object.keys(mappingrows[0]));
        headers = await removeHeadersNotInCols(tableHeaders, headers);
        headers = await removeDuplicateHeaders(headers, role);
        output.push(await formatCSVHeaders(headers, role)); //getting initial headers
        mappingrows.forEach(log => {
            const row = [];
            headers.forEach(async header => {
                let rowValue = `${log[header]}`;
                rowValue = rowValue.replace(/,/g, "-");
                if (header === "date" && interval === "day") {
                    rowValue = moment(rowValue).format("YYYY-MM-DD");
                }
                if (header === "date" && interval === "month") {
                    rowValue = moment(rowValue).format("YYYY-MM");
                }
                row.push(rowValue);
            });
            row.push

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

async function getAll() {
    return await Report.findAll({});
}

async function getChannelsByAdvertiser(options = {}) {
    return await Report.findAll({
        ...options,
        attributes: [
            [sequelize.fn("DISTINCT", sequelize.col("channel")), "channel"],
        ],
    });
}

module.exports = {
    getStats,
    getData,
    getAll,
    getChartData,
    generateFile,
    getChannelsByAdvertiser,
};
