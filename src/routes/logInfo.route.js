const express = require("express");
const router = express.Router();

const LogController = require("../controllers/logInfo.controller");

router.get("/logInfo", LogController.index);
router.get("/systemLogs", LogController.getSystemLogs);
router.post("/logInfo", LogController.add);
router.get("/logInfo/download/:fileType", LogController.logInfoDownload);

module.exports = router;
