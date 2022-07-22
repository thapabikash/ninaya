const express = require("express");
const router = express.Router();

const SearchEngineController = require("../controllers/searchEngine.controller");

router.get("/searchEngines", SearchEngineController.index);
router.post("/searchEngine", SearchEngineController.add);
router.get("/searchEngine/:id", SearchEngineController.show);
router.put("/searchEngine/:id", SearchEngineController.update);
router.delete("/searchEngine/:id", SearchEngineController.destroy);

module.exports = router;
