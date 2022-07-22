const models = require("../../models/index");
const Reports = models.reports;
const Providers = models.providers;
const Csv_upload_statuse = models.csv_upload_status; //get all uploaded csv files name
const {Op} = require("sequelize");
const SkippedRows = models.skipped_row_csv;
const SkippedApiRows = models.skipped_row_advertiser_api;

async function storeCSVData(data) {
    //impliment validation here
    try {
        return await Reports.bulkCreate(data);
    } catch (error) {
        return error.message;
    }
}

async function storeSkippedRows(data, source = null, advertiser_id = null) {
    try {
        if (source === "API") {
            await SkippedApiRows.destroy({
                where: {
                    advertiser_id: advertiser_id,
                },
            });
            return await SkippedApiRows.bulkCreate(data);
        } else {
            return await SkippedRows.bulkCreate(data);
        }
    } catch (error) {
        return error.message;
    }
}

async function fetchAllSkippedRows(options = {}) {
    const {count, rows} = await SkippedRows.findAndCountAll({
        ...options,
    });
    const total = count.length || count;
    return {
        total,
        data: rows,
        limit: options.limit,
        pageCount: Math.ceil(total / options.limit),
    };
}

async function fetchCSVfiles(options = {}) {
    return await Csv_upload_statuse.findAll({
        ...options,
    });
}

//for get all list of upload csv status with filter
async function fetchAllUploadCsvStatus(options = {}) {
    const {count, rows} = await Csv_upload_statuse.findAndCountAll({
        ...options,
    });
    const total = count.length || count;
    return {
        total,
        data: rows,
        limit: options.limit,
        pageCount: Math.ceil(total / options.limit),
    };
}

async function fetchSkippedReportsById(params) {
    return await SkippedRows.findByPk(params.id);
}

async function deleteData(today = null, advertiser_id, reports = []) {
    let deleted = [];
    let dates = reports.map(data => data?.date);
    let channel = reports.map(date => date?.channel);
    const del = await Reports.destroy({
        where: {
            // uploaded_date: today,
            advertiser_id,
            date: {
                [Op.in]: dates,
            },
            deleted: false,
            channel: {
                [Op.in]: channel,
            },
        },
    });
    if (del) {
        deleted.push(del);
    }
    // for (let report of reports) {
    // const del=  await Reports.destroy({
    //     where: {
    //     uploaded_date: today,
    //     advertiser_id,
    //     date:report?.date,
    //     channel:report?.channel
    //   }
    //  });
    //  if (del){
    //    deleted.push(del)
    //  }
    // }
    return deleted;
}

async function deleteReportsByPublisherAccounts(options = {}) {
    return await Reports.destroy(
        // {deleted: true},
        {
            where: options,
        }
    );
}

async function deleterevenuereportsByPubAdv(options = {}) {
    return await Reports.destroy({
        where: options,
    });
}
async function fetchAdvertiserWithMapping(order) {
    return await Providers.findAll({
        order,
        attributes: ["id", "name", "status", "deleted"],
        where: {deleted: false, display_in_upload_screen: true},
        include: [
            {
                model: models.mapping,
                attributes: ["id"],
            },
        ],
    });
}

async function csvUploadStatusCreate(reports) {
    return await Csv_upload_statuse.create(reports);
}

async function csvUploadStatusUpdate(id, reports) {
    return await Csv_upload_statuse.update(reports, {
        where: {
            id: id,
        },
    });
}

async function checkCSVuploadStatus(options = {}) {
    return await Csv_upload_statuse.findOne({
        where: {
            ...options,
        },
        attributes: {
            exclude: ["createdAt", "updatedAt", "id"],
            include: [
                "advertiser_id",
                "check_sum_totalSearches",
                "csv_name",
                "endDate",
                "message",
                "notiFy",
                "startDate",
                "time_taken",
                "total_rows",
                "total_skipped",
                "total_uploaded",
                ["uploaded_status", "status"],
                "uploaded_sum_totalSearches",
            ],
        },
        include: [
            {
                model: models.providers,
                attributes: ["name", "id"],
            },
        ],
    });
}

module.exports = {
    storeCSVData,
    deleteData,
    fetchAdvertiserWithMapping,
    storeSkippedRows,
    fetchAllSkippedRows,
    fetchSkippedReportsById,
    deleteReportsByPublisherAccounts,
    csvUploadStatusCreate,
    csvUploadStatusUpdate,
    checkCSVuploadStatus,
    fetchCSVfiles,
    fetchAllUploadCsvStatus,
    deleterevenuereportsByPubAdv,
};
