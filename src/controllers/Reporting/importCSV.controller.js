const fs = require("fs");
const csv = require("fast-csv");
const path = require("path");
const moment = require("moment");
const {transform, indexOf} = require("lodash");
const sequelize = require("sequelize");
const {Op} = sequelize;
const {log} = require("../../../helpers/logger");
const title = "Reporting CSV upload";

const ReportingData = require("../../services/datas/reporting.data");
const ReportingMappingData = require("../../services/datas/reportingMapping.data");
const PublisherAccountData = require("../../services/datas/publisiherAccount.data");
const {successResponse, errorResponse} = require("../../../helpers/response");
const csv_store_dir = path.join(__dirname, "../../CSVfiles/");
const sendEmailService = require("../../services/datas/email.data");
const {saveRevenueAlert} = require("./Logic/revenueAlert.logic");
const {FAILED, PROCESSING} = require("./constant/uploadStatus");

const {
    isMapFieldsZero,
    isValidDateFormat,
    isFieldWithNumValue,
} = require("./Logic/csvValidation.logic");
const {
    getStartAndEndDate,
    getSourceIdentValue,
    calculateCheckSum,
    changeIntoNumericFields,
    roundingFixedValues,
    findPublisheAccountByIdentifier,
    queSearchLogs,
    storeExcludeFields,
    checkRevenueUploadStatus,
    subIdForUploadedAndSkippedRecords,
    filterOutUploadedSubIdsFromSkip,
    identifyMissingPublisherAccount,
} = require("./Logic/csvHelper.logic");

//que
const PQueue = require("p-queue");
const csvUploadQueue = new PQueue({concurrency: 1});

async function queUploadJob(req, next) {
    return csvUploadQueue.add(() => uploadSingleCSVfile(req, next));
}

async function queingUploadCSV(req, res, next) {
    try {
        let startDate = moment();
        let obj = {};
        obj["csv_name"] = req.file.filename;
        obj["advertiser_id"] = req.body.advertiser_id;
        obj["uploaded_status"] = PROCESSING;
        const created = await ReportingData.csvUploadStatusCreate(obj);
        if (created) {
            successResponse(res, "Success", {
                csv: req.file.filename,
                advertiser_id: req.body.advertiser_id,
                created_id: created.id,
            });
        }
        if (!created) {
            errorResponse(res, "Failed to create csv upload status", {
                success: false,
                status: 400,
                message: "Failed to create csv upload status",
            });
            log.error({title}, "Failed to create csv upload status");
        }

        const finalData = await queUploadJob(req, next);
        if (finalData.success) {
            let endDate = moment();
            let timeTaken = endDate.diff(startDate, "seconds");
            obj["uploaded_status"] = checkRevenueUploadStatus(finalData);
            obj["total_rows"] = finalData.totalCount;
            obj["total_uploaded"] = finalData.uploaded;
            obj["total_skipped"] = finalData.skippedField;
            (obj["check_sum_totalSearches"] =
                finalData.check_sum_totalSearches),
                (obj["uploaded_sum_totalSearches"] =
                    finalData.uploaded_sum_totalSearches);
            obj["startDate"] =
                finalData.startDate === "Invalid date"
                    ? moment()
                    : finalData.startDate;
            obj["endDate"] =
                finalData.endDate === "Invalid date"
                    ? moment()
                    : finalData.endDate;
            obj["message"] = finalData.message;
            obj["time_taken"] = timeTaken;
            (obj["skippedSubIdWithValidation"] =
                finalData.skippedWithValidation),
                (obj["skippedSubIdWithNotFoundPubAccount"] =
                    finalData.skippedWithNotFoundPubAccount),
                (obj["missing_tags_with_subIds"] =
                    finalData.notExistAdvertiserTagsWithSubId),
                (obj["exist_tags_with_subIds"] =
                    finalData.existAdvertiserTagsWithSubId),
                (obj["skipped_subid"] = finalData.skippedSubIdsOrChannels),
                (obj["uploaded_subid"] = finalData.uploadedSubIdsOrChannels),
                await ReportingData.csvUploadStatusUpdate(created.id, obj);
            log.info(
                {title},
                `CSV having name ${req.file.filename} file uploaded successfully of advertiser #${req.body.advertiser_id}`
            );
            sendEmailService.SendEmail(obj, "csv");
            // successResponse(res, "Uploaded successfully", finalData);
        }
        if (finalData.success === false) {
            let endDate = moment();
            let timeTaken = endDate.diff(startDate, "seconds");
            obj["uploaded_status"] = FAILED;
            obj["message"] = finalData.message;
            obj["time_taken"] = timeTaken;
            await ReportingData.csvUploadStatusUpdate(created.id, obj);
            log.error(
                {title},
                `Failed to upload csv having name ${req.file.filename} of advertiser #${req.body.advertiser_id}`
            );
            sendEmailService.SendEmail(obj, "csv");
            // errorResponse(res, "Failed to upload", finalData);
        }
    } catch (error) {
        log.error({title}, error.message || error);
        console.log("===error===", error.message || error);
    }
}

