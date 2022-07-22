const models = require("../../../../src/models/index");
const sequelize = require("sequelize");

function queryGenerator(options = {}) {
    let query = ``;
    if (options.currentHr === 0 || options.currentHr === 00) {
        query = `SELECT * FROM "agg_tagid_hourly" AS "agg_tagid_hourly" WHERE  "agg_tagid_hourly"."hour" = 23 AND "agg_tagid_hourly"."yesterday_hits" <= ${options.today_hits}`;
    } else {
        query = `SELECT * FROM "agg_tagid_hourly" AS "agg_tagid_hourly" WHERE  "agg_tagid_hourly"."hour" = ${options.hour} AND "agg_tagid_hourly"."today_hits" <= ${options.today_hits}`;
    }
    return query;
}

function queryGeneratorForChangePercentage(options = {}) {
    let query = ``;
    if (options.currentHr === 0 || options.currentHr === 00) {
        query = `select q.*,(q.difference_previous_hour/q.last_hour_hits::float)*100 perc_diff FROM (select targeting_id,hour,yesterday_hits,today_hits,LAG(yesterday_hits) over (PARTITION BY targeting_id ORDER BY hour) as last_hour_hits,yesterday_hits - LAG(yesterday_hits) OVER (PARTITION BY targeting_id ORDER BY hour) as difference_previous_hour from agg_tagid_hourly where hour = 22 or hour = 23) q where last_hour_hits IS NOT NULL and last_hour_hits !=0`;
    }
    if (options.currentHr === 1 || options.currentHr === 01) {
        query = `select q.*,(q.difference_previous_hour/q.last_hour_hits::float)*100 perc_diff FROM (select targeting_id,hour,yesterday_hits,today_hits,LAG(yesterday_hits) over (PARTITION BY targeting_id ORDER BY hour DESC) as last_hour_hits,today_hits - LAG(yesterday_hits) OVER (PARTITION BY targeting_id ORDER BY hour DESC) as difference_previous_hour from agg_tagid_hourly where hour = 0 or hour = 23) q where last_hour_hits IS NOT NULL and last_hour_hits !=0`;
    } else {
        query = `select q.*,(q.difference_previous_hour/q.last_hour_hits::float)*100 perc_diff FROM (select targeting_id,hour,yesterday_hits,today_hits,LAG(today_hits) over (PARTITION BY targeting_id ORDER BY hour) as last_hour_hits,today_hits - LAG(today_hits) OVER (PARTITION BY targeting_id ORDER BY hour) as difference_previous_hour from agg_tagid_hourly where hour = ${options.currentHrOneHourBefore} or hour = ${options.currentHrTwoHourBefore}) q where last_hour_hits IS NOT NULL and last_hour_hits !=0`;
    }
    return query;
}

const findAggHourlyTags = async (query = null) => {
    return await models.sequelize.query(query, {
        type: sequelize.QueryTypes.SELECT,
    });
};
const dailyUpdateAggregate = async () => {
    let query = `UPDATE agg_tagid_hourly
	SET yesterday_hits = today_hits, total_hits = today_hits + total_hits, today_hits = 0`;
    return await models.sequelize.query(query, {
        type: sequelize.QueryTypes.UPDATE,
    });
};

const findAggregateRowByHour = async (hour = null) => {
    let query = `SELECT * FROM agg_tagid_hourly WHERE hour = ${hour}`;
    return await models.sequelize.query(query, {
        type: sequelize.QueryTypes.SELECT,
    });
};

module.exports = {
    findAggHourlyTags,
    queryGenerator,
    queryGeneratorForChangePercentage,
    dailyUpdateAggregate,
    findAggregateRowByHour,
};
