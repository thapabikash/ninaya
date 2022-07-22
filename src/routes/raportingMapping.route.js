const express = require("express");
const router = express.Router();
const MappingController = require("../controllers/Reporting/mapping.controller");

router.post("/store/mapping",  MappingController.storeMapping);
router.get("/mapping/:id",  MappingController.getMappingData);
router.put("/update/mapping/:id",  MappingController.updateMapping);

module.exports = router;