const {
    getStatsReport,
    applyCronedWithProviders,
} = require("../../../services/datas/api/advertiserApi.service");
const {advertiserApiLogic} = require("../Logic/advertiserApi.logic");
const sendEmailService = require("../../../services/datas/email.data");
const {successResponse} = require("../../../../helpers/response");
const {log} = require("../../../../helpers/logger");
const {apiUrlGenarator} = require("../../../../helpers/advertiserApi.helper");
const {
    updateAdvertiserApiInfo,
} = require("../../../services/datas/api/advertiserApiInfo.service");

const reportMappingService = require("../../../services/datas/reportingMapping.data");
const publisherAccountService = require("../../../services/datas/publisiherAccount.data");
const title = "Advertiser Api";
const {isArray} = require("lodash");
const moment = require("moment");
const {checkAdvertiserParams} = require("./advertiserApi.credentials");
const {
    createJob,
} = require("../../../../helpers/queue/workers/advertiserApi.worker");
const {FAILED, PROCESSING} = require("../constant/uploadStatus");
const {checkRevenueUploadStatus} = require("../Logic/csvHelper.logic");

//For D2R Reports form API

/**
 *
 * @param {*} RequestedAdvertiser
 */

async function getAdvertiserReportApi(RequestedAdvertiser = {}) {
    try {
        const req = {
            advertiser_id: RequestedAdvertiser?.advertiser_id || null,
            user: RequestedAdvertiser?.user || null,
            url: RequestedAdvertiser.url,
            croneJob: RequestedAdvertiser.croneJob || false,
            advertiser_code: RequestedAdvertiser.advertiser_code || "",
            mapping_fields: RequestedAdvertiser.mapping_fields || {},
        };

        let startDate = moment();
        const REPORT = await getStatsReport(req);
        if (REPORT) {
            if (REPORT?.status == 200 || REPORT?.status == true) {
                const REPORTDATAS = isArray(REPORT?.data)
                    ? REPORT?.data
                    : REPORT?.data?.data;
                const uploaded = await advertiserApiLogic(REPORTDATAS, req);
                if (uploaded) {
                    let endDate = moment();
                    let timeTaken = endDate.diff(startDate, "seconds");
                    uploaded["total_rows"] = uploaded.totalCount;
                    uploaded["total_uploaded"] = uploaded.uploaded;
                    uploaded["total_skipped"] = uploaded.skippedField;
                    uploaded["csv_name"] = "Api call";
                    uploaded["status"] = "Uploaded";
                    uploaded["advertiser_id"] =
                        RequestedAdvertiser.advertiser_id;
                    uploaded["time_taken"] = timeTaken;
                    uploaded["uploaded_status"] =
                        checkRevenueUploadStatus(uploaded);

                    //print api status in advertiserApiInfo table
                    const infoDetails = {
                        uploaded_status: uploaded?.uploaded_status
                            ? uploaded?.uploaded_status
                            : checkRevenueUploadStatus(uploaded),
                        check_sum: uploaded?.check_sum_totalSearches,
                        check_sum_in_db: uploaded?.uploaded_sum_totalSearches,

                        message: uploaded?.message
                            ? uploaded?.message
                            : `Successfully uploaded Reports of Advertiser ${RequestedAdvertiser.advertiser_id}`,
                        total_rows: uploaded?.totalCount,
                        total_uploaded: uploaded?.uploaded,
                        total_skipped: uploaded?.skippedField,
                        skipped_subid:
                            uploaded?.skippedSubIdsOrChannels || null,
                        uploaded_subid:
                            uploaded?.uploadedSubIdsOrChannels || null,
                        skippedSubIdWithValidation:
                            uploaded?.skippedWithValidation || null,
                        missing_tags_with_subIds:
                            uploaded?.notExistAdvertiserTagsWithSubId || null,
                        exist_tags_with_subIds:
                            uploaded?.existAdvertiserTagsWithSubId || null,
                        skippedSubIdWithNotFoundPubAccount:
                            uploaded?.skippedWithNotFoundPubAccount || null,
                        last_updated_db: moment.utc(new Date()).format(),
                    };
                    await updateAdvertiserApiInfo(
                        infoDetails,
                        RequestedAdvertiser?.advertiser_id
                    );
                    //send email to admin
                    sendEmailService.SendEmail(uploaded, "api");
                    log.info(
                        {title},
                        `Success  api call for advertiser ${RequestedAdvertiser.advertiser_id}`
                    );
                } else {
                    throw new Error(
                        {title},
                        `Failed to called api job for advertiser ${RequestedAdvertiser.advertiser_id}`
                    );
                }
            } else {
                throw new Error(REPORT?.message || "Failed to called api");
            }
        } else {
            throw new Error("Failed to fetch API");
        }
    } catch (error) {
        throw new Error(
            `For Advertiser ${RequestedAdvertiser?.advertiser_id}-- ${
                error?.message || "Something went wrong in advertiser api"
            } `
        );
    }
}

