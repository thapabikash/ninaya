"use strict";
const models = require("../../models/index");
const TagType = models.tag_types;
const isUniqueValue = require("./isUniqueValue.data");
async function createTagType(data) {
    await isUniqueValue.createUniqueValue("Tag Type", TagType, data, "name");
    const tagType = await TagType.create(data);
    return tagType;
}

async function updateTagType(params = {}, data) {
    //check if tag type exists
    await isUniqueValue.updateUniqueValue(
        "Tag Type",
        TagType,
        data,
        params,
        "name"
    );
    const tagType = await TagType.findByPk(params.id, {
        where: {deleted: false},
    });
    if (!tagType) {
        throw new Error("Tag Type not found");
    }
    //update tag type
    const updatedTagType = await tagType.update(data, {where: params});
    return updatedTagType;
}

async function deleteTagType(params = {}) {
    //check if tag type exists
    const tagType = await TagType.findByPk(params.id);
    if (!tagType) {
        throw new Error("Tag Type not found");
    }
    //update tag type
    const deletedTagType = await tagType.update(
        {deleted: true},
        {where: params}
    );
    return deletedTagType;
}

async function destroyTagType(params = {}) {
    //check if tag type exists
    const tagType = await TagType.findByPk(params.id);
    if (!tagType) {
        throw new Error("Tag Type not found");
    }

    const destroyed = await tagType.destroy({where: params});
    return destroyed;
}

async function findAllTagTypes(options = {}) {
    const {count, rows} = await TagType.findAndCountAll({
        ...options,
    });
    const total = count.length || count;
    return {
        total,
        tag_types: rows,
        limit: options.limit,
        pageCount: Math.ceil(total / options.limit),
    };
}

async function findOneTagType(params, options = {}) {
    let includeQuery = {
        where: params,
        subQuery: false,
    };
    if (options.attr) {
        includeQuery.attributes = options.attr;
    }
    const tagType = await TagType.findOne(includeQuery);
    return tagType;
}

module.exports = {
    createTagType,
    updateTagType,
    deleteTagType,
    destroyTagType,
    findAllTagTypes,
    findOneTagType,
};
