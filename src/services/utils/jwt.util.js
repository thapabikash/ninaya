"use strict";

let jwt = require("jsonwebtoken");
const secretKey = process.env.CIPHER_SECRET || "secret_ninaya_fms";
const constants = require("../../../helpers/constant");

/**
 * Decode the jwt token
 * @param token{String}
 */
async function decode(token) {
  return new Promise(function (resolve, reject) {
    jwt.verify(token, constants.secretKey, function (err, payload) {
      if (err) {
        reject(err);
      } else {
        resolve(payload);
      }
    });
  });
}

/**
 * Create a jwt token
 * @param user{Object}
 * @param expiresIn{Object}
 */
async function encode(user, expiresIn = {}) {
  const payload = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    active: user.active,
  };
  return new Promise(function (resolve, reject) {
    jwt.sign(payload, constants.secretKey, expiresIn, function (err, token) {
      if (err) {
        reject(err);
      } else {
        resolve(token);
      }
    });
  });
}

module.exports = {
  decode,
  encode,
};
