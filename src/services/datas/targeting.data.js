"use strict";
const Sequelize = require("sequelize");
const models = require("../../models/index");

const sequelize = models.sequelize;
const Targeting = models.targetings;
const TargetingRule = models.targeting_rules;

const targtingRuleService = require("../datas/targetingRule.data");
const publisherAccountService = require("./publisiherAccount.data");
const TargetingRuleSchema = require("../validationSchema/targetingRule.schema");

/***
 *
 * @param options find query while  getting all data
 * @returns {Promise.<*>}
 */

async function findAllTargetings(options = {}) {
    const includeQuery = {
        attributes: {
            include: [
                [
                    Sequelize.fn(
                        "COUNT",
                        Sequelize.col("targeting_rules.targeting_id")
                    ),
                    "no_of_rules",
                ],
            ],
        },
        include: [
            {
                model: models.publishers,
                as: "publisher_info",
                attributes: ["name", "details", "status"],
            },
            {
                model: models.targeting_rules,
                attributes: [],
            },
        ],
        group: ["targetings.id", "publisher_info.id"],
        subQuery: false,
        ...options,
    };
    const {count, rows} = await Targeting.findAndCountAll(includeQuery);
    const total = count.length || count;
    return {
        total,
        targetings: rows,
        limit: options.limit,
        pageCount: Math.ceil(total / options.limit),
    };
}

/***
 *
 * @param queryParams find query while  getting all data
 * @returns {Promise.<*>}
 */
async function getRulesByParams(queryParams = {}) {
    // const includeQuery = {

    //   attributes: [["default_fallback", "fallback"], "targeting_type"],
    //   include: [
    //     {
    //       model: models.targeting_rules,
    //       attributes: ["priority", ["id", "rule_id"], "daily_cap", "daily_frequency", ["provider_details", "providers"]],
    //       where: { deleted: false, disabled: false },
    //     },
    //   ],
    //   where: queryParams,
    // };
    // const targeting = await Targeting.findOne(includeQuery);
    return await sequelize.query(
        `SELECT "targetings"."id","targetings"."default_fallback" AS "fallback","targetings"."targeting_type","targeting_rules"."id" AS "targeting_rules.id","targeting_rules"."priority" AS "targeting_rules.priority","targeting_rules"."id" AS "targeting_rules.rule_id","targeting_rules"."daily_cap" AS "targeting_rules.daily_cap","targeting_rules"."daily_frequency" AS "targeting_rules.daily_frequency","targeting_rules"."provider_details" AS "targeting_rules.providers" FROM "targetings" LEFT JOIN "targeting_rules" AS "targeting_rules" ON "targetings"."id"="targeting_rules"."targeting_id" AND "targeting_rules"."deleted"=FALSE AND "targeting_rules"."disabled"=FALSE WHERE "targetings"."is_active"=TRUE AND "targetings"."publisher_id"='${queryParams.publisher_id}' AND "targetings"."client_id"='${queryParams.client_id}';`
    );
}

/***
 *
 * @param targetingParams data to create targeting
 * @returns {Promise.<*>}
 */

async function createTargeting(targetingParams) {
    const {targeting_rules, ...data} = targetingParams;
    let targeting_id;
    let publisher_id;
    try {
        if (data.status === "published") {
            data.publishedAt = Date.now();
        }
        const createdTargeting = await Targeting.create(data);
        targeting_id = createdTargeting.id;
        publisher_id = createdTargeting.publisher_id;
        for (let i = 0; i < targeting_rules.length; i++) {
            targeting_rules[i].targeting_id = targeting_id;
        }
        let rulesErrors =
            TargetingRuleSchema.bulkCreate.validate(targeting_rules).error;
        if (rulesErrors) {
            const errArray = [];
            rulesErrors.details.forEach(function (err) {
                errArray.push(err.message);
            });
            throw new Error(errArray);
        }
        const createdRules = await targtingRuleService.bulkCreateTargetingRule(
            targeting_rules
        );

        //for mapping publisher and advertiser

        const {uncreatedAccount, createdAccount} =
            await publisherAccountService.createUpdatePublisherAccount({
                targeting_rules: createdRules,
                publisher_id,
                targeting_id,
            });
        return {
            ...createdTargeting.dataValues,
            targeting_rules: createdRules,
            skippedCreatePublisherAccount: uncreatedAccount,
            createdPublisherAccount: createdAccount,
        };
    } catch (err) {
        // remove targeting data from db if exists and error occurs
        if (targeting_id) {
            await destroyTargeting({id: targeting_id});
        }
        throw err;
    }
}

/**
 *
 * @param params required for querying in db
 * @returns {Promise.<*>}
 */
