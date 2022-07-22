//generate HTML
const {hourlyPipeConverter} = require("../hourlyPipe");
const moment = require("moment");

function itemrender(data, purpose) {
    if (purpose === "Hourly Aggregate") {
        return data
            .map(
                item =>
                    `<ul>
                       <li> Publisher tag : ${item?.targeting_id}</li>
                       <li> Alert for : ${hourlyPipeConverter(item?.hour)}</li>
                       <li> Current hour hits: ${item?.today_hits}</li>
                       <li> Yesterday hits : ${item?.yesterday_hits}</li>
                       <li> Message : Total no. of traffic is Zero </li>
                    </ul><hr>`
            )
            .join("");
    } else {
        return `${data
            .map(function (key) {
                return ` <ul>
                    <li> Publisher Tag : ${key?.targeting_id}</li>
                    <li> Alert For : ${hourlyPipeConverter(key?.hour)}</li>
                    <li> Yesterday hits : ${key?.yesterday_hits}</li>
                    <li> Current hour hits : ${key?.today_hits}</li>
                    <li> Previous hour hits : ${key?.last_hour_hits}</li>
                    <li> Decreased by : ${Math.abs(key?.perc_diff).toFixed(
                        2
                    )}</li>
                  </ul><hr>`;
            })
            .join("")} `;
    }
}

const commanHeader = data => {
    return ` <div class="header"><ul style="list-style: none;font-size: 16px;font-weight: 500;padding: 0;">
    <li>Ninaya FMS Alerts</li>
    <li>Date : ${moment()
        .utc()
        .format(
            "dddd, MMMM Do YYYY, hA"
        )} (UTC), Alert for ${hourlyPipeConverter(data[0]?.hour)}</li>
</ul></div><hr>`;
};

function genarateHTML(data, purpose = null, exactHr = null) {
    let htmlContent = ``;
    if (purpose === "Hourly Aggregate") {
        htmlContent = `<div style="background: #e5f0f3; width: 60%;padding: 22px;">
        ${commanHeader(data)}
              <h5 style="font-size: 20px;padding: 8px;font-weight: 500;margin: 8px;background: #ffffff;">
               ${data?.length} publisher tags has Zero traffic </h5>
               <div>
               ${itemrender(data, purpose)}
            </div>
              </div>`;
        return htmlContent;
    } else {
        htmlContent = `<div style="background: #e5f0f3; width: 60%;padding: 22px;">
        ${commanHeader(data)}
       <h5 style="font-size: 20px;padding: 8px;font-weight: 500;margin: 8px;background: #ffffff;">
       ${
           data?.length
       } publisher tags traffic has decreased at least by 25%  </h5>
           <div>
              ${itemrender(data, purpose)}
           </div>
    </div>`;
        return htmlContent;
    }
}

module.exports = {genarateHTML};
