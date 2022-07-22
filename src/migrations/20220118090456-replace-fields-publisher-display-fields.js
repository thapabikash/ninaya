
  
"use strict";

module.exports = {
    up: async (queryInterface, Sequelize) => {
        return Promise.all([
            queryInterface.removeColumn(
                "Publisher_display_fields",
                "fields"
            ),
            queryInterface.removeColumn(
              "Publisher_display_fields",
              "Publisher_display_fields"
          ),
            queryInterface.addColumn(
                "Publisher_display_fields",
                "fields",
                {
                    type: Sequelize.ARRAY(Sequelize.STRING),
                    defaultValue: [
                        "date",
                        "channel",
                        "geo",
                        "total_searches",
                        "clicks",
                        "ctr",
                        "net_revenue",
                    ],
                    allowNull: true,
                }
            ),
        ]);
    },

    down: async (queryInterface, Sequelize) => {
        return Promise.all([
          queryInterface.removeColumn(
            "Publisher_display_fields",
            "fields"
        ),
          queryInterface.addColumn(
            "Publisher_display_fields",
            "fields",
            {
              type: Sequelize.ARRAY(Sequelize.STRING),
              allowNull: true,
          }
        ),
        queryInterface.addColumn(
          "Publisher_display_fields",
          "Publisher_display_fields",
          {
            type: Sequelize.ARRAY(Sequelize.STRING),
            defaultValue: [
                "date",
                "channel",
                "geo",
                "total_searches",
                "clicks",
                "ctr",
                "net_revenue",
            ],
            allowNull: true,
        }
      ),
        ]);
    },
};