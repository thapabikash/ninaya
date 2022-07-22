const express = require("express");
const router = express.Router();

const TagTypeController = require("../controllers/tagType.controller");

router.get("/tagTypes", TagTypeController.index);
router.post("/tagType", TagTypeController.add);
router.get("/tagType/:id", TagTypeController.show);
router.put("/tagType/:id", TagTypeController.update);
router.delete("/tagType/:id", TagTypeController.destroy);

module.exports = router;
