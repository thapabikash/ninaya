const express = require("express");
const router = express.Router();

const SettingController = require("../controllers/setting.controller");

router.get("/settings", SettingController.index);
router.post("/setting", SettingController.add);
router.get("/setting/:id", SettingController.show);
router.delete("/setting/:id", SettingController.destroy);

module.exports = router;
