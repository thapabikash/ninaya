const CustomError = require("../customError");
const models = require("../../src/models/index");
const PublisherApiDetails = models.publisher_api_details;
const {decrypthashToken} = require("./tokenEncription");
const moment = require("moment");

async function publisherRevenueAuth(req, res, next) {
    try {
        const api_key = req?.query?.api_key;
        const {from_date, to_date} = req.query;
        if (api_key) {
            const publisher_id = await decrypthashToken(api_key);
            // get the publisher api details by only id
            const publisherApiDetails = await PublisherApiDetails.findOne({
                where: {
                    publisher_id: +publisher_id,
                    is_active: true
                }
            })
            if(!publisherApiDetails){
                throw new Error("Unauthorized request");
            };
            // check if token matches
            if(publisherApiDetails.api_key !== api_key){
                // check if the token exist in the old column
                if(publisherApiDetails.old_tokens.includes(api_key)){
                    // TODO send email
                    throw new Error("You are using old token");
                }else{
                    throw new Error("Something went wrong");
                }
            }
            // const publisherApiDetails = await PublisherApiDetails.findOne({
            //     where: {
            //         api_key,
            //         publisher_id: +publisher_id,
            //         is_active: true,
            //     },
            // });
                req.publisher_id = +publisher_id;
                if (
                    validateDateFormat(from_date,"from_date") &&
                    validateDateFormat(to_date,"to_date")
                ) {
                    next();
                } else {
                    throw new Error("Valid date format (YYYY-MM-DD) is required");
                }
        } else {
            throw new Error("Token (api_key) is required");
        }
    } catch (error) {
        next(
            new CustomError.BadRequest(
                error?.message || "Unauthorised request",
                400
            )
        );
    }
}

const validateDateFormat = (date,type) => {
    if(!date){
              throw new Error(`Date field ${type} is required`)      
    }else{
        return moment(date, "YYYY-MM-DD",true).isValid();
    }
   
};

module.exports = {
    publisherRevenueAuth,
};
