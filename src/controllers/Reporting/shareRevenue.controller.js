const {
    addRevenueShare,
    getRevenueShare,
} = require("../../services/datas/shareRevenue.data");
const {successResponse} = require("../../../helpers/response");

async function createAndUpdate(request, response, next) {
    try {
        const data = request.body;
        if (data.share_revenue > 100) {
            throw new Error("Share Revenue(%) must be less than 100%");
        }
        const result = await addRevenueShare(data);
        return successResponse(
            response,
            "Share Revenue(%) Intigreted Successfully",
            result
        );
    } catch (error) {
        next(error);
    }
}

async function get(request, response, next) {
    try {
        const result = await getRevenueShare();
        if (result) {
            return successResponse(response, "Get Success", result);
        } else {
            return successResponse(response, "Not Found", result);
        }
    } catch (error) {
        next(error);
    }
}

module.exports = {
    createAndUpdate,
    get,
};
