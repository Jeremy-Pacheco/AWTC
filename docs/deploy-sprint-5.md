# Production Deployment Guide - Sprint 5

## Introduction

This deployment guide builds upon [Sprint 4](./deploy-sprint-4.md), which implemented HTTPS security and domain configuration. Sprint 5 focuses on **quality assurance through comprehensive testing** and **mobile user experience improvements**. For those deploying for the first time, complete [Sprint 3](./deploy-sprint-3.md) for base infrastructure, then [Sprint 4](./deploy-sprint-4.md) for HTTPS setup before proceeding with Sprint 5.

**📋 Required Sprint 3 Components:**
- Configured DigitalOcean Droplet (VPS)
- Node.js runtime, PM2 process manager, and Git version control
- Deployed Backend and Frontend services
- MySQL database instance
- PM2-managed application processes

This documentation covers:
- Custom domain configuration (`awilltochange.me`)
- Nginx reverse proxy setup
- SSL certificate acquisition via Let's Encrypt
- Production HTTPS implementation
- Secure WebSocket configuration
- HTTPS-enabled Push Notification system

### Production Access Points
- **Main Website (HTTPS)**: https://awilltochange.me
- **API Gateway**: https://awilltochange.me/api
- **Administration Panel**: https://awilltochange.me/admin/
- **API Documentation Portal**: https://awilltochange.me/api-docs
- **Secure WebSocket**: wss://awilltochange.me/socket.io/

### Local Development Endpoints
- **Frontend Development Server**: http://localhost:5173
- **Backend Development Server**: http://localhost:8080
- **API Documentation**: http://localhost:8080/api-docs

---

## Sprint 5 Enhancements

### 🆕 New Features from Sprint 4
1. **Custom Domain Integration**: Configured domain `awilltochange.me` with DNS records
2. **SSL/TLS Implementation**: Free SSL certificates from Let's Encrypt for encrypted communications
3. **Reverse Proxy Layer**: Nginx-based traffic routing and SSL termination
4. **Real-time Notifications**: Web Push API implementation with VAPID authentication
5. **Live Communication**: Socket.IO for instant messaging capabilities
6. **Optimized User Interface**: Paginated dashboard displays (5-10 records per view)
7. **Advanced Monitoring**: Secure admin analytics dashboard

### 🧪 Sprint 5 Additions
- **Backend Testing Suite**: Comprehensive test coverage for API endpoints, controllers, and business logic
- **Frontend Testing Suite**: UI component tests, integration tests, and user interaction testing
- **Mobile UX Fix**: Resolved visual bug in hamburger menu on mobile devices

