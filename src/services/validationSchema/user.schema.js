const Joi = require("joi");

const create = Joi.object({
  first_name: Joi.string().allow(null),
  last_name: Joi.string().allow(null),
  email: Joi.string().required(),
  password: Joi.string().required(),
  contact_number: Joi.string().allow(null),
  skype_details: Joi.string().allow(null),
  role: Joi.string(),
  blocked: Joi.bool().required(),
  role_id:Joi.number().required(),
  publisher_id: Joi.number().allow(null),
}).options({ abortEarly: false });

const update = Joi.object({
  first_name: Joi.string().allow(null),
  last_name: Joi.string().allow(null),
  email: Joi.string(),
  contact_number: Joi.string().allow(null),
  skype_details: Joi.string().allow(null),
  role: Joi.string(),
  blocked: Joi.bool(),
  role_id:Joi.number().required(),
  publisher_id: Joi.number().allow(null),
}).options({ abortEarly: false });

module.exports = { create, update };
