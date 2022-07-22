//for get all list of upload csv status with filter
const models = require("../../../models/index");
const Skipped_row_advertiser_api = models.skipped_row_advertiser_api; //get all uploaded csv files name
async function findAll(options = {}) {
    const {count, rows} = await Skipped_row_advertiser_api.findAndCountAll({
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

module.exports = {
    findAll,
};