// function for call api for each advertisers API with custome details
async function apiCallWithCustome(req, res, next) {
    try {
        const {fromDate, toDate} = req.body;
        const user = req?.user?.id;
        let f_Date = moment(fromDate).format("YYYY-MM-DD");
        let t_Date = moment(toDate).format("YYYY-MM-DD");
        const responseData = await applyCronedWithProviders(req.body);
        if (responseData.length > 0) {
            for (let advertiser of responseData) {
                advertiser["fromDate"] = f_Date;
                advertiser["toDate"] = t_Date;
                advertiser["user"] = user;
                // await createJob(applyJob, advertiser);
                await applyJob(advertiser);
            }
        }
        return successResponse(res, "Successfully called api");
    } catch (error) {
        console.log("====" + error + "====");
        log.error(error.message || error);
        next(error);
    }
}

async function applyJob(advertiser) {
    const {fromDate, toDate, user, advertiser_id} = advertiser;
    try {
        //print api status in advertiserApiInfo table
        const startUpdate = {
            message: `Appling  job for advertiser api ${advertiser_id}`,
            uploaded_status: PROCESSING,
            called_api_date: moment.utc(new Date()).format(),
            apply_to_date: toDate || null,
            apply_from_data: fromDate || null,
            source: "Api",
        };
        await updateAdvertiserApiInfo(startUpdate, advertiser_id);
        // const isExistMappedFields = await checkMappedFieldsSet(advertiser_id);
        const account = await checkPublisherAdAccountExist(advertiser_id);
        // if (!isExistMappedFields) {
        //     throw new Error(
        //         `No Mapped fields found for the advertiser ${advertiser_id} - ${advertiser?.provider?.name} `
        //     );
        // }
        if (!account) {
            throw new Error(
                `No Publisher Ad Account has been created with  the Advertiser ${advertiser_id} - ${advertiser?.provider?.name} `
            );
        }
        if (!advertiser.provider.api_credentials) {
            throw new Error(
                `Not set any API credentials for Advertiser ${advertiser_id} - ${advertiser.provider.name}`
            );
        } else {
            const api_credentials = advertiser?.provider?.api_credentials;
            for (let api_credential of api_credentials) {
                if (!isValidateCredentials(api_credential)) {
                    throw new Error(
                        `Something Was Missing API Credentials of ${advertiser_id} - ${advertiser?.provider?.name} with token ${api_credential?.api_key} and status ${api_credential?.is_active}`
                    );
                } else {
                    let Credentials = checkAdvertiserParams(advertiser_id);
                    let params = Credentials.params;
                    let api_code = Credentials.api_code;
                    const customeUrl = apiUrlGenarator({
                        params,
                        token: api_credential.api_key
                            ? api_credential.api_key
                            : null,
                        from_date: moment(fromDate).format(
                            Credentials?.params?.data_format
                        ),
                        to_date: moment(toDate).format(
                            Credentials?.params?.data_format
                        ),
                        url: api_credential?.api_url
                            ? api_credential?.api_url
                            : "",
                    });
                    const RequestedAdvertiser = {
                        advertiser_id: advertiser_id,
                        user: user ? user : null,
                        advertiser_code: api_code,
                        url: customeUrl,
                        croneJob: false,
                        mapping_fields: Credentials.mapping_fields,
                    };
                    await getAdvertiserReportApi(RequestedAdvertiser);
                }
            }
        }
    } catch (error) {
        console.log("====" + error + "====");
        const data = {
            message: error.message || error,
            uploaded_status: FAILED,
        };
        updateAdvertiserApiInfo(data, advertiser_id);
        sendEmailService.SendEmail(
            {
                total_rows: 0,
                total_uploaded: 0,
                total_skipped: 0,
                csv_name: "Api call",
                status: FAILED,
                advertiser_id: advertiser_id,
                time_taken: 0,
                check_sum_totalSearches: 0,
                uploaded_sum_totalSearches: 0,
                message: error.message || error,
            },
            "api"
        );
        log.error(error.message || error);
    }
}

//validation purposed to check corect credentials
function isValidateCredentials(credentials) {
    if (
        credentials.api_key &&
        credentials.api_url &&
        credentials.is_active === true
    ) {
        return true;
    }
    return false;
}

//validation purposed to check mapping fields for the advertiser
// async function checkMappedFieldsSet(advertiser_id) {
//     const mappedFields = await reportMappingService.getMapping(advertiser_id);
//     if (mappedFields) {
//         return true;
//     }
//     return false;
// }

//validation purposed to check publisher ad account are created or not
async function checkPublisherAdAccountExist(advertiser_id) {
    const accounts = await publisherAccountService.getPublisherAccount({
        provider_id: advertiser_id,
    });
    if (accounts) {
        return true;
    }
    return false;
}

module.exports = {
    getAdvertiserReportApi,
    apiCallWithCustome,
};
