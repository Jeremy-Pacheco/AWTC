'use strict';
const bcrypt = require('bcrypt');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    const [users] = await queryInterface.sequelize.query(
      `SELECT id FROM Users WHERE email = 'admin@awtc.es' LIMIT 1;`
    );

    if (!users || users.length === 0) {
      const hashedPassword = await bcrypt.hash('adminawtc1234', 10);
      
      await queryInterface.bulkInsert('Users', [{
        name: 'Admin',
        email: 'admin@awtc.es',
        password: hashedPassword,
        role: 'admin',
        profileImage: null,
        createdAt: new Date(),
        updatedAt: new Date()
      }], {});

      console.log('✓ Admin user created successfully');
    }
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Users', { email: 'admin@awtc.es' }, {});
  }
};
