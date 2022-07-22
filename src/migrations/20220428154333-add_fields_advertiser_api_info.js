// add enum for advertiser_api_info table fields
module.exports = {
    up: function (queryInterface, Sequelize) {
        return Promise.all([
            queryInterface.addColumn(
                "advertiser_api_infos",
                "uploaded_status",
                {
                    type: Sequelize.ENUM,
                    values: [
                        "Failed",
                        "Partially Uploaded",
                        "Zero Records Uploaded",
                        "Processing",
                        "Constant",
                        "Uploaded Successfully",
                    ],
                    defaultValue: "Constant",
                }
            ),
        ]);
    },
    down: function (queryInterface, Sequelize) {
        return Promise.all([
            queryInterface.removeColumn(
                "advertiser_api_infos",
                "uploaded_status"
            ),
        ]);
    },
};
