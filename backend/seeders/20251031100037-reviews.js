'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('Reviews', [{
      content: 'Great experience volunteering here!',
      date: new Date(),
      userId: 1,
      image: '/images/beach-cleanup.png',
      createdAt: new Date(),
      updatedAt: new Date()
    }], {
      ignoreDuplicates: true
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Reviews', null, {});
  }
};
