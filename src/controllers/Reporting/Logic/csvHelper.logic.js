const moment = require("moment");
const {findKey} = require("lodash");
const LogService = require("../../../services/datas/logInfo.data");
const {sumBy, difference} = require("lodash");
const ReportingData = require("../../../services/datas/reporting.data");
const {MISSING_PUBLISHER_AD_ACCOUNT} = require("./invalidMessage");
const ProvLinkService = require("../../../services/datas/providerLink.data");
const PublisherAccountService = require("../../../services/datas/publisiherAccount.data");
const parseUrl = require("url-parse");
const {
    PARTIALLY_UPLOADED,
    COMPLETELY_UPLOADED,
    ZERO_RECORD_UPLOADED,
} = require("../constant/uploadStatus");
const e = require("express");

/**
 *
 * @param {*} dates  date range
 * @returns
 */
function getStartAndEndDate(dates) {
    const maxDate = new Date(Math.max.apply(null, dates));
    const minDate = new Date(Math.min.apply(null, dates));
    return {
        maxDate: moment(maxDate).format("MM-DD-YYYY"),
        minDate: moment(minDate).format("MM-DD-YYYY"),
    };
}

//case sesitive source identifier with CSV rows
/**
 *
 * @param {*} obj - CSV row
 * @param {*} name - name of the column
 * @returns
 */
function getSourceIdentValue(obj, name) {
    var realName = findKey(obj, function (value, key) {
        return key?.trim().toLowerCase() === name?.trim().toLowerCase();
    });
    if (!realName) {
        return null;
    }
    return "" + obj[realName];
}

function calculateCheckSum(check_sum_total_searches, uploadedreports) {
    let check_sum_tc = check_sum_total_searches.reduce((accumulator, sum) => {
        return accumulator + +sum;
    }, 0);
    let uploaded_sum_tc = uploadedreports.reduce((accumulator, sum) => {
        return (
            accumulator + (sum["total_searches"] ? sum["total_searches"] : 0)
        );
    }, 0);
    return {check_sum_tc, uploaded_sum_tc};
}

/**
 *
 * @param {*} mapping - mapping of the CSV file
 */
function changeIntoNumericFields(mapping) {
    const replaceWith = ["gross_revenue", "total_searches", "clicks"];
    replaceWith.forEach(field => {
        if (mapping[field]) {
            mapping[field] = mapping[field]?.replace(/^\D+|\D+$|\,|/g, "");
        }
    });
}

//fixed decimal value with first 3 digit
function roundingFixedValues(filters) {
    const mapFixedValues = filters.map(map => {
        map.pub_revenue = +map?.pub_revenue?.toFixed(3);
        map.monetized_searches = map?.monetized_searches
            ? parseInt(map?.monetized_searches)
            : 0;
        map.clicks = map?.clicks ? parseInt(map?.clicks) : 0;
        map.total_searches = map?.total_searches
            ? parseInt(map?.total_searches)
            : 0;
        map.followon_searches = map?.followon_searches
            ? parseInt(map?.followon_searches)
            : 0;
        map.initial_searches = map?.initial_searches
            ? parseInt(map?.initial_searches)
            : 0;
        const data = {
            ...map,
        };
        return data;
    });
    return mapFixedValues;
}

/**
 *
 * @param {*} extractReport - []report data
 * @param {*} newexcludeData - []exclude data
 * @param {*} allPublisherAccounts - []all publisher accounts
 * @param {*} allProviderLinks - []all provider links
 * @returns
 */
