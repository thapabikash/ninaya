const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const mkdirp = require("mkdirp");
const croneJob = require("./helpers/croneJob");

require("dotenv").config({path: path.join(__dirname, ".env")});
const {
    databaseHealthCheck,
    redisHealthCheck,
} = require("./helpers/healthCheck");

// logger file
const {log} = require("./helpers/logger");

const routeHelper = require("./helpers/routes");
// handlers and middlewares
const {errorHandler} = require(`./helpers/errorHandler`);
const authMiddlewareHelper = require("./helpers/authMiddleware");

const app = express();
app.use(cors());

app.options("*", cors());

app.use(bodyParser.json());
app.use(
    bodyParser.urlencoded({
        extended: true,
    })
);

app.use(cookieParser());

const PORT = process.env.PORT || 7001;

app.use(`/assets`, express.static(path.resolve(__dirname, "./assets")));

app.use(express.static(path.resolve(__dirname, "./assets")));
app.use(express.static("uploads"));

app.use((req, res, next) => {
    mkdirp(path.resolve("src/log/"), err => {
        if (err) {
            next(err);
        } else {
            next();
        }
    });
});

app.use("/healthcheck", async function (req, res) {
    try {
        const databaseHealth = await databaseHealthCheck();
        const redisHealth = await redisHealthCheck();
        if (databaseHealth && redisHealth) {
            res.status(200).send({status: 200});
        } else {
            res.status(500).send({status: 500});
        }
    } catch (error) {
        res.status(500).send({status: 500});
    }
});

croneJob.scheduleJob();

app.get("/", function (req, res) {
    res.send("Hello world!!");
});

// Include all routes

app.use(authMiddlewareHelper);
routeHelper.route(app);

// Error handling middleware (keep below routes)
app.use(errorHandler);

app.listen(PORT, () => {
    log.info(`Server is running at port ${PORT}`);
});

module.exports = app;
