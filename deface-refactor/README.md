# Anti-Defacement Monitoring System

A comprehensive web-based monitoring system for detecting and preventing file system defacement attacks on servers with secure authentication and RBAC.

## Features

### 🔐 Security
- **JWT Authentication**: Secure token-based authentication
- **RBAC (Role-Based Access Control)**: Three user roles with different permissions
  - **Admin**: Full system access including user management and settings
  - **Operator**: Can manage servers and backups
  - **Viewer**: Read-only access to monitoring data
- **Password Hashing**: Bcrypt encryption for secure password storage
- **Secure API**: All endpoints protected with JWT tokens

### 📊 Monitoring
- Real-time file change detection
- Permission change monitoring
- Automatic backup and restore
- Multi-server management
- Alert system with multiple severity levels
- Real-time WebSocket updates for live charts
- Activity logging to database

### 💻 Modern UI
- Responsive React-based dashboard
- **Real-time statistics and charts** via WebSocket
- **URL-based routing** with React Router (no redirect on refresh)
- Clean and intuitive interface
- Role-based UI elements
- Fully functional pages:
  - Dashboard with live updates
  - Server management
  - Activity monitoring
  - **Backup management** (create, restore, view)
  - **Alert configuration** (email, Telegram)
  - **Permissions management** (user roles)
  - **General settings** (monitoring, Redis)

### 🗄️ Database
- **Production-ready MySQL**: Required database for all deployments
- **SQLAlchemy ORM**: Clean database operations with proper relationships
- **Centralized Activity Logging**: All events in single `activity_logs` table
- **Database Initialization Script**: Easy setup with `init_database.sql`
- **Optimized Performance**: Connection pooling and proper indexing

### 🔄 Monitoring Modes
- **Active Mode**: Real-time monitoring with automatic file restoration
- **Passive Mode**: Monitoring and alerting without automatic changes
- **UI Toggle**: Easy switch between modes per server
- **Visual Indicators**: Color-coded mode display on server cards

## Architecture

### Backend (FastAPI)
- RESTful API with JWT authentication
- MySQL database with centralized activity logging
- WebSocket support for real-time updates
- RBAC middleware for endpoint protection
- Modular architecture for easy extension

### Frontend (React)
- React Router for URL-based navigation
- Context-based state management
- Real-time updates via WebSocket
- Secure token storage
- Protected routes
- Role-based component rendering
- Active/Passive monitoring toggle per server

## Installation

### Prerequisites
- Python 3.8+
- Node.js 18+
- npm 9+
- **MySQL 5.7+ (REQUIRED)**

### Quick Start

See [SETUP_GUIDE.md](SETUP_GUIDE.md) for comprehensive step-by-step instructions.

### Backend Setup

1. **Set up MySQL Database:**
```bash
# Create database and initialize schema
mysql -u root -p < init_database.sql
```

2. Navigate to the backend directory:
```bash
cd deface-refactor
```

3. Install Python dependencies:
```bash
pip install -r requirements_complete.txt
```

4. Create environment configuration:
```bash
cp .env.example .env
# Edit .env and configure:
# - SECRET_KEY: Generate a strong random key (use: python -c "import secrets; print(secrets.token_urlsafe(32))")
# - DATABASE_URL: mysql+pymysql://user:password@localhost:3306/antidefacement
```

**For detailed MySQL setup**, see [MYSQL_SETUP.md](MYSQL_SETUP.md).

5. Start the API server:
```bash
uvicorn api:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at `http://localhost:8000`
API documentation: `http://localhost:8000/docs`
WebSocket endpoint: `ws://localhost:8000/ws`

### Frontend Setup

1. Navigate to the UI directory:
```bash
cd deface-refactor/ui
```

2. Install dependencies:
```bash
npm install
```

3. Create environment configuration:
```bash
cp .env.example .env
# Edit .env if needed
```

4. Start the development server:
```bash
npm run dev
```

The UI will be available at `http://localhost:5173`

## Default Credentials

**Username:** `admin`  
**Password:** `admin123`

**⚠️ Important:** Change the default password immediately after first login!

## User Roles

### Admin
- Full system access
- User management (create, delete users)
- Update system settings
- Delete servers
- All operator and viewer permissions

### Operator
- Add and manage servers
- Create and restore backups
- View all monitoring data
- Cannot delete servers or manage users

### Viewer
- Read-only access
- View dashboard statistics
- View alerts and activity
- View server information
- Cannot modify any data

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login and get JWT token
- `POST /api/auth/register` - Register new user (admin only)
- `GET /api/auth/me` - Get current user info
- `POST /api/auth/logout` - Logout

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics

### Servers
- `GET /api/servers` - List all servers
- `POST /api/servers` - Add new server (operator+)
- `GET /api/servers/{id}` - Get server details
- `DELETE /api/servers/{id}` - Delete server (admin only)

