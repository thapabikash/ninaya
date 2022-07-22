const ReportingMappingData = require('../../services/datas/reportingMapping.data');

const { successResponse, errorResponse } = require("../../../helpers/response");

async function storeMapping(req, res, next) {
    try {
        const mappingData = req.body;
        await ReportingMappingData.storeMapping(mappingData);
        return successResponse(res, "Mapping data store success!!");
    } catch (error) {
        next(error)
    }
}


async function updateMapping(req, res, next) {
    try {
        const advertiserId = req.params.id;
        const mappingData = req.body;
        await ReportingMappingData.updateMapping(mappingData, advertiserId);
        return successResponse(res, "Mapping data update success!!");
    } catch (error) {
        next(error)
    }
}


async function getMappingData(req, res, next) {
    try {
        const advertiserId = req.params.id;
        const mappingData = await ReportingMappingData.getMapping(advertiserId);
        return successResponse(res, "Mapping data fetch success!!", { mappingData });
    } catch (error) {
        next(error)
    }
}


module.exports = {
    storeMapping,
    updateMapping,
    getMappingData
}