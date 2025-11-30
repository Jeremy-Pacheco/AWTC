'use strict';

/** @type {import('sequelize-cli').Seeder} */
module.exports = {
  async up (queryInterface, Sequelize) {
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
    */
    await queryInterface.bulkInsert('categories', [
      {
        name: 'Education',
        description: 'Projects related to education and training',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Environment',
        description: 'Environmental conservation and protection projects',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Health',
        description: 'Projects related to health and wellness',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Community',
        description: 'Community support and development projects',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Technology',
        description: 'Technology innovation and development projects',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Human Rights',
        description: 'Human rights defense and promotion projects',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
    await queryInterface.bulkDelete('categories', null, {});
  }
};
