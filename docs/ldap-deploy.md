# LDAP Deployment Guide (Digital Ocean)

This guide details the steps to deploy the LDAP authentication changes to your Digital Ocean production server.

## 1. Connect to Server
Connect via SSH to your Droplet:
```bash
ssh root@your_server_ip
```

## 2. Install OpenLDAP (Native)
Instead of Docker, we will install OpenLDAP directly on the server (assuming Ubuntu/Debian).

1.  **Install packages**:
    ```bash
    sudo apt update
    sudo apt install slapd ldap-utils
    ```

2.  **Configure OpenLDAP**:
    Run the configuration wizard:
    ```bash
    sudo dpkg-reconfigure slapd
    ```
    Answer the prompts as follows:
    *   **Omit OpenLDAP server configuration?**: No
    *   **DNS domain name**: `awtc.com`
    *   **Organization name**: `AWTC`
    *   **Administrator password**: (Choose a secure password)
    *   **Confirm password**: (Repeat password)
    *   **Database backend**: MDB
    *   **Remove the database when slapd is purged?**: No
    *   **Move old database?**: Yes

## 3. Initialize LDAP Structure
We need to create the `ou=users` group where users will be stored.

1.  **Create an LDIF file**:
    ```bash
    nano users.ldif
    ```
    Paste this content:
    ```ldif
    dn: ou=users,dc=awtc,dc=com
    objectClass: organizationalUnit
    ou: users
    ```

2.  **Apply the configuration**:
    ```bash
    ldapadd -x -D "cn=admin,dc=awtc,dc=com" -W -f users.ldif
    ```
    *Enter the administrator password you set in step 2.*

## 4. Update Backend Code
Navigate to your project folder:
```bash
cd /path/to/AWTC/backend
```

Pull the latest changes and install dependencies:
```bash
git pull origin develop
npm install
```

## 5. Configure Environment Variables
Create or update the `.env.production` file in the `backend` directory (since the app looks for this file in production mode):

```env
LDAP_URL=ldap://localhost:389
LDAP_BASE_DN=dc=awtc,dc=com
LDAP_ADMIN_DN=cn=admin,dc=awtc,dc=com
LDAP_ADMIN_PASSWORD=YOUR_SECURE_PASSWORD
```
*Note: If using Docker for the backend, use the container name or internal IP instead of localhost.*

## 6. Database Migration
This will remove the password column from your MySQL production database.
**⚠️ Backup your database before running this!**

```bash
npm run migrate:prod
```

## 7. Sync Existing Users
Since the database passwords are removed and LDAP is empty, you must sync the initial users.

Run the sync script (passing the password explicitly if not in .env):
```bash
LDAP_ADMIN_PASSWORD="YOUR_SECURE_PASSWORD" node scripts/sync-ldap-users.js
```

## 8. Restart Backend
Restart your application to apply changes.

```bash
pm2 restart all
```
