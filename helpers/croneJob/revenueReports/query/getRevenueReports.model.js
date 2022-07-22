const {CSV_UPLOAD_ALERT} = require("../../../constants/alert/alertType");
const moment = require("moment");
const models = require("../../../../src/models/index");
const sequelize = require("sequelize");

const getRevenueReportsAlerts = async () => {
    let query = `SELECT * FROM alerts WHERE type = '${CSV_UPLOAD_ALERT}' AND alerted_at >='${moment()
        .startOf("day")
        .utc()}'`;

    // using sequelize raw query also logging the query
    let alerts = await models.sequelize.query(query, {
        type: sequelize.QueryTypes.SELECT,
        logging: console.log,
    });
    return alerts;
};

module.exports = {
    getRevenueReportsAlerts,
};
