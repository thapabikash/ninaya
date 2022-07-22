//constant package
const cron = require("node-cron");
const title = "Advertiser Api";

//helper function
const config = require("../../../config/advertiserApi.config");
const {apiUrlGenarator} = require("../../advertiserApi.helper");
const {log} = require("../../logger");

//services controller
const {
    updateAdvertiserApiInfo,
} = require("../../../src/services/datas/api/advertiserApiInfo.service");
const sendEmailService = require("../../../src/services/datas/email.data");
const {
    getAdvertiserReportApi,
} = require("../../../src/controllers/Reporting/api/advertiserApi.controller");
const {fromAndTodate} = require("./query/getFromToToDate");
const {getAdvertiser} = require("./query/getAdvertiser");
const moment = require("moment");

const {createJob} = require("../../queue/workers/advertiserApi.worker");
const {
    FAILED,
    PROCESSING,
} = require("../../../src/controllers/Reporting/constant/uploadStatus");

async function ScheduleJobForAdvertiserAPI() {
    try {
        const TIMESCHEDULE = config.jobScheduleTime; //every wednesday
        // for (let obj of config.cron) {
        //     await createJob(applyJobWithCrone, obj);
        //     // await applyJob(obj);
        // }

        cron.schedule(
            TIMESCHEDULE,
            async function () {
                for (let obj of config.cron) {
                    await createJob(applyJobWithCrone, obj);
                }
            },
            {
                scheduled: true,
                timezone: "UTC",
            }
        );
    } catch (error) {
        // const data = {
        //     message: error.message || error,
        //     uploaded_status: "Failed",
        // };
        // updateAdvertiserApiInfo(data, advertiser_id);
        log.error({title}, error.message || error);
    }
}

//Apply each loop
async function applyJobWithCrone(obj = {}) {
    const advertiser_id = obj.advertiser_id || null;
    const user = null;
    const {from_date, to_date} = await fromAndTodate(advertiser_id, obj);
    const advertiser_code = obj?.api_code || "";
    const mapping_fields = obj?.mapping_fields || {};
    try {
        const isExistAdvertiser = await getAdvertiser(advertiser_id);
        if (isExistAdvertiser && isExistAdvertiser.length > 0) {
            //print api status in advertiserApiInfo table
            const startUpdate = {
                message: `Appling crone job for advertiser api ${advertiser_id} at ${moment()
                    .utc()
                    .format("YYYY-MM-DD HH:mm:ss")}`,
                uploaded_status: PROCESSING,
                called_api_date: moment.utc(new Date()).format(),
                apply_to_date: to_date || null,
                apply_from_data: from_date || null,
                source: "Api",
            };
            await updateAdvertiserApiInfo(startUpdate, advertiser_id);

            const customeUrl = apiUrlGenarator({
                ...obj,
                from_date: from_date,
                to_date: to_date,
            });
            const RequestedAdvertiser = {
                advertiser_id,
                user,
                url: customeUrl,
                croneJob: true,
                advertiser_code: advertiser_code,
                mapping_fields,
            };
            await getAdvertiserReportApi(RequestedAdvertiser);
        } else {
            throw new Error(`Advertiser ${advertiser_id} not found in our DB`);
        }
    } catch (error) {
        //print failed message in advertiserApiInfo table
        console.log(error, "=======error occured in crone job=====");
        const data = {
            message: `${
                error.message || error
            } of advertiser: ${advertiser_id}`,
            uploaded_status: FAILED,
        };
        updateAdvertiserApiInfo(data, advertiser_id);
        sendEmailService.SendEmail(
            {
                total_rows: 0,
                total_uploaded: 0,
                total_skipped: 0,
                csv_name: "Api call",
                status: FAILED,
                advertiser_id: advertiser_id,
                time_taken: 0,
                check_sum_totalSearches: 0,
                uploaded_sum_totalSearches: 0,
                message: error.message || error,
            },
            "api"
        );
        log.error(
            {title},
            `Crone job failed for advertiser ${advertiser_id} api at ${moment()
                .utc()
                .format("YYYY-MM-DD HH:mm:ss")}`
        );
    }
}

module.exports = {
    ScheduleJobForAdvertiserAPI,
};
