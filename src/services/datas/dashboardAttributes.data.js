const sequelize = require("sequelize");
const superAdminRole = process.env.SUPER_ADMIN_ROLE;

//for table level
async function getDashboardAttributes(
    role = null,
    publisherAttributes = null,
    group_by = null,
    interval = null
) {
    let attributes = [];
    if (
        role === superAdminRole ||
        role === "SuperAdmin" ||
        !publisherAttributes
    ) {
        // for super admin return all attributes
        let superAdminData = [
            [sequelize.literal("SUM(search_counts)"), "server_search_counts"],
            [sequelize.literal("SUM(total_searches)"), "total_searches"],
            [
                sequelize.literal("SUM(monetized_searches)"),
                "monetized_searches",
            ],
            [sequelize.literal("SUM(clicks)"), "clicks"],

            [sequelize.literal("SUM(followon_searches)"), "followon_searches"],
            [sequelize.literal("SUM(initial_searches)"), "initial_searches"],
            [
                sequelize.literal("cast(SUM(gross_revenue) as NUMERIC(10,3))"),
                "gross_revenue",
            ],
            [
                sequelize.literal("cast(SUM(pub_revenue) as NUMERIC(10,3))"),
                "pub_revenue",
            ],
            [
                sequelize.literal(
                    "cast(SUM(gross_revenue)-SUM(pub_revenue) as NUMERIC(10,3))"
                ),
                "net_revenue",
            ],
            [
                sequelize.literal(
                    "(case when SUM(reports.total_searches) = 0 then 0.000 else cast(SUM(cast(reports.monetized_searches as FLOAT))*100/SUM(reports.total_searches) as NUMERIC(10,3)) end)"
                ),
                "ad_coverage",
            ],
            [
                sequelize.literal(
                    "(case when SUM(reports.clicks) = 0 then 0.000 else cast(SUM(reports.gross_revenue)/SUM(cast(reports.clicks as FLOAT)) as NUMERIC(10,3)) end)"
                ),
                "rpc",
            ],
            [
                sequelize.literal(
                    "(case when SUM(reports.total_searches) = 0 then 0.000  else cast(SUM(cast(reports.clicks as FLOAT))*100/SUM(reports.total_searches) as NUMERIC(10,3)) end)"
                ),
                "ctr",
            ],
            [
                sequelize.literal(
                    "(case when SUM(reports.total_searches) = 0 then 0.000  else cast(SUM(reports.gross_revenue * 1000)/SUM(reports.total_searches) as NUMERIC(10,3)) end)"
                ),
                "rpm",
            ],
            [
                sequelize.literal(
                    "(case when SUM(reports.monetized_searches) = 0 then 0.000  else cast(SUM(reports.gross_revenue * 1000)/SUM(reports.monetized_searches) as NUMERIC(10,3)) end)"
                ),
                "rpmm",
            ],
        ];
        attributes.push(...superAdminData);
        return attributes;
    } else {
        //for publisher return only publisher attributes
        let publisherData = [];
        //group by conditions
        if (group_by || interval) {
            let attributesToSend = [
                "net_revenue",
                "search_counts",
                "total_searches",
                "monetized_searches",
                "clicks",
                "ctr",
                "rpm",
                "rpmm",
                "rpc",
                "gross_revenue",
                "ad_coverage",
                "pub_revenue",
                "followon_searches",
                "initial_searches",
            ];
            let calculatedFields = [
                "rpm",
                "rpmm",
                "rpc",
                "ad_coverage",
                "ctr",
                "pub_revenue",
                "net_revenue",
            ];
            if (publisherAttributes) {
                publisherAttributes.forEach(element => {
                    if (attributesToSend.includes(element)) {
                        if (!calculatedFields.includes(element)) {
                            publisherData.push([
                                sequelize.literal(`SUM(${element})`),
                                `${element}`,
                            ]);
                        } else {
                            if (element === "ctr") {
                                publisherData.push([
                                    sequelize.literal(
                                        "(case when SUM(reports.total_searches) = 0 then 0.000  else cast(SUM(cast(reports.clicks as FLOAT))*100/SUM(reports.total_searches) as NUMERIC(10,3)) end)"
                                    ),
                                    "ctr",
                                ]);
                            }
                            if (element === "ad_coverage") {
                                publisherData.push([
                                    sequelize.literal(
                                        "(case when SUM(reports.total_searches) = 0 then 0.000  else cast(SUM(cast(reports.monetized_searches as FLOAT))*100/SUM(reports.total_searches) as NUMERIC(10,3)) end)"
                                    ),
                                    "ad_coverage",
                                ]);
                            }
                            if (element === "rpm") {
                                publisherData.push([
                                    sequelize.literal(
                                        "(case when SUM(reports.total_searches) = 0 then 0.000  else cast(SUM(reports.pub_revenue) * 1000/SUM(reports.total_searches) as NUMERIC(10,3)) end)"
                                    ),
                                    "rpm",
                                ]);
                            }
                            if (element === "rpmm") {
                                publisherData.push([
                                    sequelize.literal(
                                        "(case when SUM(reports.monetized_searches) = 0 then 0.000  else cast(SUM(reports.pub_revenue) * 1000/SUM(reports.monetized_searches) as NUMERIC(10,3)) end)"
                                    ),
                                    "rpmm",
                                ]);
                            }
                            if (element === "rpc") {
                                publisherData.push([
                                    sequelize.literal(
                                        "(case when SUM(reports.clicks) = 0 then 0.000  else cast(SUM(reports.pub_revenue)/cast(SUM(reports.clicks) as FLOAT) as NUMERIC(10,3)) end)"
                                    ),
                                    "rpc",
                                ]);
                            }
                            if (element === "net_revenue") {
                                publisherData.push([
                                    sequelize.literal(
                                        "cast(SUM(pub_revenue) as NUMERIC(10,3))"
                                    ),
                                    "net_revenue",
                                ]);
                            }
                            if (element === "pub_revenue") {
                                publisherData.push([
                                    sequelize.literal(
                                        "cast(SUM(pub_revenue) as NUMERIC(10,3))"
                                    ),
                                    "pub_revenue",
                                ]);
                            }
                        }
                    }
                });
            }
            attributes.push(...publisherData);
        }
        // not group by
        else {
            let attributesToSend = [
                "net_revenue",
                "followon_searches",
                "initial_searches",
                "total_searches",
                "monetized_searches",
                "clicks",
                "ctr",
                "rpm",
                "rpmm",
                "rpc",
                "gross_revenue",
                "ad_coverage",
                "pub_revenue",
            ];
            if (publisherAttributes) {
                publisherAttributes.forEach(element => {
                    if (attributesToSend.includes(element)) {
                        publisherData.push(element);
                    }
                });
            }
            attributes.push(...publisherData);
        }
        return attributes;
    }
}

//for state level
async function getStateAttributes(role = null, publisherAttributes = null) {
    let attributes = [];
    //for super admin return all attributes
    if (
        role === superAdminRole ||
        role === "SuperAdmin" ||
        !publisherAttributes
    ) {
        let adminState = [
            [
                sequelize.literal(
                    "cast(SUM(gross_revenue)-SUM(pub_revenue) as NUMERIC(10,3))"
                ),
                "net_revenue",
            ],
            [sequelize.literal("SUM(total_searches)"), "total_searches"],
            [
                sequelize.literal("SUM(monetized_searches)"),
                "monetized_searches",
            ],
        ];
        attributes.push(...adminState);
    } else {
        let adminState = [
            [
                sequelize.literal("cast(SUM(pub_revenue) as NUMERIC(10,3))"),
                "pub_revenue",
            ],
            [sequelize.literal("SUM(total_searches)"), "total_searches"],
            [
                sequelize.literal("SUM(monetized_searches)"),
                "monetized_searches",
            ],
        ];
        attributes.push(...adminState);
    }
    return attributes;
}

module.exports = {
    getDashboardAttributes,
    getStateAttributes,
};
