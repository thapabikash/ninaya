const express = require("express");
const router = express.Router();
const PublisherDisplayFields = require("../controllers/Reporting/publisherDisplayFields.controller");
router.get("/publisher/display/:id", PublisherDisplayFields.index);
router.post("/publisher/display/:id", PublisherDisplayFields.create);
router.put("/publisher/display/:id", PublisherDisplayFields.update);

module.exports = router;