async function uploadSingleCSVfile(req, next) {
    return new Promise(async function (resolve, reject) {
        const today = moment().format("YYYY-MM-DD");
        const advertiser_id = req.body.advertiser_id;
        let sourceIdentifier = null;
        let mapName = await ReportingMappingData.getMapping(advertiser_id);
        //initialised value
        let source_link_identifier = mapName?.dataValues?.provider
            ?.link_source_identifier
            ? mapName?.dataValues?.provider?.link_source_identifier
            : null;

        sourceIdentifier = mapName?.dataValues?.provider?.csv_source_identifier
            ? mapName?.dataValues?.provider?.csv_source_identifier
            : null;
        mapName = mapName?.dataValues?.fields;

        //for save case-sensitive csv amd map fields
        let mapFieldsReversed = {};
        const mappingField = transform(mapName, function (result, val, key) {
            result[key.toLowerCase()] = val;
            mapFieldsReversed[val] = key.trim().toLowerCase();
        });

        let isSameSearchVal =
            mapFieldsReversed?.["total_searches"] ===
            mapFieldsReversed?.["monetized_searches"];
        let search_val_key = mapFieldsReversed?.["total_searches"]
            .trim()
            .toLowerCase();

        const allPublisherAccounts =
            await PublisherAccountData.findAllPublisherAccountsForReports({
                where: {provider_id: advertiser_id},
            });

        try {
            if (!sourceIdentifier) {
                //is req.file.filename exist in dir
                const fileExist = await fs.existsSync(
                    path.join(csv_store_dir, req.file.filename)
                );
                if (fileExist) {
                    await fs.unlink(csv_store_dir + req.file.filename, err => {
                        if (err) return true;
                    });
                }

                return resolve({
                    success: false,
                    status: 400,
                    message: "No csv identifier set for this advertiser",
                });
            }
            if (req.file && allPublisherAccounts) {
                let extractReport = [];
                let totalCount = 0;
                let indexCount = 1;
                let skippedField = 0;
                let publisherId = null;
                let excludedData = [];
                let check_sum_total_searches = [];
                let allDates = [];

                let skippedSubIdsOrChannels = [];
                let uploadedSubIdsOrChannels = [];
                let skippedWithValidation = [];
                let skippedWithNotFoundPubAccount = [];
                let notExistAdvertiserTagsWithSubId = [];
                let existAdvertiserTagsWithSubId = [];

                fs.createReadStream(csv_store_dir + req.file.filename)
                    .pipe(
                        csv.parse({
                            headers: true,
                        })
                    )
                    .on("error", async error => {
                        const fileExist = fs.existsSync(
                            path.join(csv_store_dir, req.file.filename)
                        );
                        if (fileExist) {
                            await fs.unlink(
                                csv_store_dir + req.file.filename,
                                err => {
                                    if (err) return;
                                }
                            );
                        }
                        return resolve({
                            success: false,
                            status: 404,
                            message: error.message,
                        });
                    })
                    .on("data", row => {
                        totalCount = totalCount + 1;
                        indexCount = indexCount + 1;

                        let mapping = {};

                        if (sourceIdentifier) {
                            for (let r in row) {
                                let source = getSourceIdentValue(
                                    row,
                                    sourceIdentifier
                                )?.trim();

                                let col_name = r.trim().toLocaleLowerCase();

                                if (
                                    col_name === search_val_key &&
                                    isSameSearchVal &&
                                    mappingField[col_name]
                                ) {
                                    mapping["total_searches"] = row[r];
                                    mapping["monetized_searches"] = row[r];
                                }

                                if (mappingField[col_name]) {
                                    mapping[mappingField[col_name]] = row[r];
                                    mapping["source_identifier"] = source
                                        ? source
                                        : "";
                                    mapping["index"] = indexCount;
                                }
                            }
                            extractMapping(
                                advertiser_id,
                                mapping,
                                extractReport,
                                req,
                                publisherId,
                                skippedField,
                                excludedData,
                                check_sum_total_searches,
                                allDates
                            );
                        }
                    })
                    .on("end", async () => {
                        const fileExist = fs.existsSync(
                            path.join(csv_store_dir, req.file.filename)
                        );

                        if (fileExist) {
                            await fs.unlink(
                                csv_store_dir + req.file.filename,
                                err => {
                                    if (err) return;
                                }
                            );
                        }
                        try {
                            const reportsWithPubAcount =
                                await findPublisheAccountByIdentifier(
                                    extractReport,
                                    excludedData,
                                    allPublisherAccounts
                                );

                            //to find staring and end date from csv
                            let {maxDate = null, minDate = null} =
                                getStartAndEndDate(allDates);

                            //to find list of  subIds from skipped subIds which is skipped due to validation and not found pub account
                            await subIdForUploadedAndSkippedRecords(
                                excludedData,
                                skippedSubIdsOrChannels,
                                skippedWithValidation,
                                skippedWithNotFoundPubAccount
                            );

                            //extract list of subIds from excluded/skipped subids which is not exist in advertiser tags
                            await identifyMissingPublisherAccount(
                                skippedWithNotFoundPubAccount,
                                notExistAdvertiserTagsWithSubId,
                                existAdvertiserTagsWithSubId,
                                advertiser_id,
                                source_link_identifier
                            );

                            if (reportsWithPubAcount.length > 0) {
                                // rounding fixed values
                                let reportsWithFixedValues =
                                    roundingFixedValues(reportsWithPubAcount);

                                //here find out search logs corresspondings

                                const ReportsWithServerSearches =
                                    await queSearchLogs(
                                        reportsWithFixedValues,
                                        advertiser_id
                                    );
                                let {
                                    check_sum_tc = null,
                                    uploaded_sum_tc = null,
                                } = calculateCheckSum(
                                    check_sum_total_searches,
                                    ReportsWithServerSearches
                                );

                                if (ReportsWithServerSearches.length > 0) {
                                    await ReportingData.deleteData(
                                        today,
                                        advertiser_id,
                                        ReportsWithServerSearches
                                    );
                                }
                                await ReportingData.storeCSVData(
                                    ReportsWithServerSearches
                                );

                                await subIdForUploadedAndSkippedRecords(
                                    ReportsWithServerSearches,
                                    uploadedSubIdsOrChannels,
                                    null,
                                    null
                                );

                                await storeExcludeFields(
                                    excludedData,
                                    advertiser_id,
                                    req?.file?.filename,
                                    ReportsWithServerSearches,
                                    "Skipped/Uploaded rows info",
                                    {check_sum_tc, uploaded_sum_tc},
                                    "CSV"
                                );

                                await saveRevenueAlert(
                                    {
                                        reports: ReportsWithServerSearches,
                                        skippedReports: excludedData,
                                        advertiser_id: advertiser_id,
                                    },
                                    "CSV"
                                );

                                return resolve({
                                    success: true,
                                    totalCount,
                                    uploaded: ReportsWithServerSearches.length,
                                    check_sum_totalSearches: check_sum_tc,
                                    uploaded_sum_totalSearches: uploaded_sum_tc,
                                    startDate: minDate,
                                    endDate: maxDate,
                                    skippedField:
                                        totalCount -
                                        ReportsWithServerSearches.length,
                                    message: `${
                                        ReportsWithServerSearches.length
                                    } rows of data uploaded and ${
                                        totalCount -
                                        ReportsWithServerSearches.length
                                    } rows of data skipped.`,
                                    skippedSubIdsOrChannels:
                                        filterOutUploadedSubIdsFromSkip(
                                            skippedSubIdsOrChannels,
                                            uploadedSubIdsOrChannels
                                        ),
                                    skippedWithValidation: [
                                        ...new Set(skippedWithValidation),
                                    ],
                                    skippedWithNotFoundPubAccount: [
                                        ...new Set(
                                            skippedWithNotFoundPubAccount
                                        ),
                                    ],
                                    uploadedSubIdsOrChannels: [
                                        ...new Set(uploadedSubIdsOrChannels),
                                    ],
                                    notExistAdvertiserTagsWithSubId: [
                                        ...new Set(
                                            notExistAdvertiserTagsWithSubId
                                        ),
                                    ],
                                    existAdvertiserTagsWithSubId: [
                                        ...new Set(
                                            existAdvertiserTagsWithSubId
                                        ),
                                    ],
                                });
                            } else {
                                let {
                                    check_sum_tc = null,
                                    uploaded_sum_tc = null,
                                } = calculateCheckSum(
                                    check_sum_total_searches,
                                    []
                                );

                                await storeExcludeFields(
                                    excludedData,
                                    advertiser_id,
                                    req?.file?.filename,
                                    [],
                                    "Skipped/Uploaded rows info",
                                    {check_sum_tc, uploaded_sum_tc},
                                    "CSV"
                                );

                                return resolve({
                                    success: true,
                                    totalCount,
                                    uploaded: 0,
                                    check_sum_totalSearches: check_sum_tc,
                                    uploaded_sum_totalSearches: uploaded_sum_tc,
                                    startDate: minDate,
                                    endDate: maxDate,
                                    skippedField: totalCount,
                                    message: `0 rows of data uploaded and ${totalCount} rows of data skipped.`,
                                    skippedWithValidation: [
                                        ...new Set(skippedWithValidation),
                                    ],
                                    skippedWithNotFoundPubAccount: [
                                        ...new Set(
                                            skippedWithNotFoundPubAccount
                                        ),
                                    ],
                                    notExistAdvertiserTagsWithSubId: [
                                        ...new Set(
                                            notExistAdvertiserTagsWithSubId
                                        ),
                                    ],
                                    existAdvertiserTagsWithSubId: [
                                        ...new Set(
                                            existAdvertiserTagsWithSubId
                                        ),
                                    ],
                                    skippedSubIdsOrChannels:
                                        skippedSubIdsOrChannels,
                                    uploadedSubIdsOrChannels: [],
                                });
                            }
                        } catch (error) {
                            return resolve({
                                success: false,
                                status: 404,
                                message: error?.message,
                            });
                        }
                    });
            } else {
                throw new Error("Please upload csv file and try again");
            }
        } catch (error) {
            next(error);
        }
    });
}