### Monitoring
- `GET /api/activity` - Get recent activity
- `GET /api/alerts` - Get alerts
- `GET /api/files` - Get file changes
- `GET /api/permissions` - Get permission changes

### Backups
- `GET /api/backups` - List backups
- `POST /api/backups` - Create backup (operator+)
- `POST /api/backups/{id}/restore` - Restore backup (operator+)

### Settings
- `GET /api/settings/alerts` - Get alert configuration
- `PUT /api/settings/alerts` - Update alert configuration (admin only)
- `GET /api/settings/general` - Get general settings
- `PUT /api/settings/general` - Update general settings (admin only)

### Server Monitoring
- `PUT /api/servers/{id}/mode` - Update server mode (active/passive) (operator+)

## Monitoring Modes

### Active Mode
- **Real-time monitoring** with automatic file restoration
- Continuously monitors file changes
- Automatically restores modified files from backup
- Best for **production environments**
- Requires backup path configuration
- Provides maximum protection

### Passive Mode
- **Monitoring and alerting only**
- Logs all file changes and permission modifications
- Sends alerts without modifying files
- Best for **development/staging environments**
- Good for initial testing and observation
- Lower resource usage

### Switching Modes
- Toggle mode from UI server card (green button = active, gray = passive)
- Use API endpoint: `PUT /api/servers/{id}/mode`
- Changes take effect immediately
- Mode persists across restarts

## Security Best Practices

1. **Change Default Credentials**: Immediately change the default admin password
2. **Secret Key**: Use a strong, random SECRET_KEY in production (`python -c "import secrets; print(secrets.token_urlsafe(32))"`)
3. **HTTPS**: Always use HTTPS in production (configure nginx or Apache as reverse proxy)
4. **CORS**: Configure CORS to allow only trusted domains in .env
5. **Token Expiry**: Tokens expire after 24 hours by default
6. **Database Security**: 
   - Use strong database passwords
   - Limit database user privileges
   - Enable MySQL SSL connections in production
7. **Firewall**: Restrict access to MySQL (port 3306) and API (port 8000) ports
8. **Regular Backups**: Regularly backup the MySQL database
9. **SSH Keys**: Use SSH keys instead of passwords for server monitoring
10. **Network Security**: Run on a secure, isolated network when possible

## Development

### Code Structure

```
deface-refactor/
├── api.py                  # Main FastAPI application
├── auth.py                 # Authentication & RBAC module
├── database.py             # MySQL database models and ORM
├── init_database.sql       # Database initialization script
├── core/                   # Core monitoring modules
├── ui/                     # React frontend
│   ├── src/
│   │   ├── components/     # UI components
│   │   ├── context/        # React contexts (Auth, Dashboard)
│   │   ├── pages/          # Page components
│   │   └── services/       # API service layer (real backend integration)
├── requirements_complete.txt
├── .env.example
├── SETUP_GUIDE.md          # Detailed setup instructions
├── CHANGES_SUMMARY.md      # Summary of recent changes
└── MYSQL_SETUP.md          # MySQL-specific setup guide
```

### Frontend Development

```bash
cd ui
npm run dev      # Start dev server
npm run build    # Build for production
npm run lint     # Run linter
```

### Backend Development

```bash
# Run with auto-reload
uvicorn api:app --reload

# Run tests (if available)
pytest

# Format code
black .
```

## Troubleshooting

### CORS Errors
- Ensure frontend URL is in CORS_ORIGINS in backend .env
- Check browser console for specific CORS errors
- Default: `CORS_ORIGINS=http://localhost:3000,http://localhost:5173`

### Authentication Issues
- Clear browser localStorage and try again
- Check if backend is running and accessible at http://localhost:8000
- Verify token hasn't expired (24 hour default)
- Check backend logs for authentication errors

### Database Issues
- **Connection Error**: Check MySQL is running: `sudo systemctl status mysql`
- **Access Denied**: Verify DATABASE_URL credentials in .env
- **Missing Tables**: Run `mysql -u antidef_user -p antidefacement < init_database.sql`
- **Slow Queries**: Check MySQL slow query log
- **Connection Pool Exhausted**: Increase pool_size in database.py

### Server Monitoring Issues  
- **SSH Connection Failed**: Verify credentials, firewall rules, SSH port
- **Permission Denied**: Check SSH key permissions (chmod 600)
- **Mode Toggle Not Working**: Check backend logs, verify API endpoint is accessible

For detailed troubleshooting, see [SETUP_GUIDE.md](SETUP_GUIDE.md#troubleshooting)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - See LICENSE file for details

## Support

For issues and questions, please open an issue on the GitHub repository.
