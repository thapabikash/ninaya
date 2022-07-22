const config = require("../../../../config/advertiserApi.config");
const {requestThirdPartyApi} = require("../../../../helpers/apiCallHelper");
const models = require("../../../models/index");
const {Op} = require("sequelize");
const parseUrl = require("url-parse");
const AdvertiserApiInfos = models.advertiser_api_infos;

/***
 *
 * @param params
 * @returns {Promise.<*>}
 * @param from_date - YYYY-MM-DD
 * @param to_date - YYYY-MM-DD
 * @param type - stats,recent
 * @param format - json,csv
 */

async function getStatsReport({advertiser_code = "", url = "", ...params}) {
    let headers = null;
    let result = null;
    if (advertiser_code === config.GIX_MEDIA_CODE) {
        result = await gixMediaApi(url, params);
    } else {
        if (advertiser_code === config.FUSE_BUTTON_CODE) {
            url = url + "&p=ni1";
        }
        if (advertiser_code === config.SHOWCASE_CODE) {
            url = url + "&user=ninayaio";
        }
        result = await requestThirdPartyApi(url, headers, null, "get");
        if (result) {
            //for EVERNETRIX ADVERTISER
            if (advertiser_code === config.EVERNETRIX_CODE) {
                let datas = result?.data?.data;
                let d = datas.map((em, i) => {
                    return {
                        Date: em[0],
                        "Search Channel": em[2],
                        Country: em[3],
                        "Total Searches": em[4],
                        "Monetized Searches": em[5],
                        Clicks: em[6],
                        Amount: em[7],
                    };
                });
                result = {status: true, data: d};
            }

            //for AKA advertiser
            if (advertiser_code === config.AKA_CODE) {
                if (result.data.length > 0) {
                    let datas = result?.data[0].rows
                        ? result?.data[0].rows
                        : result?.data;
                    result = {status: true, data: datas};
                } else {
                    result = {
                        status: false,
                        data: [],
                        message: "No data found",
                    };
                }
            }
        } else {
            result = {
                status: false,
                data: [],
                message: result?.message
                    ? result.message
                    : "No response from api/Api has been failed",
            };
        }
    }
    return result;
}

/**
 *
 * @param {*} type -advertiser code
 * @returns
 */
async function getRecentDbStatus(type) {
    try {
        let headers = null;
        const url = `${process.env.D2R_DB_STATUS_URL}?key=${config.d2r.apiKey}`;
        let response = await requestThirdPartyApi(url, headers, null, "get");
        return response.data;
    } catch (error) {
        console.log("====" + error + "====");
    }
}

async function applyCronedWithProviders(data = {}) {
    const {selected} = data;
    const advertisers = await AdvertiserApiInfos.findAll({
        where: {
            id: {
                [Op.in]: [...selected],
            },
        },
        include: [
            {
                model: models.providers,
            },
        ],
    });
    return advertisers;
}

async function gixMediaApi(url, info = {}) {
    let result = null;
    try {
        const parsedUrl = parseUrl(url, true);
        const token = parsedUrl.query.token;
        const from_date = parsedUrl.query.FromDate;
        const to_date = parsedUrl.query.ToDate;
        const type = parsedUrl.query.Format;
        const baseUrl =
            parsedUrl.protocol + "//" + parsedUrl.host + parsedUrl.pathname;
        let body = {
            FromDate: from_date || info.from_date,
            ToDate: to_date || info.to_date,
            Format: type || info.format,
            GroupBy: ["Date", "DistributerId", "Channel", "Country"],
            Fields: ["Searches", "MonetizedSearches", "Clicks", "NetRev"],
        };
        let headers = {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        };
        const response = await requestThirdPartyApi(
            baseUrl,
            headers,
            body,
            "post"
        );
        if (response) {
            result = {status: true, data: response};
        } else {
            throw new Error("No response from gixMedia api");
        }
    } catch (error) {
        result = {status: false, data: [], message: error.message};
    }
    return result;
}

module.exports = {
    getStatsReport,
    getRecentDbStatus,
    applyCronedWithProviders,
    gixMediaApi,
};
