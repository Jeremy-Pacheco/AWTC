# LDAP Deployment Guide (Digital Ocean)

This guide details the steps to deploy the LDAP authentication changes to your Digital Ocean production server.

## 1. Connect to Server
Connect via SSH to your Droplet:
```bash
ssh root@your_server_ip
```

## 2. Deploy OpenLDAP Container
We need to run a persistent OpenLDAP container.

1.  **Create Docker Volumes** (for data persistence):
    ```bash
    docker volume create ldap_data
    docker volume create ldap_config
    ```

2.  **Start the Container**:
    *Replace `YOUR_SECURE_PASSWORD` with a strong password.*
    ```bash
    docker run --name openldap-server \
      -p 389:389 \
      --env LDAP_ORGANISATION="AWTC" \
      --env LDAP_DOMAIN="awtc.com" \
      --env LDAP_ADMIN_PASSWORD="YOUR_SECURE_PASSWORD" \
      --env LDAP_CONFIG_PASSWORD="YOUR_SECURE_PASSWORD" \
      -v ldap_data:/var/lib/ldap \
      -v ldap_config:/etc/ldap/slapd.d \
      --detach --restart unless-stopped \
      osixia/openldap:1.5.0
    ```

## 3. Initialize LDAP Structure
Create the `ou=users` organizational unit.

Run this command (using the password from step 2):
```bash
echo -e "dn: ou=users,dc=awtc,dc=com\nobjectClass: organizationalUnit\nou: users" | docker exec -i openldap-server ldapadd -x -D "cn=admin,dc=awtc,dc=com" -w YOUR_SECURE_PASSWORD
```

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
