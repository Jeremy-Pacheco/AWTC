# Deployment - Sprint 3

## Overview

A Will To Change (AWTC) is deployed on **DigitalOcean** with both frontend and backend running on a single Droplet (VPS) managed by **PM2**. We use DigitalOcean's managed MySQL database for data storage and handle image uploads via Multer middleware.

### Deployment URLs
- **Frontend**: http://209.97.187.131:5173/
- **Backend API**: http://209.97.187.131:8080/
- **API Documentation**: http://209.97.187.131:8080/api-docs

---

## Deployment Architecture

### Infrastructure Stack
- **Hosting**: DigitalOcean Droplet (VPS)
- **Frontend**: React 19 + TypeScript with Vite
- **Backend**: Node.js + Express 5
- **Database**: DigitalOcean Managed MySQL
- **Process Manager**: PM2 for process management and auto-restart
- **Web Server**: Express (no separate nginx/apache needed)
- **File Storage**: Local filesystem (`backend/public/images/`)

### Application Architecture
- **Frontend**: React/TypeScript application running on port 5173
- **Backend**: Node.js/Express server running on port 8080
- **Database**: MySQL managed by DigitalOcean
- **Process Manager**: PM2 for managing and auto-restarting applications
- **Image Storage**: Backend `public/images` directory for project and user images

---

## Deployment Process

### Step 1: Initial Droplet Setup

Connect via SSH and update the system:

```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Install Node.js 18.x (or latest LTS)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install PM2 globally
sudo npm install -g pm2

# Install Git
sudo apt install -y git

# Create necessary directories
mkdir -p /var/www/awtc/public/images
mkdir -p /var/www/awtc/public/aboutUs
```

---

### Step 2: Clone the Repository

```bash
# Navigate to deployment directory
cd /var/www

# Clone the AWTC repository
git clone https://github.com/Jeremy-Pacheco/AWTC.git awtc
cd awtc
```

---

### Step 3: Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Build the frontend for production
npm run build
```

---

### Step 4: Backend Setup

```bash
cd ../backend

# Install dependencies
npm install

# Create .env.production file with environment variables
nano .env.production
```

**Add these environment variables to `.env.production`:**

```env
# Node Environment
NODE_ENV=production

# Server Configuration
PORT=8080
SESSION_NAME=awtc.sid
SESSION_SECRET=your_secure_session_secret

# Database Configuration
DB_HOST=your-db-cluster.db.ondigitalocean.com
DB_PORT=25060
DB_USER=doadmin
DB_PASSWORD=your_db_password
DB_NAME=db_awtc_production

# JWT Configuration (if using JWT authentication)
JWT_SECRET=your_jwt_secret_key

# CORS Configuration (adjust as needed)
ALLOWED_ORIGINS=http://209.97.187.131:5173,http://localhost:5173

```

---

### Step 5: Create Image Upload Directories

Ensure the directories for image uploads exist:

```bash
# From backend directory
mkdir -p public/images
mkdir -p public/aboutUs

# Set proper permissions
chmod -R 755 public/
```

---

### Step 6: Database Initialization

```bash
# From backend directory, run migrations
NODE_ENV=production npx sequelize-cli db:migrate

# Run seeders to populate initial data (categories, projects, etc.)
NODE_ENV=production npx sequelize-cli db:seed:all
```

---

### Step 7: Build Frontend for Production

```bash
# From frontend directory
npm run build

# Verify build output
ls -la dist/
```

---

### Step 8: Start Applications with PM2

**For the frontend (development/preview mode):**

```bash
cd /var/www/awtc/frontend
pm2 start "npm run dev -- --host 0.0.0.0" --name awtc-frontend
```

**For the backend:**

```bash
cd /var/www/awtc/backend
pm2 start "NODE_ENV=production node index.js" --name awtc-backend
```

**Save PM2 configuration and enable startup on reboot:**

```bash
# Save current PM2 configuration
pm2 save

# Enable PM2 to start on system reboot
sudo pm2 startup

# Run the command output from the previous command
# Example: sudo /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u ubuntu --hp /home/ubuntu
```

---

### Step 9: Verify Deployment

Check that both applications are running:

```bash
# List all PM2 processes
pm2 status

# View logs
pm2 logs awtc-backend
pm2 logs awtc-frontend
```

Both applications should show status **"online"** in the PM2 list.

**Test the application:**

- Frontend: `http://209.97.187.131:5173/`
- Backend: `http://209.97.187.131:8080`
- API Docs: `http://209.97.187.131:8080/api-docs`

---

## Database Schema & Migrations

The database is automatically initialized through Sequelize migrations. The current schema includes:

### Tables
- **Users**: User accounts with roles (Admin, Coordinator, Volunteer)
- **Projects**: Volunteer projects with details, images, and category
- **Categories**: Project categories
- **Reviews**: User reviews and ratings for projects
- **UserProjects**: Join table for user-project enrollments with status tracking
- **UserProjectBans**: Tracks banned users per project
- **Contacts**: Contact form submissions

### Migrations
All migrations are stored in `backend/migrations/`. Key migrations include:
- User profile management with image upload
- Project creation with categories and images
- Review system with images
- User-project relationship management
- User bans per project

---

## Authentication & Security

