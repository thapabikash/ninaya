const Queue = require("bull");
const path = require("path");
require("dotenv").config({path: path.join(__dirname, "../../.env")});
const {options} = require("./queueRedis");

//set queue name
const REDIS_SEARCH_LOGS_QUEUE_NAME =
    process.env.REDIS_SEARCH_LOGS_QUEUE_NAME || "search_logs";
const REDIS_ADVERTISER_API_QUEUE_NAME =
    process.env.REDIS_ADVERTISER_API_QUEUE_NAME || "advertiser_api";

//create queue
let searchLogsQueue = new Queue(REDIS_SEARCH_LOGS_QUEUE_NAME, options);
let advertiserApiQueue = new Queue(REDIS_ADVERTISER_API_QUEUE_NAME, options);

module.exports = {
    searchLogsQueue,
    REDIS_SEARCH_LOGS_QUEUE_NAME,
    advertiserApiQueue,
    REDIS_ADVERTISER_API_QUEUE_NAME,
};
