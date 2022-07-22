"use strict";

const ProvLinkSchema = require("../services/validationSchema/provLink.schema");
const ProvLinkService = require("../services/datas/providerLink.data");
const ProviderService = require("../services/datas/provider.data");
const PublisherAccount = require("../services/datas/publisiherAccount.data");
const {pagination} = require("../../helpers/paginationHelper");
// helpers
const {log} = require("../../helpers/logger");
const {errorResponse, successResponse} = require("../../helpers/response");
const sequelize = require("sequelize");
const {Op} = sequelize;
const title = "Settings";
const models = require("../models/index");
const TargettingService = require("../services/datas/targeting.data");
const TargetingRuleService = require("../services/datas/targetingRule.data");
const parseUrl = require("url-parse");
/**
 * index: controller to get list of publishers
 * @param {*} req request object
 * @param {*} res response object
 * @param {*} next next function
 */

async function index(req, res, next) {
    try {
        let params = {where: {deleted: false}, order: [["id", "ASC"]]};
        const providerLinks = await ProvLinkService.findAllProviderLinks(
            params
        );
        return successResponse(res, "Advertiser Links get success!", {
            providerLinks,
        });
    } catch (err) {
        log.error(err.message || err);
        next(err);
    }
}

//apply filter conditions heres
async function executeWhereClause(query, params, alllinks) {
    if (query.provider_id) {
        if (Array.isArray(query.provider_id)) {
            params.where.provider_id = {
                [Op.in]: query.provider_id,
            };
        } else {
            params.where.provider_id = query.provider_id;
        }
    }

    if (query.publisher_id) {
        let links = [];
        if (Array.isArray(query.publisher_id)) {
            let linksWithPublisher =
                await TargettingService.targettingsByPublisher({
                    publisher_id: {
                        [Op.in]: query.publisher_id,
                    },
                });

            if (linksWithPublisher.length > 0) {
                linksWithPublisher.forEach(em => {
                    em.targeting_rules.forEach(es => {
                        es.provider_details.forEach(ess => {
                            links.push(ess.provider_link);
                        });
                    });
                });
            }

            params.where.id = {
                [Op.and]: {
                    ...params?.where?.id,
                    [Op.in]: links,
                },
            };
        } else {
            let linksWithPublisher =
                await TargettingService.targettingsByPublisher({
                    publisher_id: query.publisher_id,
                });

            if (linksWithPublisher.length > 0) {
                linksWithPublisher.forEach(em => {
                    em.targeting_rules.forEach(es => {
                        es.provider_details.forEach(ess => {
                            links.push(ess.provider_link);
                        });
                    });
                });
            }
            params.where.id = {
                [Op.and]: {
                    ...params?.where?.id,
                    [Op.in]: links,
                },
            };
        }
    }

    if (query.status) {
        params.where.disabled = query.status;
    }

    if (query.q) {
        params.where.searchq_val = {
            [Op.iLike]: `%${query.q}%`,
        };
    }

    //   params.where.id={};

    if (query.isLinked && query.isLinked === "linked") {
        params.where.id = {
            [Op.and]: {
                ...params?.where?.id,
                [Op.in]: alllinks || [],
            },
        };
    }
    if (query.isLinked && query.isLinked === "not_linked") {
        params.where.id = {
            [Op.and]: {
                ...params?.where?.id,
                [Op.notIn]: alllinks || [],
            },
        };
    }

    if (query.isLive && query.isLive === "live") {
        // params.where.id = {
        //     [Op.and]: {
        //         ...params?.where?.id,
        //         [Op.in]: sequelize.literal("( SELECT link_id FROM log_infos)"),
        //     },
        // };
    }

    if (query.isLive && query.isLive === "not_live") {
        // params.where.id = {
        //     [Op.and]: {
        //         ...params?.where?.id,
        //         [Op.notIn]: sequelize.literal(
        //             "( SELECT link_id FROM log_infos WHERE log_infos.link_id IS NOT null)"
        //         ),
        //     },
        // };
    }

    if (query.link) {
        params.where.link = {
            [Op.iLike]: `%${query.link}%`,
        };
    }

    if (query.deleted) {
        params.where.deleted = query.deleted;
    }

    if (query.search_engine_id) {
        if (Array.isArray(query.search_engine_id)) {
            params.where.search_engine_id = {[Op.in]: query.search_engine_id};
            params.include.push({
                model: models.search_engines,
                attributes: ["id", "name"],
            });
        } else {
            params.where.search_engine_id = query.search_engine_id;
            params.include.push({
                model: models.search_engines,
                attributes: ["id", "name"],
            });
        }
    }

    if (query.platform_id) {
        params.include.push({
            model: models.platforms,
            attributes: ["id", "name"],
        });
        if (Array.isArray(query.platform_id)) {
            params.where.platform_id = {[Op.in]: query.platform_id};
        } else {
            params.where.platform_id = query.platform_id;
        }
    }

    if (query.tag_type_id) {
        params.include.push({
            model: models.tag_types,
            attributes: ["id", "name"],
        });
        if (Array.isArray(query.tag_type_id)) {
            params.where.tag_type_id = {[Op.in]: query.tag_type_id};
        } else {
            params.where.tag_type_id = query.tag_type_id;
        }
    }

    params.where.deleted = false;
    return params.where;
}
function executeAttributesClause(query, params) {
    let attributes = [
        "id",
        "link",
        "search_engine_type",
        "p_sid",
        "searchq_val",
        "n_val",
        "sub_id_val",
        "description",
        "click_id_val",
        ["disabled", "isActive"],
        "deleted",
        "disabled",
        "createdAt",
    ];
    // attributes.push([
    //     sequelize.literal(`(
    //             case when   (SELECT COUNT(*)
    //             FROM rule_providers AS rule
    //             WHERE
    //                 rule.provider_link = provider_links.id
    //             LIMIT 2
    //             )
    //             > 0 then 'Linked' else 'Not Linked' end
    //         )`),
    //     "isLinked",
    // ]);
    attributes.push([
        sequelize.literal(`(
                case when  (SELECT COUNT(*)
                FROM log_infos AS logs
                WHERE
                    logs.link_id = provider_links.id
                LIMIT 2 
                )
                > 0 then 'Live' else 'Pending' end
            )`),
        "isLive",
    ]);
    params.attributes.push(...attributes);
    return attributes;
}

