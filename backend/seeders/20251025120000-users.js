'use strict';

/** @type {import('sequelize-cli').Seeder} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('Users', [
      {
        email: 'admin@awtc.es',
        name: 'Admin',
        role: 'admin',
        profileImage: 'admin-profile.png',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        email: 'juan@gmail.com',
        name: 'Juan',
        role: 'coordinator',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        email: 'paco@gmail.com',
        name: 'Paco',
        role: 'volunteer',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        email: 'maria@gmail.com',
        name: 'Maria',
        role: 'volunteer',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {
      ignoreDuplicates: true
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Users', null, {});
  }
};
