const moment = require("moment");
const {transform, indexOf} = require("lodash");

const ReportingData = require("../../../services/datas/reporting.data");
const ReportingMappingData = require("../../../services/datas/reportingMapping.data");
const PublisherAccountData = require("../../../services/datas/publisiherAccount.data");
const ProviderService = require("../../../services/datas/provider.data");
const {saveRevenueAlert} = require("./revenueAlert.logic");

const {
    isMapFieldsZero,
    isValidDateFormat,
    isFieldWithNumValue,
} = require("./csvValidation.logic");
const {
    getStartAndEndDate,
    getSourceIdentValue,
    calculateCheckSum,
    roundingFixedValues,
    findPublisheAccountByIdentifier,
    queSearchLogs,
    storeExcludeFields,
    subIdForUploadedAndSkippedRecords,
    filterOutUploadedSubIdsFromSkip,
    identifyMissingPublisherAccount,
} = require("./csvHelper.logic");

/**
 *
 * @param {*} REPORTDATAS - Array of reports
 * @param {*} req
 * @returns
 */

async function advertiserApiLogic(REPORTDATAS, req) {
    try {
        const today = moment().format("YYYY-MM-DD");
        const advertiser_id = req.advertiser_id;
        let sourceIdentifier = null;
        let mapName = await ReportingMappingData.getMapping(advertiser_id);
        let provider = await ProviderService.findOneProvider(
            {
                id: advertiser_id,
            },
            {}
        );
        //new added to find out source link identifier
        let source_link_identifier = provider?.dataValues
            ?.link_source_identifier
            ? provider?.dataValues?.link_source_identifier
            : null;
        //initialised value
        sourceIdentifier = provider?.dataValues?.csv_source_identifier
            ? provider?.dataValues?.csv_source_identifier
            : null;

        mapName = req?.mapping_fields;

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

        if (!sourceIdentifier) {
            throw new Error(`No source Identifier Found ${advertiser_id}`);
        }
        if (!allPublisherAccounts) {
            throw new Error(`No Publisher account found ${advertiser_id}`);
        }

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

        for (let row of REPORTDATAS) {
            totalCount = totalCount + 1;
            indexCount = indexCount + 1;
            let mapping = {};
            if (sourceIdentifier) {
                for (let r in row) {
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
                        mapping["source_identifier"] = getSourceIdentValue(
                            row,
                            sourceIdentifier
                        )?.trim();
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
        }

        // for combined csv
        const reportsWithPubAcount = await findPublisheAccountByIdentifier(
            extractReport,
            excludedData,
            allPublisherAccounts
        );

        //to find staring and end date from csv
        let {maxDate = null, minDate = null} = getStartAndEndDate(allDates);
        await subIdForUploadedAndSkippedRecords(
            excludedData,
            skippedSubIdsOrChannels,
            skippedWithValidation,
            skippedWithNotFoundPubAccount
        );
        await identifyMissingPublisherAccount(
            skippedSubIdsOrChannels,
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

            const ReportsWithServerSearches = await queSearchLogs(
                reportsWithFixedValues,
                advertiser_id
            );
            let {check_sum_tc = null, uploaded_sum_tc = null} =
                calculateCheckSum(
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
            await storeExcludeFields(
                excludedData,
                advertiser_id,
                null,
                ReportsWithServerSearches,
                "Skipped/Uploaded rows info",
                {check_sum_tc, uploaded_sum_tc},
                "API"
            );
            await ReportingData.storeCSVData(ReportsWithServerSearches);
            await subIdForUploadedAndSkippedRecords(
                ReportsWithServerSearches,
                uploadedSubIdsOrChannels,
                null,
                null
            );

            await saveRevenueAlert(
                {
                    reports: ReportsWithServerSearches,
                    skippedReports: excludedData,
                    advertiser_id: advertiser_id,
                },
                "API"
            );

            return {
                success: true,
                totalCount,
                uploaded: ReportsWithServerSearches.length,
                check_sum_totalSearches: check_sum_tc,
                uploaded_sum_totalSearches: uploaded_sum_tc,
                startDate: minDate,
                endDate: maxDate,
                skippedField: totalCount - ReportsWithServerSearches.length,
                message: `${
                    ReportsWithServerSearches.length
                } rows of data uploaded and ${
                    totalCount - ReportsWithServerSearches.length
                } rows of data skipped.`,
                skippedSubIdsOrChannels: filterOutUploadedSubIdsFromSkip(
                    skippedSubIdsOrChannels,
                    uploadedSubIdsOrChannels
                ),
                skippedWithValidation: [...new Set(skippedWithValidation)],
                skippedWithNotFoundPubAccount: [
                    ...new Set(skippedWithNotFoundPubAccount),
                ],
                uploadedSubIdsOrChannels: [
                    ...new Set(uploadedSubIdsOrChannels),
                ],
                notExistAdvertiserTagsWithSubId: [
                    ...new Set(notExistAdvertiserTagsWithSubId),
                ],
                existAdvertiserTagsWithSubId: [
                    ...new Set(existAdvertiserTagsWithSubId),
                ],
            };
        } else {
            let {check_sum_tc = null, uploaded_sum_tc = null} =
                calculateCheckSum(check_sum_total_searches, []);

            await storeExcludeFields(
                excludedData,
                advertiser_id,
                null,
                [],
                "0 records has been uploaded",
                {check_sum_tc, uploaded_sum_tc},
                "API"
            );

            return {
                success: true,
                totalCount,
                uploaded: 0,
                check_sum_totalSearches: check_sum_tc,
                uploaded_sum_totalSearches: uploaded_sum_tc,
                startDate: minDate,
                endDate: maxDate,
                skippedField: totalCount,
                message: `0 rows of data uploaded and ${totalCount} rows of data skipped.`,
                skippedWithValidation: [...new Set(skippedWithValidation)],
                skippedWithNotFoundPubAccount: [
                    ...new Set(skippedWithNotFoundPubAccount),
                ],
                notExistAdvertiserTagsWithSubId: [
                    ...new Set(notExistAdvertiserTagsWithSubId),
                ],
                existAdvertiserTagsWithSubId: [
                    ...new Set(existAdvertiserTagsWithSubId),
                ],
                skippedSubIdsOrChannels: skippedSubIdsOrChannels,
                uploadedSubIdsOrChannels: [],
            };
        }
    } catch (error) {
        throw new Error(error);
    }
}

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
    mapping["clicks"] = mapping["clicks"] ? mapping["clicks"] : "0";
    mapping["monetized_searches"] = mapping["monetized_searches"]
        ? mapping["monetized_searches"]
        : 0;
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
        mapping["uploaded_by"] = req.user;
        mapping["advertiser_id"] = advertiser_id;
        mapping["uploaded_date"] = moment.utc(new Date()).format();
        mapping["source"] = "Api";
        extractReport.push(mapping);
    }
}

module.exports = {
    advertiserApiLogic,
};
