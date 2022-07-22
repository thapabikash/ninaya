const models = require("../../models/index");
const Alert = models.alert;

async function findAllAlerts(options = {}) {
    const {count, rows} = await Alert.findAndCountAll({
        ...options,
    });
    const total = count.length || count;
    return {
        total,
        alerts: rows,
        limit: options.limit,
        pageCount: Math.ceil(total / options.limit),
    };
}

async function create(alerts) {
    return await Alert.create(alerts);
}

module.exports = {
    findAllAlerts,
    create,
};
