const AlertsController = require("../../alert.controller");
const {
    CSV_UPLOAD_ALERT,
    ADVERTISER_API_UPLOAD_ALERT,
} = require("../../../../helpers/constants/alert/alertType");
const _ = require("lodash");

async function saveRevenueAlert(revenue = {}, source = null) {
    const {reports, skippedReports, advertiser_id} = revenue;
    const Revenue_reports = _(reports)
        .groupBy("subId")
        .map(function (group, subId) {
            let total_searches = _.map(group, "total_searches");
            let search_counts = _.map(group, "search_counts");
            let sum_a = _.sum(total_searches);
            let sum_b = _.sum(search_counts);
            return {
                subId: subId,
                total_searches: sum_a,
                total_searches_search_logs: sum_b,
                percentage: 100 * Math.abs((sum_a - sum_b) / sum_a),
                advertiser_id: advertiser_id,
            };
        })
        .value();
    const Filter_reports = _.filter(Revenue_reports, function (o) {
        return o.percentage >= 5;
    });
    if (Filter_reports.length > 0) {
        AlertsController.createAlerts({
            type:
                source === "CSV"
                    ? CSV_UPLOAD_ALERT
                    : ADVERTISER_API_UPLOAD_ALERT,
            subject: "Revenue share alert",
            response: Filter_reports,
            advertiser_id: advertiser_id,
            message: `The following subID's total searches has been changed at least by 5% with server logs total searches for the advertiser - ${advertiser_id} `,
        });
    }
}

module.exports = {
    saveRevenueAlert,
};
