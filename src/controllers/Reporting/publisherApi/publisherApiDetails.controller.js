const {log} = require("../../../../helpers/logger");
const {successResponse} = require("../../../../helpers/response");
const publisherApiDetailsService = require("../../../services/datas/publisherApi/publisherApiDetails.data");

const {
    generateHashToken,
} = require("../../../../helpers/publisherRevenueApi/tokenEncription");
const {date} = require("joi");

async function getPublisherApiDetails(req, res, next) {
    try {
        const id = req?.params?.id;
        const publisherApiDetails = await publisherApiDetailsService.getById(
            id
        );
        return successResponse(
            res,
            "Publisher API Details",
            publisherApiDetails
        );
    } catch (err) {
        next(err);
        log.error(err.message || err);
    }
}

/**
 * controller to update to regenerate api token for publisher
 */
async function postUpdatePublisherApiDetails(req, res, next) {
    try {
        // token check 
        // if no token generate token
        // if token exist tyo token lai old token ma move garni
        // new token lai token ma update garni
        const id = req.params.id;
        const fields = [
            "date",
            "total_searches",
            "clicks",
            "tag_id",
            "publisher",
            "monetized_searches",
            "geo",
            "gross_revenue",
        ];
        const data = {
            publisher_id: id,
            api_key: generateHashToken("" + id),
            is_active: true,
            expire_at: new Date(),
            fields: fields,
            old_tokens: []
        };
        const publisherApiDetails =
            await publisherApiDetailsService.postApiDetails(data, id);

        if (publisherApiDetails) {
            return successResponse(
                res,
                "Publisher API Details",
                publisherApiDetails
            );
        } else {
            throw new Error(
                `Publisher API Details not found for the publisher - ${id}`
            );
        }
    } catch (err) {
        next(err);
        log.error(err.message || err);
    }
}

async function getPublisherApiDetailsByAccountId(req, res, next) {
    try {
        const acc_id = req?.params?.id;
        const publisherApiDetails = await publisherApiDetailsService.getByAccId(
            acc_id
        );
        return successResponse(
            res,
            "Publisher API Details",
            publisherApiDetails
        );
    } catch (err) {
        next(err);
        log.error(err.message || err);
    }
}

module.exports = {
    getPublisherApiDetails,
    postUpdatePublisherApiDetails,
    getPublisherApiDetailsByAccountId,
};
