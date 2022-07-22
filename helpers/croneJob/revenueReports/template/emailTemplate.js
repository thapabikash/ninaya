const moment = require("moment");
const {
    CSV_UPLOAD_ALERT,
    ADVERTISER_API_UPLOAD_ALERT,
} = require("../../../constants/alert/alertType");

const commonHeader = data => {
    return ` <div class="header"><ul style="list-style: none;font-size: 16px;font-weight: 500;padding: 0;">
    <li>Ninaya FMS Alerts</li>
    <li>Date : ${moment().utc().format("dddd, MMMM Do YYYY, hA")} (UTC)</li>
</ul></div><hr>`;
};

const multiSubIdsrender = data => {
    return data
        .map(
            item =>
                ` <ul>
            <li> SubId/Channel : ${item.subId}</li>
            <li> Total Searches In DB : ${item.total_searches}</li>
            <li> Total Searches In Server Logs : ${item.total_searches_search_logs}</li>
            <li> Difference By (%) : ${item.percentage}</li>
        </ul><hr>`
        )
        .join("");
};

const multiListRender = data => {
    return data
        .map(
            (item, index) =>
                `<ul>
            <li>Alerted Report Source :${
                item.type === CSV_UPLOAD_ALERT ? "CSV Upload" : "API Call"
            }</li>
           <li> Created At. : ${moment(item.alerted_at)
               .utc()
               .format("dddd, MMMM Do YYYY, hA")}</li>
           <li> Advertiser : ${item?.data?.advertiser_id}</li>
           <div>
               <P>The following SubId/Channel of Advertiser - ${
                   item?.data?.advertiser_id
               }  has difference of total searches in between advertiser's report and system logs </p>
               ${multiSubIdsrender(item.data.data)}
           </div>
        </ul><br>`
        )
        .join("");
};

const genarateHTML = (data = []) => {
    let htmlContent = ``;
    htmlContent = `<div style="background: #e5f0f3; width: 60%;padding: 22px;">
    ${commonHeader(data)}
          <h5 style="font-size: 20px;padding: 8px;font-weight: 500;margin: 8px;background: #ffffff;">
          Difference in Advertiser's reports and our system logs</h5>
           <div>
           ${multiListRender(data)}
        </div>
          </div>`;
    return htmlContent;
};

module.exports = {
    genarateHTML,
};
