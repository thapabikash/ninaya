module.exports = {
    up: (queryInterface, Sequelize) => {
        return Promise.all([
            queryInterface.changeColumn("skipped_row_csvs", "date", {
                type: Sequelize.STRING,
                allowNull: true,
            }),
        ]);
    },

    down: (queryInterface, Sequelize) => {
        return Promise.all([
            queryInterface.changeColumn("skipped_row_csvs", "date", {
                type: Sequelize.DATEONLY,
                allowNull: true,
            }),
        ]);
    },
};
