"use strict";
const models = require("../../models/index");
const Platform = models.platforms;
const isUniqueValue = require("./isUniqueValue.data");

async function createPlatform(data) {
    await isUniqueValue.createUniqueValue("Platform", Platform, data, "name");
    const platform = await Platform.create(data);
    return platform;
}

async function updatePlatform(params = {}, data) {
    //check if platform exists
    await isUniqueValue.updateUniqueValue(
        "Platform",
        Platform,
        data,
        params,
        "name"
    );
    const platform = await Platform.findByPk(params.id, {
        where: {deleted: false},
    });
    if (!platform) {
        throw new Error("Platform not found");
    }
    //update platform
    const updatedPlatform = await platform.update(data, {where: params});
    return updatedPlatform;
}

async function deletePlatform(params = {}) {
    //check if platform exists
    const platform = await Platform.findByPk(params.id);
    if (!platform) {
        throw new Error("Platform not found");
    }
    //update platform
    const deletedPlatform = await platform.update(
        {deleted: true},
        {where: params}
    );
    return deletedPlatform;
}

async function destroyPlatform(params = {}) {
    //check if platform exists
    const platform = await Platform.findByPk(params.id);
    if (!platform) {
        throw new Error("Platform not found");
    }

    const destroyed = await platform.destroy({where: params});
    return destroyed;
}

async function findAllPlatforms(options = {}) {
    const {count, rows} = await Platform.findAndCountAll({
        ...options,
    });
    const total = count.length || count;
    return {
        total,
        platforms: rows,
        limit: options.limit,
        pageCount: Math.ceil(total / options.limit),
    };
}

async function findOnePlatform(params, options = {}) {
    let includeQuery = {
        where: params,
        subQuery: false,
    };
    if (options.attr) {
        includeQuery.attributes = options.attr;
    }
    const platform = await Platform.findOne(includeQuery);
    return platform;
}

module.exports = {
    createPlatform,
    updatePlatform,
    deletePlatform,
    destroyPlatform,
    findAllPlatforms,
    findOnePlatform,
};
