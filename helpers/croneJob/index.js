const REFRESH_DATABASE = require("./materialView/material_view_refresh.cronejob");
const SCHEDULE_ADVERTISER_API_JOB = require("./advertiserApi/advertiserApi.cronejob");
const HOURLY_AGGREGATE_TAGS = require("./hourlyAggregate");
const UPDATE_DAILY_AGGREGATE = require("./hourlyAggregate/job/dailyUpdateAggregate");
const REVENUE_REPORTS = require("./revenueReports");

function scheduleJob() {
    REFRESH_DATABASE.ScheduleJob();
    SCHEDULE_ADVERTISER_API_JOB.ScheduleJobForAdvertiserAPI();
    HOURLY_AGGREGATE_TAGS.hourlyCroneJob();
    UPDATE_DAILY_AGGREGATE.updateDailyAggregate();
    REVENUE_REPORTS.revenueReports();
}

module.exports = {scheduleJob};