async function findPublisheAccountByIdentifier(
    extractReport = [],
    newexcludeData = [],
    allPublisherAccounts = []
) {
    let extractedArr = [];

    for (let row of extractReport) {
        try {
            let pubAccount = null;
            const response = allPublisherAccounts?.data?.filter(em => {
                return em.sin === row?.source_identifier;
            });

            pubAccount = getAccountBeforeAfterDate(response, row);

            if (pubAccount && response) {
                let share_revenue_calc = pubAccount?.share_revenue
                    ? pubAccount?.share_revenue / 100
                    : 0;
                let pub_revenue = row?.gross_revenue * share_revenue_calc;
                let pub_account_id = pubAccount?.id;
                let link_id = pubAccount?.link_id;
                extractedArr.push({
                    ...row,
                    pub_revenue,
                    link_id,
                    pub_account_id,
                    publisher: pubAccount?.publisher_id,
                    tag_id: pubAccount?.tid,
                    rule_id: pubAccount?.rule_id,
                    link_id: pubAccount?.link_id,
                    platform_id: pubAccount?.provider_link?.platform_id,
                    tag_type_id: pubAccount?.provider_link?.tag_type_id,
                    search_engine_id:
                        pubAccount?.provider_link?.search_engine_id,
                });
            } else {
                newexcludeData.push({
                    ...row,
                    Invalid_Message: MISSING_PUBLISHER_AD_ACCOUNT,
                });
            }
        } catch (e) {
            console.log("=====" + e + "====");
        }
    }

    return extractedArr;
}

function getAccountBeforeAfterDate(publisherAccounts = [], report = {}) {
    let accounts = null;
    if (publisherAccounts.length === 1) {
        accounts = publisherAccounts[0];
    }
    if (publisherAccounts.length <= 0) {
        accounts = null;
    }
    if (publisherAccounts.length > 1) {
        let publisherAccountsData =
            replaceNullWithCurrentDate(publisherAccounts);
        let rowDate = report?.date;

        let nearestdate = findNearestDate(rowDate, publisherAccountsData);
        accounts = findActualAccount(nearestdate, publisherAccountsData);
    }
    return accounts;
}

function replaceNullWithCurrentDate(datas) {
    let convertedAccounts = [];
    for (let data of datas) {
        if (data.to_date) {
            convertedAccounts.push({
                convertdate: data.to_date,
                id: data.id,
                publisher_id: data.publisher_id,
                provider_id: data.provider_id,
                rule_id: data.rule_id,
                sin: data.sin,
                tid: data.tid,
                link_id: data.link_id,
                source_identifier: data.source_identifier,
                share_revenue: data.share_revenue,
                provider_link: data?.provider_link?.dataValues,
            });
        } else {
            convertedAccounts.push({
                convertdate: moment().utc().format("YYYY-MM-DD"),
                id: data.id,
                publisher_id: data.publisher_id,
                provider_id: data.provider_id,
                rule_id: data.rule_id,
                sin: data.sin,
                tid: data.tid,
                link_id: data.link_id,
                source_identifier: data.source_identifier,
                share_revenue: data.share_revenue,
                provider_link: data?.provider_link?.dataValues,
            });
        }
    }

    return convertedAccounts;
}

function findNearestDate(date, dates) {
    let nearestDate = dates[0].convertdate;
    let nearestDateDiff = moment(date).diff(moment(nearestDate));
    for (let i = 1; i < dates.length; i++) {
        let diff = moment(date).diff(moment(dates[i].convertdate));
        if (diff < 0 && nearestDateDiff < 0) {
            if (diff > nearestDateDiff) {
                nearestDate = dates[i].convertdate;
                nearestDateDiff = diff;
            }
        } else {
            if (diff === 0 || diff < nearestDateDiff) {
                nearestDate = dates[i].convertdate;
                nearestDateDiff = diff;
            }
        }
    }
    return nearestDate;
}

function findActualAccount(nearestDate, accounts) {
    for (let i = 0; i < accounts.length; i++) {
        if (accounts[i].convertdate === nearestDate) {
            return accounts[i];
        }
    }
    return accounts[0];
}

/**
 *
 * @param {*} reports - []report data
 * @param {*} allSearchLogs - []all search logs
 * @returns
 */

// async function queSearchLogs(reports, advertiser_id) {
//     let running = true;
//     let limit = 200000;
//     let offset = 0;

//     while (running) {
//         const allSearchLogs = await LogService.findAllLogInfosForReports({
//             limit: limit,
//             offset: offset,
//         });

//         if (!allSearchLogs || allSearchLogs.length < 1) {
//             running = false;
//         }
//         for (let report of reports) {
//             const {publisher, rule_id, date, tag_id, link_id, geo} = report;

