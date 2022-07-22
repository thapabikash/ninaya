const cron = require("node-cron");
const {log} = require("../../logger");
const title = "Revenue Reports Comparision with Search Logs";
const {csvRevenueReports} = require("./job/csvRevenueReports");

async function revenueReports() {
    try {
        let cronnigTime = process.env.REVENUE_SHARE_CRONE_JOB || `58 0 * * *`;
        // csvRevenueReports();
        cron.schedule(
            cronnigTime,
            function () {
                csvRevenueReports();
            },
            {
                scheduled: true,
                timezone: "UTC",
            }
        );
    } catch (error) {
        console.log(error);
        log.error({title}, error.message || error);
    }
}

module.exports = {
    revenueReports,
};
