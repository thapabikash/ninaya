const {log} = require("../../../helpers/logger");
const {successResponse, errorResponse} = require("../../../helpers/response");
const EmailConfigService = require("../../services/datas/emailConfig.data");

async function getEmail(req, res, next) {
    try {
        const emails = await EmailConfigService.findEmailConfigs();
        return successResponse(res, "success", {emails});
    } catch (err) {
        log.error(err.message || err);
        next(err);
    }
}

async function addOrUpdateEmail(req, res, next) {
    try {
        const data = req.body;
        const email = await EmailConfigService.createEmailConfig(data);
        return successResponse(res, "success", {email});
    } catch (err) {
        log.error(err.message || err);
        next(err);
    }
}

module.exports = {
    getEmail,
    addOrUpdateEmail,
};
