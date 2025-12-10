'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Fetch a valid user ID
    const [users] = await queryInterface.sequelize.query(
      `SELECT id FROM Users LIMIT 1`
    );
    const userId = users && users.length > 0 ? users[0].id : null;

    if (userId) {
      await queryInterface.bulkInsert('Reviews', [{
        content: 'Volunteering at the El Puertillo beach clean-up was an amazing experience. The team was friendly, the atmosphere was positive, and it felt great to see how much cleaner the beach looked after just a few hours of work. I left feeling proud and inspired to keep helping the environment. Highly recommended!',
        date: new Date(),
        userId: userId,
        image: '/images/beach-cleanup.png',
        createdAt: new Date(),
        updatedAt: new Date()
      }], {
        ignoreDuplicates: true
      });
    }
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Reviews', null, {});
  }
};
