const {getRevenueReportsAlerts} = require("../query/getRevenueReports.model");
const {SendEmail} = require("../sendEmail");

const csvRevenueReports = async () => {
    const alerts = await getRevenueReportsAlerts();
    if (alerts.length > 0) {
        SendEmail(alerts);
    }
};

module.exports = {
    csvRevenueReports,
};
