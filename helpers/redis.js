const path = require("path");
require("dotenv").config({path: path.join(__dirname, "../env")});

const REDIS_HOST = process.env.REDIS_HOST || "localhost";
const REDIS_PORT = process.env.REDIS_PORT || 6379;
const REDIS_PASSWORD = process.env.REDIS_PASSWORD;
const redis = require("redis");

let client = redis.createClient({
    host: REDIS_HOST,
    port: REDIS_PORT,
    password: REDIS_PASSWORD,
    retry_strategy: retry => retry * 100 || 3000,
});

client.on("connect", () => {
    console.log("Redis: connected");
});

client.on("end", () => {
    console.log("Redis: end");
});
client.on("disconnected", () => {
    console.log("Redis: disconnected");
});

client.on("error", function (error) {
    console.error("Redis:Error", error);
});

function get(key) {
    if (!client) return null;
    return new Promise((resolve, reject) =>
        client.get(key, (err, data) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(JSON.parse(data));
        })
    );
}

function set(key, value) {
    if (!client) return null;
    return client.set(key, JSON.stringify(value));
}

function setEx(key, time, value) {
    if (!client) return null;
    return client.set(key, JSON.stringify(value), "EX", time);
}

function flushAll() {
    if (!client) return null;
    return new Promise((resolve, reject) =>
        client.flushdb(function (err, succeeded) {
            if (err) {
                reject(err);
                return;
            }
            console.log(succeeded); // will be true if successfull
            resolve(succeeded);
        })
    );
}

function deletKey(key) {
    if (!client) return null;
    return new Promise((resolve, reject) =>
        client.del(key, function (err, succeeded) {
            if (err) {
                reject(err);
                return;
            }
            console.log(succeeded); // will be true if successfull
            resolve(succeeded);
        })
    );
}

module.exports = {get, set, flushAll, deletKey, setEx, client};
