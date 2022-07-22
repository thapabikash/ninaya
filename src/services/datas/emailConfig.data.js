const models = require("../../models/index");
const EmailConfig = models.EmailConfig;

async function findEmailConfigs() {
    return await EmailConfig.findAll();
}

async function createEmailConfig(data) {
    const existing = await EmailConfig.findOne();
    if (existing) {
        return await EmailConfig.update(data, {
            where: {
                id: existing.id,
            },
        });
    } else {
        return await EmailConfig.create(data);
    }
}

//this function is used to find emails by type
async function getEmailByType(type = null) {
    return await EmailConfig.findOne({
        where: {
            type: type,
            isDeleted: false,
        },
    });
}

module.exports = {
    findEmailConfigs,
    createEmailConfig,
    getEmailByType
};
