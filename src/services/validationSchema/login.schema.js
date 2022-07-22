"use strict";

const Joi = require("joi");

/**
 * Schema created with joi, and used for validation
 */

const schema = Joi.object({
  email: Joi.string().required(),
  password: Joi.string().required(),
});

module.exports = { schema };