function executeGroupClause(query, params) {
    const {group_by} = query;
    let newParams = {...params};
    newParams.group.push("provider_links.id");
    if (Array.isArray(group_by)) {
        if (group_by.includes("provider_id")) {
            newParams.group.push("provider.id");
            newParams.include.push({
                model: models.providers,
                attributes: ["id", "name"],
            });
        }
        if (group_by.includes("search_engine_id")) {
            newParams.group.push("search_engine.id");
            newParams.include.push({
                model: models.search_engines,
                attributes: ["id", "name"],
            });
        }
        if (group_by.includes("tag_types_id")) {
            newParams.group.push("tag_type.id");
            newParams.include.push({
                model: models.tag_types,
                attributes: ["id", "name"],
            });
        }
        if (group_by.includes("platform_id")) {
            newParams.group.push("platform.id");
            newParams.include.push({
                model: models.platforms,
                attributes: ["id", "name"],
            });
        }
    } else {
        if (group_by === "provider_id") {
            newParams.group.push("provider.id");
            newParams.include.push({
                model: models.providers,
                attributes: ["id", "name"],
            });
            newParams.group.push("provider_id");
            newParams.attributes.push("provider_id");
        }
        if (group_by === "search_engine_id") {
            newParams.group.push("search_engine.id");
            newParams.include.push({
                model: models.search_engines,
                attributes: ["id", "name"],
            });
        }
        if (group_by === "tag_types_id") {
            newParams.group.push("tag_type.id");
            newParams.include.push({
                model: models.tag_types,
                attributes: ["id", "name"],
            });
        }
        if (group_by === "platform_id") {
            newParams.group.push("platform.id");
            newParams.include.push({
                model: models.platforms,
                attributes: ["id", "name"],
            });
        }
    }

    if (Array.isArray(group_by)) {
        group_by.forEach(value => {
            newParams.group.push(value);
            newParams.attributes.push(value);
        });
    } else {
        newParams.group.push(group_by);
        newParams.attributes.push(group_by);
    }
    return newParams;
}

