# VPS Setup Guide - Propela Application

Complete step-by-step guide to set up your application on a VPS from scratch.

## Prerequisites
- VPS with Linux (Ubuntu 20.04 or later recommended)
- SSH access to your VPS
- Root or sudo privileges

---

## Step 1: Connect to Your VPS

```bash
ssh root@your_vps_ip_address
# or
ssh username@your_vps_ip_address
```

---

## Step 2: Update System Packages

```bash
sudo apt update
sudo apt upgrade -y
```

---

## Step 3: Install Node.js and npm

```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs
node --version  # Verify installation
npm --version
```

---

## Step 4: Install MySQL Server

```bash
sudo apt install -y mysql-server

# Start MySQL
sudo systemctl start mysql
sudo systemctl enable mysql  # Auto-start on reboot

# Verify MySQL is running
sudo systemctl status mysql
```

---

## Step 5: Secure MySQL Setup

```bash
# Run MySQL security script
sudo mysql_secure_installation

# When prompted:
# - Validate password component: Press 'y' for yes
# - Password strength: Choose 'MEDIUM' (option 1)
# - Set root password: Choose a strong password and remember it
# - Remove anonymous users: 'y'
# - Disable remote root login: 'y'
# - Remove test database: 'y'
# - Reload privilege tables: 'y'
```

---

## Step 6: Create Database and User

```bash
# Login to MySQL (use password you just set)
mysql -u root -p

# Run these commands in MySQL:
```

```sql
-- Create database
CREATE DATABASE propela;

-- Create user (change 'propela_user' and 'strong_password' as needed)
CREATE USER 'propela_user'@'localhost' IDENTIFIED BY 'strong_password';

-- Grant privileges
GRANT ALL PRIVILEGES ON propela.* TO 'propela_user'@'localhost';

-- Apply changes
FLUSH PRIVILEGES;

-- Exit MySQL
EXIT;
```

---

## Step 7: Clone Your Repository

```bash
cd /home/username  # or your preferred directory
# or
cd /var/www

# Clone your repository (or upload files)
git clone https://github.com/yourusername/propela.git
cd propela
```

---

## Step 8: Setup Environment Variables

Create `.env` file in your project root:

```bash
nano .env
```

Copy and paste (update with your actual values):

```
# Server Configuration
PORT=5000
NODE_ENV=production
JWT_SECRET=your-very-secure-random-key-change-this-123456789

# MySQL Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USER=propela_user
DB_PASSWORD=strong_password
DB_NAME=propela

# Vibe Prospecting MCP (Optional - only if you use it)
VIBE_PROSPECTING_URL=https://vibeprospecting.explorium.ai/mcp
VIBE_PROSPECTING_API_KEY=your-api-key-if-needed
VIBE_CACHE_TTL_SECONDS=900

# Logging
LOG_LEVEL=info

# Frontend
VITE_API_URL=https://your-domain.com
```

Save file: `Ctrl+X`, then `Y`, then `Enter`

---

## Step 9: Install Dependencies

```bash
# Install root dependencies
npm install

# Install frontend dependencies
cd frontend
npm install
npm run build

# Go back to root
cd ..
```

---

## Step 10: Verify Database Connection

Test that the application can connect to the database:

```bash
npm run dev
```

You should see:
```
✅ MySQL Database initialized successfully
🚀 Propela Server running on http://localhost:5000
```

If you see database errors, check:
- `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD` in `.env`
- MySQL is running: `sudo systemctl status mysql`
- User has correct permissions

---

## Step 11: Setup PM2 for Process Management

```bash
# Install PM2 globally
sudo npm install -g pm2

# Create PM2 ecosystem config
nano ecosystem.config.js
```

Copy and paste:

```javascript
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
      error_file: './logs/error.log',
      out_file: './logs/out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      max_memory_restart: '1G'
    }
  ]
};
```

Save file: `Ctrl+X`, then `Y`, then `Enter`

---

## Step 12: Start Application with PM2

