// add enum for advertiser_api_info table fields
module.exports = {
    up: function (queryInterface, Sequelize) {
        return Promise.all([
            queryInterface.addColumn("csv_upload_statuses", "uploaded_status", {
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
            }),
        ]);
    },
    down: function (queryInterface, Sequelize) {
        return Promise.all([
            queryInterface.removeColumn(
                "csv_upload_statuses",
                "uploaded_status"
            ),
        ]);
    },
};
