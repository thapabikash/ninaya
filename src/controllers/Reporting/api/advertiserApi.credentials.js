const config = require("../../../../config/advertiserApi.config");
const checkAdvertiserParams = (advertiser_id = null) => {
    if (advertiser_id == config?.TRIS_ID) {
        return {
            params: config?.TRIS_PARAMS,
            api_code: config.TRIS_CODE,
            mapping_fields: config.TRIS_MAPPING_FIELDS,
        };
    }
    if (advertiser_id == config?.D2R_ID) {
        return {
            params: config?.D2R_PARAMS,
            api_code: config.D2R_CODE,
            mapping_fields: config.D2R_MAPPING_FIELDS,
        };
    }
    if (advertiser_id == config?.EVERTRENIX_ID) {
        return {
            params: config?.EVERNETRIX_PARAMS,
            api_code: config.EVERNETRIX_CODE,
            mapping_fields: config.EVERNETRIX_MAPPING_FIELDS,
        };
    }
    if (advertiser_id == config?.GIX_MEDIA_ID) {
        return {
            params: config?.GIX_MEDIA_PARAMS,
            api_code: config.GIX_MEDIA_CODE,
            mapping_fields: config.GIX_MEDIA_MAPPING_FIELDS,
        };
    }
    if (advertiser_id == config?.FUSE_BUTTON_ID) {
        return {
            params: config?.FUSE_BUTTON_PARAMS,
            api_code: config.FUSE_BUTTON_CODE,
            mapping_fields: config.FUSE_BUTTON_MAPPING_FIELDS,
        };
    }
    if (advertiser_id == config?.AKA_ID) {
        return {
            params: config?.AKA_PARAMS,
            api_code: config.AKA_CODE,
            mapping_fields: config.AKA_MAPPING_FIELDS,
        };
    }
    if (advertiser_id == config?.SHOWCASE_ID) {
        return {
            params: config?.SHOWCASE_PARAMS,
            api_code: config.SHOWCASE_CODE,
            mapping_fields: config.SHOWCASE_MAPPING_FIELDS,
        };
    } else {
        return {
            params: config?.DEFAULT_PARAMS,
            api_code: "default",
            mapping_fields: config.DEFAULT_MAPPING_FIELDS,
        };
    }
};

module.exports = {
    checkAdvertiserParams,
};
