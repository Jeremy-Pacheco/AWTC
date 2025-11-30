'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    // Adding the userId column to the Reviews table
    const table = await queryInterface.describeTable('reviews');
    if (!table.userId) {
      await queryInterface.addColumn('reviews', 'userId', {
        type: Sequelize.INTEGER,
        references: {
          model: 'users',  //Name of the users table
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL', //Or 'CASCADE' if you want to delete reviews when the user is deleted
      });
    }
  },

  async down (queryInterface, Sequelize) {
    const table = await queryInterface.describeTable('reviews');
    if (table.userId) {
      await queryInterface.removeColumn('reviews', 'userId');
    }
  }
};