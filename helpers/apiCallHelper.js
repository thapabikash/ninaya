/**
 * third party api helper
 * calls api with given data and options
 */

const axios = require("axios");
const https = require("https");
const {log} = require("../helpers/logger");

/**
 *
 * @param {*} req_url
 * @param {*} headers
 * @param {*} body
 * @param {*} req_method
 * @returns
 */

async function requestThirdPartyApi(req_url, headers, body, req_method) {
    try {
        let response;
        const agent = new https.Agent({rejectUnauthorized: false});
        if (req_method === "get") {
            response = await axios.get(req_url, {httpsAgent: agent});
        } else {
            let responses = await axios.post(req_url, body, {
                headers: headers,
            });

            if (responses.status === 200) {
                response = responses;
            } else {
                throw new Error("No response from gixMedia api");
            }
        }
        return response;
    } catch (err) {
        console.log(err, "erroro");
        throw Error(err.message || err);
    }
}

module.exports = {requestThirdPartyApi};
