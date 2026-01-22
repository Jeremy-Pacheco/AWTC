# Logs and Rotation Documentation

## Logging Strategy (Application Level)
We use **Winston** for structured logging and **Morgan** for HTTP request logging.

### Log Levels
- **Error**: Critical issues that require immediate attention (e.g., DB connection failure).
- **Warn**: Important events that are not errors (e.g., CORS blocks, 404s on critical routes).
- **Info**: General operational events (e.g., User login, Project creation).
- **HTTP**: All incoming HTTP requests (Method, URL, Status, Response Time).

### Log Storage
Logs are stored in the `backend/logs/` directory and are rotated daily:
- `error-YYYY-MM-DD.log`: Contains only error-level messages.
- `combined-YYYY-MM-DD.log`: Contains all log messages (Info, Warn, Error, HTTP).

### Implementation Details
- **Library**: `winston` + `winston-daily-rotate-file` + `morgan`
- **Format**: Timestamped and structured.
- **Integration**: Middleware in `index.js` captures all traffic.

## Log Rotation strategy

### 1. Application Files (Winston)
The application handles its own log file rotation using `winston-daily-rotate-file`.
- **Frequency**: Daily.
- **Max Size**: 20MB (Rotates if file exceeds this size in a single day).
- **Retention**: 14 days (Files older than 14 days are deleted).
- **Compression**: Enabled (Old logs are zipped).

### 2. System/Console Output (PM2)
We also use **pm2-logrotate** to manage the stdout/stderr output captured by PM2 (which mirrors what you see in `pm2 logs`).

#### Configuration for PM2
- **Max Size**: 10MB
- **Retention**: 30 files
- **Compression**: Enabled

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
ls -l
# Look for the file with today's date
tail -f combined-2026-01-22.log
```