//             const concatetext = `${date.replace(/-/g, "")}${geo.charCodeAt(
//                 0
//             )}${tag_id}${publisher}${advertiser_id}${rule_id}${link_id}`;

//             try {
//                 const searchlogs = allSearchLogs?.filter(ems => {
//                     return ems.concatenated_text === concatetext;
//                 });
//                 let total = sumBy(searchlogs, elem => {
//                     return +elem?.total;
//                 });
//                 if (report["search_counts"]) {
//                     report["search_counts"] = report["search_counts"] + +total;
//                 } else {
//                     report["search_counts"] = +total;
//                 }
//             } catch (error) {
//                 report["search_counts"] = 0;
//             }
//         }

//         offset += limit;
//     }
//     return reports;
// }

async function queSearchLogs(reports, advertiser_id) {
    for (let report of reports) {
        const {publisher, rule_id, date, tag_id, link_id, geo} = report;

        const concatetext = `${date?.replace(/-/g, "")}${
            geo ? geo.charCodeAt(0) : ""
        }${tag_id}${publisher}${advertiser_id}${rule_id}${link_id}`;

        const allSearchLogs = await LogService.findAllLogInfosForReports({
            concatetext: concatetext,
        });
        let total = allSearchLogs[0].total ? +allSearchLogs[0].total : 0;
        if (report["search_counts"]) {
            report["search_counts"] = report["search_counts"] + +total;
        } else {
            report["search_counts"] = +total;
        }
    }
    return reports;
}

//for skipping rows
async function skippedUploadedRows(
    excludeField,
    uploadedData,
    advertiser_id,
    filename,
    msg = "",
    {check_sum_tc, uploaded_sum_tc},
    source = null
) {
    const excluded = excludeField.map(row => {
        let excludedRows = {
            channel:
                "" + row["source_identifier"] ? row["source_identifier"] : null,
            date: row["date"] ? row["date"] : null,
            total_searches:
                "" + row["total_searches"] ? row["total_searches"] : null,
            clicks: "" + row["clicks"] ? row["clicks"] : null,
            monetized_searches:
                "" + row["monetized_searches"]
                    ? row["monetized_searches"]
                    : null,
            row_index: "" + row["index"] ? row["index"] : null,
            gross_revenue:
                "" + row["gross_revenue"] ? row["gross_revenue"] : null,
            upload_status: false,
            check_sum: check_sum_tc,
            sum_in_db: uploaded_sum_tc,
            total_uploaded: uploadedData.length,
            total_excluded: excludeField.length,
            advertiser_id: advertiser_id,
            message: row["Invalid_Message"],
        };
        if (source === "API") {
            excludedRows["source"] = "API";
        } else {
            excludedRows["csvfile"] = filename;
        }
        return excludedRows;
    });

    const uploaded = uploadedData.map(row => {
        let uploadedRows = {
            channel:
                "" + row["source_identifier"] ? row["source_identifier"] : null,
            date: row["date"] ? row["date"] : null,
            total_searches:
                "" + row["total_searches"] ? row["total_searches"] : null,
            clicks: "" + row["clicks"] ? row["clicks"] : null,
            monetized_searches:
                "" + row["monetized_searches"]
                    ? row["monetized_searches"]
                    : null,
            row_index: "" + row["index"] ? row["index"] : null,
            gross_revenue:
                "" + row["gross_revenue"] ? row["gross_revenue"] : null,
            upload_status: true,
            check_sum: check_sum_tc,
            sum_in_db: uploaded_sum_tc,
            total_uploaded: uploadedData.length,
            total_excluded: excludeField.length,
            advertiser_id: advertiser_id,
            message: "uploaded",
        };
        if (source === "API") {
            uploadedRows["source"] = "API";
        } else {
            uploadedRows["csvfile"] = filename;
        }
        return uploadedRows;
    });

    return [...excluded, ...uploaded];
}

/**
 *  @param {*} excludeField-excluded field from csv file
 */
