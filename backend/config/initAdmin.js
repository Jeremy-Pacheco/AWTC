const bcrypt = require('bcrypt');
const { User } = require('../models');

async function initAdmin() {
  try {
    const adminEmail = 'admin@awtc.es';
    const adminPass = 'adminawtc1234';

    const existingAdmin = await User.findOne({ where: { email: adminEmail } });
    
    if (!existingAdmin) {
      await User.create({
          name: 'Admin',
          email: adminEmail,
          password: adminPass,
          role: 'admin'
      });
      console.log(`Admin account created: ${adminEmail}`);
    } else {
      // Update password to ensure it is correct (hooks will hash it)
      existingAdmin.password = adminPass;
      existingAdmin.role = 'admin';
      await existingAdmin.save();
      console.log(`Admin account updated: ${adminEmail}`);
    }
  } catch (error) {
    console.error('Error creating admin:', error.message);
  }
}

module.exports = initAdmin;
