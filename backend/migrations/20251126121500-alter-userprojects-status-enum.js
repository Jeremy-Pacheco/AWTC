'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Change status enum to only 'accepted'
    await queryInterface.sequelize.query("ALTER TABLE `UserProjects` MODIFY COLUMN `status` ENUM('accepted') NOT NULL DEFAULT 'accepted';");
  },
  async down(queryInterface, Sequelize) {
    // rollback to original enum with applied/accepted/rejected if needed
    await queryInterface.sequelize.query("ALTER TABLE `UserProjects` MODIFY COLUMN `status` ENUM('applied','accepted','rejected') NOT NULL DEFAULT 'applied';");
  }
};
