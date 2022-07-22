const express = require("express");
const router = express.Router();
const DisplayMappingController = require("../controllers/Reporting/displayMapping.controller");

router.post("/store/displaymapping", DisplayMappingController.storeDisplayMapping);
router.get("/displaymapping/:id", DisplayMappingController.getDisplayMappingData);
router.put("/update/displaymapping/:id", DisplayMappingController.updateDisplayMapping);

module.exports = router;