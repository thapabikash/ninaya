const Joi = require("joi");

const create = Joi.object({
  publisher_id: Joi.number().required(),
  custom_domain: Joi.string().allow(null),
  use_custom_domain: Joi.bool(),
  use_custom_fallback: Joi.bool(),
  use_sid: Joi.bool(),
  sub_id: Joi.string().allow(null),
  client_id: Joi.number()
    .greater(0)
    .message("client id must be positive value!!")
    .allow(null),
  o_id: Joi.number()
    .greater(0)
    .message("oid must be positive value!!")
    .allow(null),
  n: Joi.bool().allow(null),
  click_id: Joi.bool().allow(null),
  notes: Joi.string().allow(null),
  tag_description: Joi.string().allow(null),
  link: Joi.string(),
  is_active: Joi.bool(),
  status: Joi.string(),
  targeting_type: Joi.string(),
  default_fallback: Joi.string().allow(null),
  targeting_rules: Joi.array().required(),
}).options({ abortEarly: false });

const update = Joi.object({
  publisher_id: Joi.number().required(),
  custom_domain: Joi.string().allow(null),
  use_custom_domain: Joi.bool(),
  use_custom_fallback: Joi.bool(),
  use_sid: Joi.bool(),
  sub_id: Joi.string().allow(null),
  client_id: Joi.number()
    .greater(0)
    .message("client id must be positive value!!")
    .allow(null),
  o_id: Joi.number()
    .greater(0)
    .message("oid must be positive value!!")
    .allow(null),
  n: Joi.bool().allow(null),
  click_id: Joi.bool().allow(null),
  notes: Joi.string().allow(null),
  tag_description: Joi.string().allow(null),
  link: Joi.string().allow(null),
  is_active: Joi.bool(),
  status: Joi.string(),
  targeting_type: Joi.string(),
  default_fallback: Joi.string().allow(null),
  targeting_rules: Joi.array(),
}).options({ abortEarly: false });

module.exports = { create, update };
