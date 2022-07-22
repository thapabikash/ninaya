const express = require("express");
const router = express.Router();
const EmailConfigController = require("../controllers/Reporting/emailConfig.controller");
router.get("/emailConfig", EmailConfigController.getEmail);
router.post("/emailConfig", EmailConfigController.addOrUpdateEmail);

module.exports = router;
