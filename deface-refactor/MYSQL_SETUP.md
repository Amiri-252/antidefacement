# MySQL Database Setup Guide

This guide explains how to set up and use MySQL as the database for the Anti-Defacement Monitoring System.

## Why MySQL?

MySQL offers several advantages over SQLite for production deployments:

- **Better concurrency**: Handle multiple simultaneous connections
- **Scalability**: Supports larger datasets and more users
- **Reliability**: Better data integrity and backup options
- **Performance**: Optimized for production workloads
- **User management**: Built-in authentication and access control

## Prerequisites

- MySQL Server 5.7+ or MariaDB 10.3+
- Python 3.8+
- Root or administrative access to MySQL

## Installation

### 1. Install MySQL Server

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

## Database Setup

### 1. Create Database and User

Login to MySQL as root:
```bash
sudo mysql -u root -p
```

Create the database and user:
```sql
-- Create database
CREATE DATABASE antidefacement CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create user (change password!)
CREATE USER 'antidef_user'@'localhost' IDENTIFIED BY 'your_secure_password';

-- Grant privileges
GRANT ALL PRIVILEGES ON antidefacement.* TO 'antidef_user'@'localhost';

-- Apply changes
FLUSH PRIVILEGES;

-- Verify
SHOW GRANTS FOR 'antidef_user'@'localhost';

-- Exit
EXIT;
```

### 2. Configure Application

Edit your `.env` file:
```bash
cp .env.example .env
nano .env
```

Update the DATABASE_URL:
```env
DATABASE_URL=mysql+pymysql://antidef_user:your_secure_password@localhost:3306/antidefacement
```

### 3. Install Python Dependencies

```bash
pip install -r requirements_complete.txt
```

This will install:
- `sqlalchemy` - ORM for database operations
- `pymysql` - MySQL driver for Python
- `alembic` - Database migration tool

### 4. Initialize Database Tables

The application will automatically create tables on first run. To verify:

```bash
# Start the API server
uvicorn api:app --reload

# Check logs for "Database initialized: MySQL"
```

Or manually verify in MySQL:
```bash
mysql -u antidef_user -p antidefacement
```

```sql
SHOW TABLES;
```

You should see:
- `servers`
- `settings`
- `activity_logs`
- `backups`
- `users` (from auth module)

## Migration from SQLite

If you have existing data in SQLite, you can migrate it to MySQL:

### Option 1: Using Export/Import

```bash
# Export from SQLite
sqlite3 antidefacement.db .dump > backup.sql

# Import to MySQL (requires manual adjustments)
mysql -u antidef_user -p antidefacement < backup.sql
```

### Option 2: Using Python Script

Create a migration script:

```python
#!/usr/bin/env python3
import sqlite3
import pymysql
from database import get_db_manager, Server, Setting

# Connect to SQLite
sqlite_conn = sqlite3.connect('antidefacement.db')
sqlite_cursor = sqlite_conn.cursor()

# Connect to MySQL using the new database module
db_manager = get_db_manager()
db = db_manager.get_session()

# Migrate servers
sqlite_cursor.execute("SELECT * FROM servers")
for row in sqlite_cursor.fetchall():
    server = Server(
        id=row[0],
        name=row[1],
        host=row[2],
        port=row[3],
        username=row[4],
        password=row[5],
        key_path=row[6],
        path=row[7],
        mode=row[8],
        backup_path=row[9],
        interval=row[10],
        status=row[11]
    )
    db.add(server)

db.commit()
db.close()
sqlite_conn.close()
print("Migration completed!")
```

## Performance Tuning

### MySQL Configuration

Edit MySQL configuration file (`/etc/mysql/my.cnf` or `/etc/my.cnf`):

```ini
[mysqld]
# Connection pool
max_connections = 100
thread_cache_size = 8

# Buffer sizes
innodb_buffer_pool_size = 256M
query_cache_size = 32M

# Logging
slow_query_log = 1
slow_query_log_file = /var/log/mysql/slow-query.log
long_query_time = 2
```

