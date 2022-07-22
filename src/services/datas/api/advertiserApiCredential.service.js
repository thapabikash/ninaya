"use strict";
const models = require("../../../models/index");

const AdvertiserApiInfos = models.advertiser_api_infos;
const Providers = models.providers;
async function addCredentialService(data = [], advertiser_id = null) {
    const updated = await Providers.update(
        {api_credentials: data},
        {
            where: {
                id: advertiser_id,
            },
        }
    );
    if (updated && advertiser_id) {
        const advertiserInfos = await AdvertiserApiInfos.findOne({
            where: {
                advertiser_id: advertiser_id,
            },
        });
        if (!advertiserInfos) {
            await AdvertiserApiInfos.create({
                advertiser_id: advertiser_id,
            });
        }
    }
    return updated;
}

async function getCredentialService(advertiser_id = null) {
    return await Providers.findOne({
        where: {
            id: advertiser_id,
        },
        attributes: ["api_credentials"],
    });
}

module.exports = {
    addCredentialService,
    getCredentialService,
};
