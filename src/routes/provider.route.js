const express = require("express");
const router = express.Router();

const ProviderController = require("../controllers/provider.controller");
const ProvLinkController = require("../controllers/providerLink.controller");

router.get("/providers", ProviderController.index);
router.post("/provider", ProviderController.add);
router.post("/provider/:id/links", ProvLinkController.add);
router.get("/provider/all/links", ProvLinkController.findProviderWithFilter);
router.post(
    "/provider/:id/identicallinks",
    ProvLinkController.checkIsIdenticalLink
);
router.get("/provider/:id", ProviderController.show);
router.get("/provider/:id/links", ProviderController.getLinksById);
router.put("/provider/:id", ProviderController.update);
router.put("/providers", ProviderController.bulkUpdate);
router.delete("/provider/:id", ProviderController.destroy);
router.get("/providers/links", ProvLinkController.index);
router.delete("/provider/link/:id", ProvLinkController.destroy);
router.delete("/providers", ProviderController.bulkDestroy);

module.exports = router;
