# Propela Deployment Guide

## Production Deployment on Linux VPS

This guide covers deploying Propela to a Linux VPS environment (Ubuntu 20.04+).

### Prerequisites

- Ubuntu 20.04 or newer
- 2GB RAM minimum (4GB recommended)
- 20GB storage
- Node.js 18+
- Git
- Nginx (for reverse proxy)
- PM2 (for process management)
- SSL Certificate (Let's Encrypt recommended)

### Step 1: Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install Nginx
sudo apt install -y nginx

# Install PM2 globally
sudo npm install -g pm2

# Create application directory
sudo mkdir -p /var/www/propela
sudo chown -R $USER:$USER /var/www/propela
```

### Step 2: Clone and Setup Application

```bash
cd /var/www/propela
git clone <your-repo-url> .

# Create .env file with your configuration
cp .env.example .env
# Edit .env with your settings:
nano .env
```

### Step 3: Install Dependencies

```bash
# Install server dependencies
npm install

# Install frontend dependencies and build
cd frontend
npm install
npm run build
cd ..

# Copy built frontend to public directory
mkdir -p public
cp -r frontend/dist/* public/
```

### Step 4: Database Setup

```bash
# The database will be automatically created on first run
# To test the connection:
node -e "import('./server/db.js').then(m => m.initializeDatabase())"
```

### Step 5: Nginx Configuration

```bash
# Create Nginx configuration
sudo tee /etc/nginx/sites-available/propela > /dev/null <<EOF
server {
    listen 80;
    server_name your-domain.com;

    # Redirect HTTP to HTTPS
    return 301 https://\$server_name\$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;

    # SSL Certificate (using Let's Encrypt)
    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

    # SSL Configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # Security Headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "SAMEORIGIN" always;

    # Root directory for static files
    root /var/www/propela/public;

    # API Proxy
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    # Serve static files
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # SPA fallback
    location / {
        try_files \$uri \$uri/ /index.html;
    }
}
EOF

# Enable site
sudo ln -s /etc/nginx/sites-available/propela /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default

# Test Nginx configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

### Step 6: SSL Certificate Setup (Let's Encrypt)

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Generate certificate
sudo certbot certonly --standalone -d your-domain.com

# Auto-renewal
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer
```

### Step 7: Setup PM2 for Process Management

```bash
cd /var/www/propela

# Create ecosystem.config.js
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [
    {
      name: 'propela-api',
      script: './server/index.js',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 5000
      },
      error_file: '/var/log/propela/error.log',
      out_file: '/var/log/propela/out.log',
      log_file: '/var/log/propela/combined.log',
      time_format: 'YYYY-MM-DD HH:mm:ss Z'
    }
  ]
};
EOF

# Create log directory
mkdir -p /var/log/propela
sudo chown -R $USER:$USER /var/log/propela

# Start with PM2
pm2 start ecosystem.config.js

# Save PM2 startup script
pm2 startup systemd -u $USER --hp /home/$USER
pm2 save
```

### Step 8: Firewall Configuration

```bash
# Enable UFW
sudo ufw enable

# Allow SSH
sudo ufw allow 22/tcp

# Allow HTTP and HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Check status
sudo ufw status
```

### Step 9: Monitoring and Logs

```bash
# View PM2 logs
pm2 logs propela-api

# Monitor with PM2 Dashboard (optional)
pm2 monit

# View Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### Step 10: Backup Strategy

```bash
# Create backup script
cat > /var/www/propela/backup.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/backups/propela"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# Backup database
cp /var/www/propela/propela.db $BACKUP_DIR/propela_$TIMESTAMP.db

# Keep only last 7 backups
find $BACKUP_DIR -name "propela_*.db" -mtime +7 -delete

echo "Backup completed: $BACKUP_DIR/propela_$TIMESTAMP.db"
EOF

# Make executable
chmod +x /var/www/propela/backup.sh

# Add to crontab (daily at 2 AM)
(crontab -l 2>/dev/null; echo "0 2 * * * /var/www/propela/backup.sh") | crontab -
```

### Maintenance Commands

```bash
# Restart application
pm2 restart propela-api

# Rebuild frontend
cd /var/www/propela/frontend
npm run build
cp -r dist/* ../public/

# View application status
pm2 status

# Stop application
pm2 stop propela-api

# Update application
cd /var/www/propela
git pull origin main
npm install
cd frontend && npm install && npm run build && cd ..
cp -r frontend/dist/* public/
pm2 restart propela-api
```

## Environment Variables

Create `.env` file in root directory:

```
PORT=5000
JWT_SECRET=your-long-random-secret-key
NODE_ENV=production
GOOGLE_MAPS_API_KEY=your-api-key-optional
DATABASE_URL=sqlite:./propela.db
```

## Docker Deployment (Alternative)

Create `Dockerfile`:

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Build frontend
COPY frontend/ ./frontend/
WORKDIR /app/frontend
RUN npm install && npm run build

# Setup backend
WORKDIR /app
COPY server/ ./server/

# Expose port
EXPOSE 5000

# Start application
CMD ["node", "server/index.js"]
```

Build and run:

```bash
docker build -t propela:latest .
docker run -p 5000:5000 -v /path/to/db:/app/data propela:latest
```

## Troubleshooting

**Port 5000 already in use:**
```bash
lsof -i :5000
kill -9 <PID>
```

**Database locked:**
```bash
rm /var/www/propela/propela.db
pm2 restart propela-api
```

**High memory usage:**
```bash
pm2 kill
pm2 start ecosystem.config.js
```

**SSL certificate issues:**
```bash
sudo certbot renew --dry-run
sudo certbot renew
```

## Performance Optimization

1. **Enable compression:** Add `gzip on;` to Nginx config
2. **Use CDN:** Serve static assets from CloudFlare
3. **Database optimization:** Use PostgreSQL instead of SQLite
4. **Caching:** Implement Redis for session management
5. **Monitoring:** Setup Datadog or New Relic

## Support

For issues, check logs:
```bash
pm2 logs propela-api
tail -f /var/log/nginx/error.log
```

Contact support@propela.com for assistance.
