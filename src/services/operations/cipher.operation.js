"use strict";

const bcrypt = require("bcryptjs");
const crypto = require("crypto");

async function generateHash(password) {
  return bcrypt.hashSync(password, 10);
}

async function compareHash(password, hash) {
  return bcrypt.compareSync(password, hash);
}

/**
 * hash password with md5.
 * @function
 * @param {string} password
 */
let sha512 = function (password) {
  let hash = crypto.createHash("md5");
  /** Hashing algorithm sha512 */
  let value = hash.update(password).digest("hex");
  return {
    passwordHash: value,
  };
};

function saltHashPassword(userpassword) {
  return new Promise((resolve, reject) => {
    let passwordData = sha512(userpassword);
    if (passwordData.passwordHash) {
      resolve(passwordData.passwordHash);
    } else {
      reject(new Error("Unable to hash the password."));
    }
  });
}

module.exports = {
  generateHash,
  compareHash,
  saltHashPassword,
};
