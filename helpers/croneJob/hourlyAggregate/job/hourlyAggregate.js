const moment = require("moment");
const {
    findAggHourlyTags,
    queryGenerator,
    queryGeneratorForChangePercentage,
    findAggregateRowByHour,
} = require("../query/getHourlyAggrigate.model");
const {SendEmail} = require("../sendEmail");
const {log} = require("../../../logger");
const title = "Hourly Aggrigate";
const AlertsController = require("../../../../src/controllers/alert.controller");

const {hourlyPipeConverter} = require("../hourlyPipe");

//alert constant variables
const {
    ZERO_HITS_CURRENT_HOUR_ALERT,
    PERCENTAGE_AGG_ALERT,
} = require("../../../constants/alert/alertType");

async function hourlyAggCron(purpose) {
    const currentHr = moment().utc().hours();
    const currentHrOneHourBefore = moment().utc().subtract(1, "h").hours();
    let query = ``;
    try {
        query = queryGenerator({
            hour: currentHrOneHourBefore,
            currentHr,
            today_hits: 0,
        });

        //check is exist hour in aggregate table if not lets take its be 0 and send mail
        const exactHr = currentHr == 0 ? 23 : currentHrOneHourBefore;
        const isExistHour = await findAggregateRowByHour(exactHr);

        const response = await findAggHourlyTags(query);
        if (response) {
            console.log("=======response hourly 0=======", response);
            if (response.length > 0) {
                //save alert in our db
                AlertsController.createAlerts({
                    response: response,
                    type: ZERO_HITS_CURRENT_HOUR_ALERT,
                    subject: "Zero Hits Current Hour",
                    message: `Total No. of Searches is 0 at a time of ${hourlyPipeConverter(
                        exactHr
                    )}`,
                });

                SendEmail(response, purpose, exactHr);
            }
        } else {
            throw new Error(
                "Something has been happened during fetching data from aggrigate table"
            );
        }
    } catch (error) {
        console.log(error);
        log.error({title}, error.message || error);
    }
}

async function checkPercentageHrlyTag(purpose = "") {
    const currentHr = moment().utc().hours();
    const currentHrOneHourBefore = moment().utc().subtract(1, "h").hours();
    const currentHrTwoHourBefore = moment().utc().subtract(2, "h").hours();
    let query = ``;
    try {
        query = queryGeneratorForChangePercentage({
            currentHrOneHourBefore,
            currentHrTwoHourBefore,
            currentHr,
        });
        const response = await findAggHourlyTags(query);
        if (response) {
            let filteredResponse = response.filter(res => res.perc_diff <= -25);
            if (filteredResponse.length > 0) {
                //save alert in our db
                AlertsController.createAlerts({
                    response: filteredResponse,
                    type: PERCENTAGE_AGG_ALERT,
                    subject: "Percentage Hourly Aggrigate",
                    message: `The following Publisher Tags has been decreased by less than 25% to the previous hour.`,
                });

                SendEmail(filteredResponse, purpose, null);
            }
        } else {
            throw new Error(
                "Something has been happened during fetching data from aggrigate table"
            );
        }
    } catch (error) {
        console.log(error);
        log.error({title}, error.message || error);
    }
}

module.exports = {
    hourlyAggCron,
    checkPercentageHrlyTag,
};
