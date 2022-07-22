const dotenv = require("dotenv");
dotenv.config({path: __dirname + "/../.env"});
module.exports = {
    host: process.env.PG_HOST,
    username: process.env.PG_USERNAME,
    password: process.env.PG_PASSWORD,
    database: process.env.PG_DATABASE,
    port: process.env.PG_PORT,
    seederStorage: "sequelize",
    dialect: "postgres",
    pool: {
        max: 1000,
        min: 0,
        acquire: 30000,
        idle: 10000,
    },
    logging: false,
    dialectOptions: {
        useUTC: true, // for reading from database
    },
    timezone: "UTC", // for writing to database
};
