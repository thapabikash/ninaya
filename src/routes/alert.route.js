const express = require("express");
const router = express.Router();

const AlertController = require("../controllers/alert.controller");

router.get("/alert", AlertController.index);

module.exports = router;
