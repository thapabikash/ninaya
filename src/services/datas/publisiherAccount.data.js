"use strict";
const models = require("../../models/index");
const providerLink = require("./providerLink.data");
const parseUrl = require("url-parse");
const {transform} = require("lodash");
const moment = require("moment");

const PulisherAccount = models.publisher_accounts;
const TargetingRule = models.targeting_rules;
const {getRevenueShare} = require("./shareRevenue.data");

//for generating updating targetings objects
/**
 * @param {*} targeting_rules - targeting rules array
 * @param {*} publisher_id- publisher id integer
 * @param {*} index- index of targeting rules array
 * @param {*} provider- provider object
 * @param {*} targeting_id- targeting id integer
 * @param {*} providerlinks- provider links
 * @param {*} parsed- parsed url object
 * @returns
 */

async function shareRevenueSetting() {
    const shareRevenue = await getRevenueShare();
    if (shareRevenue) {
        return shareRevenue?.share_revenue;
    } else {
        return null;
    }
}

function generateMapperObj(
    targeting_rules,
    publisher_id,
    index = null,
    provider,
    targeting_id,
    providerlinks,
    parsed
) {
    const mapper = {};
    let pathname = parsed?.pathname;
    (mapper["rule_id"] = targeting_rules.id),
        (mapper["publisher_id"] = publisher_id);
    mapper["provider_id"] = provider.provider_id;
    mapper["tid"] = targeting_id;
    mapper["link_id"] = providerlinks.id;
    mapper["rule_index"] = index;
    (mapper["source_identifier"] =
        providerlinks?.provider.link_source_identifier),
        (mapper["sin"] = linkIdentifierFromLink(
            pathname,
            parsed,
            providerlinks?.provider?.link_source_identifier
        ));
    mapper["status"] = true;
    return mapper;
}

