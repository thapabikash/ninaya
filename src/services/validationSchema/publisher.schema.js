const Joi = require("joi");

const create = Joi.object({
  name: Joi.string().required(),
  details: Joi.string().allow(null),
  status: Joi.string().required(),
}).options({ abortEarly: false });

const update = Joi.object({
  name: Joi.string(),
  details: Joi.string().allow(null),
  status: Joi.string(),
  deleted: Joi.bool(),
}).options({ abortEarly: false });

module.exports = { create, update };