```bash
# Start application
pm2 start ecosystem.config.js

# Check status
pm2 status

# View logs
pm2 logs propela-api

# Setup auto-start on reboot
pm2 startup
# Copy and run the command it outputs
pm2 save
```

---

## Step 13: Setup Nginx as Reverse Proxy

```bash
sudo apt install -y nginx

# Create Nginx config
sudo nano /etc/nginx/sites-available/propela
```

Copy and paste (replace `your-domain.com`):

```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com www.your-domain.com;

    # SSL certificates (you'll add these in next step)
    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml;

    # Frontend static files
    location / {
        root /path/to/propela/frontend/dist;
        try_files $uri $uri/ /index.html;
    }

    # API proxy
    location /api/ {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Save file: `Ctrl+X`, then `Y`, then `Enter`

---

## Step 14: Enable Nginx Site

```bash
# Enable the site
sudo ln -s /etc/nginx/sites-available/propela /etc/nginx/sites-enabled/

# Test Nginx config
sudo nginx -t

# Start Nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

---

## Step 15: Setup SSL Certificate (Let's Encrypt)

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot certonly --nginx -d your-domain.com -d www.your-domain.com

# Auto-renew certificates
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer
```

---

## Step 16: Update Nginx with SSL Paths

Update the SSL paths in your Nginx config that Certbot provides:

```bash
sudo nano /etc/nginx/sites-available/propela
# Verify SSL paths are correct, then reload:

sudo systemctl reload nginx
```

---

## Step 17: Setup Firewall

```bash
sudo ufw allow 22/tcp   # SSH
sudo ufw allow 80/tcp   # HTTP
sudo ufw allow 443/tcp  # HTTPS
sudo ufw enable
sudo ufw status
```

---

## Step 18: Verify Everything Works

```bash
# Check PM2 status
pm2 status

# Check Nginx status
sudo systemctl status nginx

# Check MySQL status
sudo systemctl status mysql

# View API logs
pm2 logs propela-api

# Test API
curl https://your-domain.com/api/health
```

---

## Useful Commands

```bash
# PM2 commands
pm2 stop propela-api
pm2 start propela-api
pm2 restart propela-api
pm2 logs propela-api --lines 100

# MySQL commands
mysql -u propela_user -p propela  # Login to database
SHOW TABLES;  # List tables
SELECT COUNT(*) FROM users;  # Check users table

# Nginx commands
sudo systemctl restart nginx
sudo nginx -t  # Test config

# View system resources
free -h  # Memory usage
df -h   # Disk usage
top     # Running processes
```

---

## Troubleshooting

### Database Connection Error
```bash
# Check MySQL is running
sudo systemctl status mysql

# Check credentials
mysql -u propela_user -p -h localhost propela

# Check logs
pm2 logs propela-api
```

### Nginx Not Showing App
```bash
# Check frontend is built
ls frontend/dist/index.html

# Rebuild if needed
cd frontend && npm run build && cd ..

# Check Nginx config
sudo nginx -t
```

### Port Already in Use
```bash
# Find process using port 5000
sudo lsof -i :5000

# Kill process
sudo kill -9 <PID>
```

### SSL Certificate Issues
```bash
# Renew manually
sudo certbot renew --force-renewal

# Check certificate
sudo certbot certificates
```

---

## Final Checklist

- [ ] Node.js installed
- [ ] MySQL running and user created
- [ ] `.env` file configured
- [ ] Dependencies installed
- [ ] Database tables created (first run)
- [ ] Frontend built (`npm run build`)
- [ ] PM2 running the app
- [ ] Nginx configured and running
- [ ] SSL certificate installed
- [ ] Firewall enabled
- [ ] Domain pointing to VPS IP
- [ ] Can access https://your-domain.com

---

## Support

If you encounter issues:
1. Check PM2 logs: `pm2 logs propela-api`
2. Check Nginx error log: `sudo tail -f /var/log/nginx/error.log`
3. Check MySQL connection: `mysql -u propela_user -p propela`
4. Verify `.env` variables are correct
5. Check firewall rules: `sudo ufw status`

Good luck! 🚀
