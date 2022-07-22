const express = require("express");
const router = express.Router();

const PlatformController = require("../controllers/platform.controller");

router.get("/platforms", PlatformController.index);
router.post("/platform", PlatformController.add);
router.get("/platform/:id", PlatformController.show);
router.put("/platform/:id", PlatformController.update);
router.delete("/platform/:id", PlatformController.destroy);

module.exports = router;
