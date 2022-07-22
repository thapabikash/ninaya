var nodemailer = require("nodemailer");
const {google} = require("googleapis");
const {log} = require("../../../helpers/logger");
const title = "Email Service"; // title while saving logs
const ProviderService = require("./provider.data");

//email configuration
const {DEFAULT_ALERT} = require("../../../helpers/emailConfig.type");
const EmailConfigService = require("./emailConfig.data");

//for google api secret tokens
const CLIENT_ID = process.env.CLIENT_ID;
const REFRESH_TOKEN = process.env.REFRESH_TOKEN;
const REDIRECT_URL = process.env.REDIRECT_URL;
const CLIENT_SECRET = process.env.CLIENT_SECRET;

let MAIL_TO = process.env.MAIL_TO;

async function SendEmail(data, source = null) {
    //get email config
    const Response = await EmailConfigService.getEmailByType(DEFAULT_ALERT);
    if (Response) {
        MAIL_TO = Response?.dataValues?.email || MAIL_TO;
    }

    const oAuth2client = new google.auth.OAuth2(
        CLIENT_ID,
        CLIENT_SECRET,
        REDIRECT_URL
    );
    oAuth2client.setCredentials({refresh_token: REFRESH_TOKEN});
    async function submission(data) {
        try {
            const provider = await ProviderService.getProviderByProperty(
                data?.advertiser_id
            );
            async function getGmailTransporter({auth}) {
                return nodemailer.createTransport({
                    host: process.env.SMTP_HOST,
                    port: process.env.SMTP_PORT,
                    auth: auth,
                    tls: {
                        rejectUnauthorized: false,
                    },
                });
            }

            const transport = await getGmailTransporter({
                auth: {
                    type: "OAuth2",
                    user: process.env.EMAIL,
                    clientId: CLIENT_ID,
                    clientSecret: CLIENT_SECRET,
                    refreshToken: REFRESH_TOKEN,
                    accessToken: oAuth2client.getAccessToken(),
                },
            });

            let subject =
                source === "api"
                    ? `API of Advertiser ${data.advertiser_id} (${
                          provider ? "" + provider.name : ""
                      }) - ${
                          data?.uploaded_status
                              ? data.uploaded_status
                              : data?.status
                      }`
                    : `CSV of Advertiser ${data.advertiser_id} (${
                          provider ? "" + provider.name : ""
                      }) -  ${
                          data?.uploaded_status
                              ? data.uploaded_status
                              : data?.status
                      }`;
            let HelperOptions = {
                from: `${process.env.RELETED_TO}<${process.env.EMAIL}>`,
                to: MAIL_TO,
                bcc: process.env.BCC_EMAIL,
                subject: subject,
                html: genarateHTML(data, source),
            };

            const send = await transport.sendMail(HelperOptions);
            if (send) {
                if (source === "api") {
                    log.info(
                        {title},
                        `Mail Send successfull for the last call of api of Advertiser ${data.advertiser_id}`
                    );
                } else {
                    log.info(
                        {title},
                        `Mail Send successfull for the csv file ${data.csv_name} and Advertiser ${data.advertiser_id}`
                    );
                }
            } else {
                throw new Error("Something is missing in MailConfig");
            }
        } catch (err) {
            log.error({title}, err.message || err);
        }
    }

    await submission(data);
}

