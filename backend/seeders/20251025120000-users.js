'use strict';

/** @type {import('sequelize-cli').Seeder} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('Users', [
      {
        email: 'admin@awtc.es',
        name: 'Admin',
        password: '$2b$10$8z/5uy8./ob9o8Rq9upPPu2VKdEpRuy7SJqX6J75E7KlYjKG7R1Vq', // bcrypt hash of "adminawtc1234"
        role: 'admin',
        profileImage: 'admin-profile.png',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        email: 'juan@gmail.com',
        name: 'Juan',
        password: '$2b$10$CNbVDQjUyx5C80R0iuqeWOq8AarBZ9cIpwxZaC1.PEjDVgtVlkZOS', // bcrypt hash of "juan"
        role: 'coordinator',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        email: 'paco@gmail.com',
        name: 'Paco',
        password: '$2b$10$gXiJmBCLeAHaEgDETlM9POpin49rnXfrsBoefSn4esoB4ifliiesy', // bcrypt hash of "paco"
        role: 'volunteer',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        email: 'maria@gmail.com',
        name: 'Maria',
        password: '$2b$10$lBWs49C6lUhHkGcP1960we7BchbH5XqwOR0xlLaM698thHMPuY9QC', // bcrypt hash of "maria"
        role: 'volunteer',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Users', null, {});
  }
};
