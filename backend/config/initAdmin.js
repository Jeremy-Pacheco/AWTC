const bcrypt = require('bcrypt');
const { User } = require('../models');

async function initAdmin() {
  try {
    const existingAdmin = await User.findOne({ where: { role: 'admin' } });
    if (!existingAdmin) {
      await User.create({
          name: 'Admin',
          email: 'admin@awtc.es',
          password: 'adminawtc1234',
          role: 'admin'
      });
      console.log('Admin account created: admin@awtc.es / adminawtc1234');
    } else {
      console.log('Admin already exists');
    }
  } catch (error) {
    console.error('Error creating admin:', error.message);
  }
}

module.exports = initAdmin;
