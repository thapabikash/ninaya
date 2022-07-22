const express = require("express");
const router = express.Router();
const RoleController = require("../controllers/Reporting/roles.controller");
router.get("/role", RoleController.index);
router.post("/role", RoleController.add);
router.get("/role/:id", RoleController.show);
router.put("/role/:id", RoleController.update);
router.delete("/role/:id", RoleController.destroy);

module.exports = router;