const Joi = require("joi");

const create = Joi.array()
  .items(
    Joi.object({
      id: Joi.number(),
      provider_id: Joi.number(),
      link: Joi.string(),
      search_engine_type: Joi.string().allow(null),
      p_sid: Joi.number().allow(null),
      searchq_val: Joi.string().allow(null),
      description: Joi.string().allow(null),
      n_val: Joi.string().allow(null),
      sub_id_val: Joi.string().allow(null),
      click_id_val: Joi.string().allow(null),
      search_engine_id: Joi.number(),
      tag_type_id: Joi.number(),
      platform_id: Joi.number(),
      disabled: Joi.bool(),
    })
  )
  .options({ abortEarly: false });

module.exports = { create };
