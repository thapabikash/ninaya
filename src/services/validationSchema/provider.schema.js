const Joi = require("joi");

const create = Joi.object({
    name: Joi.string().required(),
    details: Joi.string().allow(null),
    csv_source_identifier: Joi.string().allow(null),
    // api_source_identifier: Joi.string().allow(null),
    link_source_identifier: Joi.string().allow(null),
    status: Joi.string().required(),
    api_credentials: Joi.allow(null),
    display_in_upload_screen: Joi.boolean().required(),
}).options({abortEarly: false});

const update = Joi.object({
    name: Joi.string(),
    details: Joi.string().allow(null),
    csv_source_identifier: Joi.string().allow(null),
    //api_source_identifier: Joi.string().allow(null),
    link_source_identifier: Joi.string().allow(null),
    api_credentials: Joi.allow(null),
    status: Joi.string(),
    display_in_upload_screen: Joi.boolean(),
}).options({abortEarly: false});

module.exports = {create, update};