/**
 * @param {*} advertiser_id -advertiser id
 * @param {*} mapping -csv mapping data
 * @param {*} extractReport- extracted csv data by certain condation
 * @param {*} req -request
 * @param {*} publisherId -publisher id
 * @param {*} skippedField -skipped field-not match with mapping
 * @param {*} excludedData
 * @param {*}  allDates  --arry of dates
 *
 */

async function extractMapping(
    advertiser_id,
    mapping,
    extractReport,
    req,
    publisherId,
    skippedField,
    excludedData,
    check_sum_total_searches,
    allDates
) {
    mapping["clicks"] = !mapping["clicks"]
        ? "0"
        : mapping["clicks"].length > 0
        ? mapping["clicks"]
        : "0";
    mapping["monetized_searches"] = !mapping["monetized_searches"]
        ? 0
        : mapping["monetized_searches"].length > 0
        ? mapping["monetized_searches"]
        : "0";

    changeIntoNumericFields(mapping);
    if (
        isValidDateFormat(mapping, excludedData) ||
        isMapFieldsZero(
            mapping,
            excludedData,
            mapping["source_identifier"],
            allDates
        ) ||
        !isFieldWithNumValue(mapping, excludedData)
    ) {
        skippedField = skippedField + 1;
        check_sum_total_searches.push(
            mapping["total_searches"] ? mapping["total_searches"] : 0
        );
    } else {
        check_sum_total_searches.push(
            mapping["total_searches"] ? mapping["total_searches"] : 0
        );

        mapping["tag_description"] = "";
        mapping["publisher"] = publisherId;
        mapping["channel"] = mapping["source_identifier"];
        mapping["tag_number"] = 0;
        mapping["followon_searches"] = mapping["followon_searches"]
            ? +mapping["followon_searches"]
            : 0;
        mapping["initial_searches"] = mapping["initial_searches"]
            ? +mapping["initial_searches"]
            : 0;
        mapping["date"] = moment(mapping["date"]).format("YYYY-MM-DD");
        mapping["uploaded_by"] = req.user.id;
        mapping["advertiser_id"] = advertiser_id;
        mapping["uploaded_date"] = moment.utc(new Date()).format();
        extractReport.push(mapping);
    }
}

