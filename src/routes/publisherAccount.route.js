const express = require("express");
const router = express.Router();

const publisherAccountController = require("../controllers/publisher_account.controller");

router.get("/pubaccount", publisherAccountController.index);
router.get("/pubaccount/:id", publisherAccountController.findAccountById);
router.put("/pubaccount/:id", publisherAccountController.updateAccount);
router.get(
    "/pubaccount/:pid/:tid/:rid",
    publisherAccountController.getAccountByTargetingId
);
router.post("/pubaccount/verify", publisherAccountController.verifyPubAccounts);

module.exports = router;
