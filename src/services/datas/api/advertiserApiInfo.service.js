const models = require("../../../models/index");
const AdvertiserApiInfos = models.advertiser_api_infos;
async function getAdvertiserApiInfo(options = {}) {
    const {count, rows} = await AdvertiserApiInfos.findAndCountAll({
        ...options,
    });
    const total = count.length || count;
    return {
        total,
        data: rows,
        limit: options.limit,
        pageCount: Math.ceil(total / options.limit),
    };
}

async function updateAdvertiserApiInfo(data = {}, advertiser_id = null) {
    const result = await AdvertiserApiInfos.update(data, {
        where: {
            advertiser_id,
        },
    });
    return result;
}

async function getApiInfoById(options = {}) {
    const result = await AdvertiserApiInfos.findOne({...options});
    return result;
}

module.exports = {
    getAdvertiserApiInfo,
    updateAdvertiserApiInfo,
    getApiInfoById,
};