async function getAllLinksIdFromTargetingRule() {
    let ids = [];
    const targettingRules = await TargetingRuleService.findAllTargetingRules({
        where: {
            deleted: false,
        },
    });
    if (targettingRules) {
        const linksIds = targettingRules.map(rule => rule.provider_details);
        for (let provider_details of linksIds) {
            for (let link of provider_details) {
                ids.push(link.provider_link);
            }
        }
    }
    return [...new Set(ids)];
}

async function findProviderWithFilter(req, res, next) {
    try {
        let alllinks = await getAllLinksIdFromTargetingRule();
        const {q, page, size, order_by, order_direction} = req.query;
        let startDate = new Date();
        startDate = startDate.setHours(startDate.getHours() - 48);
        let endDate = new Date();
        let params = {
            where: {},
            include: [
                {
                    model: models.tag_types,
                    attributes: ["id", "name"],
                },
                {
                    model: models.search_engines,
                    attributes: ["id", "name"],
                },
                {
                    model: models.platforms,
                    attributes: ["id", "name"],
                },
                {
                    model: models.providers,
                    attributes: ["id", "name"],
                },
            ],
            attributes: [],
            group: [],
            order: [],
        };

        if (req.query.group_by) {
            params.group = executeGroupClause(req.query, params).group;
            params.include = executeGroupClause(req.query, params).include;
        }

        if (order_by && order_direction) {
            let paramsGroupBy = req.query.group_by;
            if (Array.isArray(paramsGroupBy)) {
                paramsGroupBy.includes(order_by) &&
                    params.order.push([order_by, order_direction]);
            } else {
                params.order.push([order_by, order_direction]);
            }
        }

        params.where = await executeWhereClause(req.query, params, alllinks);
        executeAttributesClause(req.query, params);
        let paginateData = {};
        if (page === "all") {
            paginateData = params;
        } else {
            paginateData = pagination(
                page,
                size,
                params.where,
                params.order,
                params.attributes,
                params.group,
                params.include
            );
        }

        const providerLinks = await ProvLinkService.index(paginateData);
        let Allproviderlinks = [];
        if (providerLinks) {
            let looplinks = providerLinks?.providerLinks || [];
            if (looplinks.length > 0) {
                for (let i = 0; i < looplinks.length; i++) {
                    let obj = {...looplinks[i].dataValues};

                    if (alllinks.includes(looplinks[i].dataValues.id)) {
                        obj["isLinked"] = "Linked";
                    } else {
                        obj["isLinked"] = "Not Linked";
                    }
                    Allproviderlinks.push(obj);
                }
            }
        }

        let AllproviderLinksTargetobj = [];
        if (providerLinks) {
            let looplinks = Allproviderlinks || [];
            if (looplinks.length > 0) {
                for (let i = 0; i < looplinks.length; i++) {
                    let obj = {...looplinks[i]};
                    const publisher = await ProvLinkService.findTargetedObj(
                        obj.id
                    );
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
        }

        return successResponse(res, "Advertiser Links get success!", {
            providerLinks: {
                ...providerLinks,
                providerLinks: AllproviderLinksTargetobj,
            },
        });
    } catch (err) {
        console.log(err);
        log.error(err.message || err);
        next(err);
    }
}
//checke link for dvertiser
async function checkIsIdenticalLink(req, res, next) {
    let data = req.body.data;
    let provider_id = req.params.id;
    let include_self = req.query.include_self;
    let id = req.query.link_id || null;
    provider_id = include_self ? null : provider_id;
    try {
        if (data.length < 0) {
            throw new Error("Please provide links with array!!");
        }
        let dublicatelink = [];
        for (let i = 0; i < data.length; i++) {
            const is_exist_link = await ProvLinkService.findAll(
                {link: data[i]},
                provider_id,
                id
            );

            if (is_exist_link.length > 0) {
                dublicatelink.push(is_exist_link);
            }
        }
        log.info({req, title}, "Check identical links!!");
        const dupRemove = dublicatelink.filter(
            (v, i, a) =>
                a.findIndex(t => JSON.stringify(t) === JSON.stringify(v)) === i
        );
        return successResponse(res, "Identical links", {
            links: dupRemove,
            is_Found_Identical: dupRemove?.length < 1 ? false : true,
        });
    } catch (err) {
        log.error(err.message || err);
        next(err);
    }
}

async function add(req, res, next) {
    let data = req.body;
    const provider_id = req.params.id;
    try {
        if (!Array.isArray(data)) {
            if (typeof data === "object") {
                data = [data];
            } else {
                throw new Error("Valid data not provided!!");
            }
        }
        const {error} = ProvLinkSchema.create.validate(data);

        if (error) {
            const errArray = [];
            error.details.forEach(function (err) {
                errArray.push(err.message);
            });
            throw new Error(errArray);
        }
        let newLinks = [];
        for (let i = 0; i < data.length; i++) {
            const d = data[i];

            if (d.id) {
                //update
                const updatedLink = await ProvLinkService.update({id: d.id}, d);
                newLinks.push(updatedLink);
            } else {
                //add

                //check existing pub-ad account with tha same ad id and sin
                // const result = checkLinkInPublisherAccount(d);
                // if (result.isExist) {
                //     throw new Error(result.message);
                // }

                d.provider_id = provider_id;
                const link = await ProvLinkService.create(d);
                newLinks.push(link);
            }
        }
        log.info({req, title}, "Provider links create/update success!!");
        return successResponse(
            res,
            "Provider links created/updated successfully",
            {
                setting: newLinks,
            }
        );
    } catch (err) {
        log.error(err.message || err);
        next(err);
    }
}

async function checkLinkInPublisherAccount(data) {
    return new Promise(async (resolve, reject) => {
        let link = data.link;
        let provider_id = data.provider_id;
        try {
            const provider = await ProviderService.getProviderByProperty(
                provider_id
            );

            if (provider) {
                const parsed = parseUrl(link, true);
                let pathname = parsed?.pathname;
                let sin = parsed?.query[provider?.link_source_identifier]
                    ? parsed?.query[provider?.link_source_identifier]
                    : linkIdentifierFromLink(pathname);
                if (sin) {
                    let publisherAcc =
                        await PublisherAccount.getPublisherAccount({
                            sin: sin,
                            provider_id: provider_id,
                        });
                    if (publisherAcc) {
                        resolve({
                            isExist: true,
                            sin: sin,
                            advertiser: provider_id,
                            message: `Publisher_Ad Account is already exist with this advertiser=${provider_id} and Link source identifying value=${sin}`,
                        });
                    } else {
                        resolve({
                            isExist: false,
                        });
                    }
                } else {
                    resolve({
                        isExist: false,
                    });
                }
            } else {
                resolve({
                    isExist: false,
                });
            }
        } catch (error) {
            console.log(error);
            resolve({
                isExist: false,
            });
        }
    });
}
function linkIdentifierFromLink(path) {
    if (path) {
        let mySubString = path.substring(
            path.indexOf("/"),
            path.lastIndexOf("/")
        );
        let splitPath = mySubString.split("/");
        var filtered = splitPath.filter(el => el != "");
        return filtered[filtered.length - 1];
    } else {
        return null;
    }
}

async function destroy(req, res, next) {
    const id = req.params.id;
    try {
        let publisherAcc = await PublisherAccount.getPublisherAccount({
            link_id: id,
        });
        if (publisherAcc) {
            throw new Error(
                `Sorry cannot delete, Publisher-Ad Account  with this link #${id} already exists.`
            );
        } else {
            const link = await ProvLinkService.deleteProvLink({
                id,
                deleted: false,
            });
            log.info(
                {req, title, id},
                `Provider link archived successfully with id: ${id}`
            );
            return successResponse(
                res,
                `Provider link archived successfully with id: ${id}`,
                link
            );
        }
    } catch (err) {
        log.error(err.message || err);
        next(err);
    }
}

module.exports = {
    index,
    add,
    destroy,
    checkIsIdenticalLink,
    findProviderWithFilter,
};
