"use strict";
const Joi = require("joi");

const mappingSchema = Joi.object({
    advertiser_id: Joi.number().required(),
    net_revenue:Joi.string().required(),
   subId:Joi.string().required(),
   date:Joi.string().required(),
  geo:Joi.string().required(),
  monetized_searches:Joi.string().required(),
  clicks:Joi.string().required(),
  ctr:Joi.string().required(),
  tag_description:Joi.string().required(),
  followon_searches:Joi.string().required(),
 initial_searches:Joi.string().required(),
  publisher:Joi.string().required(),
 rpc:Joi.string().required(),
  rpm:Joi.string().required(),
   rpmm:Joi.string().required(),
  tag_number:Joi.string().required(),
  total_searches:Joi.string().required(),
});

module.exports = { mappingSchema};
