const models = require("../../../models/index");
const ApiDetails = models.publisher_api_details;
const Publishers = models.publishers;
const Account = models.users;

async function getById(id = null) {
    return await ApiDetails.findOne({
        where: {
            publisher_id: id,
        },
        include: [
            {
                model: models.publishers,
                as: "publisher",
                attributes: ["id", "name"],
            },
        ],
    });
}

async function getByAccId(id = null) {
    const publisher = await Account.findOne({
        where: {
            id: id,
        },
    });
    if (publisher && publisher.publisher_id) {
        return await getById(publisher.publisher_id);
    }
}

async function postApiDetails(data = {}, publisher_id = null) {
    const is_publisher_exist = await Publishers.findOne({
        where: {
            id: publisher_id,
        },
    });
    // if the user of the id exists
    if (is_publisher_exist) {
        let is_existDetails = await ApiDetails.findOne({
            where: {
                publisher_id: publisher_id,
            },
        });
        // if not previous token exists
        if (!is_existDetails) {
            return await ApiDetails.create(data);
        } else {
            let old_tokens = is_existDetails.old_tokens || [];
            return await is_existDetails.update({...data, old_tokens: [...old_tokens, is_existDetails.api_key]});
        }
    } else {
        throw new Error(`Publisher not found with Id - ${publisher_id}`);
    }
}

module.exports = {
    getById,
    postApiDetails,
    getByAccId,
};
