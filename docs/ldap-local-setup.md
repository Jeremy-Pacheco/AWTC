# LDAP Local Setup Guide

This guide details how to set up the LDAP authentication service in your local development environment using Docker.

## Local Environment (Docker)

To work locally, we will use Docker Compose to spin up an OpenLDAP server and a graphical interface (phpLDAPadmin).

### Prerequisites
*   Have **Docker Desktop** installed and running.

### Steps to Start
1.  Open a terminal in the `backend` folder.
2.  Run the following command to start the services:
    ```bash
    docker-compose up -d
    ```
3.  Verify that the containers are running:
    ```bash
    docker ps
    ```
    You should see `openldap-server` and `phpldapadmin`.

### Accessing the Graphical Interface (phpLDAPadmin)
*   **URL**: [http://localhost:8081](http://localhost:8081)
*   **Login DN**: `cn=admin,dc=awtc,dc=com`
*   **Password**: `adminawtc1234`

### Backend Configuration
The `.env.development` file has been automatically configured with:
```env
LDAP_URL=ldap://localhost:389
LDAP_BASE_DN=dc=awtc,dc=com
LDAP_ADMIN_DN=cn=admin,dc=awtc,dc=com
LDAP_ADMIN_PASSWORD=adminawtc1234
```

### Notes for Local Development
*   If you need to restart from scratch (delete all LDAP users), run:
    ```bash
    docker-compose down -v
    docker-compose up -d
    ```
*   Remember that your local MySQL database must also be running (via XAMPP or similar).
*   **Sync Users**: If your LDAP is empty but you have users in your database (or want to create the default seed users), run:
    ```bash
    node scripts/sync-ldap-users.js
    ```