async function findAllMappers(options = {}) {
    const {count, rows} = await PulisherAccount.findAndCountAll({
        attributes: {exclude: ["createdAt", "updatedAt"]},
        include: [
            {
                model: models.publishers,
                attributes: ["id", "name"],
                required: false,
            },
            {
                model: models.providers,
                attributes: ["id", "name"],
                required: false,
            },
        ],
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

async function findAllPublisherAccountsForReports(options = {}) {
    const rows = await PulisherAccount.findAll({
        attributes: {exclude: ["updatedAt"]},
        include: [
            {
                model: models.provider_links,
                attributes: [
                    "id",
                    "platform_id",
                    "tag_type_id",
                    "search_engine_id",
                ],
                required: false,
            },
        ],
        order: [["to_date", "ASC"]],
        ...options,
    });
    return {
        data: rows,
    };
}

async function findAccountByTargeting(params = {}) {
    return await PulisherAccount.findAll({
        where: params,
        attributes: {exclude: ["createdAt", "updatedAt"]},
        include: [
            {
                model: models.publishers,
                required: false,
                attributes: {
                    exclude: ["createdAt", "updatedAt"],
                },
            },
            {
                model: models.providers,
                required: false,
                attributes: {
                    exclude: ["createdAt", "updatedAt"],
                },
            },
        ],
    });
}

async function findAccountsById(id) {
    const account = await PulisherAccount.findOne({
        where: {id: id},
        attributes: {exclude: ["createdAt", "updatedAt"]},
        include: [
            {
                model: models.publishers,
                required: false,
                attributes: {
                    exclude: ["createdAt", "updatedAt"],
                },
            },
            {
                model: models.providers,
                required: false,
                attributes: {
                    exclude: ["createdAt", "updatedAt"],
                },
            },
            {
                model: models.targetings,
                required: false,
                attributes: {
                    exclude: ["createdAt", "updatedAt"],
                },
            },
        ],
    });
    return account;
}

//update Publisher Account
async function updatePublisherAccount(publisherAccountId, data) {
    return await PulisherAccount.update(data, {
        where: {id: publisherAccountId},
    });
}

async function updatePublisherAccountByAdID(advertiserId, data, res) {
    const account = await PulisherAccount.findAll({
        where: {provider_id: advertiserId},
    });
    if (account.length > 0) {
        for (let acc of account) {
            try {
                let link_id = acc.link_id;
                const link = await providerLink.findOne({id: link_id});
                if (link) {
                    const linkstring = link.link;
                    const parsed = parseUrl(linkstring, true);
                    let pathname = parsed?.pathname;
                    let sin = linkIdentifierFromLink(
                        pathname,
                        parsed,
                        data?.source_identifier
                    );
                    if (!sin) {
                        await PulisherAccount.destroy({
                            where: {
                                id: acc.id,
                            },
                        });
                    } else {
                        await PulisherAccount.update(
                            {...data, sin: sin},
                            {
                                where: {provider_id: advertiserId},
                            }
                        );
                    }
                } else {
                    throw new Error("link not exist");
                }
            } catch (error) {
                console.log(error, "===error===");
            }
        }
    }
}

//find identifier if link have not any identifying params
function linkIdentifierFromLink(
    path = null,
    parsed = null,
    source_identifier = null
) {
    if (parsed && path) {
        if (parsed?.query && source_identifier) {
            let identifier = null;
            const checkMultipleSourceIdentifiers = source_identifier.split(",");
            const reqObj = transform(
                parsed?.query,
                function (result, val, key) {
                    result[key.toLowerCase()] = val;
                }
            );
            for (let source of checkMultipleSourceIdentifiers) {
                let link_source_identifier = source.toLowerCase();
                if (reqObj[link_source_identifier]) {
                    identifier = reqObj[link_source_identifier];
                }
            }
            return identifier;
        }
        if (path) {
            let mySubString = path.substring(
                path.indexOf("/"),
                path.lastIndexOf("/")
            );
            let splitPath = mySubString.split("/");
            var filtered = splitPath.filter(el => el != "");
            return filtered[filtered.length - 1];
        }
    } else {
        return null;
    }
}

//new create and update publisher account

/**
 * @param {*} data
 * @targeting_rules [{rules}]
 * @publisher_id -integer
 * @targeting_id -integer
 * @returns {*} -{ uncreatedAccount, createdAccount }
 */
async function createUpdatePublisherAccount(data) {
    const {targeting_rules, publisher_id, targeting_id} = data;
    const shareRevenue = await shareRevenueSetting();
    let uncreatedAccount = [];
    let createdAccount = [];
    for (let i = 0; i < targeting_rules.length; i++) {
        let rules = targeting_rules[i];
        if (rules?.disabled === true || rules?.deleted === true) {
            //disabled all related publisher tags with this rule
            await updateWhenTargetingDisabled(rules?.id ? rules?.id : null);
        } else {
            for (let k = 0; k < rules.provider_details.length; k++) {
                let provider = rules.provider_details[k];
                const providerlinks = await providerLink.findOne({
                    id: provider.provider_link,
                });
                const parsed = parseUrl(providerlinks.link, true);
                let pathname = parsed?.pathname;
                let sin = linkIdentifierFromLink(
                    pathname,
                    parsed,
                    providerlinks?.provider?.link_source_identifier
                );

                const existing = await PulisherAccount.findAll({
                    where: {
                        rule_id: rules?.id,
                        publisher_id: publisher_id,
                        provider_id: provider.provider_id,
                        rule_index: k,
                        tid: targeting_id,
                    },
                });

                if (existing.length > 0 && sin) {
                    //edit publisher ad accounts
                    for (let j = 0; j < existing.length; j++) {
                        let exist = existing[j];
                        let mapper = generateMapperObj(
                            targeting_rules[i],
                            publisher_id,
                            k,
                            provider,
                            targeting_id,
                            providerlinks,
                            parsed
                        );
                        await updateWhenExistAccountwithRuleId(
                            mapper["rule_id"],
                            targeting_id,
                            k
                        );
                        await PulisherAccount.update(
                            {...mapper, to_date: null},
                            {
                                where: {id: exist.id},
                            }
                        );
                        createdAccount.push({
                            ...mapper,
                            message: "Account updated",
                        });
                    }
                } else {
                    if (providerlinks && sin) {
                        //add publisher add new accounts
                        let mapper = generateMapperObj(
                            targeting_rules[i],
                            publisher_id,
                            k,
                            provider,
                            targeting_id,
                            providerlinks,
                            parsed
                        );

                        await updateWhenExistAccountwithRuleId(
                            mapper["rule_id"],
                            targeting_id,
                            k
                        );
                        mapper["share_revenue"] = shareRevenue
                            ? shareRevenue
                            : null;
                        await PulisherAccount.create(mapper);
                        createdAccount.push({
                            ...mapper,
                            message: "New account created",
                        });
                    } else {
                        uncreatedAccount.push({
                            rule_id: rules?.id, //rule_id
                            publisher_id: publisher_id,
                            provider_id: provider.provider_id,
                            rule_index: k,
                            tid: targeting_id,
                            sin: "not set",
                            message:
                                "Provider link or Source identifier not set",
                        });
                    }
                }
            }
        }
    }
    return {uncreatedAccount, createdAccount};
}

async function getPublisherAccount(options = {}) {
    return await PulisherAccount.findOne({
        where: options,
    });
}

//call this function from disabled/archive targeting rule
async function updateWhenTargetingDisabled(rule_id = null) {
    if (rule_id) {
        await PulisherAccount.update(
            {
                to_date: moment().utc().subtract(1, "d").format(),
                status: false,
            },
            {
                where: {
                    rule_id: rule_id,
                    status: true,
                },
            }
        );
    }
}

//update publisher ad accounts when if there exist same link and sin
async function updateWhenExistAccountwithRuleId(
    rule_id = null,
    targeting_id = null,
    index = null
) {
    await PulisherAccount.update(
        {
            to_date: moment().utc().subtract(1, "d").format(),
            status: false,
        },
        {
            where: {
                rule_id: rule_id,
                rule_index: index,
                tid: targeting_id,
                status: true,
            },
        }
    );
}

//verify is already exist publisher ad accounts with link_id,sin and status active
async function verifyIsAccountExistWithLinkIdSubId(link_ids = []) {
    let existPubAccounts = [];
    for (let link_id of link_ids) {
        const providerlinks = await providerLink.findOne({
            id: link_id,
        });
        if (providerlinks) {
            const parsed = parseUrl(providerlinks.link, true);
            let pathname = parsed?.pathname;
            let sin = linkIdentifierFromLink(
                pathname,
                parsed,
                providerlinks?.provider?.link_source_identifier
            );
            if (sin) {
                let accounts = await PulisherAccount.findAll({
                    where: {
                        sin: sin,
                        link_id: link_id,
                        status: true,
                    },
                    attributes: [
                        "id",
                        "rule_id",
                        "link_id",
                        "sin",
                        "tid",
                        "status",
                    ],
                });
                if (accounts.length > 0) {
                    existPubAccounts.push(...accounts);
                }
            }
        }
    }
    return [...new Set(existPubAccounts)];
}

module.exports = {
    findAllMappers,
    updatePublisherAccount,
    // findPublisheAccountByIdentifier,
    findAccountByTargeting,
    findAccountsById,
    createUpdatePublisherAccount,
    updatePublisherAccountByAdID,
    findAllPublisherAccountsForReports,
    getPublisherAccount,
    updateWhenTargetingDisabled,
    verifyIsAccountExistWithLinkIdSubId,
    shareRevenueSetting,
    linkIdentifierFromLink,
};
