const express = require("express");
const router = express.Router();

const DashboardController = require("../controllers/Reporting/dashoard.controller");

router.get("/dashboard", DashboardController.index);
router.get("/dashboard/all", DashboardController.findall);
router.get("/dashboard/download/:fileType", DashboardController.reportDownload);
router.get("/dashboard/monthlyStats", DashboardController.monthlyStats);
router.get(
    "/dashboard/advertisers/subids",
    DashboardController.getAdvertiserSubIds
);

module.exports = router;
