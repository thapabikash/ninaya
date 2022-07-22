"use strict";

const Joi = require("joi");

/**
 * Schema created with joi, and used for validation
 */

const schema = Joi.object({
  name: Joi.string().required()
});

module.exports = { schema };
