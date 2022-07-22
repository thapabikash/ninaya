const express = require("express");
const router = express.Router();
const { s3Uploader } = require("../../helpers/s3helper");

const UserController = require("../controllers/user.controller");

router.get("/user", UserController.index);
router.post("/user", s3Uploader, UserController.add);
router.get("/user/:id", UserController.show);
router.put("/user/changePassword/:id", UserController.changePassword);
router.put("/user/:id", s3Uploader, UserController.update);
router.delete("/user/:id", UserController.destroy);
router.get("/user/account/:accountId", UserController.getuserByaccountId)
router.put("/user/status/:id",UserController.editStatus)

module.exports = router;
