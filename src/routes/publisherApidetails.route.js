const express = require("express");
const router = express.Router();
const PublisherApiDetailsController = require("../controllers/Reporting/publisherApi/publisherApiDetails.controller");

router.get(
    "/publisher/api/details/:id",
    PublisherApiDetailsController.getPublisherApiDetails
);
router.post(
    "/publisher/api/details/:id",
    PublisherApiDetailsController.postUpdatePublisherApiDetails
);

router.get(
    "/publisher/api/details/account/:id",
    PublisherApiDetailsController.getPublisherApiDetailsByAccountId
);

module.exports = router;
