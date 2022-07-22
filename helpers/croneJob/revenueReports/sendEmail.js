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
const RELETED_TO = "Revenue Share Alert";
const SMTP_HOST = process.env.SMTP_HOST || "smtp.gmail.com";
const SMTP_PORT = process.env.SMTP_PORT || 587;
const EMAIL = process.env.EMAIL || "ninayafms@gmail.com";
//email
let REVENUE_SHARE_MAIL_TO = process.env.REVENUE_SHARE_MAIL_TO || "";
const {DEFAULT_ALERT} = require("../../emailConfig.type");
const EmailConfigService = require("../../../src/services/datas/emailConfig.data");

const title = "Revenue Share Alert";

//main function to send email
async function SendEmail(data = []) {
    //mail config
    const Response = await EmailConfigService.getEmailByType(DEFAULT_ALERT);
    if (Response) {
        REVENUE_SHARE_MAIL_TO =
            Response?.dataValues?.email || REVENUE_SHARE_MAIL_TO;
    }

    const oAuth2client = new google.auth.OAuth2(
        CLIENT_ID,
        CLIENT_SECRET,
        REDIRECT_URL
    );
    oAuth2client.setCredentials({refresh_token: REFRESH_TOKEN});
    await submit(data, oAuth2client);
}

async function submit(data, oAuth2client) {
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

        let HelperOptions = {
            from: `${RELETED_TO}<${EMAIL}>`,
            to: REVENUE_SHARE_MAIL_TO,
            bcc: process.env.BCC_EMAIL,
            subject: `Difference in Advertiser's reports and our system logs`,
            html: genarateHTML(data),
        };

        const send = await transport.sendMail(HelperOptions);
        if (send) {
            log.info({title}, `Revenue Share Alerts`);
        } else {
            throw new Error(
                "Something is missing from email Config For Revenue Share Alert"
            );
        }
    } catch (error) {
        log.error({title}, error.message || error);
    }
}

module.exports = {SendEmail};
