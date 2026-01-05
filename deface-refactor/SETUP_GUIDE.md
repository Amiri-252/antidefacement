# Anti-Defacement System - Complete Setup Guide

This guide will help you set up the Anti-Defacement Monitoring System from scratch.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Database Setup](#database-setup)
3. [Backend Setup](#backend-setup)
4. [Frontend Setup](#frontend-setup)
5. [Running the System](#running-the-system)
6. [Configuration](#configuration)
7. [Troubleshooting](#troubleshooting)

## Prerequisites

### Required Software
- **Python 3.8 or higher**
- **Node.js 18 or higher**
- **MySQL 5.7+ or MariaDB 10.3+**
- **Git** (for cloning the repository)

### System Requirements
- Linux, macOS, or Windows with WSL2
- At least 2GB RAM
- 1GB free disk space

## Database Setup

### 1. Install MySQL

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install mysql-server
sudo systemctl start mysql
sudo systemctl enable mysql
```

**CentOS/RHEL:**
```bash
sudo yum install mysql-server
sudo systemctl start mysqld
sudo systemctl enable mysqld
```

**macOS:**
```bash
brew install mysql
brew services start mysql
```

### 2. Secure MySQL Installation

```bash
sudo mysql_secure_installation
```

Follow the prompts to:
- Set root password
- Remove anonymous users
- Disallow root login remotely
- Remove test database

### 3. Create Database and User

Login to MySQL as root:
```bash
sudo mysql -u root -p
```

Run the following SQL commands:
```sql
-- Create database
CREATE DATABASE antidefacement CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create user (replace 'your_secure_password' with a strong password)
CREATE USER 'antidef_user'@'localhost' IDENTIFIED BY 'your_secure_password';

-- Grant privileges
GRANT ALL PRIVILEGES ON antidefacement.* TO 'antidef_user'@'localhost';

-- Apply changes
FLUSH PRIVILEGES;

-- Exit
EXIT;
```

### 4. Initialize Database Schema

From the project directory:
```bash
cd deface-refactor
mysql -u antidef_user -p antidefacement < init_database.sql
```

Enter the password you created in step 3.

### 5. Verify Database Setup

```bash
mysql -u antidef_user -p antidefacement
```

Run verification queries:
```sql
SHOW TABLES;
SELECT COUNT(*) FROM users;
SELECT COUNT(*) FROM settings;
```

You should see 5 tables (servers, settings, activity_logs, backups, users) and some initial data.

## Backend Setup

### 1. Navigate to Backend Directory

```bash
cd deface-refactor
```

### 2. Create Virtual Environment (Recommended)

```bash
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### 3. Install Python Dependencies

```bash
pip install -r requirements_complete.txt
```

This will install:
- FastAPI - Web framework
- SQLAlchemy - Database ORM
- PyMySQL - MySQL driver
- Bcrypt - Password hashing
- python-jose - JWT tokens
- and other dependencies...

### 4. Configure Environment Variables

Copy the example environment file:
```bash
cp .env.example .env
```

Edit `.env` file:
```bash
nano .env  # or use your preferred editor
```

**Required configurations:**
```env
# Generate a secure secret key
SECRET_KEY=your_generated_secret_key_here

# Database connection (update with your password)
DATABASE_URL=mysql+pymysql://antidef_user:your_secure_password@localhost:3306/antidefacement

# Server settings
API_HOST=0.0.0.0
API_PORT=8000

# CORS origins (add your frontend URL)
CORS_ORIGINS=http://localhost:3000,http://localhost:5173
```

**Generate a secure SECRET_KEY:**
```bash
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

### 5. Test Backend Installation

```bash
# Run the API server
uvicorn api:app --reload --host 0.0.0.0 --port 8000
```

You should see:
```
INFO:     Started server process
INFO:     Waiting for application startup.
INFO:     Application startup complete.
INFO:     Uvicorn running on http://0.0.0.0:8000
```

Visit `http://localhost:8000/docs` to see the API documentation.

## Frontend Setup

### 1. Navigate to UI Directory

```bash
cd deface-refactor/ui
```

### 2. Install Node.js Dependencies

```bash
npm install
```

This will install:
- React - UI framework
- React Router - Navigation
- Recharts - Charts and graphs
- Lucide React - Icons
- Tailwind CSS - Styling

### 3. Configure Environment Variables

Create `.env` file in the `ui` directory:
```bash
nano .env
```

Add:
```env
VITE_API_URL=http://localhost:8000/api
```

### 4. Test Frontend Installation

```bash
npm run dev
```

You should see:
```
  VITE v4.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

Visit `http://localhost:5173` to see the UI.

## Running the System

### Start Backend

In terminal 1:
```bash
cd deface-refactor
source venv/bin/activate  # If using virtual environment
uvicorn api:app --reload --host 0.0.0.0 --port 8000
```

### Start Frontend

In terminal 2:
```bash
cd deface-refactor/ui
npm run dev
```

### Access the System

1. Open browser: `http://localhost:5173`
2. Login with default credentials:
   - **Username:** `admin`
   - **Password:** `admin123`
3. **IMPORTANT:** Change the default password immediately!

## Configuration

### Adding Your First Server

1. Login to the system
2. Navigate to "Servers" page
3. Click "Add Server"
4. Fill in server details:
   - **Name:** A friendly name for your server
   - **Host:** IP address or hostname
   - **Port:** SSH port (default: 22)
   - **Username:** SSH username
   - **Password or SSH Key:** Authentication credentials
   - **Path:** Directory to monitor (e.g., `/var/www/html`)
   - **Mode:** Choose "Active" or "Passive"
     - **Active:** Automatically restores files on change
     - **Passive:** Only monitors and alerts
   - **Backup Path:** Where to store backups
   - **Interval:** Monitoring interval in seconds

5. Click "Add Server"

### Monitoring Modes

**Active Mode:**
- Monitors file changes in real-time
- Automatically restores modified files from backup
- Best for production environments
- Requires backup path configuration

**Passive Mode:**
- Monitors and logs file changes
- Sends alerts but doesn't modify files
- Best for development/staging environments
- Good for initial testing

You can toggle between modes by clicking the mode button on each server card.

### Configuring Alerts

1. Navigate to "Alert Config" page
2. Configure notification channels:
   - **Telegram:** Add bot token and chat ID
   - **Email:** Configure SMTP settings
3. Set alert thresholds:
   - **Critical:** Immediate notification
   - **Warning:** After 3 occurrences
4. Click "Save Configuration"

## Troubleshooting

### Database Connection Issues

**Error: "Can't connect to MySQL server"**
```bash
# Check if MySQL is running
sudo systemctl status mysql

# Check credentials in .env file
cat .env | grep DATABASE_URL

# Test connection manually
mysql -u antidef_user -p antidefacement
```

**Error: "Access denied for user"**
```bash
# Reset user permissions
sudo mysql -u root -p

# In MySQL:
GRANT ALL PRIVILEGES ON antidefacement.* TO 'antidef_user'@'localhost';
FLUSH PRIVILEGES;
```

### Backend Issues

**Error: "Module not found"**
```bash
# Reinstall dependencies
pip install -r requirements_complete.txt
```

**Error: "Port 8000 already in use"**
```bash
# Kill existing process
lsof -ti:8000 | xargs kill -9

# Or use different port
uvicorn api:app --reload --host 0.0.0.0 --port 8001
```

### Frontend Issues

**Error: "Cannot connect to backend"**
- Check if backend is running on port 8000
- Verify VITE_API_URL in frontend .env file
- Check browser console for CORS errors

**Error: "npm install fails"**
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### SSH Connection Issues

**Error: "Permission denied (publickey)"**
- Ensure SSH key is in correct format
- Check SSH key permissions: `chmod 600 /path/to/key`
- Verify username and host are correct

**Error: "Connection timeout"**
- Check firewall rules
- Verify SSH port is correct
- Ensure target server is accessible

## Next Steps

1. **Change Default Password:** Login and update admin password
2. **Add Servers:** Configure your servers for monitoring
3. **Test Monitoring:** Make a test change to verify detection
4. **Configure Alerts:** Set up Telegram or email notifications
5. **Review Activity:** Check the Activity and Alerts pages
6. **Create Backups:** Use the Backups page to create initial backups

## Security Best Practices

1. **Strong Passwords:** Use strong, unique passwords
2. **Secure Keys:** Protect SSH keys with proper permissions
3. **HTTPS:** Use HTTPS in production (configure reverse proxy)
4. **Firewall:** Restrict access to API port
5. **Regular Updates:** Keep system and dependencies updated
6. **Backup Database:** Regular automated database backups
7. **Monitor Logs:** Review system logs regularly

## Getting Help

- Check logs: `tail -f /var/log/antidefacement.log`
- Backend logs: Check uvicorn console output
- Frontend logs: Check browser console (F12)
- Database logs: `/var/log/mysql/error.log`

For additional help, refer to:
- `README.md` - Overview and features
- `MYSQL_SETUP.md` - Detailed database setup
- `QUICK_START.md` - Quick start guide
- API Docs: `http://localhost:8000/docs`
