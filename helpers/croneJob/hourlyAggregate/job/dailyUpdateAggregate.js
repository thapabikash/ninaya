const cron = require("node-cron");
const path = require("path");
require("dotenv").config({path: path.join(__dirname, "../../../../.env")});

const {dailyUpdateAggregate} = require("../query/getHourlyAggrigate.model");
const {log} = require("../../../logger");
const title = "Hourly Aggrigate Update";

const updateDailyAggregate = () => {
    let cronnigTime = process.env.DAILY_UPDATE_AGGREGATE_CRONE || `58 0 * * *`; //run every last hour of a aday i.e 00:58 at utc
    cron.schedule(
        cronnigTime,
        async function () {
            try {
                const updated = await dailyUpdateAggregate();
                if (updated) {
                    console.log(
                        "=======updated daily aggrigate=======",
                        updated
                    );
                    log.info({title}, "Daily Aggrigate Updated");
                } else {
                    throw new Error("Failed To Update Daily Aggrigate Table");
                }
            } catch (error) {
                log.error({title}, error.message || error);
            }
        },
        {
            scheduled: true,
            timezone: "UTC",
        }
    );
};

module.exports = {
    updateDailyAggregate,
};
