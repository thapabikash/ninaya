const Joi = require("joi");

const bulkUpdate = Joi.array()
  .items(
    Joi.object({
      id: Joi.number(),
      priority: Joi.number(),
      daily_cap: Joi.number(),
      daily_frequency: Joi.number().allow(null),
      comment: Joi.string().allow(null),
      targeting_id: Joi.number().required(),
      provider_details: Joi.array().items(
        Joi.object({
          provider_id: Joi.number(),
          provider_link: Joi.number(),
          traffic: Joi.number(),
        })
      ),
      disabled: Joi.bool(),
      deleted: Joi.bool(),
    })
  )
  .options({ abortEarly: false });

const bulkCreate = Joi.array()
  .items(
    Joi.object({
      priority: Joi.number(),
      daily_cap: Joi.number(),
      daily_frequency: Joi.number().allow(null),
      comment: Joi.string().allow(null),
      targeting_id: Joi.number().required(),
      provider_details: Joi.array().items(
        Joi.object({
          provider_id: Joi.number(),
          provider_link: Joi.number(),
          traffic: Joi.number(),
        })
      ),
      disabled: Joi.bool().allow(null),
    })
  )
  .options({ abortEarly: false });

module.exports = { bulkUpdate, bulkCreate };
