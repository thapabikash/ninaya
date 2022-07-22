const DisplayMappingData = require('../../services/datas/displayMapping.data');

const { successResponse, errorResponse } = require("../../../helpers/response");


async function storeDisplayMapping(req, res, next) {
    try {
        const mappingData = req.body;
        await DisplayMappingData.storeDisplayMapping(mappingData);
        return successResponse(res, "Display Mapping data store success!!");
    } catch (error) {
        next(error)
    }
}


async function getDisplayMappingData(req, res, next) {
    try {
        const mappingData = await DisplayMappingData.getDisplayMappingData();
        return successResponse(res, "Display Mapping data fetch success!!", { mappingData });
    } catch (error) {
        next(error)
    }
}


async function updateDisplayMapping(req, res, next) {
    try {
        const id = req.params.id;
        const data = req.body;
        const updatedData = await DisplayMappingData.updateDisplayMappingData(data, id);
        return successResponse(res, "Dsiplay Mapping data update success!!", { updatedData });
    } catch (error) {
        next(error)
    }
}

module.exports = {
    storeDisplayMapping,
    getDisplayMappingData,
    updateDisplayMapping
}