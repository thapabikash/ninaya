const express = require("express");
const router = express.Router();
const AdvertiserApiController = require("../controllers/Reporting/api/advertiserApi.controller");
const AdvertiserApiRowsController = require("../controllers/Reporting/api/apiRowStatus.controller");

router.post(
    "/providers/api/cronejob",
    AdvertiserApiController.apiCallWithCustome
);
router.get("/advertiser/api/rowsStatus", AdvertiserApiRowsController.index);
module.exports = router;
