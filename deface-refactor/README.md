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
- **Flexible database support**: SQLite (dev) or MySQL (production)
- **SQLAlchemy ORM**: Clean database operations
- **Activity logging**: All events stored in centralized database
- **Easy migration**: Tools and guides for moving to MySQL

## Architecture

### Backend (FastAPI)
- RESTful API with JWT authentication
- SQLite or MySQL database support for data persistence
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

## Installation

### Prerequisites
- Python 3.8+
- Node.js 18+
- npm 9+
- MySQL 5.7+ (optional, recommended for production)

### Backend Setup

1. Navigate to the backend directory:
```bash
cd deface-refactor
```

2. Install Python dependencies:
```bash
pip install -r requirements_complete.txt
```

3. Create environment configuration:
```bash
cp .env.example .env
# Edit .env and configure:
# - SECRET_KEY: Generate a strong random key
# - DATABASE_URL: Choose SQLite (default) or MySQL
```

**For MySQL setup**, see [MYSQL_SETUP.md](MYSQL_SETUP.md) for detailed instructions.

4. Start the API server:
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

## Security Best Practices

1. **Change Default Credentials**: Immediately change the default admin password
2. **Secret Key**: Use a strong, random SECRET_KEY in production
3. **HTTPS**: Always use HTTPS in production
4. **CORS**: Configure CORS to allow only trusted domains
5. **Token Expiry**: Tokens expire after 24 hours by default
6. **Database Backups**: Regularly backup the SQLite database

## Development

### Code Structure

```
deface-refactor/
├── api.py              # Main FastAPI application
├── auth.py             # Authentication & RBAC module
├── core/               # Core monitoring modules
├── ui/                 # React frontend
│   ├── src/
│   │   ├── components/ # UI components
│   │   ├── context/    # React contexts (Auth, Dashboard)
│   │   ├── pages/      # Page components
│   │   └── services/   # API service layer
├── requirements_complete.txt
└── .env.example
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

### Authentication Issues
- Clear browser localStorage and try again
- Check if backend is running and accessible
- Verify token hasn't expired

### Database Issues
- Delete antidefacement.db to reset database
- Check file permissions on database file

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
