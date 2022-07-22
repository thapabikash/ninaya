const express = require("express");
const router = express.Router();

const PublisherController = require("../controllers/publisher.controller");

router.get("/publishers", PublisherController.index);
router.post("/publisher", PublisherController.add);
router.get("/publisher/:id", PublisherController.show);
router.put("/publisher/:id", PublisherController.update);
router.put("/publishers", PublisherController.bulkUpdate);
router.delete("/publisher/:id", PublisherController.destroy);
router.delete("/publishers", PublisherController.bulkDestroy);

module.exports = router;
