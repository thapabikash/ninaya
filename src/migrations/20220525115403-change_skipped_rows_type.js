module.exports = {
    up: (queryInterface, Sequelize) => {
        return Promise.all([
            //for csv skipping rows change column type to string
            queryInterface.changeColumn("skipped_row_csvs", "total_searches", {
                type: Sequelize.STRING,
                allowNull: true,
            }),
            queryInterface.changeColumn("skipped_row_csvs", "clicks", {
                type: Sequelize.STRING,
                allowNull: true,
            }),
            queryInterface.changeColumn("skipped_row_csvs", "gross_revenue", {
                type: Sequelize.STRING,
                allowNull: true,
            }),
            queryInterface.changeColumn(
                "skipped_row_csvs",
                "monetized_searches",
                {
                    type: Sequelize.STRING,
                    allowNull: true,
                }
            ),

            //for api skipping
            queryInterface.changeColumn("skipped_row_advertiser_apis", "date", {
                type: Sequelize.STRING,
                allowNull: true,
            }),
            queryInterface.changeColumn(
                "skipped_row_advertiser_apis",
                "total_searches",
                {
                    type: Sequelize.STRING,
                    allowNull: true,
                }
            ),
            queryInterface.changeColumn(
                "skipped_row_advertiser_apis",
                "clicks",
                {
                    type: Sequelize.STRING,
                    allowNull: true,
                }
            ),
            queryInterface.changeColumn(
                "skipped_row_advertiser_apis",
                "gross_revenue",
                {
                    type: Sequelize.STRING,
                    allowNull: true,
                }
            ),
            queryInterface.changeColumn(
                "skipped_row_advertiser_apis",
                "monetized_searches",
                {
                    type: Sequelize.STRING,
                    allowNull: true,
                }
            ),
        ]);
    },

    down: (queryInterface, Sequelize) => {
        return Promise.all([
            queryInterface.changeColumn("skipped_row_csvs", "total_searches", {
                type: Sequelize.INTEGER,
                allowNull: true,
            }),
            queryInterface.changeColumn("skipped_row_csvs", "clicks", {
                type: Sequelize.INTEGER,
                allowNull: true,
            }),
            queryInterface.changeColumn("skipped_row_csvs", "gross_revenue", {
                type: Sequelize.FLOAT,
                allowNull: true,
            }),
            queryInterface.changeColumn(
                "skipped_row_csvs",
                "monetized_searches",
                {
                    type: Sequelize.INTEGER,
                    allowNull: true,
                }
            ),
            //for api
            queryInterface.changeColumn("skipped_row_advertiser_apis", "date", {
                type: Sequelize.DATE,
                allowNull: true,
            }),
            queryInterface.changeColumn(
                "skipped_row_advertiser_apis",
                "total_searches",
                {
                    type: Sequelize.INTEGER,
                    allowNull: true,
                }
            ),
            queryInterface.changeColumn(
                "skipped_row_advertiser_apis",
                "clicks",
                {
                    type: Sequelize.INTEGER,
                    allowNull: true,
                }
            ),
            queryInterface.changeColumn(
                "skipped_row_advertiser_apis",
                "gross_revenue",
                {
                    type: Sequelize.FLOAT,
                    allowNull: true,
                }
            ),
            queryInterface.changeColumn(
                "skipped_row_advertiser_apis",
                "monetized_searches",
                {
                    type: Sequelize.INTEGER,
                    allowNull: true,
                }
            ),
        ]);
    },
};
