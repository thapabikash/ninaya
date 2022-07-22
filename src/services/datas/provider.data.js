"use strict";
const Sequelize = require("sequelize");
const models = require("../../models/index");
const Provider = models.providers;
const RuleProvider = models.rule_providers;
const ProvLinkService = require("./providerLink.data");
/***
 *
 * @param params
 * @returns {Promise.<*>}
 */

async function findAllProviders(options = {}) {
    const includeQuery = {
        attributes: {
            include: [
                [
                    Sequelize.fn(
                        "COUNT",
                        Sequelize.col("provider_links.provider_id")
                    ),
                    "no_of_links",
                ],
            ],
        },
        include: [
            {
                model: models.provider_links,
                attributes: [],
            },
        ],
        group: ["providers.id"],
        subQuery: false,
        ...options,
    };
    const {count, rows} = await Provider.findAndCountAll(includeQuery);
    for (let i = 0; i < rows.length; i++) {
        const r = rows[i];
        const {count} = await RuleProvider.findAndCountAll({
            where: {provider_id: r.id},
        });
        r.dataValues["no_of_rules"] = count;
    }
    const total = count.length || count;
    return {
        total,
        providers: rows,
        limit: options.limit,
        pageCount: Math.ceil(total / options.limit),
    };
}

/**
 *
 * @param {*} providerParams
 * @returns {Promise.<*>}
 */
async function createProvider(providerParams) {
    const createdProvider = await Provider.create(providerParams);
    return createdProvider;
}

/**
 *
 * @param {*} params
 * @param {*} options
 * @returns {Promise.<*>}
 */
async function findOneProvider(params, options = {}) {
    const includeQuery = {
        where: params,
        attributes: {
            include: [
                [
                    Sequelize.fn(
                        "COUNT",
                        Sequelize.col("provider_links.provider_id")
                    ),
                    "no_of_links",
                ],
            ],
        },
        include: [
            {
                model: models.provider_links,
                attributes: [],
            },
        ],
        group: ["providers.id"],
        subQuery: false,
    };
    if (options.attr) {
        includeQuery.attributes = options.attr;
    }
    const provider = await Provider.findOne(includeQuery);
    const provider_id = provider?.dataValues?.id || null;
    if (provider_id) {
        const {count} = await RuleProvider.findAndCountAll({
            where: {provider_id: provider_id},
        });
        provider.dataValues["no_of_rules"] = count;
    }
    return provider;
}

async function getProviderByProperty(id) {
    return await Provider.findByPk(id);
}

/**
 *
 * @param {*} params
 * @returns {Promise.<*>}
 */
async function getLinksById(params) {
    const provider = await Provider.findOne({
        where: params,
        attributes: ["id", "status"],
        include: [
            {
                model: models.provider_links,
                as: "provider_links",
                where: {deleted: false},
                required: false,
                attributes: {
                    exclude: ["deleted", "createdAt", "updatedAt"],
                },
            },
        ],
        order: [["provider_links", "id", "DESC"]],
    });
    if (provider) {
        const {count} = await RuleProvider.findAndCountAll({
            where: {provider_id: provider.id},
        });
        provider.dataValues["no_of_rules"] = count;
        if (provider.provider_links && provider.provider_links.length) {
            provider.dataValues["provider_linkss"] =
                await returnLinkReletedFields(provider.provider_links);
        }
    }
    let providers = {};
    providers["provider_links"] = provider.dataValues["provider_linkss"];
    providers["no_of_rules"] = provider.dataValues["no_of_rules"];
    providers["status"] = provider.dataValues["status"];
    providers["id"] = provider.dataValues["id"];
    return providers;
}

async function returnLinkReletedFields(data) {
    let providerlinks = [...data];
    let AllproviderLinksTargetobj = [];
    let looplinks = providerlinks || [];
    if (looplinks.length > 0) {
        for (let i = 0; i < looplinks.length; i++) {
            let obj = {...looplinks[i].dataValues};

            const publisher = await ProvLinkService.findTargetedObj(obj.id);

            if (publisher && publisher.length > 0) {
                obj["targetObj"] = publisher;
                let active = publisher.filter(em => !em.disabled);
                obj["no_of_active_rules"] = active.length;
                obj["no_of_rules"] = publisher.length;
            } else {
                obj["targetObj"] = [];
            }
            AllproviderLinksTargetobj.push(obj);
        }
    }
    return AllproviderLinksTargetobj;
}

/**
 *
 * @param {*} params params to check for update
 * @param {*} data data to ipdate
 * @returns {Promise.<*>}
 */
async function updateProvider(params = {}, data) {
    // check if provider exists
    const provider = await Provider.findByPk(params.id);
    if (!provider) {
        throw new Error("Advertiser not found!!");
    }
    const updatedProvider = await Provider.update(data, {where: params});
    // if(updateProvider){
    //   await updatePublisherAccountByAdID(params.id,{source_identifier:data.link_source_identifier});
    // }
    return updatedProvider;
}

/**
 *
 * for all data to update
 * @param params
 * @returns {Promise.<*>}
 */
async function bulkUpdateStatus(params = {}, data) {
    return await Provider.update(data, {where: params});
}

/**
 *
 * @param params
 * @returns {Promise.<*>}
 */
async function deleteProvider(params = {}) {
    const destroyed = await Provider.update({deleted: true}, {where: params});
    return destroyed;
}

/**
 *
 * @param params
 * @returns {Promise.<*>}
 */
async function destroyProvider(params = {}) {
    const provider = await Provider.findByPk(params.id);
    if (!provider) {
        throw new Error("Advertiser not found");
    }
    const destroyed = await Provider.destroy({where: params});
    return destroyed;
}

module.exports = {
    findAllProviders,
    createProvider,
    findOneProvider,
    getLinksById,
    updateProvider,
    bulkUpdateStatus,
    deleteProvider,
    destroyProvider,
    getProviderByProperty,
};