async function fetchAdvertiserWithMapping(req, res, next) {
    try {
        const {order_by, order_direction} = req.query;
        const order = [];
        if (order_by && order_direction) {
            order.push([order_by, order_direction]);
        } else {
            order.push(["id", "ASC"]);
        }
        const advertisers = await ReportingData.fetchAdvertiserWithMapping(
            order
        );
        return successResponse(res, "Fetching mapping advertisers success", {
            advertisers,
        });
    } catch (err) {
        next(err);
    }
}

//http://localhost:8080/remove/reports/3?from=2021-7-17&to=2021-7-17
async function deleteReports(req, res, next) {
    try {
        const {from, to} = req.query;
        const pub_id = req.params.id;
        let whereclause = {};
        let endDate = new Date();
        let startDate;
        if (!pub_id) {
            throw new Error(
                "Publisher Id is required to delete specific publishers reports"
            );
        }
        if (pub_id) {
            whereclause.pub_account_id = pub_id;
        }
        if (to) {
            const newTo = new Date(to);
            endDate = new Date(newTo.setDate(newTo.getDate() + 1));
        }
        if (from) {
            startDate = new Date(from);
            whereclause.date = {
                [Op.gte]: startDate,
                [Op.lte]: endDate,
            };
        }
        const deleted = await ReportingData.deleteReportsByPublisherAccounts(
            whereclause
        );
        return successResponse(
            res,
            "Successfully deleted reports releted with this publisher accounts",
            {
                deleted,
            }
        );
    } catch (error) {
        next(error);
    }
}