async function findOneTargeting(params, options = {}) {
    let attributes = options.attr ? {attributes: options.attr} : "";
    const targeting = await Targeting.findOne({
        where: params,
        ...attributes,
        include: [
            {
                model: models.publishers,
                as: "publisher_info",
                attributes: ["name", "details", "status"],
            },

            {
                model: models.targeting_rules,
                where: {deleted: false},
                // Note: commented becoz provider_info not required for now
                // include: [
                //   {
                //     model: models.providers,
                //     as: "provider_info",
                //     through: { attributes: [] },
                //   },
                // ],

                attributes: {
                    exclude: ["deleted", "createdAt", "updatedAt"],
                },
            },
        ],
        order: [
            [
                {model: models.targeting_rules, as: "targeting_rules"},
                "priority",
                "ASC",
            ],
        ],
    });
    return targeting;
}

async function targettingsByPublisher(params = {}) {
    const targettingdata = await Targeting.findAll({
        where: {
            ...params,
        },
        include: [
            {
                model: models.targeting_rules,
                where: {deleted: false},
            },
        ],
    });
    if (targettingdata.length > 0) {
        return targettingdata;
    } else {
        return [];
    }
}

async function getTargetRules(params) {
    const targeting = await Targeting.findOne({
        where: params,
        attributes: ["is_active"],
        include: [
            {
                model: models.targeting_rules,
                attributes: ["id"],
            },
        ],
    });
    return targeting;
}

/**
 *
 * @param params required for passing query to check in db
 * @param data data passed to update targeting
 * @returns {Promise.<*>}
 */
async function updateTargeting(params, data) {
    let datas = {newRules: [], skippedAccount: [], createdAccount: []};
    let {targeting_rules, ...targetingData} = data;
    // check if targeting exists
    const targeting = await findOneTargeting({id: params.id});
    let targeting_id = targeting.id;
    let publisher_id = data?.publisher_id;
    if (!targeting) {
        throw new Error("Targeting not found!!");
    }
    if (
        targeting.status !== "published" &&
        targetingData.status === "published"
    ) {
        targetingData.publishedAt = Date.now();
    }
    delete targeting.dataValues.history;
    targetingData["history"] = targeting;
    // start a transaction and save into a variable
    const t = await sequelize.transaction();
    try {
        const updatedTargeting = await Targeting.update(targetingData, {
            where: params,
            transaction: t,
            returning: true,
        });

        const rules = await TargetingRule.findAll({
            where: {
                targeting_id: updatedTargeting[1][0].dataValues.id,
            },
        });

        let rulesprovider = rules?.map(rule => {
            return {
                id: rule.id,
                priority: rule.priority,
                daily_cap: rule.daily_cap,
                daily_frequency: rule.daily_frequency,
                comment: rule.comment,
                targeting_id: rule.targeting_id,
                provider_details: rule.provider_details,
                disabled: rule.disabled,
            };
        });
        targeting_rules = targeting_rules
            ? targeting_rules
            : rulesprovider
            ? rulesprovider
            : targeting_rules;

        if (targeting_rules && targeting_rules.length) {
            // validate rules data to update
            let rulesErrors = await TargetingRuleSchema.bulkUpdate.validate(
                targeting_rules
            ).error;
            if (rulesErrors) {
                const errArray = [];
                rulesErrors.details.forEach(function (err) {
                    errArray.push(err.message);
                });
                throw new Error(errArray);
            }

            const data = await targtingRuleService.bulkUpdateTargetingRule(
                targeting_rules,
                {targeting_id, publisher_id},
                {
                    transaction: t,
                }
            );
            datas = data;
        }
        const {newRules, skippedAccount, createdAccount} = datas;
        await t.commit();

        return {
            newRules,
            updatedTargeting,
            skippedCreatePublisherAccount: skippedAccount,
            createdPublisherAccount: createdAccount,
        };
    } catch (err) {
        await t.rollback();
        throw err;
    }
}

/**
 *
 * @param params
 * @returns {Promise.<*>}
 */
async function deleteTargeting(params = {}) {
    const destroyed = await Targeting.update({deleted: true}, {where: params});
    return destroyed;
}

/**
 *
 * destroy targeting data from db
 * @param params
 * @returns {Promise.<*>}
 */
async function destroyTargeting(params) {
    const targeting = await Targeting.findByPk(params.id);
    if (!targeting) {
        throw new Error("Targeting not found");
    }
    const rules = await getTargetRules(params);
    for (let i = 0; i < rules.targeting_rules.length; i++) {
        const r = rules.targeting_rules[i];
        await targtingRuleService.destroyTargetingRule({id: r.id});
    }
    const destroyed = await Targeting.destroy({where: params});
    return destroyed;
}

module.exports = {
    findAllTargetings,
    getRulesByParams,
    getTargetRules,
    createTargeting,
    findOneTargeting,
    updateTargeting,
    deleteTargeting,
    destroyTargeting,
    targettingsByPublisher,
};
