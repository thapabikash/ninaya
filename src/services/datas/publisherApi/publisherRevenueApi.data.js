const models = require("../../../models/index");
const Report = models.reports;
const uuid = require("uuid");
const os = require("os");
const fs = require("fs");
const path = require("path");

async function index(options = {}, attribute = []) {
    return await Report.findAll({
        where: {
            ...options,
            deleted: false,
        },
        attributes: attribute,
        group: ["tag_id", "date", "geo", "publisher"],
    });
}

const orderedHeadersList = [
    "Date",
    "Total Searches",
    "Clicks",
    "SubId",
    "Publisher ID",
    "Monetized Searches",
    "Country",
    "Net Revenue",
];
/* Get values in the headers ordered as per ordered headers list */
async function getOrderedHeadersList(headers) {
    const orderedHeaders = [];
    for (let i = 0; i < orderedHeadersList.length; i++) {
        const header = orderedHeadersList[i];
        if (headers.includes(header)) {
            orderedHeaders.push(header);
        }
    }
    return orderedHeaders;
}
/**
 * Returns a proper name for database column headers for the reports
 */

async function generateCsvFile(data = [], type = null) {
    const output = [];
    for (let row of data) {
        output.push(row.dataValues);
    }
    const actualdata = [];
    let headers = await getOrderedHeadersList(Object.keys(data[0].dataValues));
    actualdata.push(headers); //getting initial headers

    output.forEach(log => {
        const row = [];
        headers.forEach(async header => {
            let rowValue = `${log[header]}`;
            rowValue = rowValue.replace(/,/g, "-");
            row.push(rowValue);
        });
        actualdata.push(row.join());
    });
    const filename = uuid.v4() + `.${type}`;
    const downloadDir = path.join(__dirname, "../../../../data");
    if (!fs.existsSync(downloadDir)) {
        fs.mkdirSync(downloadDir);
    }
    let filepath = path.join(downloadDir, filename);

    fs.writeFileSync(filepath, Buffer.from(actualdata.join(os.EOL)));
    return filepath;
}

module.exports = {
    index,
    generateCsvFile,
};
