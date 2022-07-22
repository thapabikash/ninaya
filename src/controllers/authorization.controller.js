"use strict";
const Joi = require("joi");
const crypto = require("crypto-js");

const JwtUtil = require("../services/utils/jwt.util");
const LoginSchema = require("../services/validationSchema/login.schema");
const CipherOperation = require("../services/operations/cipher.operation");
const UserService = require("../services/datas/users.data");
const CustomError = require("../../helpers/customError");
const Constants = require("../../helpers/constant");

async function login(req, res, next) {
  try {
    let { data } = req.body;
    const bytes = crypto.AES.decrypt(data, Constants.secretKey);
    const decryptedData = JSON.parse(bytes.toString(crypto.enc.Utf8));

    const { error } = LoginSchema.schema.validate(decryptedData);

    if (error) {
      let errArray = [];
      error.details.forEach((err) => {
        errArray.push(err.message);
        throw new Error(errArray);
      });
    }

    let hashPassword = await CipherOperation.saltHashPassword(
      decryptedData.password
    );

    let params = {
      email: decryptedData.email.trim().toLowerCase(),
      password: hashPassword,
    };

    return UserService.findOneUser(params)
      .then(async (fetchedUser) => {
        if (fetchedUser) {
          if(fetchedUser.blocked){
            throw new Error("This user has been blocked");
          }else{
            let token = await JwtUtil.encode(fetchedUser, {
              expiresIn: Constants.tokenExpireTime,
            });
           return res.send({
              data: {
                token: `${token}`,
              },
              message: "Successfully login",
              success: true,
            });
          }
         
        } else {
          throw new Error("Mismatch email/username and password.");
        }
      })
      .catch((err) => {
        next(err);
      });
  } catch (err) {
    next(err);
  }
}

async function logout(req, res, next) {
  try {
  } catch (err) {
    next(new CustomError.Unauthorized(err.message));
  }
}

module.exports = {
  login,
  logout,
};
