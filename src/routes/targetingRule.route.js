const express = require("express");
const router = express.Router();

const TargetingRuleController = require("../controllers/targetingRule.controller");

router.get("/targetingRules", TargetingRuleController.index);
router.post("/targetingRules", TargetingRuleController.bulkAdd);
router.get("/targetingRule/:id", TargetingRuleController.show);
router.delete("/targetingRule/:id", TargetingRuleController.destroy);
router.put("/targetingRules", TargetingRuleController.bulkUpdate);

module.exports = router;
