const models = require("../../src/models");
const TargetingRule = models.targeting_rules;
const PublisherAdAccount = models.publisher_accounts;
const moment = require("moment");
const {successResponse} = require("../response");
const parseUrl = require("url-parse");
const {transform, uniqWith, isEqual} = require("lodash");
const {
    shareRevenueSetting,
} = require("../../src/services/datas/publisiherAccount.data");

async function updatePublisherAddAccounts(req, res, next) {
    const updated = [];
    const rules = await TargetingRule.findAll({
        where: {
            deleted: true,
        },
    });
    if (rules.length > 0) {
        for (let i = 0; i < rules.length; i++) {
            const rule = rules[i];
            const publisherAccount = await PublisherAdAccount.findAll({
                where: {
                    rule_id: rule.id,
                    to_date: null,
                },
            });
            if (publisherAccount.length > 0) {
                for (let j = 0; j < publisherAccount.length; j++) {
                    const account = publisherAccount[j];
                    const up = await PublisherAdAccount.update(
                        {
                            status: false,
                            to_date: moment().utc().subtract(1, "d").format(),
                        },
                        {
                            where: {
                                id: account.id,
                            },
                        }
                    );
                    updated.push(up);
                }
            }
        }
        return successResponse(res, "Updated!", {
            rules,
            updatedAccount: updated,
        });
    } else {
        return successResponse(res, "No Rules!", rules);
    }
}

//select count(*) as count ,jsonb_array_elements(tr.provider_details::jsonb)->'provider_link' as provider_links
//from targeting_rules tr where disabled = false group by jsonb_array_elements(tr.provider_details::jsonb)->'provider_link' ORDER BY count DESC
// let excludeTags = [
//     939, 1016, 7, 1024, 891, 1083, 1082, 781, 241, 962,
//     1191, 240, 261, 768, 770, 1285, 389, 769, 1200, 842,
//     64,
// ];

