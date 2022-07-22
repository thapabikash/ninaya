const models = require("../../src/models/index");
const {log} = require("../logger");
const title = "Create Materialized view table";

(async function createMaterialView() {
    try {
        const created = await models.sequelize.query(
            `CREATE MATERIALIZED VIEW optimized_logs AS
            select
              aid, total, concatenated_text :: numeric
            from
            (
                    select
                        aid,
                        total,
                        concat_ws(
                            '',
                            REPLACE(request_at :: text, '-', ''),
                            ascii(country),
                            "cid",
                            "pid",
                            "provider_id",
                            "rule_id",
                            "link_id"
                        ) as concatenated_text
                    from
                        (
                            select
                                row_number() OVER () AS aid,
                                date(request_at) as request_at,
                                geo ->> 'country' as country,
                                count(id) as total,
                                "cid",
                                "pid",
                                "provider_id",
                                "rule_id",
                                "link_id"
                            from
                                log_infos -- where request_at >= '2022-02-06' AND request_at < '2022-02-07'
                            group by
                                date(request_at),
                                "cid",
                                "pid",
                                "provider_id",
                                "rule_id",
                                "link_id",
                                geo ->> 'country'
                        ) as sub
                ) as subsub`
        );
        if (created) {
            log.info({title}, "created material views");
            console.log("===Created===");
        } else {
            log.error("Failed to create material view");
            console.log("===Failed===");
        }
    } catch (error) {
        log.error(error.message || error);
    }
})();
