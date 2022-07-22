const express = require("express");
const router = express.Router();
const AccountController = require("../controllers/Reporting/account.controller");
router.get("/account", AccountController.index);
router.post("/account", AccountController.add);
router.get("/account/:id", AccountController.show);
router.put("/account/:id", AccountController.update);
router.delete("/account/:id", AccountController.destroy);

module.exports = router;