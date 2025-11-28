# 🚀 Deployment Guide on DigitalOcean

This guide explains how to deploy a project using **DigitalOcean Droplets**.
It includes droplet creation, server configuration, dependency installation, and application deployment.

---

## 📌 1. Creating the Droplet

1. Log in to **DigitalOcean**.
2. Go to **Droplets → Create Droplet**.
3. Select:
   - A **Region** for your server.
   - The **Operating System / environment** (e.g., Ubuntu).
   - A **Plan** (student accounts receive $200 in credits).
4. Finalize the configuration and create the **Droplet**.
![foto1](./doc-img/frontend-img/Foto1.png)
![foto2](./doc-img/frontend-img/Foto2.png)
![foto3](./doc-img/frontend-img/Foto3.png)
![foto4](./doc-img/frontend-img/Foto4.png)
![foto5](./doc-img/frontend-img/Foto5.png)
![foto6](./doc-img/frontend-img/Foto6.png)
---

## 📌 2. Droplet Configuration

### 🔹 Access the Droplet
You can access your droplet using:
![foto7](./doc-img/frontend-img/Foto7.png)
- The **DigitalOcean Console**
![foto8](./doc-img/frontend-img/Foto8.png)
- Install Node.js, npm and PM2
```bash
apt update & upgrade -y
apt install git nodejs
apt install npm
npm install pm2 -g
```
![foto9](./doc-img/frontend-img/Foto9.png)
![foto10](./doc-img/frontend-img/Foto10.png)
![foto11](./doc-img/frontend-img/Foto11.png)
![foto12](./doc-img/frontend-img/Foto12.png)
- Clone your repository
```bash
git clone <YOUR_REPOSITORY_URL>
cd <PROJECT_FOLDER>
npm install
```
![foto13](./doc-img/frontend-img/Foto13.png)
![foto14](./doc-img/frontend-img/Foto14.png)
![foto15](./doc-img/frontend-img/Foto15.png)
![foto15](./doc-img/frontend-img/Foto15.png)
![foto16](./doc-img/frontend-img/Foto16.png)
![foto17](./doc-img/frontend-img/Foto17.png)
- Viewing the Deployment
![foto18](./doc-img/frontend-img/Foto18.png)


