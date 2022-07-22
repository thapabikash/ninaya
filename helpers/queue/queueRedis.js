const path = require("path");
require("dotenv").config({path: path.join(__dirname, "../../.env")});

const REDIS_QUEUE_HOST = process.env.REDIS_HOST || "localhost";
const REDIS_QUEUE_PORT = process.env.QUEUE_PORT || 6379;
const REDIS_QUEUE_PASSWORD = process.env.REDIS_PASSWORD;

const options = {
    removeOnSuccess: true,
    redis: {
        host: REDIS_QUEUE_HOST,
        port: REDIS_QUEUE_PORT,
        password: REDIS_QUEUE_PASSWORD,
    },
};

module.exports = {options};
