# HTTPS Configuration Guide - AWTC Project

## 📋 Table of Contents
1. [Local Development Setup](#local-development)
2. [Production Deployment (DigitalOcean)](#production-deployment)
3. [Testing HTTPS](#testing-https)
4. [Troubleshooting](#troubleshooting)

---

## 🔧 Local Development Setup

### Prerequisites
- OpenSSL installed on your system
- Node.js and npm
- Backend and frontend projects cloned

### Step 1: Generate SSL Certificates

Navigate to the backend directory and generate self-signed certificates:

```bash
cd backend
node scripts/generate-ssl-cert.js
```

This will create:
- `backend/ssl/key.pem` (private key)
- `backend/ssl/cert.pem` (certificate)

**Note:** These are self-signed certificates for development only. Your browser will show a security warning - this is normal.

### Step 2: Enable HTTPS in Environment Variables

**Backend** - Edit `backend/.env.development`:
```env
USE_HTTPS=true
PORT=8080
HTTPS_PORT=8443
FRONTEND_URL=https://localhost:5173
```

**Frontend** - Edit `frontend/.env.development`:
```env
VITE_API_URL=https://localhost:8443/api
VITE_USE_HTTPS=true
```

### Step 3: Start the Servers

**Backend:**
```bash
cd backend
npm start
```

The server will run on:
- HTTPS: https://localhost:8443
- HTTP: http://localhost:8080 (redirects to HTTPS)

**Frontend:**
```bash
cd frontend
npm run dev
```

The frontend will run on:
- HTTPS: https://localhost:5173

### Step 4: Accept Self-Signed Certificate

1. Open https://localhost:8443 in your browser
2. Click "Advanced" or "Show Details"
3. Click "Proceed to localhost" or "Accept Risk and Continue"
4. Repeat for https://localhost:5173

---

## 🚀 Production Deployment (DigitalOcean)

### Option A: Using Certbot (Let's Encrypt) - RECOMMENDED

#### Prerequisites
- Domain name pointed to your DigitalOcean droplet
- SSH access to your server

#### Step 1: Install Certbot

```bash
ssh root@your-server-ip

# Update system
apt update
apt upgrade -y

# Install Certbot and Nginx
apt install certbot python3-certbot-nginx nginx -y
```

#### Step 2: Configure Nginx as Reverse Proxy

Create Nginx configuration:

```bash
nano /etc/nginx/sites-available/awtc
```

Add this configuration:

```nginx
# HTTP server - redirects to HTTPS
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    # Let's Encrypt challenge
    location /.well-known/acme-challenge/ {
        root /var/www/html;
    }

    # Redirect all other traffic to HTTPS
    location / {
        return 301 https://$server_name$request_uri;
    }
}

# HTTPS server - Backend API
server {
    listen 443 ssl http2;
    server_name your-domain.com www.your-domain.com;

    # SSL certificates (will be configured by Certbot)
    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

    # SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers on;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # API proxy
    location /api {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # WebSocket support
    location /socket.io {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # Frontend static files
    location / {
        root /var/www/awtc/frontend/dist;
        try_files $uri $uri/ /index.html;
    }

    # Images
    location /images {
        alias /var/www/awtc/backend/public/images;
    }
}
```

#### Step 3: Enable Site and Obtain SSL Certificate

```bash
# Create symbolic link
ln -s /etc/nginx/sites-available/awtc /etc/nginx/sites-enabled/

# Test Nginx configuration
nginx -t

# Reload Nginx
systemctl reload nginx

# Obtain SSL certificate
certbot --nginx -d your-domain.com -d www.your-domain.com
```

Follow the prompts:
- Enter your email
- Agree to terms
- Choose to redirect HTTP to HTTPS (option 2)

#### Step 4: Configure Backend for Production

Edit `/var/www/awtc/backend/.env.production`:

```env
NODE_ENV=production
USE_HTTPS=false  # Nginx handles SSL, not Node.js
PORT=8080
FRONTEND_URL=https://your-domain.com
```

#### Step 5: Configure Frontend for Production

Edit `/var/www/awtc/frontend/.env.production`:

```env
VITE_API_URL=https://your-domain.com/api
VITE_USE_HTTPS=true
```

#### Step 6: Build and Deploy

```bash
# Backend
cd /var/www/awtc/backend
npm install --production
pm2 restart awtc-backend

# Frontend
cd /var/www/awtc/frontend
npm install
npm run build

# The dist folder will be served by Nginx
```

#### Step 7: Auto-Renewal Setup

Certbot automatically adds a cron job for renewal. Test it:

```bash
certbot renew --dry-run
```

---

### Option B: Using Cloudflare (Alternative)

If you're using Cloudflare:

1. **Point your domain to DigitalOcean droplet IP**
2. **Enable Cloudflare proxy (orange cloud)**
3. **In Cloudflare Dashboard:**
   - Go to SSL/TLS → Overview
   - Set encryption mode to "Full (strict)"
4. **On your server:**
   - Keep backend on HTTP (port 8080)
   - Cloudflare handles SSL/TLS
   - Configure Nginx similar to Option A but without SSL certificates

---

## 🧪 Testing HTTPS

### Local Testing

```bash
# Test backend HTTPS
curl -k https://localhost:8443/api/health

# Test frontend HTTPS
curl -k https://localhost:5173

# Test HTTP to HTTPS redirect
curl -I http://localhost:8080
# Should return: Location: https://localhost:8443
```

### Production Testing

```bash
# Test SSL certificate
openssl s_client -connect your-domain.com:443 -servername your-domain.com

# Test HTTPS response
curl -I https://your-domain.com

# Test HTTP redirect
curl -I http://your-domain.com
# Should return: Location: https://your-domain.com

# Check SSL rating
# Visit: https://www.ssllabs.com/ssltest/analyze.html?d=your-domain.com
```

---

## 🔍 Troubleshooting

### Issue: "Self-signed certificate" warning in browser

**Solution:**
- This is expected for local development
- Click "Advanced" → "Proceed to localhost"
- For production, use Let's Encrypt certificates

### Issue: "ERR_CERT_AUTHORITY_INVALID" in production

**Solution:**
- Verify Certbot installed certificates correctly
- Check certificate paths in Nginx config
- Run: `certbot certificates`

### Issue: Mixed content warnings

**Solution:**
- Ensure all API calls use HTTPS URLs
- Update `VITE_API_URL` to use https://
- Check browser console for specific resources

### Issue: WebSocket connection fails over HTTPS

**Solution:**
- Verify Nginx WebSocket proxy configuration
- Check that Socket.IO client uses `wss://` protocol
- Ensure Upgrade headers are set in Nginx

### Issue: Certificate renewal fails

**Solution:**
```bash
# Stop Nginx temporarily
systemctl stop nginx

# Renew certificate
certbot renew

# Start Nginx
systemctl start nginx
```

### Issue: Port 443 already in use

**Solution:**
```bash
# Check what's using port 443
sudo lsof -i :443

# Kill the process if needed
sudo kill -9 <PID>
```

---

## 📝 Security Best Practices

1. **Never commit SSL certificates to Git**
   - Add `ssl/` to `.gitignore`
   - Keep `.env` files secret

2. **Use environment variables for sensitive data**
   - API keys, database credentials, secrets

3. **Keep certificates updated**
   - Let's Encrypt certificates expire every 90 days
   - Certbot auto-renewal handles this

4. **Use strong SSL/TLS settings**
   - TLS 1.2+ only
   - Strong cipher suites
   - HSTS headers

5. **Monitor certificate expiry**
   ```bash
   # Check expiry date
   echo | openssl s_client -servername your-domain.com -connect your-domain.com:443 2>/dev/null | openssl x509 -noout -dates
   ```

---

## 📚 Additional Resources

- [Let's Encrypt Documentation](https://letsencrypt.org/docs/)
- [Nginx SSL Configuration](https://nginx.org/en/docs/http/configuring_https_servers.html)
- [Mozilla SSL Configuration Generator](https://ssl-config.mozilla.org/)
- [SSL Labs Server Test](https://www.ssllabs.com/ssltest/)

---

## ✅ Checklist for Submission

- [ ] SSL certificates generated for local development
- [ ] HTTPS working on localhost (both backend and frontend)
- [ ] HTTP redirects to HTTPS
- [ ] Production deployment uses Let's Encrypt
- [ ] All API calls use HTTPS
- [ ] WebSockets work over WSS
- [ ] Screenshots of HTTPS lock icon in browser
- [ ] SSL Labs test results (A or better)
- [ ] Documentation complete with setup steps
