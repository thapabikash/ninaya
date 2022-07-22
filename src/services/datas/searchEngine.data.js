"use strict";
const models = require("../../models/index");
const SearchEngine = models.search_engines;
const isUniqueValue = require("./isUniqueValue.data");

async function createSearchEngine(data) {
    await isUniqueValue.createUniqueValue(
        "Search Engine",
        SearchEngine,
        data,
        "name"
    );
    const searchEngine = await SearchEngine.create(data);
    return searchEngine;
}

async function updateSearchEngine(params = {}, data) {
    //check if search engine exists
    await isUniqueValue.updateUniqueValue(
        "Search Engine",
        SearchEngine,
        data,
        params,
        "name"
    );
    const searchEngine = await SearchEngine.findByPk(params.id, {
        where: {deleted: false},
    });
    if (!searchEngine) {
        throw new Error("Search Engine not found");
    }
    //update search engine
    const updatedSearchEngine = await searchEngine.update(data, {
        where: params,
    });
    return updatedSearchEngine;
}

async function deleteSearchEngine(params = {}) {
    //check if search engine exists
    const searchEngine = await SearchEngine.findByPk(params.id);
    if (!searchEngine) {
        throw new Error("Search Engine not found");
    }
    //update search engine
    const deletedSearchEngine = await searchEngine.update(
        {deleted: true},
        {where: params}
    );
    return deletedSearchEngine;
}

async function destroySearchEngine(params = {}) {
    //check if search engine exists
    const searchEngine = await SearchEngine.findByPk(params.id);
    if (!searchEngine) {
        throw new Error("Search Engine not found");
    }
    const destroyed = await searchEngine.destroy({where: params});
    return destroyed;
}

async function findAllSearchEngines(options = {}) {
    const {count, rows} = await SearchEngine.findAndCountAll({
        ...options,
    });
    const total = count.length || count;
    return {
        total,
        search_engines: rows,
        limit: options.limit,
        pageCount: Math.ceil(total / options.limit),
    };
}

async function findOneSearchEngine(params, options = {}) {
    let includeQuery = {
        where: params,
        subQuery: false,
    };
    if (options.attr) {
        includeQuery.attributes = options.attr;
    }
    const searchEngine = await SearchEngine.findOne(includeQuery);
    return searchEngine;
}

module.exports = {
    createSearchEngine,
    updateSearchEngine,
    deleteSearchEngine,
    destroySearchEngine,
    findAllSearchEngines,
    findOneSearchEngine,
};