### 🔒 Security Enhancements
- End-to-end TLS encryption
- Encrypted WebSocket communications (wss://)
- Production-grade secure cookie handling
- Domain-specific CORS policies
- Hardened session management protocols

---

## Differences from Sprint 3

### Additional Infrastructure
- **Nginx Web Server**: Traffic routing and SSL certificate handling
- **Let's Encrypt Integration**: Automated free SSL certificate provisioning
- **Custom DNS**: Domain-based access replacing direct IP connections
- **TLS Encryption**: Complete traffic encryption with TLS 1.2/1.3 support
- **WSS Protocol**: Encrypted WebSocket layer for Socket.IO

### Infrastructure Evolution
- **Sprint 3 Architecture**: Direct port access (209.97.187.131:5173, 209.97.187.131:8080)
- **Sprint 5 Architecture**: Unified access through Nginx on ports 443 (HTTPS) and 80 (HTTP auto-redirect)

Reference [Sprint 3 documentation](./deploy-sprint-3.md) for core infrastructure details (Process Management, Database Configuration, File Storage).

---

## Updated System Architecture

### Technology Stack
- **Cloud Infrastructure**: DigitalOcean VPS - IP Address: 209.97.187.131 *(from Sprint 3)*
- **Domain Management**: awilltochange.me with DNS configuration **← NEW**
- **Reverse Proxy**: Nginx for traffic routing and SSL **← NEW**
- **Frontend Framework**: React 19 + TypeScript built with Vite (port 5173) *(from Sprint 3)*
- **Backend Platform**: Node.js + Express 5 (port 8080) *(from Sprint 3)*
- **Data Storage**: DigitalOcean Managed MySQL Database *(from Sprint 3)*
- **Application Manager**: PM2 process supervision *(from Sprint 3)*
- **Certificate Authority**: Let's Encrypt with auto-renewal **← NEW**
- **Real-time Layer**: Socket.IO over WSS protocol **← ENHANCED**
- **Media Storage**: Local filesystem (`backend/public/images/`) *(from Sprint 3)*

### Request Flow Diagram
```
Client Browser (Secure HTTPS)
    ↓
Nginx Server (Port 443 - SSL Certificate Handler)
    ↓
    ├─→ React Application (Port 5173) - User Interface
    ├─→ REST API (Port 8080) - /api/* endpoints
    ├─→ Control Panel (Port 8080) - /admin/* routes
    ├─→ WebSocket Server (Port 8080) - /socket.io/* connections
    └─→ Image Assets (Port 8080) - /images/* resources
```

---

## Domain Prerequisites

### DNS Configuration Requirements
Before deployment:
1. Registered domain `awilltochange.me`
2. DNS A record configured to server IP: `209.97.187.131`
3. Completed DNS propagation (typically 24-48 hours)

Verification commands:
```bash
nslookup awilltochange.me
# Expected output: 209.97.187.131

ping awilltochange.me
# Should receive responses from 209.97.187.131
```

---

## Sprint 5 Prerequisites

Ensure completion of [Sprint 3 deployment procedures](./deploy-sprint-3.md):
- ✅ DigitalOcean Droplet provisioned and accessible
- ✅ Node.js runtime, PM2, and Git installed
- ✅ Source code repository cloned
- ✅ Application dependencies resolved (backend/frontend)
- ✅ Database schema migrations applied
- ✅ Seed data loaded
- ✅ PM2 process management active

**Sprint 5 Additional Requirements:**
- Registered domain name with DNS pointing to server
- Root/administrative server access

---

## Implementation Steps

### Step 1: Validate Existing Infrastructure

```bash
# Establish SSH connection
ssh root@209.97.187.131

# Confirm running processes from Sprint 3
pm2 status

# Both awtc-backend and awtc-frontend should display "online" status
```

**If applications aren't running, complete [Sprint 3 configuration](./deploy-sprint-3.md) first.**

---

### Step 2: Install Required Software

Install Nginx web server and Certbot SSL client:

```bash
# Install Nginx reverse proxy
sudo apt install -y nginx

# Install Let's Encrypt certificate manager
sudo apt install -y certbot python3-certbot-nginx

# Confirm successful installation
nginx -v
certbot --version
```

---

### Step 3: Domain Name System Setup

**Complete DNS configuration before SSL certificate acquisition:**

1. Access your domain provider's control panel (e.g., Namecheap, GoDaddy, Cloudflare)
2. Create/modify DNS entries:

| Record Type | Hostname | Destination | Time-to-Live |
|-------------|----------|-------------|--------------|
| A | @ | 209.97.187.131 | 3600 |
| A | www | 209.97.187.131 | 3600 |

3. Allow time for DNS propagation (up to 48 hours maximum)

**DNS Propagation Verification:**

```bash
nslookup awilltochange.me
# Should resolve to: 209.97.187.131

ping awilltochange.me
# Should respond from: 209.97.187.131
```

---

### Step 4: SSL Certificate Acquisition

**CRITICAL**: Execute this step PRIOR to Nginx SSL configuration.

```bash
# Temporarily halt Nginx (Certbot requires port 80 availability)
sudo systemctl stop nginx

# Request SSL certificate from Let's Encrypt
sudo certbot certonly --standalone \
  -d awilltochange.me \
  -d www.awilltochange.me \
  --email admin@awilltochange.me \
  --agree-tos \
  --non-interactive

# Certificate files stored at:
# /etc/letsencrypt/live/awilltochange.me/fullchain.pem
# /etc/letsencrypt/live/awilltochange.me/privkey.pem
```

**Certificate Installation Verification:**
```bash
sudo ls -la /etc/letsencrypt/live/awilltochange.me/
```

---

### Step 5: Nginx Configuration Deployment

**Pre-configured Nginx file available** in project root: `awtc.nginx.conf`

This configuration includes Sprint 5 enhancements:
- Complete HTTPS/SSL support
- Automatic HTTP to HTTPS redirection
- Enhanced security headers
- Resolved Swagger API URL duplication

**Configuration Deployment:**

```bash
# Copy configuration from repository
sudo cp /var/www/awtc/awtc.nginx.conf /etc/nginx/sites-available/awtc
```

**Configuration Highlights:**

- ✅ **Automatic HTTPS Redirect** - HTTP requests automatically upgraded to HTTPS
- ✅ **Modern TLS Configuration** - Supports TLS 1.2 and 1.3 with robust cipher suites
- ✅ **Security Header Suite** - HSTS, X-Frame-Options, Content-Type-Options, XSS filters
- ✅ **Frontend Routing** - Proxies requests to React application (port 5173)
- ✅ **API Gateway** - Routes `/api` traffic to backend service (port 8080)
- ✅ **Admin Interface** - Handles `/admin/` with URL rewriting for EJS templates
- ✅ **API Documentation** - Serves `/api-docs` with corrected URL handling
- ✅ **Static Asset Server** - Delivers images with optimized caching policies
- ✅ **WebSocket Proxy** - Routes Socket.IO with appropriate timeout configurations

**Review Configuration:**
```bash
cat /var/www/awtc/awtc.nginx.conf
```

**Activate Configuration:**

```bash
# Create symbolic link to enable site
sudo ln -s /etc/nginx/sites-available/awtc /etc/nginx/sites-enabled/

# Remove default site configuration if present
sudo rm /etc/nginx/sites-enabled/default

# Validate configuration syntax
sudo nginx -t

# If validation succeeds, restart Nginx
sudo systemctl restart nginx

# Configure Nginx for automatic startup
sudo systemctl enable nginx
```

---

### Step 6: Backend Environment Configuration

**Note**: Sprint 3 backend configuration largely unchanged. Only URL protocol updated to HTTPS.

```bash
cd /var/www/awtc/backend

# Modify production environment configuration
nano .env.production
```

**Update these specific variables (retain Sprint 3 settings for others):**

```env
# Application Environment
NODE_ENV=production

# **SPRINT 5 UPDATE**: Protocol changed to HTTPS
FRONTEND_URL=https://awilltochange.me

# Web Push Notification Credentials (VAPID) - **SPRINT 5 ADDITION**
VAPID_PUBLIC_KEY=BMtR0EhYYntcSbWAufPurSBqwg6Kb-Qu7rG0WloxOklWahtQbOKl0fWIn92FnK6seN_pXacy6Bw1gz0YshOyi1Y
VAPID_PRIVATE_KEY=WHqGUgnELc5cT2w_CF5ADboJ0Kzn2a9KyC2WuiZrYQ0
VAPID_EMAIL=admin@awilltochange.me
```

**Complete environment variable documentation available in [Sprint 3 guide](./deploy-sprint-3.md#step-4-backend-setup).**

---

### Step 7: Frontend Environment Update

```bash
cd /var/www/awtc/frontend

# Edit production environment settings
nano .env.production
```

**Configure HTTPS endpoints:**

```env
# **SPRINT 5 UPDATE**: Secure protocol URLs
VITE_API_URL=https://awilltochange.me
VITE_IMAGE_URL=https://awilltochange.me/images

# Web Push Public Key - **SPRINT 5 ADDITION**
VITE_VAPID_PUBLIC_KEY=BMtR0EhYYntcSbWAufPurSBqwg6Kb-Qu7rG0WloxOklWahtQbOKl0fWIn92FnK6seN_pXacy6Bw1gz0YshOyi1Y
```

**Compile production build:**

```bash
npm run build

# Verify compilation output
ls -la dist/
```

---

### Step 8: Application Restart

**Restart PM2 services** to load updated environment configuration:

```bash
# Restart backend service
pm2 restart awtc-backend

# Restart frontend service
pm2 restart awtc-frontend

# Verify operational status
pm2 status
```

**Note**: For initial PM2 configuration, consult [Sprint 3 - Step 8](./deploy-sprint-3.md#step-8-start-applications-with-pm2).

---

### Step 9: Automated Certificate Renewal

Let's Encrypt certificates have a 90-day validity period. Configure automatic renewal:

```bash
# Test renewal procedure
sudo certbot renew --dry-run

# Certbot installs a systemd renewal timer automatically
# Verify timer is operational
sudo systemctl status certbot.timer

# Manual renewal command (when necessary)
sudo certbot renew

# Reload Nginx to apply renewed certificates
sudo systemctl reload nginx
```

---

### Step 10: Deployment Verification

**Verify PM2 services:**

```bash
pm2 status
pm2 logs
```

**Verify Nginx service:**

```bash
sudo systemctl status nginx
sudo nginx -t
```

**Endpoint Testing:**
- Main Site: https://awilltochange.me
- API Status: https://awilltochange.me/api/health (if endpoint exists)
- Admin Panel: https://awilltochange.me/admin/
- Documentation: https://awilltochange.me/api-docs

**SSL Certificate Validation:**
```bash
openssl s_client -connect awilltochange.me:443 -servername awilltochange.me
```

**Security Rating Check:**
Visit: https://www.ssllabs.com/ssltest/analyze.html?d=awilltochange.me

---

## Web Push Notifications Configuration

### VAPID Key Generation

To generate new VAPID key pairs:

```bash
cd /var/www/awtc/backend
npx web-push generate-vapid-keys
```

Update credentials in both:
- `backend/.env.production` (PUBLIC_KEY, PRIVATE_KEY, EMAIL)
- `frontend/.env.production` (PUBLIC_KEY only)

### Service Worker Implementation

Service worker location: `frontend/public/sw.js`. Responsibilities include:
- Push notification reception
- Click event handling
- Background synchronization (if configured)

**Critical**: Service workers require HTTPS (except localhost development).

---

## Real-time Communication Setup

### Backend WebSocket Configuration
Socket.IO implementation in `backend/config/socket.js`:
- Instant message delivery
- Online user presence tracking
- Offline user push notifications

### Frontend WebSocket Integration
Socket.IO client implementation:
- `frontend/src/pages/Messages.tsx`
- Automatic wss:// protocol in production

### WebSocket Testing
```bash
# Browser console verification
# Expected output: "Socket.IO connection established"
```

---

## Application Update Procedures

### Standard Update Workflow

```bash
# 1. SSH connection to server
ssh root@209.97.187.131

# 2. Navigate to application directory
cd /var/www/awtc

# 3. Fetch latest code
git pull origin main

# 4. Backend updates
cd backend
npm install
NODE_ENV=production npx sequelize-cli db:migrate

# 5. Frontend rebuild
cd ../frontend
npm install
npm run build

# 6. Application restart
pm2 restart all

# 7. Status verification
pm2 status
pm2 logs --lines 50
```

### Zero-Downtime Update Strategy (Advanced)

```bash
# Use graceful reload instead of hard restart
pm2 reload all
```

---

## Issue Resolution Guide

### SSL Certificate Problems

```bash
# Check certificate validity period
sudo certbot certificates

# Test automated renewal
sudo certbot renew --dry-run

# Force manual renewal
sudo certbot renew
sudo systemctl reload nginx
```

### Nginx Service Failures

```bash
# Validate configuration syntax
sudo nginx -t

# Monitor error output
sudo tail -f /var/log/nginx/error.log

# Check port 443 availability
sudo lsof -i :443
```

### Application Startup Issues

```bash
# Review PM2 process logs
pm2 logs awtc-backend --lines 100
pm2 logs awtc-frontend --lines 100

# Restart specific service
pm2 restart awtc-backend

# Detailed process information
pm2 describe awtc-backend
```

### Push Notification Failures

```bash
# 1. Confirm VAPID key consistency across .env files
# 2. Verify service worker registration (browser console)
# 3. Confirm HTTPS functionality (push notifications requirement)
# 4. Review backend subscription logs:
pm2 logs awtc-backend | grep -i "push\|vapid"
```

### WebSocket Connection Problems

```bash
# Verify Socket.IO availability
curl https://awilltochange.me/socket.io/?EIO=4&transport=polling

# Validate Nginx WebSocket proxy
sudo nginx -t

# Monitor WebSocket activity
pm2 logs awtc-backend | grep -i "socket"
```

### Database Connection Failures

```bash
# Test database connectivity
mysql -h your-db-host -u doadmin -p -D db_awtc_production

# Review database configuration
cat backend/.env.production | grep DB_
```

### Port Conflict Resolution

```bash
# Identify process using port 8080
sudo lsof -i :8080

# Identify process using port 5173
sudo lsof -i :5173

# Terminate conflicting process
kill -9 <PID>

# Restart services
pm2 restart all
```

---

## Security Implementation Guide

### 1. Firewall Setup

```bash
# Activate UFW firewall
sudo ufw enable

# Enable SSH access
sudo ufw allow 22/tcp

# Enable HTTP (Let's Encrypt verification)
sudo ufw allow 80/tcp

# Enable HTTPS traffic
sudo ufw allow 443/tcp

# Review firewall rules
sudo ufw status
```

### 2. Environment Variable Protection

```bash
# Restrict environment file permissions
chmod 600 /var/www/awtc/backend/.env.production
chmod 600 /var/www/awtc/frontend/.env.production
```

### 3. Routine Maintenance

```bash
# Weekly system updates
sudo apt update && sudo apt upgrade -y

# Monthly dependency updates
cd /var/www/awtc/backend && npm update
cd /var/www/awtc/frontend && npm update
```

### 4. Backup Procedures

```bash
# Database backup (via DigitalOcean interface or CLI)
# Image archive creation
tar -czf images-backup-$(date +%Y%m%d).tar.gz /var/www/awtc/backend/public/images/

# Configuration backup
cp /etc/nginx/sites-available/awtc ~/nginx-backup-$(date +%Y%m%d).conf
cp /var/www/awtc/backend/.env.production ~/env-backup-$(date +%Y%m%d).env
```

---

## System Monitoring & Logging

### PM2 Process Monitoring

```bash
# Live monitoring dashboard
pm2 monit

# Detailed process inspection
pm2 describe awtc-backend
pm2 describe awtc-frontend

# Log viewing
pm2 logs
pm2 logs awtc-backend --lines 100
pm2 logs awtc-frontend --lines 100

# Log cleanup
pm2 flush
```

### Nginx Log Management

```bash
# Monitor access logs
sudo tail -f /var/log/nginx/access.log

# Monitor error logs
sudo tail -f /var/log/nginx/error.log

# Search for errors
sudo grep -i error /var/log/nginx/error.log
```

### System Resource Monitoring

```bash
# Storage utilization
df -h

# Memory consumption
free -h

# CPU usage monitoring
top

# Active network connections
sudo netstat -tlnp
```

---

## Rollback Strategy

In case of deployment issues or failures:

```bash
# 1. Halt running applications
pm2 stop all

# 2. Return to previous code version
cd /var/www/awtc
git log --oneline -5  # List recent commits
git checkout <previous-commit-hash>

# 3. Rebuild frontend application
cd frontend
npm install
npm run build

# 4. Reinstall backend packages
cd ../backend
npm install

# 5. Revert database changes (if necessary)
NODE_ENV=production npx sequelize-cli db:migrate:undo

# 6. Restart all services
pm2 restart all

# 7. Verify system status
pm2 logs
```

---

## Environment Configuration Reference

### Backend Configuration (.env.production)

| Variable Name | Purpose | Example Value |
|--------------|---------|---------------|
| `NODE_ENV` | Runtime environment | `production` |
| `PORT` | Backend service port | `8080` |
| `FRONTEND_URL` | Frontend application URL | `https://awilltochange.me` |
| `DB_HOST` | Database server address | `db-host.ondigitalocean.com` |
| `DB_PORT` | Database connection port | `25060` |
| `DB_USER` | Database username | `doadmin` |
| `DB_PASSWORD` | Database authentication | `secure_password` |
| `DB_NAME` | Database schema name | `db_awtc_production` |
| `DB_SSL` | Database SSL connection | `false` |
| `SESSION_SECRET` | Session encryption key | `random_secret_key` |
| `VAPID_PUBLIC_KEY` | Push notification public key | `BMtR0E...` |
| `VAPID_PRIVATE_KEY` | Push notification private key | `WHqGU...` |
| `VAPID_EMAIL` | Push notification contact | `admin@awilltochange.me` |

### Frontend Configuration (.env.production)

| Variable Name | Purpose | Example Value |
|--------------|---------|---------------|
| `VITE_API_URL` | Backend API endpoint | `https://awilltochange.me` |
| `VITE_IMAGE_URL` | Image resource location | `https://awilltochange.me/images` |
| `VITE_VAPID_PUBLIC_KEY` | Push notification public key | `BMtR0E...` |

---

## SSL Certificate Maintenance Checklist

Let's Encrypt certificates require renewal every 90 days. While Certbot automates this, periodic verification is recommended:

- [ ] Certbot timer active: `sudo systemctl status certbot.timer`
- [ ] Renewal test successful: `sudo certbot renew --dry-run`
- [ ] Certificate expiration check: `sudo certbot certificates`
- [ ] Nginx reload after renewal: Review `/var/log/letsencrypt/` logs

**Manual renewal procedure:**
```bash
sudo certbot renew
sudo systemctl reload nginx
```

---

## Project Resources

- **Source Code Repository**: https://github.com/Jeremy-Pacheco/AWTC
- **Technical Documentation**: `/docs` directory in repository
- **Bug Reports**: GitHub Issues page

---

## External Documentation Links

- [Let's Encrypt Official Documentation](https://letsencrypt.org/docs/)
- [Nginx Reverse Proxy Configuration Guide](https://docs.nginx.com/nginx/admin-guide/web-server/reverse-proxy/)
- [PM2 Process Manager Documentation](https://pm2.keymetrics.io/)
- [DigitalOcean Deployment Guides](https://docs.digitalocean.com/)
- [Web Push Notification Protocol](https://developers.google.com/web/fundamentals/push-notifications)
- [Socket.IO Official Documentation](https://socket.io/docs/v4/)
