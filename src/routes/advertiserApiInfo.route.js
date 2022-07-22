// for api details routes
const express = require("express");
const router = express.Router();
const AdvertiserApiInfo = require("../controllers/Reporting/api/advertiserApiInfo.controller");
router.get("/providers/api/apiinfo", AdvertiserApiInfo.getAdvertiserApiInfos);
router.get(
    "/providers/api/apiinfo/:id",
    AdvertiserApiInfo.getAdvertiserApiInfoByID
);

module.exports = router;
