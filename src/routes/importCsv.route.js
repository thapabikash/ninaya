const express = require("express");
const router = express.Router();
const upload = require("../../config/multer.config.js");
const CSVController = require("../controllers/Reporting/importCSV.controller");
const csvRowStatusController = require("../controllers/Reporting/csvRowStatus.controller");

router.post(
    "/upload/singlecsvfile",
    upload.single("file"),
    CSVController.queingUploadCSV
);
router.get("/mapping/advertisers", CSVController.fetchAdvertiserWithMapping);
router.get("/skippedrows", csvRowStatusController.fetchAllSkippedRows);
router.get("/skippedrows/:id", csvRowStatusController.fetchSkippedRowsById);
router.get("/csv/files", csvRowStatusController.fetchfilesByAdvertiser);
router.delete("/remove/reports/:id", CSVController.deleteReports);
router.delete(
    "/remove/eports/publisher_advertiser",
    CSVController.deleteRevenuereportsByPubAdv
);
router.delete(
    "/remove/reports/publisher/:id",
    CSVController.deleteRevenuereportByPublisher
);
//to get mannual upload status
router.get("/upload/csvstatus", csvRowStatusController.fetchCSVuploadStatus);
router.get(
    "/fetchall/revenueupload/status",
    csvRowStatusController.fetchAllRevenueReportUploadStatus
);

module.exports = router;
