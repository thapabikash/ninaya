const express = require("express");
const router = express.Router();
const AdvertiserApiCredential = require("../controllers/Reporting/api/advertiserApiCredential.controller");
//for advertiser api credentials eg to tiken
router.post(
    "/providers/api/credentials/:ad_id",
    AdvertiserApiCredential.postCredentials
);
router.get(
    "/providers/api/credentials/:ad_id",
    AdvertiserApiCredential.getCredentials
);

module.exports = router;
