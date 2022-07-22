const sequelize = require("sequelize");
const {Op} = sequelize;
const {log} = require("../../../../helpers/logger");
const title = "Publisher Revenue";
const moment = require("moment");
const fs = require("fs");
const {successResponse} = require("../../../../helpers/response");
const publisherRevenueService = require("../../../services/datas/publisherApi/publisherRevenueApi.data");

async function getPublisherRevenue(req, res, next) {
    try {
        let options = {};
        const {from_date, to_date} = req.query;
        let type = req.query.format ? req.query.format : "JSON";
        const publisher_id = req.publisher_id;
        const attribute = [
            ["date", "Date"],
            [
                sequelize.fn("sum", sequelize.col("total_searches")),
                "Total Searches",
            ],
            [sequelize.fn("sum", sequelize.col("clicks")), "Clicks"],
            [
                sequelize.fn("sum", sequelize.col("monetized_searches")),
                "Monetized Searches",
            ],
            // ["total_searches", "Total Searches"],
            //["clicks", "Clicks"],
            ["tag_id", "SubId"],
            ["publisher", "Publisher ID"],
            // ["monetized_searches", "Monetized Searches"],
            ["geo", "Country"],
            [
                sequelize.literal("cast(SUM(pub_revenue) as NUMERIC(10,3))"),
                "Net Revenue",
            ],
        ];
        if (from_date && to_date) {
            options = {
                ...options,
                publisher: publisher_id,
                date: {
                    [Op.gte]: from_date,
                    [Op.lt]: to_date,
                },
            };
            const publisherRevenue = await publisherRevenueService.index(
                options,
                attribute
            );
            if (type === "JSON") {
                return successResponse(
                    res,
                    "Revenue reports",
                    publisherRevenue
                );
            }
            if (type === "CSV") {
                if (publisherRevenue.length > 0) {
                    const file = await publisherRevenueService.generateCsvFile(
                        publisherRevenue,
                        "csv"
                    );
                    return res.sendFile(file, async function (err) {
                        try {
                            fs.unlink(file, () => {});
                        } catch (e) {
                            log.error("error removing ", file);
                        }
                    });
                } else {
                    return successResponse(
                        res,
                        "No data found",
                        publisherRevenue
                    );
                }
            } else {
                throw new Error("Not supported type (default: JSON)");
            }
        } else {
            throw new Error("Bad request");
        }
    } catch (err) {
        next(err);
        log.error(err.message || err);
    }
}

module.exports = {
    getPublisherRevenue,
};
