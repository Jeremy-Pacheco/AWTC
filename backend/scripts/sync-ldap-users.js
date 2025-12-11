const ldap = require('ldapjs');
const path = require('path');

// Try to load .env (production) or .env.development (local)
require('dotenv').config({ path: path.join(__dirname, '../.env') });
require('dotenv').config({ path: path.join(__dirname, '../.env.development') });

const LDAP_URL = process.env.LDAP_URL || 'ldap://localhost:389';
const LDAP_ADMIN_DN = process.env.LDAP_ADMIN_DN || 'cn=admin,dc=awtc,dc=com';
const LDAP_ADMIN_PASSWORD = process.env.LDAP_ADMIN_PASSWORD || 'adminawtc1234';
const LDAP_BASE_DN = process.env.LDAP_BASE_DN || 'dc=awtc,dc=com';
const LDAP_USERS_DN = `ou=users,${LDAP_BASE_DN}`;

const usersToSync = [
  { name: 'Admin', email: 'admin@awtc.es', password: 'adminawtc1234' },
  { name: 'Juan', email: 'juan@gmail.com', password: 'juan' },
  { name: 'Paco', email: 'paco@gmail.com', password: 'paco' },
  { name: 'Maria', email: 'maria@gmail.com', password: 'maria' }
];

const client = ldap.createClient({
  url: LDAP_URL
});

function ensureUsersOU() {
  return new Promise((resolve, reject) => {
    const entry = {
      ou: 'users',
      objectClass: ['organizationalUnit', 'top']
    };

    client.add(LDAP_USERS_DN, entry, (err) => {
      if (err) {
        if (err.code === 68) { // EntryAlreadyExists
          console.log('ℹ️  Group ou=users already exists.');
          return resolve();
        }
        return reject(err);
      }
      console.log('✅ Group ou=users created.');
      resolve();
    });
  });
}

function addUserToLDAP(user) {
  return new Promise((resolve, reject) => {
    const entry = {
      cn: user.email,
      sn: user.name,
      mail: user.email,
      userPassword: user.password,
      objectClass: ['inetOrgPerson', 'top']
    };

    const userDN = `cn=${user.email},${LDAP_USERS_DN}`;

    client.add(userDN, entry, (err) => {
      if (err) {
        if (err.code === 68) {
          console.log(`⚠️  User ${user.email} already exists in LDAP.`);
          return resolve();
        }
        return reject(err);
      }
      console.log(`✅ User ${user.email} created in LDAP.`);
      resolve();
    });
  });
}

client.bind(LDAP_ADMIN_DN, LDAP_ADMIN_PASSWORD, async (err) => {
  if (err) {
    console.error('❌ Error connecting to LDAP:', err);
    process.exit(1);
  }
  console.log('🔌 Connected to LDAP as Admin.');

  try {
    await ensureUsersOU();

    for (const user of usersToSync) {
      await addUserToLDAP(user);
    }
    console.log('\n✨ Synchronization completed. You can now log in with these users.');
  } catch (error) {
    console.error('❌ Error during synchronization:', error);
  } finally {
    client.unbind();
  }
});