async function storeExcludeFields(
    excludeField = [],
    advertiser_id = null,
    filename = "",
    uploadedData = [],
    msg = "",
    {check_sum_tc = null, uploaded_sum_tc = null},
    source = null
) {
    const skippedRows = await skippedUploadedRows(
        excludeField,
        uploadedData,
        advertiser_id,
        filename,
        msg,
        {check_sum_tc, uploaded_sum_tc},
        source
    );
    await ReportingData.storeSkippedRows(skippedRows, source, advertiser_id);
}
//end of skipping rows

//both are used in advertiser api
//to save sub id for skipped and uploaded records

/**
 * @param {*} rows -- array of excluded/skipped rows
 * @param {*} skippedUploadedSubIdsOrChannels -- array of sub ids or channels
 * @param {*} skippedWithValidation -- array of skipped subids with validation
 * @param {*} skippedWithNotFoundPubAccount  -- array of skipped subids with not found pub account
 **/

async function subIdForUploadedAndSkippedRecords(
    rows,
    skippedUploadedSubIdsOrChannels,
    skippedWithValidation,
    skippedWithNotFoundPubAccount
) {
    if (rows.length > 0) {
        for (let report of rows) {
            skippedUploadedSubIdsOrChannels.push(
                report?.channel || report?.source_identifier
            );
            if (skippedWithValidation && skippedWithNotFoundPubAccount) {
                if (report["Invalid_Message"] == MISSING_PUBLISHER_AD_ACCOUNT) {
                    skippedWithNotFoundPubAccount.push(
                        report?.channel || report?.source_identifier
                    );
                } else {
                    skippedWithValidation.push(
                        report?.channel || report?.source_identifier
                    );
                }
            }
        }
    }
}

//to filter only skippedSubIds
function filterOutUploadedSubIdsFromSkip(
    skippedSubIds = [],
    uploadedSubIds = []
) {
    let filteredSkippedSubIds = [...new Set(skippedSubIds)];
    let filteredUploadedSubIds = [...new Set(uploadedSubIds)];
    let differences = difference(filteredSkippedSubIds, filteredUploadedSubIds);
    return differences;
}

function checkRevenueUploadStatus(data) {
    if (
        data?.uploaded_sum_totalSearches > 0 &&
        data?.check_sum_totalSearches > 0
    ) {
        if (data?.uploaded_sum_totalSearches == data?.check_sum_totalSearches) {
            return COMPLETELY_UPLOADED;
        } else {
            return PARTIALLY_UPLOADED;
        }
    }
    return ZERO_RECORD_UPLOADED;
}

async function identifyMissingPublisherAccount(
    skippedWithNotFoundPubAccount = [],
    notExistAdvertiserTagsWithSubId = [], //there is no any advertiser tag with sub id
    existAdvertiserTagsWithSubId = [], //there is any advertiser tag with sub id but not used
    advertiser_id = null,
    source_link_identifier = null
) {
    let allReletedSubIdsInTags = [];
    if (
        skippedWithNotFoundPubAccount.length > 0 &&
        advertiser_id &&
        source_link_identifier
    ) {
        const providerLinks = await ProvLinkService.findAllProviderLinks({
            where: {
                deleted: false,
                provider_id: advertiser_id,
            },
        });
        if (providerLinks.length > 0) {
            for (let data of providerLinks) {
                const parsed = parseUrl(data.link, true);
                let pathname = parsed?.pathname;
                let sin = PublisherAccountService.linkIdentifierFromLink(
                    pathname,
                    parsed,
                    source_link_identifier
                );
                allReletedSubIdsInTags.push(sin);
            }
        }
        for (let subId of skippedWithNotFoundPubAccount) {
            if (allReletedSubIdsInTags.indexOf(subId) == -1) {
                notExistAdvertiserTagsWithSubId.push(subId);
            } else {
                //to identify subIds which is in advertiser tag
                existAdvertiserTagsWithSubId.push(subId);
            }
        }
    }
}

module.exports = {
    getStartAndEndDate,
    getSourceIdentValue,
    calculateCheckSum,
    changeIntoNumericFields,
    roundingFixedValues,
    findPublisheAccountByIdentifier,
    queSearchLogs,
    storeExcludeFields,
    subIdForUploadedAndSkippedRecords,
    filterOutUploadedSubIdsFromSkip,
    checkRevenueUploadStatus,
    identifyMissingPublisherAccount,
};
