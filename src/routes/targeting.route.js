const express = require("express");
const router = express.Router();

const TargetingController = require("../controllers/targeting.controller");
const publisherAccountController = require("../controllers/publisher_account.controller");
const TargetingRulesController = require("../controllers/targetingRule.controller");

router.get("/targetings", TargetingController.index);
router.get("/targeting/rules*", TargetingController.getRulesByParams);
router.get("/targetingRules", TargetingRulesController.index);
router.post("/targeting", TargetingController.add);
router.get("/targeting/:id", TargetingController.show);
router.put("/targeting/:id", TargetingController.update);
router.put("/targetings", TargetingController.bulkUpdate);
router.delete("/targeting/:id", TargetingController.destroy);
router.delete("/targetings", TargetingController.bulkDestroy);

module.exports = router;
