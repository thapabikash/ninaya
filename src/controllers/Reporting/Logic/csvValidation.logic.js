const moment = require("moment");
const {
    UNMATCHED_DATATYPE,
    INVALID_DATE_FORMAT,
    MISSING_DATE,
    FUTURE_DATE,
    EMPTY_SUBIDS,
    TOTAL_SEARCHES_OR_CLICKS_OR_GROSS_REVENUE_NOTEXIST,
    TOTAL_SEARCHES_AND_GROSS_REVENUE_ZERO,
    MISSING_MAPPING_FIELDS_TOTAL_SEARCHES_OR_CLICKS_OR_GROSS_REVENUE,
} = require("./invalidMessage");

// check the numeric field contain valid number
/**
 * @param {*} mapping - csv mapped data
 * @param {*} excludedData  - array of invalid data
 * @returns
 */
function isFieldWithNumValue(mapping, excludedData) {
    const isNumeric = value => !isNaN(parseFloat(value)) && isFinite(value);
    if (
        isNumeric(mapping["monetized_searches"]) &&
        isNumeric(mapping["clicks"]) &&
        isNumeric(mapping["total_searches"]) &&
        isNumeric(mapping["gross_revenue"])
    ) {
        return true;
    } else {
        excludedData.push({
            ...mapping,
            Invalid_Message: UNMATCHED_DATATYPE,
        });
        return false;
    }
}

//date validation logic
/**
 * @param {*} mapping - csv mapped data
 * @param {*} excludedData - array of invalid data
 * @returns
 */
function isValidDateFormat(mapping, excludedData) {
    if (!mapping["date"] || mapping["date"] === "") {
        excludedData.push({
            ...mapping,
            Invalid_Message: MISSING_DATE,
        });
        return true;
    }
    let isValidDate = moment(mapping["date"]);
    let dateValidate =
        moment(mapping["date"], "MM-DD-YYYY").isValid() ||
        moment(mapping["date"], "DD-MM-YYYY").isValid()
            ? true
            : false;
    if (!dateValidate) {
        if (!isValidDate.isValid()) {
            excludedData.push({
                ...mapping,
                Invalid_Message: INVALID_DATE_FORMAT,
            });
            return true;
        } else {
            mapping["date"] = moment(isValidDate).format("MM-DD-YYYY");
        }
    }
    if (dateValidate && !isValidDate.isValid()) {
        excludedData.push({
            ...mapping,
            Invalid_Message: INVALID_DATE_FORMAT,
        });
        return true;
    }
    if (dateValidate) {
        if (
            !isValidDate.isValid() &&
            moment(mapping["date"], "DD-MM-YYYY").isValid()
        ) {
            mapping["date"] = moment(mapping["date"], "DD-MM-YYYY").format(
                "MM-DD-YYYY"
            );
        }

        if (moment(mapping["date"], "MM-DD-YYYY").isValid()) {
            mapping["date"] = moment(mapping["date"]).format("MM-DD-YYYY");
        } else {
            mapping["date"] = moment(mapping["date"]).format("MM-DD-YYYY");
        }
    }

    if (new Date() < new Date(moment(mapping["date"]))) {
        excludedData.push({
            ...mapping,
            Invalid_Message: FUTURE_DATE,
        });
        return true;
    }

    return false;
}

//for check csv mapped data is 0 or not and exist sourceIdentifier or not
/**
 *
 * @param {*} mapping - csv mapped data
 * @param {*} excludedData - array of invalid data
 * @param {*} sourceIdentifier - link sourceIdentifier
 * @param {*} allDates - array of all dates
 * @returns
 */
function isMapFieldsZero(mapping, excludedData, sourceIdentifier, allDates) {
    allDates.push(new Date(mapping["date"]));
    if (!sourceIdentifier) {
        excludedData.push({
            ...mapping,
            Invalid_Message: EMPTY_SUBIDS,
        });
        return true;
    }
    const mappingKeys = Object.keys(mapping);
    if (!mappingKeys.includes("geo") || mapping["geo"]?.length <= 0) {
        excludedData.push({
            ...mapping,
            Invalid_Message: "Required GEO",
        });
        return true;
    }

    if (
        !mappingKeys.includes("total_searches") ||
        !mappingKeys.includes("gross_revenue")
    ) {
        let error_message = !mappingKeys.includes("total_searches")
            ? "Missing total_searches"
            : !mappingKeys.includes("gross_revenue")
            ? " Missing gross_revenue "
            : MISSING_MAPPING_FIELDS_TOTAL_SEARCHES_OR_CLICKS_OR_GROSS_REVENUE;
        excludedData.push({
            ...mapping,
            Invalid_Message: error_message,
        });
        return true;
    }
    if (
        "" + mapping["total_searches"]?.length <= 0 ||
        "" + mapping["clicks"]?.length <= 0 ||
        "" + mapping["gross_revenue"]?.length <= 0
    ) {
        excludedData.push({
            ...mapping,
            Invalid_Message: TOTAL_SEARCHES_OR_CLICKS_OR_GROSS_REVENUE_NOTEXIST,
        });
        return true;
    }
    if (+mapping["total_searches"] === 0 && +mapping["gross_revenue"] === 0) {
        excludedData.push({
            ...mapping,
            Invalid_Message: TOTAL_SEARCHES_AND_GROSS_REVENUE_ZERO,
        });
        return true;
    }
    return false;
}

module.exports = {isMapFieldsZero, isValidDateFormat, isFieldWithNumValue};
