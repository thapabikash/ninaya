'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn(
        'users',
        'account_id',
        {
          allowNull:true,
          type: Sequelize.INTEGER,
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE',
          references: {
            model: 'accounts',
            key: 'id',
          },
        }
      ),
      queryInterface.addColumn(
        'users',
        'publisher_id',
        {
          allowNull:true,
          type: Sequelize.INTEGER,
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE',
          references: {
            model: 'publishers',
            key: 'id',
          },
        }
      ),
      queryInterface.addColumn(
        'users',
        'role_id',
        {
          allowNull: true,
          type: Sequelize.INTEGER,
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE',
          references: {
            model: 'roles',
            key: 'id',
          },
        }
      ),
      queryInterface.removeColumn('users', 'role')
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.removeColumn('users', 'account_id'),
      queryInterface.removeColumn('users', 'publisher_id'),
      queryInterface.removeColumn('users', 'role_id'),
      queryInterface.addColumn(
        'users',
        'role',
        {
          type: Sequelize.STRING
        }
      ),
    ])
  }
};
