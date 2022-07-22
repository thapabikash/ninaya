"use strict";
const models = require("../../models/index");
const RevenueShares = models.revenue_share;

async function addRevenueShare(data = {}) {
    const existing = await RevenueShares.findOne();
    if (existing) {
        return await RevenueShares.update(data, {
            where: {
                id: existing.id,
            },
        });
    } else {
        return await RevenueShares.create(data);
    }
}

async function getRevenueShare() {
    return await RevenueShares.findOne({});
}

module.exports = {
    addRevenueShare,
    getRevenueShare,
};