//find identifier if link have not any identifying params
function linkIdentifierFromLink(
    path = null,
    parsed = null,
    source_identifier = null
) {
    if (parsed && path) {
        if (parsed?.query && source_identifier) {
            let link_source_identifier = source_identifier.toLowerCase();
            const reqObj = transform(
                parsed?.query,
                function (result, val, key) {
                    result[key.toLowerCase()] = val;
                }
            );
            return reqObj[link_source_identifier]
                ? reqObj[link_source_identifier]
                : null;
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

function madeUniqueArrayFromObject(array) {
    return uniqWith(array, isEqual);
}

function status(data) {
    if (data.rule_disabled || data.rule_deleted) {
        return true;
    } else {
        return false;
    }
}

async function getAllRules() {
    return await TargetingRule.findAll({
        include: [
            {
                model: models.targetings,
            },
        ],
        order: [["id", "DESC"]],
    });
}

function createdInCurrentMonths(date = null) {
    const startOfMonth = moment().startOf("month").format("YYYY-MM-DD hh:mm");
    const endOfMonth = moment().endOf("month").format("YYYY-MM-DD hh:mm");
    const dateToCheck = date;
    const isInRage = moment(dateToCheck).isBetween(startOfMonth, endOfMonth);
    return isInRage;
}

//create/update publisher ad account from old targeting rules whose publisher ad account were not created
async function createPublisherAdAccountFromOldRules(req, res, next) {
    try {
        const arrayOfRuleswithSubIds = [];
        const needToDisabledRule = [];
        const needTocreateAccount = [];
        const alreadydisabledRules = [];

        //get all rules which is not disabled and deleted

        let allRules = await getAllRules();

        const shareRevenue = await shareRevenueSetting();

        for (let rule of allRules) {
            //for subrule to extract each rules advertiser tags
            for (let subRule of rule.provider_details) {
                let subIdsRule = {};

                const provider = await models.providers.findByPk(
                    subRule.provider_id
                );
                const provider_link = await models.provider_links.findByPk(
                    subRule.provider_link
                );

                if (provider?.link_source_identifier) {
                    const parsed = parseUrl(provider_link.link, true);
                    let pathname = parsed?.pathname;
                    let sin = linkIdentifierFromLink(
                        pathname,
                        parsed,
                        provider?.link_source_identifier
                    );
                    if (sin) {
                        subIdsRule["rule_id"] = rule.id;
                        subIdsRule["tag_id"] = rule.targeting.id;
                        subIdsRule["publisher_id"] =
                            rule.targeting.publisher_id;
                        subIdsRule["advertiser_id"] = subRule.provider_id;
                        subIdsRule["link_id"] = subRule.provider_link;
                        subIdsRule["link"] = provider_link.link;
                        subIdsRule["index"] = 0;
                        subIdsRule["sin"] = sin;
                        subIdsRule["link_source_identifier"] =
                            provider?.link_source_identifier || null;
                        subIdsRule["rule_deleted"] = rule.deleted;
                        subIdsRule["rule_disabled"] = rule.disabled;
                        subIdsRule["rule_created_at"] = rule.updatedAt;
                        arrayOfRuleswithSubIds.push(subIdsRule);
                    }
                }
            }
        }

        for (let rule of arrayOfRuleswithSubIds) {
            const RelatedPublisherAccounts = await PublisherAdAccount.findOne({
                where: {
                    provider_id: rule.advertiser_id,
                    link_id: rule.link_id,
                    sin: rule.sin,
                    rule_id: rule.rule_id,
                },
            });
            if (RelatedPublisherAccounts) {
                //do nothing because already exist pub account for that rule with same credentials i.e subId,link_id etc
            } else {
                //serch is exist with others rule
                const publisherAdAccount = await PublisherAdAccount.findOne({
                    where: {
                        provider_id: rule.advertiser_id,
                        link_id: rule.link_id,
                        sin: rule.sin,
                        status: true,
                    },
                });
                if (publisherAdAccount) {
                    if (status(rule)) {
                        //to create publisher add account but exist in publisher ad account with same sin,link_id,provider_id with disabled rule
                        if (createdInCurrentMonths(rule.rule_created_at)) {
                            await PublisherAdAccount.create({
                                provider_id: rule.advertiser_id,
                                link_id: rule.link_id,
                                sin: rule.sin,
                                publisher_id: rule.publisher_id,
                                tid: rule.tag_id,
                                rule_index: rule.index,
                                source_identifier: rule.link_source_identifier,
                                rule_id: rule.rule_id,
                                to_date: rule.rule_created_at,
                                share_revenue: shareRevenue
                                    ? shareRevenue
                                    : null,
                                status: false,
                            });
                        }

                        alreadydisabledRules.push(rule);
                    } else {
                        //if rule is not disabled or deleted
                        needToDisabledRule.push({
                            "failed to create": {
                                tag_id: rule.tag_id,
                                rule_id: rule.rule_id,
                                provider_id: rule.advertiser_id,
                                link_id: rule.link_id,
                            },
                            "exists in another active rule ": {
                                need_to_disabled_rule:
                                    publisherAdAccount.rule_id,
                                related_disabled_tag: publisherAdAccount.tid,
                                status: publisherAdAccount.status,
                            },
                        });
                    }
                } else {
                    //to create publisher ad account which is not found with sin,link_id,provider_id
                    await PublisherAdAccount.create({
                        provider_id: rule.advertiser_id,
                        link_id: rule.link_id,
                        sin: rule.sin,
                        publisher_id: rule.publisher_id,
                        tid: rule.tag_id,
                        rule_index: rule.index,
                        source_identifier: rule.link_source_identifier,
                        rule_id: rule.rule_id,
                        to_date: status(rule) ? rule.rule_created_at : null,
                        share_revenue: shareRevenue ? shareRevenue : null,
                        status: status(rule) ? false : true,
                    });
                    needTocreateAccount.push(rule);
                }
            }
        }
        const uniqueNeedTocreateAccount =
            madeUniqueArrayFromObject(needTocreateAccount);
        const uniqueNeedToDisabledRule =
            madeUniqueArrayFromObject(needToDisabledRule);
        const uniqueAlreadydisabledRules =
            madeUniqueArrayFromObject(alreadydisabledRules);

        return successResponse(res, "New Status!", {
            uniqueAlreadydisabledRules,
            uniqueNeedTocreateAccount,
            uniqueNeedToDisabledRule,
        });
    } catch (error) {
        console.log(error);
        next(error);
    }
}

module.exports = {
    updatePublisherAddAccounts,
    createPublisherAdAccountFromOldRules,
};
