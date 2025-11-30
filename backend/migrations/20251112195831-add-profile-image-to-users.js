'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    const table = await queryInterface.describeTable('Users');
    if (!table.profileImage) {
      await queryInterface.addColumn('Users', 'profileImage', {
        type: Sequelize.STRING,
        allowNull: true,
      });
    }
  },

  async down (queryInterface, Sequelize) {
    const table = await queryInterface.describeTable('Users');
    if (table.profileImage) {
      await queryInterface.removeColumn('Users', 'profileImage');
    }
  }
};
