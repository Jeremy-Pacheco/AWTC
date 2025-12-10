module.exports = {
  apps: [
    {
      name: "awtc-backend",
      script: "index.js",
      env: {
        NODE_ENV: "production",
        PORT: 8080
      },
      instances: 1,
      exec_mode: "fork",
      autorestart: true,
      watch: false,
      max_memory_restart: "1G"
    },
    {
      name: "awtc-dns",
      script: "dns-server/dns-server.js",
      env: {
        DNS_PORT: 5454
      },
      instances: 1,
      exec_mode: "fork",
      autorestart: true,
      watch: false,
      max_memory_restart: "512M"
    },
    {
      name: "awtc-frontend",
      cwd: "../frontend",
      script: "npm",
      args: "start",
      env: {
        PORT: 3000
      },
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "512M"
    }
  ]
};
