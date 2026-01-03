# Quick Start Guide

## Get Up and Running in 5 Minutes

### 1. Backend Setup (2 minutes)

```bash
# Navigate to backend
cd deface-refactor

# Install dependencies
pip install -r requirements_complete.txt

# Create environment file
cp .env.example .env

# Edit .env and set SECRET_KEY
# For quick testing, the default SQLite is fine

# Start the API server
uvicorn api:app --reload --host 0.0.0.0 --port 8000
```

✅ Backend running at http://localhost:8000

### 2. Frontend Setup (2 minutes)

```bash
# Navigate to frontend (in new terminal)
cd deface-refactor/ui

# Install dependencies
npm install

# Start development server
npm run dev
```

✅ Frontend running at http://localhost:5173

### 3. Login (1 minute)

Open http://localhost:5173 in your browser

**Default credentials:**
- Username: `admin`
- Password: `admin123`

⚠️ **Change these immediately in production!**

## What's Working

### ✅ Real-Time Dashboard
- Live statistics updated every 5 seconds via WebSocket
- No manual refresh needed
- Automatic reconnection if connection drops

### ✅ URL-Based Navigation
- Each page has its own URL
- Refresh keeps you on the same page
- Shareable links work correctly

### ✅ Fully Functional Pages
1. **Dashboard** - Live stats and activity charts
2. **Servers** - Add, view, delete servers
3. **Activity** - Real-time activity log
4. **Backups** - Create and restore backups
5. **Alert Config** - Configure Telegram and email alerts
6. **Permissions** - User and role management
7. **Settings** - System configuration

## Quick Configuration

### Using MySQL (Optional)

```bash
# Install MySQL
sudo apt install mysql-server

# Create database
sudo mysql
CREATE DATABASE antidefacement;
CREATE USER 'antidef_user'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON antidefacement.* TO 'antidef_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;

# Update .env
DATABASE_URL=mysql+pymysql://antidef_user:your_password@localhost:3306/antidefacement

# Restart API server
```

See [MYSQL_SETUP.md](MYSQL_SETUP.md) for detailed MySQL configuration.

## Testing WebSocket Connection

Open browser console (F12) and check for:
```
WebSocket connected
Subscribed to topic: stats
Received real-time stats: {...}
```

## Common Issues

### Backend won't start
**Error**: "ModuleNotFoundError"
**Fix**: `pip install -r requirements_complete.txt`

**Error**: "SECRET_KEY environment variable is required"
**Fix**: Create `.env` file from `.env.example`

### Frontend won't connect
**Error**: "Network Error" or "Connection refused"
**Fix**: Ensure backend is running on port 8000

### WebSocket not connecting
**Check**: Backend logs should show "Background tasks started"
**Check**: Browser console should show "WebSocket connected"

## User Roles

### Admin
- Full access to everything
- Can add/remove users
- Can modify settings

### Operator
- Can manage servers and backups
- Cannot modify settings or users
- Can view all data

### Viewer
- Read-only access
- Can view dashboard and activity
- Cannot make any changes

## API Documentation

Visit http://localhost:8000/docs for interactive API documentation with:
- All available endpoints
- Request/response schemas
- Try it out functionality

## File Structure

```
deface-refactor/
├── api.py                      # Main API application
├── auth.py                     # Authentication & RBAC
├── database.py                 # Database models (NEW)
├── websocket_manager.py        # WebSocket connections (NEW)
├── requirements_complete.txt   # Python dependencies
├── .env                        # Environment configuration
├── MYSQL_SETUP.md             # MySQL guide (NEW)
├── CHANGES.md                 # Detailed changes (NEW)
└── ui/
    ├── src/
    │   ├── App.js             # Router setup (UPDATED)
    │   ├── context/
    │   │   └── DashboardContext.js  # Real-time updates (UPDATED)
    │   ├── pages/
    │   │   ├── BackupsPage.js       # Backup management (NEW)
    │   │   ├── AlertConfigPage.js   # Alert config (NEW)
    │   │   ├── PermissionsPage.js   # User management (NEW)
    │   │   └── SettingsPage.js      # System settings (NEW)
    │   └── services/
    │       └── websocket.js         # WebSocket client (NEW)
    └── package.json
```

## Next Steps

1. **Change default password** - Create new admin user
2. **Add a server** - Go to Servers → Add Server
3. **Configure alerts** - Go to Alert Config
4. **Set up MySQL** - For production (optional)
5. **Create backup schedule** - In Settings page

## Production Deployment

For production deployment:

1. Change SECRET_KEY to a strong random value
2. Use MySQL instead of SQLite
3. Set up HTTPS/SSL
4. Configure firewall rules
5. Set up automatic backups
6. Enable monitoring and logs
7. Review CORS settings

See README.md for detailed deployment instructions.

## Support

- 📖 Documentation: README.md, MYSQL_SETUP.md, CHANGES.md
- 🐛 Issues: GitHub Issues
- 💬 Questions: Check documentation first

## Verify Installation

Run these checks to verify everything is working:

```bash
# Check backend
curl http://localhost:8000/
# Should return: {"message":"Anti-Defacement API","version":"1.0.0",...}

# Check WebSocket
# Open http://localhost:5173 and check browser console
# Should see: "WebSocket connected"

# Check database
sqlite3 antidefacement.db ".tables"
# Should show: activity_logs, backups, servers, settings, users
```

All good? You're ready to monitor your servers! 🚀
