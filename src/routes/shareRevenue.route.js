const express = require("express");
const router = express.Router();

const ShareRevenueController = require("../controllers/Reporting/shareRevenue.controller");

router.get("/shareRevenue", ShareRevenueController.get);
router.post("/shareRevenue", ShareRevenueController.createAndUpdate);

module.exports = router;
