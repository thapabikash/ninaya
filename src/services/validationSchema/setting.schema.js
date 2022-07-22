const Joi = require("joi");

const create = Joi.array()
  .items(
    Joi.object({
      id: Joi.number(),
      key: Joi.string(),
      value: Joi.string(),
    })
  )
  .options({ abortEarly: false });

module.exports = { create };
