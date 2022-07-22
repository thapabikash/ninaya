const cron = require("node-cron");
const models = require("../../../src/models/index");
const {log} = require("../../logger");
const title = "Refresh Materialized view table";

function ScheduleJob() {
    let timeTOJob = process.env.REFERSH_MATERIAL_VIEW_CRONE || `35 18 * * *`;
    try {
        cron.schedule(timeTOJob, async function () {
            const refreshed = await models.sequelize.query(
                `REFRESH MATERIALIZED VIEW CONCURRENTLY optimized_logs;`
            );
            if (refreshed) {
                log.info({title}, "Refreshed materialized view table");
                console.log("===Refreshed===");
            } else {
                log.error("Failed to refresh materialize views table");
                console.log("===Failed===");
            }
        });
    } catch (error) {
        log.error(error.message || error);
    }
}

module.exports = {
    ScheduleJob,
};
