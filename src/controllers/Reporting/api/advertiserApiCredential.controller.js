const {
    addCredentialService,
    getCredentialService,
} = require("../../../services/datas/api/advertiserApiCredential.service");
const {log} = require("../../../../helpers/logger");
const {successResponse} = require("../../../../helpers/response");

//from providers table
async function postCredentials(req, res, next) {
    try {
        const data = req.body;
        const advertiser_id = req.params.ad_id;
        await addCredentialService(data, advertiser_id);
        return successResponse(res, "Added!!");
    } catch (error) {
        log.error(error.message || error);
        next(error);
    }
}

async function getCredentials(req, res, next) {
    try {
        const id = req.params.ad_id;
        const data = await getCredentialService(id);
        return successResponse(res, "Get Success!!", data);
    } catch (error) {
        log.error(error.message || error);
        next(error);
    }
}

module.exports = {
    postCredentials,
    getCredentials,
};
