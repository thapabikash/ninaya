const express = require("express");
const router = express.Router();
const {
    updatePublisherAddAccounts,
    createPublisherAdAccountFromOldRules,
} = require("../../helpers/script/updatePubAdAccount.script");
router.get("/updatepubaccount/account", updatePublisherAddAccounts);
router.get("/re_update/pub_account", createPublisherAdAccountFromOldRules);

module.exports = router;
