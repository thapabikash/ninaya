"use strict";

const CustomError = require("./customError");
const JwtUtil = require("../src/services/utils/jwt.util");
const UserService = require("../src/services/datas/users.data");

const whiteListedUrl = [
    "/login",
    "/targeting/rules",
    "/logInfo",
    "/updatepubaccount/account",
    "/re_update/pub_account",
    "/publisher/api/revenue",
];
const whiteListedPulisherUrl = ["/dashboard"];
const ADMIN = ["SuperAdmin", "Admin", "superAdmin"];

async function authorize(req, res, next) {
    const authorization = req.headers.authorization || req.headers.token;
    const url = req.url.split("?")[0];
    const skippepdurl = "" + url;
    if (whiteListedUrl.indexOf(url) > -1) {
        next();
    } else if (!authorization) {
        next(new CustomError.Unauthorized());
    } else {
        await JwtUtil.decode(authorization)
            .then(async decodedData => {
                let user = await UserService.findOneUser({id: decodedData.id});
                if (!user) throw new Error("Unauthorized!!");
                req.user = decodedData;
                if (ADMIN.includes(user.role.role)) {
                    next();
                } else if (
                    !ADMIN.includes(user?.role?.role) ||
                    whiteListedPulisherUrl.indexOf(url) > -1
                ) {
                    next();
                } else {
                    throw new Error("Unauthorized User!!");
                }
            })
            .catch(err => {
                next(new CustomError.Unauthorized());
            });
    }
}

module.exports = authorize;
