# 🔐 HTTPS Setup - Quick Start Guide

## Local Development

### 1. Generate SSL Certificates

```bash
cd backend
npm run generate-ssl
```

### 2. Enable HTTPS

**Backend** - Edit `backend/.env.development`:
```env
USE_HTTPS=true
HTTPS_PORT=8443
FRONTEND_URL=https://localhost:5173
```

**Frontend** - Edit `frontend/.env.development`:
```env
VITE_API_URL=https://localhost:8443/api
VITE_USE_HTTPS=true
```

### 3. Start Servers

```bash
# Terminal 1 - Backend
cd backend
npm start

# Terminal 2 - Frontend
cd frontend
npm run dev
```

### 4. Access Application

- Frontend: https://localhost:5173
- Backend: https://localhost:8443
- Accept the self-signed certificate warning in your browser

**Note:** Click "Advanced" → "Proceed to localhost" when you see the security warning.

---

## Production Deployment (DigitalOcean)

### Quick Setup with Certbot

```bash
# 1. SSH to your server
ssh root@your-server-ip

# 2. Install Nginx and Certbot
apt update && apt install nginx certbot python3-certbot-nginx -y

# 3. Configure Nginx (see docs/https-configuration.md for full config)

# 4. Obtain SSL certificate
certbot --nginx -d your-domain.com

# 5. Update environment variables
# backend/.env.production:
USE_HTTPS=false  # Nginx handles SSL
PORT=8080

# frontend/.env.production:
VITE_API_URL=https://your-domain.com/api
```

---

## 📚 Full Documentation

See [docs/https-configuration.md](../docs/https-configuration.md) for:
- Detailed setup instructions
- Nginx configuration
- Troubleshooting guide
- Security best practices

---

## ✅ Verification Checklist

- [ ] SSL certificates generated locally
- [ ] HTTPS working on https://localhost:8443
- [ ] HTTPS working on https://localhost:5173
- [ ] HTTP redirects to HTTPS
- [ ] No mixed content warnings
- [ ] Browser shows lock icon 🔒
- [ ] Production uses Let's Encrypt certificates
- [ ] SSL Labs rating A or better

---

## 🚨 Security Notes

1. **Never commit certificates or private keys to Git**
2. **Use strong passwords for production**
3. **Keep certificates updated (auto-renewal enabled)**
4. **Use HTTPS in production always**
