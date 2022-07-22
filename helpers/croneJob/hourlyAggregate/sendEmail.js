var nodemailer = require("nodemailer");
const {google} = require("googleapis");

//env variables
const path = require("path");
require("dotenv").config({path: path.join(__dirname, "../../../.env")});
const {log} = require("../../logger");
const {genarateHTML} = require("./template/emailTemplate");

//Email configuration
const CLIENT_ID = process.env.CLIENT_ID;
const REFRESH_TOKEN = process.env.REFRESH_TOKEN || "";
const REDIRECT_URL = process.env.REDIRECT_URL || "";
const CLIENT_SECRET = process.env.CLIENT_SECRET || "";
const RELETED_TO = "Change In Publisher Tag Traffic";
const SMTP_HOST = process.env.SMTP_HOST || "smtp.gmail.com";
const SMTP_PORT = process.env.SMTP_PORT || 587;
const EMAIL = process.env.EMAIL || "ninayafms@gmail.com";

//email get
let HOURLY_AGG_MAIL_TO = process.env.HOURLY_AGG_MAIL_TO || "";
const {DEFAULT_ALERT} = require("../../emailConfig.type");
const EmailConfigService = require("../../../src/services/datas/emailConfig.data");

const title = "Alert Publisher Tags";
const SOURCE = process.env.NODE_ENV || "";
//main function to send email
async function SendEmail(data = [], purpose = null, exactHr = null) {
    //mail config
    const Response = await EmailConfigService.getEmailByType(DEFAULT_ALERT);
    if (Response) {
        HOURLY_AGG_MAIL_TO = Response?.dataValues?.email || HOURLY_AGG_MAIL_TO;
    }

    const oAuth2client = new google.auth.OAuth2(
        CLIENT_ID,
        CLIENT_SECRET,
        REDIRECT_URL
    );
    oAuth2client.setCredentials({refresh_token: REFRESH_TOKEN});
    await submit(data, purpose, exactHr, oAuth2client);
}

async function submit(data, purpose, exactHr, oAuth2client) {
    try {
        async function getGmailTransporter({auth}) {
            return nodemailer.createTransport({
                host: SMTP_HOST,
                port: SMTP_PORT,
                auth: auth,
                tls: {
                    rejectUnauthorized: false,
                },
            });
        }
        const transport = await getGmailTransporter({
            auth: {
                type: "OAuth2",
                user: EMAIL,
                clientId: CLIENT_ID,
                clientSecret: CLIENT_SECRET,
                refreshToken: REFRESH_TOKEN,
                accessToken: oAuth2client.getAccessToken(),
            },
        });

        let subject =
            purpose === `Percentage Aggregate`
                ? `Change in Publisher Tags Traffic (%)`
                : `Zero Traffic in Publisher Tags`;
        let HelperOptions = {
            from: `${RELETED_TO}<${EMAIL}>`,
            to: HOURLY_AGG_MAIL_TO,
            bcc: process.env.BCC_EMAIL,
            subject: `${subject}`,
            html: genarateHTML(data, purpose, exactHr),
        };

        const send = await transport.sendMail(HelperOptions);
        if (send) {
            log.info({title}, `Aggregate Publisher Tags Mail Has Been Send`);
        } else {
            throw new Error("Something is missing from email Config");
        }
    } catch (error) {
        log.error({title}, error.message || error);
    }
}

module.exports = {SendEmail};
