const {
    advertiserApiQueue,
    REDIS_ADVERTISER_API_QUEUE_NAME,
} = require("../bullQueue");

let reqRes = {};

async function createJob(croningJob, obj) {
    await advertiserApiQueue
        .add({
            name: REDIS_ADVERTISER_API_QUEUE_NAME,
        })
        .then(job => {
            reqRes[job.id] = {obj, croningJob};
        });
}

function getQueue() {
    return searchLogsQueue;
}

advertiserApiQueue.process(async queue => {
    const {obj, croningJob} = reqRes[queue.id];
    await croningJob(obj);
});

module.exports = {createJob, getQueue};
