"use strict";
const models = require("../../models/index");
const TargetingRule = models.targeting_rules;
const RuleProvider = models.rule_providers;
const publisherAccountService = require("./publisiherAccount.data");

/***
 *
 * @param params
 * @returns {Promise.<*>}
 */

async function findAllTargetingRules(params) {
    const targetingRules = await TargetingRule.findAll(params);
    return targetingRules;
}

/***
 *
 * @param data to create targeting rules
 * @returns {Promise.<*>}
 */
async function createTargetingRule(data) {
    const targetingRule = await TargetingRule.create(data);
    return targetingRule;
}

/***
 *
 * @param data array to bulk create targeting rules
 * @returns {Promise.<*>}
 */
async function bulkCreateTargetingRule(data = []) {
    const ruleArr = [];
    for (let i = 0; i < data.length; i++) {
        const targetingRule = await TargetingRule.create(data[i], {
            include: [{model: models.providers, as: "provider_info"}],
        });
        const rule_id = targetingRule.id;
        for (const provider of data[i].provider_details) {
            await RuleProvider.create({
                provider_id: provider.provider_id,
                targeting_rule_id: rule_id,
                provider_link: provider.provider_link,
                traffic: provider.traffic,
            });
        }
        ruleArr.push(targetingRule);
    }
    return ruleArr;
}

/***
 *
 * @param params array to bulk create targeting rules
 * @param data targeting rules data needs to be updated
 * @returns {Promise.<*>}
 */
async function updateTargetingRule(params, data) {
    // check if targetingRule exists
    const targetingRule = await TargetingRule.findByPk(params.id);
    if (!targetingRule) {
        throw new Error("TargetingRule not found!!");
    }
    const updatedTargetingRule = await TargetingRule.update(data, {
        where: params,
    });
    return updatedTargetingRule;
}

/***
 *
 * @param ids array of rule ids to bulk update
 * @param data array of targeting rules to bulk update
 * @returns {Promise.<*>}
 */
async function bulkUpdateTargetingRule(data, detail = {}) {
    const newRules = [];
    const skippedAccount = [];
    const createdAccount = [];
    for (let i = 0; i < data.length; i++) {
        // each rule
        if (data[i].id) {
            const updated = await TargetingRule.update(
                data[i],
                {
                    where: {id: data[i].id},
                    returning: true,
                },
                {
                    include: [{model: models.providers, as: "provider_info"}],
                }
            );
            const ruleProvider = await RuleProvider.findAll({
                attributes: ["id"],
                where: {targeting_rule_id: data[i].id},
            });
            for (let j = 0; j < data[i].provider_details.length; j++) {
                const provider = data[i].provider_details;

                if (!ruleProvider[j]) {
                    const created = await RuleProvider.create({
                        provider_id: provider[j].provider_id,
                        targeting_rule_id: data[i].id,
                        provider_link: provider[j].provider_link,
                        traffic: provider[j].traffic,
                    });
                } else {
                    const updatedes = await RuleProvider.update(provider[j], {
                        where: {id: ruleProvider[j].id},
                    });
                }
            }
            // for create and update pub-acount and return skiped account
            let {uncreatedAccount, createdAccount} =
                await publisherAccountService.createUpdatePublisherAccount({
                    targeting_rules: updated[1],
                    publisher_id: detail.publisher_id,
                    targeting_id: detail.targeting_id,
                });
            skippedAccount.push(...uncreatedAccount);
            createdAccount.push(...createdAccount);

            newRules.push(updated);
        } else {
            const created = await bulkCreateTargetingRule([data[i]]);

            //for create and update pub-acount and return skiped account
            let {uncreatedAccount, createdAccount} =
                await publisherAccountService.createUpdatePublisherAccount({
                    targeting_rules: created,
                    publisher_id: detail.publisher_id,
                    targeting_id: detail.targeting_id,
                });
            skippedAccount.push(...uncreatedAccount);
            createdAccount.push(...createdAccount);

            newRules.push(created);
        }
    }
    return {newRules, skippedAccount, createdAccount};
}

/***
 *
 * @param params to create targeting rules
 * @param options options for passing attributes
 * @returns {Promise.<*>}
 */
async function findOneTargetingRule(params, options = {}) {
    let attributes = options.attr ? {attributes: options.attr} : "";
    const targetingRule = await TargetingRule.findOne({
        where: params,
        ...attributes,
    });
    return targetingRule;
}

/**
 *
 * @param params
 * @returns {Promise.<*>}
 */
async function deleteTargetingRule(params) {
    const destroyed = await TargetingRule.update(
        {deleted: true},
        {where: params}
    );
    return destroyed;
}

/**
 *
 * @param params
 * @returns {Promise.<*>}
 */
async function destroyTargetingRule(params) {
    const targetRule = await TargetingRule.findByPk(params.id);
    if (!targetRule) {
        throw new Error("Target Rule not found");
    }

    await RuleProvider.destroy({where: {targeting_rule_id: params.id}});
    const destroyed = await TargetingRule.destroy({where: params});
    return destroyed;
}
module.exports = {
    findAllTargetingRules,
    bulkCreateTargetingRule,
    bulkUpdateTargetingRule,
    findOneTargetingRule,
    deleteTargetingRule,
    destroyTargetingRule,
};
