# Logs and Rotation Documentation

## Logging Strategy (Application Level)
We use **Winston** for structured logging and **Morgan** for HTTP request logging.

### Log Levels
- **Error**: Critical issues that require immediate attention (e.g., DB connection failure).
- **Warn**: Important events that are not errors (e.g., CORS blocks, 404s on critical routes).
- **Info**: General operational events (e.g., User login, Project creation).
- **HTTP**: All incoming HTTP requests (Method, URL, Status, Response Time).

### Log Storage
Logs are stored in the `backend/logs/` directory:
- `error.log`: Contains only error-level messages.
- `combined.log`: Contains all log messages (Info, Warn, Error, HTTP).

### Implementation Details
- **Library**: `winston` + `morgan`
- **Format**: Timestamped and structured.
- **Integration**: Middleware in `index.js` captures all traffic.

## Log Rotation (System Level)
To prevent log files from consuming all disk space, we use **pm2-logrotate**.

### Configuration
- **Max Size**: 10MB (Logs rotate when they reach this size).
- **Retention**: 30 files (Keep the last 30 rotated logs).
- **Interval**: Daily (Force rotation every day at midnight if size limit isn't reached).
- **Compression**: Enabled (Rotated logs are gzipped to save space).

### Commands used for setup
```bash
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 30
pm2 set pm2-logrotate:compress true
```

## Accessing Logs
Logs can be accessed directly via SSH or through PM2.

### Via PM2 (Real-time)
```bash
pm2 logs awtc-backend
```

### Via File System (Historical)
```bash
cd ~/AWTC/backend/logs
cat combined.log
```
