const ldap = require('ldapjs');

const LDAP_URL = process.env.LDAP_URL || 'ldap://localhost:389';
const LDAP_BASE_DN = process.env.LDAP_BASE_DN || 'dc=awtc,dc=com';
const LDAP_ADMIN_DN = process.env.LDAP_ADMIN_DN || 'cn=admin,dc=awtc,dc=com';
const LDAP_ADMIN_PASSWORD = process.env.LDAP_ADMIN_PASSWORD || 'admin';
const LDAP_USERS_DN = `ou=users,${LDAP_BASE_DN}`;

function getClient() {
  return ldap.createClient({
    url: LDAP_URL,
    reconnect: true
  });
}

/**
 * Authenticate a user against LDAP
 * @param {string} email - User email (used as CN or UID)
 * @param {string} password - User password
 * @returns {Promise<boolean>}
 */
exports.authenticate = (email, password) => {
  return new Promise((resolve, reject) => {
    const client = getClient();
    
    // We assume the DN is cn=email,ou=users,dc=awtc,dc=com
    // Or we might need to search for the DN first if we don't know the structure perfectly.
    // For simplicity, let's assume cn=email.
    const userDN = `cn=${email},${LDAP_USERS_DN}`;

    client.bind(userDN, password, (err) => {
      client.unbind();
      if (err) {
        console.error('LDAP Auth Error:', err);
        return resolve(false);
      }
      return resolve(true);
    });
  });
};

/**
 * Add a new user to LDAP
 * @param {string} name - User full name
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<void>}
 */
exports.addUser = (name, email, password) => {
  return new Promise((resolve, reject) => {
    const client = getClient();

    // First bind as admin to add user
    client.bind(LDAP_ADMIN_DN, LDAP_ADMIN_PASSWORD, (err) => {
      if (err) {
        client.unbind();
        return reject(err);
      }

      const entry = {
        cn: email,
        sn: name,
        mail: email,
        userPassword: password,
        objectClass: ['inetOrgPerson', 'top']
      };

      const userDN = `cn=${email},${LDAP_USERS_DN}`;

      client.add(userDN, entry, (err) => {
        client.unbind();
        if (err) {
          return reject(err);
        }
        resolve();
      });
    });
  });
};
