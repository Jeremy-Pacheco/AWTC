# Deployment - Sprint 4

## Overview

This document extends the deployment guide from [Sprint 3](./deploy-sprint-3.md) by adding **HTTPS support with Let's Encrypt SSL certificates** and **custom domain configuration**. If you're deploying for the first time, please read the [Sprint 3 deployment guide](./deploy-sprint-3.md) first for the base setup.

**📋 Prerequisites from Sprint 3:**
- DigitalOcean Droplet configured and running
- Node.js, PM2, and Git installed
- Backend and Frontend applications deployed
- MySQL database configured
- Applications running with PM2

This guide focuses on:
- Setting up a custom domain (`awilltochange.me`)
- Installing and configuring Nginx as reverse proxy
- Obtaining and configuring SSL certificates with Let's Encrypt
- Enabling HTTPS for production
- Configuring WebSocket over secure connections
- Push Notifications with HTTPS requirement

### Deployment URLs
- **Production (HTTPS)**: https://awilltochange.me
- **Backend API**: https://awilltochange.me/api
- **Admin Dashboard**: https://awilltochange.me/admin/
- **API Documentation**: https://awilltochange.me/api-docs
- **WebSocket**: wss://awilltochange.me/socket.io/

### Development URLs (Local)
- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:8080
- **API Docs**: http://localhost:8080/api-docs

---

## What's New in Sprint 4

### 🆕 New Features
1. **Domain Setup**: Custom domain `awilltochange.me` configured with DNS
2. **HTTPS/SSL**: Let's Encrypt SSL certificates for secure connections
3. **Nginx Reverse Proxy**: Centralized routing and SSL termination
4. **Push Notifications**: Web Push API with VAPID keys for real-time notifications
5. **WebSocket Support**: Socket.IO for real-time messaging
6. **Dashboard Pagination**: Improved UX with paginated views (5-10 items per page)
7. **Enhanced Analytics**: Backend analytics accessible via secure admin panel