//delete revenue reports by publisher and advertiser
async function deleteRevenuereportsByPubAdv(req, res, next) {
    try {
        const {ids, type, from, to, advertisers, publishers} = req.body;
        let whereClause = {};
        if (ids && type && from && to) {
            whereClause.date = {
                [Op.gte]: from,
                [Op.lte]: to,
            };
            if (type === "Advertiser") {
                if (ids.length > 1) {
                    whereClause.advertiser_id = {
                        [Op.in]: [...ids],
                    };
                    if (publishers && publishers.length > 0) {
                        whereClause.publisher = publishers[0];
                    }
                } else {
                    whereClause.advertiser_id = ids[0];
                    if (publishers && publishers.length > 0) {
                        whereClause.publisher = {
                            [Op.in]: [...publishers],
                        };
                    }
                }
            }
            if (type === "Publisher") {
                if (ids.length > 1) {
                    whereClause.publisher = {
                        [Op.in]: [...ids],
                    };
                    if (advertisers && advertisers.length > 0) {
                        whereClause.advertiser_id = advertisers[0];
                    }
                } else {
                    whereClause.publisher = ids[0];
                    if (advertisers && advertisers.length > 0) {
                        whereClause.advertiser_id = {
                            [Op.in]: [...advertisers],
                        };
                    }
                }
            }
            const deleted = await ReportingData.deleterevenuereportsByPubAdv(
                whereClause
            );
            return successResponse(res, "Successfully deleted reports", {
                deleted,
            });
        } else {
            throw new Error("Please apply required credentials");
        }
    } catch (error) {
        next(error);
    }
}

async function deleteRevenuereportByPublisher(req, res, next) {
    try {
        let whereclause = {};
        const publisher_id = req.params.id;
        const {from, to, ad_ids} = req.body;

        if (publisher_id && from && to) {
            whereClause.publisher = publisher_id;
            if (ad_ids) {
                whereclause.advertiser_id = {
                    [Op.in]: ad_ids,
                };
            }
            whereClause.date = {
                [Op.gte]: from,
                [Op.lte]: to,
            };
            const deleted = await ReportingData.deleterevenuereportsByPubAdv(
                whereClause
            );
            return successResponse(res, "Successfully deleted reports", {
                deleted,
            });
        } else {
            throw new Error("Please apply required credentials");
        }
    } catch (error) {
        next(error);
    }
}

module.exports = {
    uploadSingleCSVfile,
    fetchAdvertiserWithMapping,
    deleteReports,
    queingUploadCSV,
    deleteRevenuereportsByPubAdv,
    deleteRevenuereportByPublisher,
};