### Authentication Methods
- **Session-based**: For EJS dashboard views (server-side sessions)
- **JWT Bearer tokens**: For API endpoints (stateless)

### Security Features
- Password hashing with bcrypt
- Session cookies with httpOnly flag
- CORS configuration for allowed origins
- Role-based access control (RBAC)
- Environment variables for sensitive data

### Default Admin Credentials
Created automatically on first run:
- **Email**: admin@awtc.com
- **Password**: adminawtc1234

---

## Image Management

### Image Storage Structure

Images are stored in the backend's `public/images` directory:

- **Project Images**: Uploaded via project creation/edit form (`public/images/`)
- **User Profile Images**: Uploaded during user registration (`public/images/`)
- **About Us Images**: Static images placed in `public/aboutUs/`

### Upload Process

1. **Frontend**: User selects image file via form
2. **Multer Middleware**: Validates file type and size, stores in `public/images/`
3. **Database**: Stores filename reference in project/user/review record
4. **API Response**: Returns image URL for frontend display
5. **Frontend Display**: Accesses image at `http://209.97.187.131:8080/images/{filename}`

### Image Access
All images are accessible via: `http://209.97.187.131:8080/images/{filename}`

### Supported File Types
- Images: `.jpg`, `.jpeg`, `.png`, `.gif`
- Max file size: Configured in multer middleware

### File Organization

```
backend/
├── public/
│   ├── images/              # Project and user uploaded images
│   │   ├── image-1764348145705.jpg
│   │   ├── profile-user123.png
│   │   └── ...
│   └── aboutUs/             # Static About Us section images
│       ├── aboutUs.jpg
│       └── mision.jpg
└── routes/
    └── project.routes.js    # Handles image uploads
```

---

## Updating the Application

To update the code and restart applications:

```bash
# Navigate to project directory
cd /var/www/awtc

# Pull latest changes
git pull origin develop

# Update frontend
cd frontend
npm install
npm run build

# Update backend
cd ../backend
npm install

# Run any new migrations
NODE_ENV=production npx sequelize-cli db:migrate

# Restart all PM2 processes
pm2 restart all

# Verify status
pm2 status
```

---

## Troubleshooting

### Application won't start

```bash
# Check PM2 logs
pm2 logs awtc-backend
pm2 logs awtc-frontend

# Manually test backend
cd backend
NODE_ENV=production node index.js
```

### Database connection issues

```bash
# Verify database credentials in .env.production
# Test connection
mysql -h your-db-host -u doadmin -p -D db_awtc_production
```

### Image upload fails

```bash
# Check directory permissions
ls -la backend/public/
ls -la backend/public/images/

# Fix permissions if needed
chmod -R 755 backend/public/
```

### Port already in use

```bash
# Kill process on port 8080 or 5173
lsof -i :8080
kill -9 <PID>

# Restart PM2
pm2 restart all
```

---

## Rollback Process

If something goes wrong after deployment:

```bash
# Stop applications
pm2 stop all

# Revert to previous commit
git revert HEAD

# Reinstall dependencies if needed
cd frontend && npm install && npm run build
cd ../backend && npm install

# Restart applications
pm2 start all

# Verify
pm2 status
```

---

## Monitoring

Keep applications running smoothly:

```bash
# View real-time logs
pm2 monit

# Save PM2 process list
pm2 save

# Check system resources
pm2 web  # Opens dashboard on http://localhost:9615

# View specific process logs
pm2 logs awtc-backend --lines 50
pm2 logs awtc-frontend --lines 50
```

---

## Maintenance & Best Practices

### Regular Maintenance
1. **Monitor disk space** for uploaded images
2. **Check database backups** through DigitalOcean console
3. **Review PM2 logs** regularly for errors
4. **Update dependencies** periodically (test in dev first)
5. **Backup database** before major updates

### Performance Optimization
- Use CDN for static assets (optional)
- Implement image compression for uploads
- Cache frequently accessed data
- Monitor database query performance

### Security Best Practices
- Keep environment variables secure
- Rotate session secrets periodically
- Use strong database passwords
- Enable HTTPS in production (use reverse proxy like Nginx)
- Implement rate limiting for API endpoints
- Validate all user inputs on backend

---

## Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `NODE_ENV` | Node environment | `production` |
| `PORT` | Backend server port | `8080` |
| `DB_HOST` | Database host | `db.example.com` |
| `DB_USER` | Database user | `doadmin` |
| `DB_PASSWORD` | Database password | `secure_password` |
| `DB_NAME` | Database name | `db_awtc_production` |
| `JWT_SECRET` | JWT signing secret | `your_secret_key` |
| `SESSION_SECRET` | Session encryption secret | `your_session_secret` |

---

## Additional Resources

- [PM2 Documentation](https://pm2.keymetrics.io/)
- [DigitalOcean Deployment Guide](https://docs.digitalocean.com/)
- [Sequelize CLI Documentation](https://sequelize.org/docs/v6/cli/)
- [Multer File Upload Documentation](https://expressjs.com/en/resources/middleware/multer.html)

---

**Last Updated**: November 30, 2025  
**Project**: A Will To Change (AWTC)  
**Sprint**: 3
**Deployment Status**: ✅ Active on DigitalOcean
