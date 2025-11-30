# Deploying the Backend to Railway  
*A complete step-by-step guide*

---

## 1. Introduction  
This document explains how to deploy the **backend** of your project to **Railway**, covering repository setup, environment variables, database configuration, and service deployment.  
Throughout the guide, you will find dedicated spaces where you can insert screenshots.

---

## 2. Prerequisites  

Before starting, ensure you have:

- A Railway account  
- A GitHub repository containing your backend code  
- A Railway project created  
- (Optional) A local `.env` file that will be migrated to Railway  

---

## 3. Creating a New Backend Service on Railway  

### Step 1 — Open your Railway project  

![Project Overview](./doc-img/projects.png)

### Step 2 — Add a New Service  
1. Click **“New”** → **“GitHub Repo”**  
2. Select your backend repository  
3. Railway will automatically detect the type of project (Node, Python, Java, etc.)

![Add New Service](./doc-img/service-proyect.png)

### Step 3 — Build & Deploy  
Railway will begin building your backend automatically using the project’s configuration files such as:

- `package.json` (Node)
- `Dockerfile`
- `requirements.txt` (Python)

![Build Logs](./doc-img/package-json.png)

---

## 4. Configuring Environment Variables  

Your backend likely requires environment variables such as database credentials, API keys, tokens, etc.

### Step 1 — Open the Variables Tab  
1. Go to your backend service  
2. Click **“Variables”**

![Env Variables](./doc-img/awtc-variables.png)

### Step 2 — Add Variables  
Add all variables manually or upload your `.env` file by dragging it into the variables area.

Typical examples:

```bash
PORT=3000
DATABASE_URL=mysql://user:password@host:port/dbname
JWT_SECRET=mysecretkey
```

---

## 5. Setting Up the Database (MySQL, Postgres, etc.)  

If your backend uses a database, Railway makes it simple to add one.

### Step 1 — Create a Database Service  
1. Click **“New”**  
2. Choose **MySQL**, **Postgres**, or any other DB you need

![Database Creation](./doc-img/add-database.png)

### Step 2 — Check Connection Details  
Railway provides:
- Host  
- Port  
- Username  
- Password  
- Database name  
- Connection URL  

![Database Credentials](./doc-img/mysql-variables.png)

### Step 3 — Link Backend to the Database  
Copy the **connection string** and paste it into your backend’s environment variables.

Example:

```bash
DATABASE_URL=mysql://root:password@containers-us-west-12.railway.app:5400/railway
```

---

## 6. Connecting Backend and Database Services  

Railway automatically links services when they belong to the same project.

You should see something similar to:

Insert image here:  
![Service Linking](./doc-img/connection-back-db.png)

If they aren’t linked:

1. Go to your backend service  
2. Select **“Settings”**  
3. Scroll to **“Service Connections”**  
4. Add a connection to the database service  

---

## 7. Deploying Updates  

Whenever you push changes to your GitHub repository:

- Railway will detect the commit  
- A new deployment will be triggered automatically  
- Logs will update in real time  

To redeploy manually:

1. Open your backend service  
2. Click **“Deploy” → “Redeploy Now”**

![Deployment Logs](./doc-img/deploy-redeploy.png)

---

## 8. Viewing Logs  

Logs are essential for debugging.

1. Open your backend service  
2. Click **“Logs”**  
3. Check build logs, runtime logs, and error logs  

![Logs Example](./doc-img/deploy-logs.png)

---

## 9. Testing Your Deployment  

After the backend is deployed:

1. Go to **“Settings”**  
2. Scroll to **“Domains”**  
3. Copy your public URL  

Use a tool such as Postman, Thunder Client, or your front-end to test the API.

```bash
https://awtc-production.up.railway.app/api/categories
```


![Public URL](./doc-img/categories-api.png)

---

## 10. Common Issues & Fixes  

### ❗ Build Fails  
- Check your runtime version (Node, Python, Java) in Railway build logs  
- Add an `engines` field (Node) or `runtime.txt` (Python)

### ❗ Database Connection Error  
- Ensure the DATABASE_URL variable is correct  
- Ensure the database service is running  
- Check if your ORM requires SSL (Prisma, Sequelize, etc.)

### ❗ Port Issues  
Railway expects your app to listen on:

```bash
process.env.PORT
```


Make sure your server uses this variable.

---

## 11. Conclusion  

By following these steps, your backend should now be fully deployed and running on Railway.  
You can always monitor logs, manage environment variables, scale services, and redeploy your application as needed.

---

