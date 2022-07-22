const models = require("../../src/models/index");
const {log} = require("../logger");
const title = "Create Index";

async function createIndexLog_infosTable() {
    try {
        const created = await models.sequelize.query(`CREATE INDEX target_idx
        ON log_infos (request_at, ip_address,link_id,provider_id,pid,cid,rule_id,device_info,os_info,q,browser_info);`);
        if (created) {
            log.info({title}, "created index in log_infos table");
            console.log("===Created===");
        } else {
            log.error("Failed to create index in log_infos table");
            console.log("===Failed===");
        }
    } catch (error) {
        log.error(error.message || error);
    }
}

async function createIndexMaterialViewTable() {
    try {
        const created = await models.sequelize
            .query(`CREATE INDEX target_material_idx
        ON optimized_logs (aid,concatenated_text);`);
        if (created) {
            log.info({title}, "created index in log_infos table");
            console.log("===Created===");
        } else {
            log.error("Failed to create index in log_infos table");
            console.log("===Failed===");
        }
    } catch (error) {
        log.error(error.message || error);
    }
}

(async function createIndex() {
    await createIndexLog_infosTable();
    await createIndexMaterialViewTable();
})();
