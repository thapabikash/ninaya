const models = require("../../../../src/models/index");
const sequelize = require("sequelize");

async function getAdvertiser(advertiser_id = null) {
    const query = `select * from providers where id=${advertiser_id}`;
    if (advertiser_id) {
        const advertiser = await models.sequelize.query(query, {
            type: sequelize.QueryTypes.SELECT,
        });
        return advertiser;
    }
    return null;
}
module.exports = {
    getAdvertiser,
};
