const models = require("../../models/index");
const Mapping = models.mapping;
const {invert} = require("lodash");

async function storeMapping(data) {
    let mappingField = data.fields;
    let isFieldValid = invert(mappingField);
    isFieldValid["advertiser_id"] = data?.advertiser_id;
    const existingMapping = await getMapping(data?.advertiser_id);
    if (existingMapping) {
        throw new Error("Mapping fields for this advertiser is already exist");
    } else {
        return await Mapping.create(data);
    }
}

async function updateMapping(data, id) {
    const existingMapping = await getMapping(data?.advertiser_id);
    if (existingMapping) {
        return await Mapping.update(data, {where: {id: id}});
    } else {
        throw new Error("Mapping fields not found");
    }
}

async function getMapping(advertiser_id) {
    return await Mapping.findOne({
        where: {advertiser_id: advertiser_id},
        attributes: ["id", "advertiser_id", "fields"],
        include: [
            {
                model: models.providers,
                attributes: [
                    "id",
                    "csv_source_identifier",
                    "link_source_identifier",
                ],
            },
        ],
    });
}

module.exports = {
    storeMapping,
    updateMapping,
    getMapping,
};
