const models = require("../../../../src/models/index");
const sequelize = require("sequelize");
const moment = require("moment");

/**
 *
 * @param {*} advertiser_id - advertiserId/providerId
 * @returns
 */

const fromAndTodate = async (advertiser_id, obj = {}) => {
    const query = `select date from reports where advertiser_id=${advertiser_id} AND source='Api'  order by date desc LIMIT 1`;
    const to_date = moment().format(obj.params.data_format);
    let from_date = moment().subtract(3, "days").format(obj.params.data_format);
    if (advertiser_id) {
        const d1 = await models.sequelize.query(query, {
            type: sequelize.QueryTypes.SELECT,
        });
        if (d1 && d1.length > 0) {
            from_date = moment(d1[0]?.date)
                .subtract(1, "days")
                .format(obj.params.data_format);
        }
    }
    return {from_date, to_date};
};

module.exports = {
    fromAndTodate,
};
