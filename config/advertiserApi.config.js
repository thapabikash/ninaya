//to add more advertiser api
//* Add advertiser api details here for both crone and manual
//* Also update advertiserApi.credentials.js to identify which advertisers params,and api-code and mapping fields
//data_format=date_format
module.exports = {
    //8am UTC time and then again at 5PM utc time
    jobScheduleTime: process.env.ADVERTISER_CRONE_JOB_TIME || `0 8,17 * * *`,
    //for d2r
    D2R_ID: process.env.D2R_ID || 2,
    D2R_CODE: process.env.D2R_CODE || "d2r",
    D2R_PARAMS: {
        token: "key",
        from_date: "from_date",
        to_date: "to_date",
        format: "format",
        data_format: "YYYY-MM-DD",
    },
    D2R_MAPPING_FIELDS: {
        GEO: "geo",
        Date: "date",
        Amount: "gross_revenue",
        Clicks: "clicks",
        Channel: "subId",
        TotalSearches: "total_searches",
        MonetizedSearches: "monetized_searches",
    },

    //for Gix Media
    GIX_MEDIA_ID: process.env.GIX_MEDIA_ID || 3,
    GIX_MEDIA_CODE: process.env.GIX_MEDIA_CODE || "gixmedia",
    GIX_MEDIA_PARAMS: {
        token: "token",
        from_date: "FromDate",
        to_date: "ToDate",
        format: "Format",
        data_format: "YYYY-MM-DD",
    },
    GIX_MEDIA_MAPPING_FIELDS: {
        Tag: "tag_number",
        Date: "date",
        Clicks: "clicks",
        DistributerId: "subId",
        Country: "geo",
        Net_Rev: "gross_revenue",
        Searches: "total_searches",
        Monetized_Searches: "monetized_searches",
    },

    //for evertrenix
    EVERTRENIX_ID: process.env.EVERNETRIX_ID || 400,
    EVERNETRIX_CODE: process.env.EVERNETRIX_CODE || "evernetrix",
    EVERNETRIX_PARAMS: {
        token: "token",
        from_date: "from",
        to_date: "to",
        format: "format",
        data_format: "YYYY-MM-DD",
    },
    EVERNETRIX_MAPPING_FIELDS: {
        Date: "date",
        Amount: "gross_revenue",
        Clicks: "clicks",
        Country: "geo",
        "Search Channel": "subId",
        "Total Searches": "total_searches",
        "Monetized Searches": "monetized_searches",
    },

    //for Tris
    TRIS_ID: process.env.TRIS_ID || 500,
    TRIS_CODE: process.env.TRIS_CODE || "tris",
    TRIS_PARAMS: {
        token: "token",
        from_date: "date_from",
        to_date: "date_to",
        format: "format",
        data_format: "YYYY-MM-DD",
    },
    TRIS_MAPPING_FIELDS: {
        date: "date",
        zone: "subId",
        label: "geo",
        clicks: "clicks",
        revenue: "gross_revenue",
        searches: "total_searches",
        Searches: "monetized_searches",
    },

    //for aka
    AKA_ID: process.env.AKA_ID || 600,
    AKA_CODE: process.env.AKA_CODE || "aka",
    AKA_PARAMS: {
        token: "key",
        from_date: "date_from",
        to_date: "date_to",
        format: "format",
        data_format: "MM-DD-YYYY",
    },
    AKA_MAPPING_FIELDS: {
        GEO: "geo",
        Tag: "tag_number",
        Date: "date",
        SubID: "subId",
        Clicks: "clicks",
        "Net Revenue": "gross_revenue",
        "Total Searches": "total_searches",
        "Monetized Searches": "monetized_searches",
    },

    //for fuseButton
    FUSE_BUTTON_ID: process.env.FUSE_BUTTON_ID || 700,
    FUSE_BUTTON_CODE: process.env.FUSE_BUTTON_CODE || "fusebutton",
    FUSE_BUTTON_PARAMS: {
        token: "hash",
        from_date: "from",
        to_date: "to",
        format: "format",
        data_format: "YYYY-MM-DD",
    },
    FUSE_BUTTON_MAPPING_FIELDS: {
        date: "date",
        geo: "geo",
        subiD: "subId",
        clicks: "clicks",
        "net revenue": "gross_revenue",
        searches: "total_searches",
        "monetized searches": "monetized_searches",
    },
    //for showcase
    SHOWCASE_ID: process.env.SHOWCASE_ID || 800,
    SHOWCASE_CODE: process.env.SHOWCASE_CODE || "showcase",
    SHOWCASE_PARAMS: {
        token: "key",
        from_date: "date_from",
        to_date: "date_to",
        format: "format",
        data_format: "YYYY-MM-DD",
    },
    SHOWCASE_MAPPING_FIELDS: {
        date: "date",
        country: "geo",
        channel: "subId",
        clicks: "clicks",
        revenue: "gross_revenue",
        searches: "total_searches",
        "monetized searches": "monetized_searches",
    },

    //for default
    DEFAULT_PARAMS: {
        token: "key",
        from_date: "from_date",
        to_date: "to_date",
        format: "format",
        data_format: "YYYY-MM-DD",
    },
    DEFAULT_MAPPING_FIELDS: {
        GEO: "geo",
        Tag: "tag_number",
        Date: "date",
        SubID: "subId",
        Clicks: "clicks",
        "Net Revenue": "gross_revenue",
        "Total Searches": "total_searches",
        "Monetized Searches": "monetized_searches",
    },

    //for crone job
    cron: [
        {
            advertiser_id: process.env.TRIS_ID || 500,
            api_code: process.env.TRIS_CODE || "tris",
            format: "json",
            url:
                process.env.TRIS_URL ||
                "https://partners.tris.com/dashboard/data",
            token: process.env.TRIS_TOKEN || "g1e0dePtCid65JX9MGaU",
            params: {
                token: "token",
                from_date: "date_from",
                to_date: "date_to",
                format: "format",
                data_format: "YYYY-MM-DD",
            },
            mapping_fields: {
                date: "date",
                zone: "subId",
                label: "geo",
                clicks: "clicks",
                revenue: "gross_revenue",
                searches: "total_searches",
                Searches: "monetized_searches",
            },
        },
        {
            advertiser_id: process.env.D2R_ID || 2,
            api_code: process.env.D2R_CODE || "d2r",
            format: "json",
            url:
                process.env.D2R_URL ||
                "https://partners.d2rinternetholdings.com/services/apexrest/api/stats",
            token: process.env.D2R_API_KEY || "Ni7eG-Ku7bs-c6hLK-qpvFd",
            params: {
                token: "key",
                from_date: "from_date",
                to_date: "to_date",
                format: "format",
                data_format: "YYYY-MM-DD",
            },
            mapping_fields: {
                GEO: "geo",
                Date: "date",
                Amount: "gross_revenue",
                Clicks: "clicks",
                Channel: "subId",
                TotalSearches: "total_searches",
                MonetizedSearches: "monetized_searches",
            },
        },
        {
            advertiser_id: process.env.EVERNETRIX_ID || 400,
            api_code: process.env.EVERNETRIX_CODE || "evernetrix",
            format: "json",
            params: {
                token: "token",
                from_date: "from",
                to_date: "to",
                format: "format",
                data_format: "YYYY-MM-DD",
            },
            mapping_fields: {
                Date: "date",
                Amount: "gross_revenue",
                Clicks: "clicks",
                Country: "geo",
                "Search Channel": "subId",
                "Total Searches": "total_searches",
                "Monetized Searches": "monetized_searches",
            },
            url:
                process.env.EVERNETRIX_URL ||
                "https://api.search-checker.com/reports/",
            token:
                process.env.EVERNETRIX_TOKEN ||
                "ZvpYrqerDCrUGTWoSheF1Oulzy1OtRxe",
        },
        {
            advertiser_id: process.env.AKA_ID || 600,
            api_code: process.env.AKA_CODE || "aka",
            format: "json",
            url:
                process.env.AKA_URL ||
                "https://admin.mycoolnewtab.com/api/v2/report",
            token:
                process.env.AKA_TOKEN || "40bc4ee9-c012-4d52-bc75-308d5c137352",
            params: {
                token: "key",
                from_date: "date_from",
                to_date: "date_to",
                format: "format",
                data_format: "MM-DD-YYYY",
            },
            mapping_fields: {
                GEO: "geo",
                Tag: "tag_number",
                Date: "date",
                SubID: "subId",
                Clicks: "clicks",
                "Net Revenue": "gross_revenue",
                "Total Searches": "total_searches",
                "Monetized Searches": "monetized_searches",
            },
        },
        {
            advertiser_id: process.env.GIX_MEDIA_ID || 3,
            api_code: process.env.GIX_MEDIA_CODE || "gixmedia",
            format: "json",
            url:
                process.env.GIX_MEDIA_URL ||
                "https://reporting.gixmedia.com/api/base",
            token:
                process.env.GIX_MEDIA_TOKEN ||
                "41CEo4qzRmpj27k9CdFqJ@mdc8cfRqnrn5WE8qcX!fXoT9uYlp",
            params: {
                token: "token",
                from_date: "FromDate",
                to_date: "ToDate",
                format: "Format",
                data_format: "YYYY-MM-DD",
            },
            mapping_fields: {
                Date: "date",
                Clicks: "clicks",
                DistributerId: "subId",
                Country: "geo",
                Net_Rev: "gross_revenue",
                Searches: "total_searches",
                Monetized_Searches: "monetized_searches",
            },
        },
        //for fuseButton
        {
            advertiser_id: process.env.FUSE_BUTTON_ID || 700,
            api_code: process.env.FUSE_BUTTON_CODE || "fusebutton",
            format: "json",
            url: process.env.FUSE_BUTTON_URL || "https://api.fusionbutton.com/",
            token: process.env.FUSE_BUTTON_TOKEN || "vHGPvMIvTB",
            params: {
                token: "hash",
                from_date: "from",
                to_date: "to",
                format: "format",
                data_format: "YYYY-MM-DD",
            },
            mapping_fields: {
                date: "date",
                geo: "geo",
                subiD: "subId",
                clicks: "clicks",
                "net revenue": "gross_revenue",
                searches: "total_searches",
                "monetized searches": "monetized_searches",
            },
        },
        //for showcase
        {
            advertiser_id: process.env.SHOWCASE_ID || 800,
            api_code: process.env.SHOWCASE_CODE || "showcase",
            format: "json",
            url:
                process.env.SHOWCASE_URL || "https://search-house.com/getstats",
            token:
                process.env.SHOWCASE_TOKEN || "1NNG2Nr8FFk1BWliVKOsUBN7zu3SmW",
            params: {
                token: "key",
                from_date: "date_from",
                to_date: "date_to",
                format: "format",
                data_format: "YYYY-MM-DD",
            },
            mapping_fields: {
                date: "date",
                country: "geo",
                channel: "subId",
                clicks: "clicks",
                revenue: "gross_revenue",
                searches: "total_searches",
                "Monetized Searches": "monetized_searches",
            },
        },
    ],
};