Restart MySQL:
```bash
sudo systemctl restart mysql
```

### Application Configuration

In your application, adjust connection pool settings if needed:

```python
# In database.py
engine = create_engine(
    db_url,
    pool_size=10,
    max_overflow=20,
    pool_pre_ping=True,
    pool_recycle=3600
)
```

## Backup and Restore

### Backup

**Full backup:**
```bash
mysqldump -u antidef_user -p antidefacement > backup_$(date +%Y%m%d).sql
```

**Backup with compression:**
```bash
mysqldump -u antidef_user -p antidefacement | gzip > backup_$(date +%Y%m%d).sql.gz
```

**Automated daily backups (cron):**
```bash
# Edit crontab
crontab -e

# Add this line for daily backup at 2 AM
0 2 * * * mysqldump -u antidef_user -pYOUR_PASSWORD antidefacement | gzip > /backup/antidef_$(date +\%Y\%m\%d).sql.gz
```

### Restore

```bash
# From SQL file
mysql -u antidef_user -p antidefacement < backup.sql

# From compressed file
gunzip < backup.sql.gz | mysql -u antidef_user -p antidefacement
```

## Monitoring

### Check Database Status

```sql
SHOW STATUS LIKE 'Threads_connected';
SHOW STATUS LIKE 'Questions';
SHOW PROCESSLIST;
```

### View Table Sizes

```sql
SELECT 
    table_name AS 'Table',
    ROUND(((data_length + index_length) / 1024 / 1024), 2) AS 'Size (MB)'
FROM information_schema.TABLES
WHERE table_schema = 'antidefacement'
ORDER BY (data_length + index_length) DESC;
```

## Troubleshooting

### Connection Issues

**Error: "Can't connect to MySQL server"**
- Check if MySQL is running: `sudo systemctl status mysql`
- Verify credentials in `.env` file
- Check firewall rules
- Ensure user has proper permissions

**Error: "Access denied for user"**
```sql
-- Login as root
mysql -u root -p

-- Fix permissions
GRANT ALL PRIVILEGES ON antidefacement.* TO 'antidef_user'@'localhost';
FLUSH PRIVILEGES;
```

### Performance Issues

**Slow queries:**
- Enable slow query log
- Analyze queries with `EXPLAIN`
- Add indexes to frequently queried columns
- Increase buffer pool size

**Too many connections:**
- Increase `max_connections` in MySQL config
- Implement connection pooling in application
- Check for connection leaks

### Data Integrity

**Check for corrupted tables:**
```sql
CHECK TABLE servers;
CHECK TABLE activity_logs;
```

**Repair corrupted tables:**
```sql
REPAIR TABLE servers;
```

## Security Best Practices

1. **Use strong passwords**: Generate with `openssl rand -base64 32`
2. **Limit user privileges**: Grant only necessary permissions
3. **Enable SSL/TLS**: Encrypt connections between app and database
4. **Regular updates**: Keep MySQL updated with security patches
5. **Firewall rules**: Restrict database access to application server only
6. **Regular backups**: Automate and test backup restoration
7. **Audit logging**: Enable MySQL audit plugin for compliance

## Remote Access (Optional)

If you need to access MySQL from a remote server:

```sql
-- Create user for remote access
CREATE USER 'antidef_user'@'%' IDENTIFIED BY 'your_secure_password';
GRANT ALL PRIVILEGES ON antidefacement.* TO 'antidef_user'@'%';
FLUSH PRIVILEGES;
```

Edit MySQL config to allow remote connections:
```ini
[mysqld]
bind-address = 0.0.0.0
```

Update firewall:
```bash
sudo ufw allow 3306/tcp
```

Update DATABASE_URL in `.env`:
```env
DATABASE_URL=mysql+pymysql://antidef_user:password@remote_host:3306/antidefacement
```

## Support

For issues or questions:
- Check MySQL error log: `/var/log/mysql/error.log`
- Application logs: Check uvicorn/FastAPI output
- MySQL documentation: https://dev.mysql.com/doc/
- PyMySQL documentation: https://pymysql.readthedocs.io/

