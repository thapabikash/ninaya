const path = require("path");
require("dotenv").config({path: path.join(__dirname, "../env")});

const redisClient = require("../helpers/redis");
const {Pool} = require("pg");

/** health check of the postgres database */
const databaseHealthCheck = async () => {
    try {
        const postgresConfig = {
            user: process.env.PG_USERNAME || "postgres",
            host: process.env.PG_HOST || "localhost",
            database: process.env.PG_DATABASE || "ninaya_fms",
            password: process.env.PG_PASSWORD || "",
            port: process.env.PG_PORT || 5432,
            max: 100,
            idleTimeoutMillis: 30000,
            connectionTimeoutMillis: 10000,
        };
        const postgres = new Pool(postgresConfig);
        const client = await postgres.connect();
        await client.query("SELECT 1");
        client.release();
        return true;
    } catch (error) {
        console.log(error);
        return false;
    }
};

/** health check of the redis */
const redisHealthCheck = async () => {
    try {
        const client = redisClient.client;
        await client.ping();
        return true;
    } catch (error) {
        return false;
    }
};

module.exports = {
    databaseHealthCheck,
    redisHealthCheck,
};
