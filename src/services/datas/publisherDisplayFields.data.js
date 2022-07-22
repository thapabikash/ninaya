const models = require("../../models/index");
const PublisherDisplayFields = models.Publisher_display_fields;
const User = models.users;

async function index(id) {
    const isUSerExist = await User.findByPk(id);
    if (isUSerExist) {
        const user = await PublisherDisplayFields.findOne({
            where: {user_id: id},
            include: [
                {
                    model: User,
                    attributes: [
                        "id",
                        "first_name",
                        "last_name",
                        "email",
                        "role_id",
                    ],
                    required: false,
                    include: [
                        {
                            model: models.roles,
                            attributes: ["role"],
                        },
                    ],
                },
            ],
        });
        if (user) {
            return user;
        } else {
            throw new Error(
                "You have not set publisher display fields for that user"
            );
        }
    } else {
        throw new Error("Sorry, user not exist");
    }
}

async function create(id, data) {
    const isUSerExist = await User.findByPk(id);
    if (isUSerExist) {
        const fields = {};
        fields.user_id = id;
        fields.fields = data;
        const isExistFields = await PublisherDisplayFields.findOne({
            where: {
                user_id: id,
            },
        });
        if (!isExistFields) {
            return await PublisherDisplayFields.create(fields);
        } else {
            throw new Error(
                "You already set publisher display fields for the user"
            );
        }
    } else {
        throw new Error("Sorry, user not exist");
    }
}

async function createDefaultDisplayFields(id) {
    return await PublisherDisplayFields.create({
        user_id: id,
    });
}

async function update(id, data) {
    //update
    const fields = {};
    fields.user_id = id;
    fields.fields = data;

    return await PublisherDisplayFields.update(fields, {
        where: {
            user_id: id,
        },
    });
}
module.exports = {
    index,
    create,
    update,
    createDefaultDisplayFields,
};