function genarateHTML(data, source = "") {
    let successContent = ``;
    let failedContent = ``;
    if (source === "api") {
        successContent = `<Div style="background: #e5f0f3; width: 60%;padding: 22px;">
        <h4 style="font-size: 23px;padding: 8px;font-weight: 600;margin: 8px;background: #ffffff;">
        API Call Status For Reports Of Advertiser #${data?.advertiser_id}</h4>
         <ul>
           <li><span style="font-weight: 600;">Advertiser ID :</span> ${
               data?.advertiser_id
           }</li>
           <li><span style="font-weight: 600;">Upload Status :</span> ${
               data?.uploaded_status ? data.uploaded_status : data?.status
           }</li>
            <li><span style="font-weight: 600;">Total Rows : </span>${
                data?.total_rows
            }</li>
            <li><span style="font-weight: 600;">Uploaded Rows : </span>${
                data?.total_uploaded
            }</li>
            <li><span style="font-weight: 600;">Failed Rows : </span>${
                data?.total_skipped
            }</li>
            <li><span style="font-weight: 600;">Checksum in API : </span>${
                data?.check_sum_totalSearches
            }</li>
            <li><span style="font-weight: 600;">Checksum In DB : </span>${
                data?.uploaded_sum_totalSearches
            }</li>
            <li><span style="font-weight: 600;">Message :</span>${
                data?.message
            }</li>
            <li><span style="font-weight: 600;">Time Taken :</span>${
                data?.time_taken
            } Seconds</li>
         </ul>
        </div>`;
        failedContent = `<Div style="background: #e5f0f3;width: 60%; padding: 22px;">
        <h4 style="font-size: 23px;padding: 8px;font-weight: 600;margin: 8px;
        background: #ffffff;">API Call status for Advertiser #${
            data.advertiser_id
        }</h4>
         <ul>
           <li><span style="font-weight: 600;">Advertiser ID :</span> ${
               data?.advertiser_id
           }</li>
           <li><span style="font-weight: 600;">Upload Status :</span>${
               data?.uploaded_status ? data.uploaded_status : data?.status
           }</li>
           <li><span style="font-weight: 600;">Message :</span>${
               data?.message
           }</li>
           <li><span style="font-weight: 600;">Time Taken :</span>${
               data?.time_taken
           } Seconds</li>
         </ul>
        </div>`;
    } else {
        successContent = `<Div style="background: #e5f0f3; width: 60%;padding: 22px;">
        <h4 style="font-size: 23px;padding: 8px;font-weight: 600;margin: 8px;background: #ffffff;">
        CSV upload status for Advertiser #${data?.advertiser_id}</h4>
         <ul>
           <li><span style="font-weight: 600;">Advertiser ID :</span> ${
               data?.advertiser_id
           }</li>
           <li><span style="font-weight: 600;">CSV Name :</span> ${
               data?.csv_name
           }</li>
           <li><span style="font-weight: 600;">Upload Status :</span> ${
               data?.uploaded_status ? data.uploaded_status : data?.status
           }</li>
            <li><span style="font-weight: 600;">Total Rows : </span>${
                data?.total_rows
            }</li>
            <li><span style="font-weight: 600;">Uploaded Rows : </span>${
                data?.total_uploaded
            }</li>
            <li><span style="font-weight: 600;">Failed Rows : </span>${
                data?.total_skipped
            }</li>
            <li><span style="font-weight: 600;">Checksum in CSV : </span>${
                data?.check_sum_totalSearches
            }</li>
            <li><span style="font-weight: 600;">Checksum In DB : </span>${
                data?.uploaded_sum_totalSearches
            }</li>
            <li><span style="font-weight: 600;">Message :</span>${
                data?.message
            }</li>
            <li><span style="font-weight: 600;">Time Taken :</span>${
                data?.time_taken
            } Seconds</li>
         </ul>
        </div>`;
        failedContent = `<Div style="background: #e5f0f3;width: 60%; padding: 22px;">
        <h4 style="font-size: 23px;padding: 8px;font-weight: 600;margin: 8px;
        background: #ffffff;">CSV upload status for Advertiser #${
            data.advertiser_id
        }</h4>
         <ul>
           <li><span style="font-weight: 600;">Advertiser ID :</span> ${
               data?.advertiser_id
           }</li>
           <li><span style="font-weight: 600;">CSV Name :</span> ${
               data?.csv_name
           }</li>
           <li><span style="font-weight: 600;">Upload Status :</span>${
               data?.uploaded_status ? data.uploaded_status : data?.status
           }</li>
           <li><span style="font-weight: 600;">Message :</span>${
               data?.message
           }</li>
           <li><span style="font-weight: 600;">Time Taken :</span>${
               data?.time_taken
           } Seconds</li>
         </ul>
        </div>`;
    }
    let returnContent =
        data["status"] === "Failed" ? failedContent : successContent;

    return returnContent;
}

module.exports = {
    SendEmail,
};
