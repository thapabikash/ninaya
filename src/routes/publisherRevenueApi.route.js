const express = require("express");
const router = express.Router();
const PublisherRevenueController = require("../controllers/Reporting/publisherApi/publisherRevenue.controller");
const {
    publisherRevenueAuth,
} = require("../../helpers/publisherRevenueApi/publisherRevenueApiAuth");

router.get(
    "/publisher/api/revenue",
    publisherRevenueAuth,
    PublisherRevenueController.getPublisherRevenue
);
module.exports = router;