### 🔒 Security Improvements
- SSL/TLS encryption for all traffic
- Secure WebSocket connections (wss://)
- HTTPS-only cookies in production
- CORS configuration for domain
- Secure session management

---

## Changes from Sprint 3

### New Components Added
- **Nginx**: Reverse proxy for routing and SSL termination
- **Let's Encrypt**: Free SSL certificate provider
- **Domain**: Custom domain `awilltochange.me` instead of direct IP access
- **HTTPS**: All traffic encrypted with TLS 1.2/1.3
- **Secure WebSocket**: WSS protocol for Socket.IO

### Architecture Changes
- **Before Sprint 4**: Direct access to ports (209.97.187.131:5173, 209.97.187.131:8080)
- **After Sprint 4**: All traffic through Nginx on port 443 (HTTPS) and 80 (HTTP redirect)

For base infrastructure details (PM2, Database, Image Storage), refer to [Sprint 3 documentation](./deploy-sprint-3.md).

---

## Updated Deployment Architecture

### Infrastructure Stack
- **Hosting**: DigitalOcean Droplet (VPS) - IP: 209.97.187.131 *(unchanged from Sprint 3)*
- **Domain**: awilltochange.me (DNS configured) **← NEW**
- **Web Server**: Nginx (reverse proxy, SSL termination) **← NEW**
- **Frontend**: React 19 + TypeScript with Vite (port 5173) *(unchanged)*
- **Backend**: Node.js + Express 5 (port 8080) *(unchanged)*
- **Database**: DigitalOcean Managed MySQL *(unchanged)*
- **Process Manager**: PM2 for application management *(unchanged)*
- **SSL/TLS**: Let's Encrypt (auto-renewal enabled) **← NEW**
- **WebSocket**: Socket.IO for real-time communication (now over WSS) **← UPDATED**
- **File Storage**: Local filesystem (`backend/public/images/`) *(unchanged)*

### Network Flow
```
User Browser (HTTPS)
    ↓
Nginx (Port 443 - SSL Termination)
    ↓
    ├─→ Frontend (Port 5173) - React App
    ├─→ Backend API (Port 8080) - /api/*
    ├─→ Admin Dashboard (Port 8080) - /admin/*
    ├─→ Socket.IO (Port 8080) - /socket.io/*
    └─→ Static Images (Port 8080) - /images/*
```

---

## Prerequisites

### Domain Configuration
Before starting deployment, ensure:
1. Domain `awilltochange.me` is registered
2. DNS A record points to server IP: `209.97.187.131`
3. DNS propagation is complete (can take up to 48 hours)

Verify DNS:
```bash
nslookup awilltochange.me
# Should return: 209.97.187.131

ping awilltochange.me
# Should respond from 209.97.187.131
```

---

## Prerequisites

Before proceeding with Sprint 4 deployment, ensure you have completed the [Sprint 3 deployment](./deploy-sprint-3.md) which includes:
- ✅ DigitalOcean Droplet set up and accessible
- ✅ Node.js, PM2, and Git installed
- ✅ Application repository cloned
- ✅ Backend and Frontend dependencies installed
- ✅ Database migrations and seeders executed
- ✅ Applications running with PM2

**New for Sprint 4:**
- Domain name registered and pointing to your server IP
- Root/sudo access to the server

---

## Deployment Process

### Step 1: Verify Existing Setup

```bash
# Connect to server
ssh root@209.97.187.131

# Verify applications are running from Sprint 3
pm2 status

# Expected output: awtc-backend and awtc-frontend should be "online"
```

**If applications are not running, complete [Sprint 3 setup](./deploy-sprint-3.md) first.**

---

### Step 2: Install Additional Components

Install Nginx and Certbot (Let's Encrypt client):

```bash
# Install Nginx
sudo apt install -y nginx

# Install Certbot for Let's Encrypt
sudo apt install -y certbot python3-certbot-nginx

# Verify installations
nginx -v
certbot --version
```

---

### Step 3: Configure Domain DNS

**Before obtaining SSL certificate, configure DNS:**

1. Log in to your domain registrar (e.g., Namecheap, GoDaddy, Cloudflare)
2. Add/update DNS records:

| Type | Name | Value | TTL |
|------|------|-------|-----|
| A | @ | 209.97.187.131 | 3600 |
| A | www | 209.97.187.131 | 3600 |

3. Wait for DNS propagation (can take up to 48 hours)

**Verify DNS propagation:**

```bash
nslookup awilltochange.me
# Should return: 209.97.187.131

ping awilltochange.me
# Should respond from 209.97.187.131
```

---

### Step 4: Obtain SSL Certificate

**IMPORTANT**: Do this BEFORE configuring Nginx with SSL.

```bash
# Stop Nginx temporarily (Certbot needs port 80)
sudo systemctl stop nginx

# Obtain SSL certificate
sudo certbot certonly --standalone \
  -d awilltochange.me \
  -d www.awilltochange.me \
  --email admin@awilltochange.me \
  --agree-tos \
  --non-interactive

# Certificates will be saved to:
# /etc/letsencrypt/live/awilltochange.me/fullchain.pem
# /etc/letsencrypt/live/awilltochange.me/privkey.pem
```

**Verify certificate installation:**
```bash
sudo ls -la /etc/letsencrypt/live/awilltochange.me/
```

---

### Step 5: Configure Nginx

**The project already includes a Nginx configuration file** at the root: `awtc.nginx.conf`

This file has been updated for Sprint 4 with:
- HTTPS/SSL support
- HTTP to HTTPS redirect
- Security headers
- Fixed Swagger API URL duplication issue

**Deploy the configuration file:**

```bash
# Copy the configuration file from the repository
sudo cp /var/www/awtc/awtc.nginx.conf /etc/nginx/sites-available/awtc
```

**Key features in the configuration:**

- ✅ **HTTP to HTTPS redirect** - All HTTP traffic automatically redirected to HTTPS
- ✅ **SSL/TLS Configuration** - Modern protocols (TLS 1.2/1.3) with strong ciphers
- ✅ **Security Headers** - HSTS, X-Frame-Options, Content-Type-Options, XSS Protection
- ✅ **Frontend Proxy** - Routes traffic to React app on port 5173
- ✅ **Backend API Proxy** - Routes `/api` requests to backend on port 8080
- ✅ **Admin Dashboard** - Routes `/admin/` with URL rewriting for EJS views
- ✅ **Swagger Documentation** - Routes `/api-docs` with fix for URL duplication
- ✅ **Static Images** - Serves images with caching headers
- ✅ **WebSocket Support** - Routes Socket.IO traffic with proper timeouts

**View the full configuration:**
```bash
cat /var/www/awtc/awtc.nginx.conf
```

**Enable the configuration:**

```bash
# Create symbolic link
sudo ln -s /etc/nginx/sites-available/awtc /etc/nginx/sites-enabled/

# Remove default configuration if exists
sudo rm /etc/nginx/sites-enabled/default

# Test Nginx configuration
sudo nginx -t

# If test passes, restart Nginx
sudo systemctl restart nginx

# Enable Nginx to start on boot
sudo systemctl enable nginx
```

---

### Step 6: Update Backend Configuration

**Note**: Backend configuration from Sprint 3 remains mostly the same. We only update URLs to use HTTPS.

```bash
cd /var/www/awtc/backend

# Edit production environment file
nano .env.production
```

**Update these variables (keep other variables from Sprint 3):**

```env
# Node Environment
NODE_ENV=production

# **UPDATED FOR SPRINT 4**: Change to HTTPS
FRONTEND_URL=https://awilltochange.me

# Push Notifications (Web Push VAPID Keys) - **NEW IN SPRINT 4**
VAPID_PUBLIC_KEY=BMtR0EhYYntcSbWAufPurSBqwg6Kb-Qu7rG0WloxOklWahtQbOKl0fWIn92FnK6seN_pXacy6Bw1gz0YshOyi1Y
VAPID_PRIVATE_KEY=WHqGUgnELc5cT2w_CF5ADboJ0Kzn2a9KyC2WuiZrYQ0
VAPID_EMAIL=admin@awilltochange.me
```

**For complete environment variable reference, see [Sprint 3 documentation](./deploy-sprint-3.md#step-4-backend-setup).**

---

### Step 7: Update Frontend Configuration

```bash
cd /var/www/awtc/frontend

# Edit production environment file
nano .env.production
```

**Update to use HTTPS URLs:**

```env
# **UPDATED FOR SPRINT 4**: Use HTTPS URLs
VITE_API_URL=https://awilltochange.me
VITE_IMAGE_URL=https://awilltochange.me/images

# Push Notifications Public Key - **NEW IN SPRINT 4**
VITE_VAPID_PUBLIC_KEY=BMtR0EhYYntcSbWAufPurSBqwg6Kb-Qu7rG0WloxOklWahtQbOKl0fWIn92FnK6seN_pXacy6Bw1gz0YshOyi1Y
```

**Rebuild frontend:**

```bash
npm run build

# Verify build
ls -la dist/
```

---

### Step 8: Restart Applications

**Restart PM2 processes** to apply new environment variables:

```bash
# Restart backend
pm2 restart awtc-backend

# Restart frontend
pm2 restart awtc-frontend

# Verify status
pm2 status
```

**Note**: If you haven't set up PM2 yet, refer to [Sprint 3 - Step 8](./deploy-sprint-3.md#step-8-start-applications-with-pm2).

---

### Step 9: Configure SSL Auto-Renewal

Let's Encrypt certificates expire after 90 days. Set up automatic renewal:

```bash
# Test renewal process
sudo certbot renew --dry-run

# Certbot automatically creates a systemd timer for renewal
# Verify it's active
sudo systemctl status certbot.timer

# Manual renewal (if needed)
sudo certbot renew

# Reload Nginx after renewal
sudo systemctl reload nginx
```

---

### Step 10: Verify Deployment

**Check PM2 processes:**

```bash
pm2 status
pm2 logs
```

**Check Nginx:**

```bash
sudo systemctl status nginx
sudo nginx -t
```

**Test URLs:**
- Frontend: https://awilltochange.me
- API Health: https://awilltochange.me/api/health (if you have this endpoint)
- Admin: https://awilltochange.me/admin/
- API Docs: https://awilltochange.me/api-docs

**Test SSL Certificate:**
```bash
openssl s_client -connect awilltochange.me:443 -servername awilltochange.me
```

**Check SSL Grade:**
Visit: https://www.ssllabs.com/ssltest/analyze.html?d=awilltochange.me

---

## Push Notifications Setup

### VAPID Keys Generation

If you need to generate new VAPID keys:

```bash
cd /var/www/awtc/backend
npx web-push generate-vapid-keys
```

Copy the output to both:
- `backend/.env.production` (PUBLIC_KEY, PRIVATE_KEY, EMAIL)
- `frontend/.env.production` (PUBLIC_KEY only)

### Service Worker

The service worker is located at `frontend/public/sw.js`. It handles:
- Push notification reception
- Notification click events
- Background sync (if implemented)

**Important**: Service workers only work over HTTPS (or localhost).

---

## WebSocket/Socket.IO Configuration

### Backend Setup
Socket.IO is configured in `backend/config/socket.js`:
- Handles real-time messaging
- Tracks online users
- Sends push notifications to offline users

### Frontend Setup
Socket.IO client is used in:
- `frontend/src/pages/Messages.tsx`
- Automatically connects over wss:// in production

### Testing WebSocket
```bash
# Check WebSocket connection in browser console
# Should see: "Socket.IO connection established"
```

---


## Updating the Application

### Standard Update Process

```bash
# 1. Connect to server
ssh root@209.97.187.131

# 2. Navigate to project
cd /var/www/awtc

# 3. Pull latest changes
git pull origin main

# 4. Update backend
cd backend
npm install
NODE_ENV=production npx sequelize-cli db:migrate

# 5. Update frontend
cd ../frontend
npm install
npm run build

# 6. Restart applications
pm2 restart all

# 7. Verify
pm2 status
pm2 logs --lines 50
```

### Zero-Downtime Updates (Advanced)

```bash
# Use PM2 reload instead of restart
pm2 reload all
```

---

## Troubleshooting

### SSL Certificate Issues

```bash
# Check certificate expiration
sudo certbot certificates

# Test renewal
sudo certbot renew --dry-run

# Manual renewal if needed
sudo certbot renew
sudo systemctl reload nginx
```

### Nginx Not Starting

```bash
# Check configuration
sudo nginx -t

# View error logs
sudo tail -f /var/log/nginx/error.log

# Check if port 443 is in use
sudo lsof -i :443
```

### Application Won't Start

```bash
# Check PM2 logs
pm2 logs awtc-backend --lines 100
pm2 logs awtc-frontend --lines 100

# Restart individual process
pm2 restart awtc-backend

# Check process status
pm2 describe awtc-backend
```

### Push Notifications Not Working

```bash
# 1. Verify VAPID keys match in both .env files
# 2. Check service worker registration in browser console
# 3. Verify HTTPS is working (required for push notifications)
# 4. Check backend logs for subscription errors:
pm2 logs awtc-backend | grep -i "push\|vapid"
```

### WebSocket Connection Issues

```bash
# Check if Socket.IO is running
curl https://awilltochange.me/socket.io/?EIO=4&transport=polling

# Check Nginx WebSocket configuration
sudo nginx -t

# View real-time WebSocket logs
pm2 logs awtc-backend | grep -i "socket"
```

### Database Connection Errors

```bash
# Test database connection
mysql -h your-db-host -u doadmin -p -D db_awtc_production

# Check database credentials in .env.production
cat backend/.env.production | grep DB_
```

### Port Already in Use

```bash
# Check what's using port 8080
sudo lsof -i :8080

# Check what's using port 5173
sudo lsof -i :5173

# Kill process if needed
kill -9 <PID>

# Restart PM2
pm2 restart all
```

---

## Security Best Practices

### 1. Firewall Configuration

```bash
# Enable UFW firewall
sudo ufw enable

# Allow SSH
sudo ufw allow 22/tcp

# Allow HTTP (for Let's Encrypt challenges)
sudo ufw allow 80/tcp

# Allow HTTPS
sudo ufw allow 443/tcp

# Check status
sudo ufw status
```

### 2. Secure Environment Variables

```bash
# Restrict .env file permissions
chmod 600 /var/www/awtc/backend/.env.production
chmod 600 /var/www/awtc/frontend/.env.production
```

### 3. Regular Updates

```bash
# Update system packages weekly
sudo apt update && sudo apt upgrade -y

# Update Node.js packages monthly
cd /var/www/awtc/backend && npm update
cd /var/www/awtc/frontend && npm update
```

### 4. Backup Strategy

```bash
# Backup database (via DigitalOcean console or CLI)
# Backup uploaded images
tar -czf images-backup-$(date +%Y%m%d).tar.gz /var/www/awtc/backend/public/images/

# Backup configuration files
cp /etc/nginx/sites-available/awtc ~/nginx-backup-$(date +%Y%m%d).conf
cp /var/www/awtc/backend/.env.production ~/env-backup-$(date +%Y%m%d).env
```

---

## Monitoring & Logs

### PM2 Monitoring

```bash
# Real-time monitoring
pm2 monit

# View process details
pm2 describe awtc-backend
pm2 describe awtc-frontend

# View logs
pm2 logs
pm2 logs awtc-backend --lines 100
pm2 logs awtc-frontend --lines 100

# Clear logs
pm2 flush
```

### Nginx Logs

```bash
# Access logs
sudo tail -f /var/log/nginx/access.log

# Error logs
sudo tail -f /var/log/nginx/error.log

# Search for errors
sudo grep -i error /var/log/nginx/error.log
```

### System Monitoring

```bash
# Check disk space
df -h

# Check memory usage
free -h

# Check CPU usage
top

# Check network connections
sudo netstat -tlnp
```

---

## Rollback Procedure

If deployment fails or causes issues:

```bash
# 1. Stop applications
pm2 stop all

# 2. Revert to previous version
cd /var/www/awtc
git log --oneline -5  # Find previous commit
git checkout <previous-commit-hash>

# 3. Rebuild frontend
cd frontend
npm install
npm run build

# 4. Reinstall backend dependencies
cd ../backend
npm install

# 5. Rollback database migrations (if needed)
NODE_ENV=production npx sequelize-cli db:migrate:undo

# 6. Restart applications
pm2 restart all

# 7. Verify
pm2 logs
```

---

## Environment Variables Reference

### Backend (.env.production)

| Variable | Description | Example |
|----------|-------------|---------|
| `NODE_ENV` | Node environment | `production` |
| `PORT` | Backend port | `8080` |
| `FRONTEND_URL` | Frontend URL | `https://awilltochange.me` |
| `DB_HOST` | Database host | `db-host.ondigitalocean.com` |
| `DB_PORT` | Database port | `25060` |
| `DB_USER` | Database user | `doadmin` |
| `DB_PASSWORD` | Database password | `secure_password` |
| `DB_NAME` | Database name | `db_awtc_production` |
| `DB_SSL` | Use SSL for DB | `false` |
| `SESSION_SECRET` | Session encryption key | `random_secret_key` |
| `VAPID_PUBLIC_KEY` | Push notifications public key | `BMtR0E...` |
| `VAPID_PRIVATE_KEY` | Push notifications private key | `WHqGU...` |
| `VAPID_EMAIL` | Push notifications email | `admin@awilltochange.me` |

### Frontend (.env.production)

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_URL` | API base URL | `https://awilltochange.me` |
| `VITE_IMAGE_URL` | Images base URL | `https://awilltochange.me/images` |
| `VITE_VAPID_PUBLIC_KEY` | Push notifications public key | `BMtR0E...` |

---

## SSL Certificate Renewal Checklist

Let's Encrypt certificates expire every 90 days. Certbot handles renewal automatically, but verify:

- [ ] Certbot timer is active: `sudo systemctl status certbot.timer`
- [ ] Test renewal works: `sudo certbot renew --dry-run`
- [ ] Check certificate expiry: `sudo certbot certificates`
- [ ] Nginx reloads after renewal: Check logs in `/var/log/letsencrypt/`

**Manual renewal if needed:**
```bash
sudo certbot renew
sudo systemctl reload nginx
```

---

## Contact & Support

- **Project Repository**: https://github.com/Jeremy-Pacheco/AWTC
- **Documentation**: `/docs` folder in repository
- **Issue Tracker**: GitHub Issues

---

## Additional Resources

- [Let's Encrypt Documentation](https://letsencrypt.org/docs/)
- [Nginx Reverse Proxy Guide](https://docs.nginx.com/nginx/admin-guide/web-server/reverse-proxy/)
- [PM2 Documentation](https://pm2.keymetrics.io/)
- [DigitalOcean Deployment Guide](https://docs.digitalocean.com/)
- [Web Push Protocol](https://developers.google.com/web/fundamentals/push-notifications)
- [Socket.IO Documentation](https://socket.io/docs/v4/)
