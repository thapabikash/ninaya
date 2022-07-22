"use strict";

const {Op} = require("sequelize");
const {sumBy} = require("lodash");
const redisClient = require("../../helpers/redis");

const db = require("../models/index");
const TargetingSchema = require("../services/validationSchema/targeting.schema");
const TargetingService = require("../services/datas/targeting.data");
const SettingService = require("../services/datas/setting.data");
const ProviderLinkService = require("../services/datas/providerLink.data");
// logger
const {log} = require("../../helpers/logger");
const {pagination} = require("../../helpers/paginationHelper");
const {errorResponse, successResponse} = require("../../helpers/response");
const {cache} = require("joi");
const title = "Targetings";

/**
 * index: controller to get list of targetings
 * @param {*} req request object
 * @param {*} res response object
 * @param {*} next next function
 */
async function index(req, res, next) {
    const {q, page, size, order_by, order_direction, archived} = req.query;
    let order = [];
    let searchq = {deleted: false};
    try {
        // add the order parameters to the order
        if (order_by && order_direction) {
            if (order_by === "Publisher") {
                order.push(["publisher_id", order_direction]);
            } else {
                order.push([order_by, order_direction]);
            }
        }
        if (archived) {
            searchq = {...searchq, deleted: true};
        }
        if (q) {
            searchq = {
                ...searchq,
                [Op.or]: [
                    {
                        "$publisher_info.name$": {
                            [Op.iLike]: `${q}%`,
                        },
                    },
                    {
                        link: {
                            [Op.iLike]: `%${q}%`,
                        },
                    },
                ],
            };
        }
        if (req.query.status) {
            searchq["status"] = req.query.status;
        }
        if (req.query.publisher) {
            searchq["publisher_id"] = req.query.publisher;
        }
        // implement pagination
        const paginateData = pagination(page, size, searchq, order);

        const targetings = await TargetingService.findAllTargetings(
            paginateData
        );
        return successResponse(res, "Targetings get success!!", {
            ...targetings,
            currentPage: parseInt(page, 10) || 1,
        });
    } catch (err) {
        log.error(err.message || err);
        next(err);
    }
}

async function getRulesByParams(req, res, next) {
    const {pid, cid} = req.query;

    const data = await findRules(pid, cid);
    return successResponse(res, "TargetingRules by params get success!!", data);
}
async function findRules(pid, cid) {
    let searchq = {deleted: false, is_active: true};
    try {
        if (pid) {
            searchq["publisher_id"] = pid;
        }
        if (cid) {
            searchq["client_id"] = cid;
        }
        // dont need to check sid, oid as it might be dynamic value now
        const targeting = await TargetingService.getRulesByParams(searchq);
        if (!targeting) {
            return null;
        }
        let data = {targeting_rules: []};
        for (let t of targeting[0]) {
            data.id = t.id;
            data.fallback = t.fallback;
            data.targeting_type = t.targeting_type;
            if (t["targeting_rules.id"]) {
                data.targeting_rules.push({
                    id: t["targeting_rules.id"],
                    priority: t["targeting_rules.priority"],
                    rule_id: t["targeting_rules.rule_id"],
                    daily_cap: t["targeting_rules.daily_cap"],
                    daily_frequency: t["targeting_rules.daily_frequency"],
                    providers: t["targeting_rules.providers"],
                });
            } else {
                data.targeting_rules = null;
            }
        }
        const {fallback, targeting_type, targeting_rules} = data;
        let totalCaps = null;
        if (targeting_rules) {
            for (let i = 0; i < targeting_rules.length; i++) {
                const tr = targeting_rules[i];
                const dc = tr.daily_cap;
                if (dc === 0 || dc === "0") {
                    tr.daily_cap = Number.MAX_SAFE_INTEGER;
                }
                for (let j = 0; j < tr.providers.length; j++) {
                    const tp = tr.providers[j];
                    const link = await ProviderLinkService.findOne({
                        id: tp.provider_link,
                    });
                    tp.provider_link = link.link;
                    tp.provider_link_id = link.id;
                }
            }
            totalCaps = sumBy(targeting_rules, "daily_cap");
        }

        // get system fallback
        const setting = await SettingService.findOneSetting({
            key: "system_fallback",
            deleted: false,
        });
        let defaultFallback = fallback;
        if (!fallback) {
            defaultFallback = setting.value;
        }
        return {
            targeting_type,
            fallback: defaultFallback,
            total_caps: totalCaps,
            rules: targeting_rules,
        };
    } catch (err) {
        log.error(err.message || err);
        next(err);
    }
}

async function add(req, res, next) {
    const data = req.body;
    try {
        data.is_active = data.is_active || true;
        data.status = data.status || "draft";
        // validate targeting data only here
        let errors = TargetingSchema.create.validate(data).error;
        if (errors) {
            const errArray = [];
            errors.details.forEach(function (err) {
                errArray.push(err.message);
            });
            throw new Error(errArray);
        }
        // execute raw query to get nextval
        const lastVal = await db.sequelize.query(
            "SELECT last_value from public.targetings_id_seq",
            {type: db.sequelize.QueryTypes.SELECT}
        );
        data.client_id = parseInt(lastVal[0].last_value) + 1;
        // modify link for cid
        data.link = data.link.replace("[TID]", data.client_id);
        // check unique link for each publisher
        if (data.link) {
            const exists = await TargetingService.findOneTargeting({
                publisher_id: data.publisher_id,
                link: data.link,
                deleted: false,
            });
            if (exists)
                throw new Error(`Cannot create targeting with same link`);
        }
        const targeting = await TargetingService.createTargeting(data);
        log.info(
            {req, title, id: targeting.id},
            `Targeting added with id: ${targeting.id}!!`
        );
        return successResponse(
            res,
            `Targeting added with id: ${targeting.id}!!`,
            {
                targeting,
            }
        );
    } catch (err) {
        log.error(err.message || err);
        next(err);
    }
}

