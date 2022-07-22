const cron = require("node-cron");
const path = require("path");
require("dotenv").config({path: path.join(__dirname, "../../../../.env")});
const {
    hourlyAggCron,
    checkPercentageHrlyTag,
} = require("./job/hourlyAggregate");

function hourlyCroneJob() {
    let cronnigTime = process.env.HOURLY_AGGREGATE_CRONE || `5 */1 * * * `; //run every 10 min of a hour i.e 0:00, 10:00, 20:00, 30:00, 40:00, 50:00 at utc
    // hourlyAggCron("Hourly Aggregate");
    // checkPercentageHrlyTag("Percentage Aggregate");
    cron.schedule(
        cronnigTime,
        function () {
            hourlyAggCron("Hourly Aggregate");
            checkPercentageHrlyTag("Percentage Aggregate");
        },
        {
            scheduled: true,
            timezone: "UTC",
        }
    );
}

module.exports = {
    hourlyCroneJob,
};
