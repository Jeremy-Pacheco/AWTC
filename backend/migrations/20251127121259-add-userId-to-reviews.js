'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    // Adding the userId column to the Reviews table
    await queryInterface.addColumn('reviews', 'userId', {
      type: Sequelize.INTEGER,
      references: {
        model: 'users',  //Name of the users table
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL', //Or 'CASCADE' if you want to delete reviews when the user is deleted
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('reviews', 'userId');
  }
};