async function show(req, res, next) {
    const id = req.params.id;
    try {
        const targeting = await TargetingService.findOneTargeting({
            id,
            deleted: false,
        });
        return successResponse(res, "Targeting get success!!", {targeting});
    } catch (err) {
        log.error(err.message || err);
        next(err);
    }
}

async function update(req, res, next) {
    const id = req.params.id;
    const data = req.body;
    try {
        // validate targeting data only here
        const {error} = TargetingSchema.update.validate(data);
        if (error) {
            const errArray = [];
            error.details.forEach(err => {
                errArray.push(err.message);
            });
            throw new Error(errArray);
        }
        data.client_id = data.client_id || id;
        // check unique link for each publisher
        if (data.link) {
            const exists = await TargetingService.findOneTargeting({
                id: {[Op.ne]: id},
                publisher_id: data.publisher_id,
                link: data.link,
                deleted: false,
            });
            if (exists)
                throw new Error(
                    `Targeting link should be unique for each publishers`
                );
        }
        if (req.query.archive && req.query.archive === "false") {
            data.deleted = false;
        }
        const targeting = await TargetingService.updateTargeting({id}, data);
        if (data.status === "published") {
            storeCache(id, data.publisher_id);
        }
        log.info({req, title, id}, `Targeting updated with id: ${id}!!`);
        return successResponse(res, `Targeting updated with id: ${id}!!`, {
            targeting,
        });
    } catch (err) {
        log.error(err.message || err);
        next(err);
    }
}
async function storeCache(cid, pid) {
    // console.log('=========Storing Cache===============');
    let cacheData = await redisClient.get(`${cid}_${pid}`);
    if (cacheData) {
        const logInfos = cacheData?.data?.logInfos;
        let ruleData = await findRules(pid, cid);
        cacheData.data = ruleData;
        cacheData.data.logInfos = logInfos;
        // console.log(cacheData, ruleData);
        await redisClient.set(`${cid}_${pid}`, cacheData);
    }
}

async function bulkUpdate(req, res, next) {
    try {
        const queryParams = req.query;
        const data = req.body.ids;
        if (data) {
            if (data === "all") {
                // update all data. note: not implemented yet
            } else if (Array.isArray(data)) {
                for (let i = 0; i < data.length; i++) {
                    await TargetingService.updateTargeting(
                        {id: data[i]},
                        {...queryParams}
                    );
                }
            } else {
                throw new Error("Invalid ids passed");
            }
        } else {
            throw new Error("Ids should be passed!!");
        }
        log.info({req, title}, "Targetings bulk update successful!!");
        return successResponse(res, "Targetings bulk update successful!!");
    } catch (err) {
        log.error(err.message || err);
        next(err);
    }
}

async function destroy(req, res, next) {
    const id = req.params.id;
    let perm = false;
    try {
        let findParams = {id, deleted: false};
        if (req.query.permanent && req.query.permanent === "true") {
            perm = true;
            findParams = {id};
        }
        const existing = await TargetingService.findOneTargeting(findParams, {
            attr: ["id"],
        });
        if (!existing) {
            return errorResponse(res, "Targeting not found!!", {status: 404});
        }
        if (perm) {
            const destroyed = await TargetingService.destroyTargeting({id});
            log.info(
                {req, title, id},
                `Targeting deleted permanently with id: ${id}`
            );
            return successResponse(
                res,
                `Targeting deleted permanently with id: ${id}`,
                destroyed
            );
        }
        const targeting = await TargetingService.deleteTargeting({id});
        log.info(
            {req, title, id},
            `Targeting archived successfully with id: ${id}`
        );
        return successResponse(
            res,
            `Targeting archived successfully with id: ${id}`,
            targeting
        );
    } catch (err) {
        log.error(err.message || err);
        next(err);
    }
}

async function bulkDestroy(req, res, next) {
    const ids = req.body.ids;
    let perm = false;
    try {
        if (ids) {
            if (ids === "all") {
                // delete all data
                // await TargetingService.deleteTargeting({});
            } else if (Array.isArray(ids)) {
                if (req.query.permanent && req.query.permanent === "true") {
                    perm = true;
                    for (let i = 0; i < ids.length; i++) {
                        await TargetingService.destroyTargeting({id: ids[i]});
                    }
                } else {
                    for (let i = 0; i < ids.length; i++) {
                        await TargetingService.deleteTargeting({id: ids[i]});
                    }
                }
            } else {
                throw new Error("Ids should be of valid type");
            }
        } else {
            throw new Error("Need to pass ids to delete");
        }
        if (perm) {
            log.info({req, title}, "Targetings bulk deleted permanently!!");
            return successResponse(
                res,
                "Targetings bulk deleted permanently!!"
            );
        }
        log.info({req, title}, "Targetings bulk archive success!!");
        return successResponse(res, "Targetings archived successfully");
    } catch (err) {
        log.error(err.message || err);
        next(err);
    }
}

module.exports = {
    index,
    getRulesByParams,
    add,
    show,
    update,
    bulkUpdate,
    destroy,
    bulkDestroy,
};
