"use strict";
const {Op} = require("sequelize");
const models = require("../../models/index");
const ProviderLink = models.provider_links;
const PublisherAccount = models.publisher_accounts;
const parseUrl = require("url-parse");
const RuleProvider = models.rule_providers;
const TargetingRule = models.targeting_rules;
const Targeting = models.targetings;
const sequelize = require("sequelize");
/** function to get publisher id and name
 */
async function getPublisherIdAndName(targetingID) {
    let targeting = await Targeting.findOne({
        where: {
            id: targetingID,
        },
        // publisher model has publisher_id and publisher_name
        include: [
            {
                model: models.publishers,
                attributes: ["id", "name"],
                as: "publisher_info",
            },
        ],
    });

    return (
        targeting?.dataValues?.publisher_info?.dataValues || {
            id: 0,
            name: "No Publisher",
        }
    );
}

async function addPublishersToTargetObj(targetObj) {
    let memo_publisherInfo = {};
    let newTargetObject = [];
    for (let i = 0; i < targetObj.length; i++) {
        let target = targetObj[i];
        if (!memo_publisherInfo[target.tag_id]) {
            const publisherInfo = await getPublisherIdAndName(target.tag_id);
            memo_publisherInfo[target.tag_id] = publisherInfo;
            target.publisher = publisherInfo;
        } else {
            target.publisher = memo_publisherInfo[target.tag_id];
        }
        newTargetObject.push(target);
    }
    return newTargetObject;
}

/***
 *
 * @param params to create targeting rules
 * @param options options for passing attributes
 * @returns {Promise.<*>}
 */
async function findOneTargetingRule(params, options = {}) {
    let attributes = options.attr ? {attributes: options.attr} : "";
    let include = options.include ? {include: options.include} : "";
    const targetingRule = await TargetingRule.findOne({
        where: params,
        ...attributes,
        ...include,
    });
    return targetingRule;
}

/**
 *
 * @param {*} params
 * @returns {Promise.<*>}
 */
async function create(params) {
    const providerLinks = await ProviderLink.create(params);
    return providerLinks;
}

/**
 *
 * @param {*} params
 * @returns {Promise.<*>}
 */
async function update(params = {}, data) {
    const link = await ProviderLink.findByPk(params.id, {
        where: {deleted: false},
        include: [{model: models.providers}],
    });

    if (!link) {
        throw new Error("provider link not found!!");
    }

    const parsed = parseUrl(data.link, true);
    const publisherAccount = await PublisherAccount.findOne({
        where: {
            provider_id: data.provider_id,
            link_id: data.id,
            source_identifier: link?.provider.link_source_identifier,
        },
    });

    if (publisherAccount) {
        let datas = {
            sin: parsed.query[link?.provider.link_source_identifier],
        };
        await PublisherAccount.update(datas, {
            where: {provider_id: data.provider_id, link_id: data.id},
        });
    }

    const updatedLink = await ProviderLink.update(data, {where: params});
    return updatedLink;
}

/**
 *
 * @param {*} params
 * @returns {Promise.<*>}
 */
async function deleteProvLink(params = {}) {
    const link = await ProviderLink.findOne({where: params});
    if (!link) {
        throw new Error("Provider link not found");
    }
    const destroyed = await ProviderLink.update(
        {deleted: true},
        {where: params}
    );
    return destroyed;
}

/**
 *
 * @param {*} params
 * @returns {Promise.<*>}
 */
async function findOne(params = {}) {
    return ProviderLink.findOne({
        where: params,
        include: [{model: models.providers}],
    });
}

async function findTargetedObj(link_id = null) {
    return await models.sequelize.query(
        `SELECT disabled,targeting_id AS tag_id,rules.id AS rule_id,pub.name AS publisher_name,pub.id AS publisher_id FROM targeting_rules rules 
        INNER JOIN targetings target
        ON target.id=rules.targeting_id
        INNER JOIN publishers pub
        ON target.publisher_id=pub.id
        WHERE target.id IN (
                    SELECT targeting_id
                    from targeting_rules AS rule 
                    WHERE cast(rule.provider_details AS JSONB) @> '[{"provider_link":${link_id}}]'
                    AND rules.deleted=false
                     AND rule.id=rules.id
        )
                    `,
        {
            type: sequelize.QueryTypes.SELECT,
        }
    );
}

async function findAll(params = {}, provider_id = null, id = null) {
    return ProviderLink.findAll({
        where: {
            ...params,
            provider_id: {
                [Op.not]: provider_id,
            },
            id: {
                [Op.not]: id,
            },
        },
        attributes: ["id", "link"],
        include: [{model: models.providers, attributes: ["id", "name"]}],
    });
}

async function findAllProviderLinks(params) {
    const providerLinks = await ProviderLink.findAll(params);
    return providerLinks;
}

/**
 *
 * @param {*} providerLinks
 * return providerlinks with count of related rules
 */
async function addRelatedRulesCount(data) {
    const providerLinks = [...data];
    for (let i = 0; i < providerLinks.length; i++) {
        const link = providerLinks[i];
        const {count, rows} = await RuleProvider.findAndCountAll({
            where: {provider_link: link.id},
        });
        link.dataValues["no_of_rules"] = count;
        let activeRulesCount = 0;
        if (count > 0) {
            const targetObj = [];
            for (let j = 0; j < rows.length; j++) {
                const rp = rows[j];
                const ruleId = rp.dataValues.targeting_rule_id;
                const rule = await findOneTargetingRule(
                    {id: ruleId},
                    {
                        attr: ["id", "targeting_id", "disabled", "deleted"],
                    }
                );
                const ruleNotArchived = !rule.deleted;
                ruleNotArchived &&
                    targetObj.push({
                        tag_id: rule.targeting_id,
                        rule_id: ruleId,
                        disabled: rule.disabled,
                    });
                ruleNotArchived &&
                    !rule.disabled &&
                    (activeRulesCount = activeRulesCount + 1);
                targetObj.length === 0 && (link.dataValues["no_of_rules"] = 0);
                // targetObj.length !== 0 &&
                //     (link.dataValues["targetObj1"] =
                //         await addPublishersToTargetObj(targetObj));
                link.dataValues["no_of_active_rules"] = activeRulesCount;
            }
        }
    }
    return providerLinks;
}

async function index(params = {}) {
    const {count, rows} = await ProviderLink.findAndCountAll({...params});
    // const providerLinks = await addRelatedRulesCount(rows);
    const total = count.length || count;
    return {
        total,
        providerLinks: rows,
        limit: params.limit,
        pageCount: Math.ceil(total / params.limit),
    };
}

module.exports = {
    create,
    update,
    findOne,
    deleteProvLink,
    findAll,
    findAllProviderLinks,
    index,
    addRelatedRulesCount,
    findTargetedObj,
};
