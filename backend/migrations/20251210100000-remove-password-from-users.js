'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    const tableInfo = await queryInterface.describeTable('Users');
    if (tableInfo.password) {
      await queryInterface.removeColumn('Users', 'password');
    }
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.addColumn('Users', 'password', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: 'temp_password' // Temporary default for rollback
    });
  }
};
