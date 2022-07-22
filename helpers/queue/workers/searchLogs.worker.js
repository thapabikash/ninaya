const redisClient = require("../../redis");
const {successResponse} = require("../../response");
const {searchLogsQueue, REDIS_SEARCH_LOGS_QUEUE_NAME} = require("../bullQueue");

let reqRes = {};

searchLogsQueue.process(async job => {
    try {
        const {req, res, next, fetchSearchLogs} = reqRes[job.id];
        let keyString = "";
        for (let q in req.query) {
            keyString = `${keyString}-${req.query[q]}`;
        }
        const finalData = await fetchSearchLogs(req, next);
        if (finalData) {
            redisClient.setEx(keyString, 8 * 60 * 60, finalData);
            return successResponse(res, "Logs info get success!!", finalData);
        } else {
            throw new Error("Logs info get failed!!!");
        }
    } catch (error) {
        throw new Error(error?.message || error);
    }
});

async function createJob(req, res, next, fetchSearchLogs) {
    await searchLogsQueue
        .add({
            name: REDIS_SEARCH_LOGS_QUEUE_NAME,
            fetchSearchLogs: fetchSearchLogs,
        })
        .then(job => {
            reqRes[job.id] = {req, res, next, fetchSearchLogs};
        });
}

function getQueue() {
    return searchLogsQueue;
}

module.exports = {createJob, getQueue};
