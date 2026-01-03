#!/usr/bin/env python3
"""
FastAPI Backend for Anti-Defacement Dashboard with Authentication
استفاده: uvicorn api:app --reload --host 0.0.0.0 --port 8000
"""

from fastapi import FastAPI, HTTPException, BackgroundTasks, Depends, status, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime, timedelta
import json
import os
from pathlib import Path
import asyncio
import logging

# Import authentication module
from auth import (
    User, UserCreate, UserLogin, Token,
    authenticate_user, create_access_token,
    get_current_active_user, init_auth_database,
    require_admin, require_operator, require_viewer,
    create_user
)

# Import database module
from database import (
    get_db_manager, get_db,
    Server, Activity, Backup, Setting
)

# Import WebSocket manager
from websocket_manager import get_connection_manager

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Import modules from your existing project
try:
    from permission_monitoring import PermissionMonitor, SSHConfig as PermSSHConfig, MonitorConfig as PermMonitorConfig
    from ssh import FileOperationsMonitor, SSHConfig as FileSSHConfig, MonitorConfig as FileMonitorConfig
    from red import RedisConfig
except ImportError as e:
    print(f"Warning: Could not import some modules: {e}")

app = FastAPI(title="Anti-Defacement API", version="1.0.0")

# Initialize database
db_manager = get_db_manager()

# Initialize authentication database
init_auth_database()

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],  # Frontend URLs
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==================== Models ====================

class ServerCreate(BaseModel):
    name: str
    host: str
    port: int = 22
    username: str
    password: Optional[str] = None
    key_path: Optional[str] = None
    path: str
    mode: str = "passive"  # passive or active
    backup_path: Optional[str] = None
    interval: int = 1

class ServerResponse(BaseModel):
    id: int
    name: str
    host: str
    port: int
    path: str
    mode: str
    status: str
    changes: int
    alerts: int

class AlertConfigUpdate(BaseModel):
    telegram_token: Optional[str] = None
    telegram_chat_id: Optional[str] = None
    smtp_server: Optional[str] = None
    smtp_port: Optional[int] = None
    email_from: Optional[str] = None
    email_to: Optional[str] = None
    critical_threshold: str = "immediate"
    warning_threshold: str = "after_3"

class GeneralSettingsUpdate(BaseModel):
    monitoring_interval: int = 1
    default_mode: str = "active"
    redis_host: str = "localhost"
    redis_port: int = 6379
    redis_password: Optional[str] = None
    redis_enabled: bool = False
    log_retention_days: int = 30
    log_level: str = "INFO"

class ServerModeUpdate(BaseModel):
    mode: str  # "active" or "passive"

# ==================== Helper Functions ====================

def count_activity_records(db, server_id: int = None, time_filter: float = None) -> int:
    """Count activity records from centralized database"""
    try:
        from sqlalchemy import func
        query = db.query(func.count(Activity.id))
        
        if server_id:
            query = query.filter(Activity.server_id == server_id)
        if time_filter:
            query = query.filter(Activity.timestamp > time_filter)
        
        return query.scalar() or 0
    except Exception as e:
        logger.error(f"Error counting activity records: {e}")
        return 0

# ==================== API Endpoints ====================

@app.get("/")
async def root():
    return {
        "message": "Anti-Defacement API",
        "version": "1.0.0",
        "docs": "/docs",
        "status": "online"
    }

# ==================== Authentication Endpoints ====================

@app.post("/api/auth/login", response_model=Token)
async def login(user_login: UserLogin):
    """Login endpoint - returns JWT token"""
    user = authenticate_user(user_login.username, user_login.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token = create_access_token(
        data={"sub": user.username, "role": user.role}
    )
    
    return Token(
        access_token=access_token,
        token_type="bearer",
        user=User(
            id=user.id,
            username=user.username,
            email=user.email,
            full_name=user.full_name,
            role=user.role,
            disabled=user.disabled
        )
    )

@app.post("/api/auth/register", response_model=User, dependencies=[Depends(require_admin)])
async def register(user_data: UserCreate):
    """Register new user (admin only)"""
    return create_user(user_data)

@app.get("/api/auth/me", response_model=User)
async def get_me(current_user: User = Depends(get_current_active_user)):
    """Get current user info"""
    return current_user

@app.post("/api/auth/logout")
async def logout(current_user: User = Depends(get_current_active_user)):
    """Logout endpoint (token invalidation handled on client side)"""
    return {"message": "Successfully logged out"}

# ========== Dashboard Endpoints ==========

@app.get("/api/dashboard/stats", dependencies=[Depends(require_viewer)])
async def get_dashboard_stats(db: Session = Depends(get_db)):
    """Get dashboard statistics"""
    try:
        from sqlalchemy import func
        
        # Get total active servers
        total_servers = db.query(func.count(Server.id)).filter(Server.status == 'active').scalar() or 0
        
        # Active monitors = total servers * 3 (perm + file + restore)
        active_monitors = total_servers * 3 if total_servers > 0 else 0
        
        # Calculate alerts today from activity_logs
        today_start = datetime.now().replace(hour=0, minute=0, second=0).timestamp()
        alerts_today = count_activity_records(db, time_filter=today_start)
        
        # Calculate restored files (simplified - you can enhance this logic)
        restored_files = alerts_today // 2 if alerts_today > 0 else 0
        
        return {
            "totalServers": total_servers,
            "activeMonitors": active_monitors,
            "alertsToday": alerts_today,
            "restoredFiles": restored_files
        }
    except Exception as e:
        logger.error(f"Error getting dashboard stats: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# ========== Servers Endpoints ==========

@app.get("/api/servers", dependencies=[Depends(require_viewer)])
async def get_servers(db: Session = Depends(get_db)):
    """Get all servers"""
    try:
        servers = db.query(Server).all()
        
        result = []
        for server in servers:
            # Count changes and alerts from activity_logs
            changes = count_activity_records(db, server_id=server.id)
            alerts = changes  # For now, all changes are considered alerts
            
            result.append({
                "id": server.id,
                "name": server.name,
                "host": server.host,
                "ip": f"{server.host}:{server.port}",
                "port": server.port,
                "path": server.path,
                "mode": server.mode,
                "status": server.status,
                "changes": changes,
                "alerts": alerts
            })
        
        return result
    except Exception as e:
        logger.error(f"Error getting servers: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/servers", dependencies=[Depends(require_operator)])
async def add_server(server_data: ServerCreate, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    """Add a new server"""
    try:
        new_server = Server(
            name=server_data.name,
            host=server_data.host,
            port=server_data.port,
            username=server_data.username,
            password=server_data.password,
            key_path=server_data.key_path,
            path=server_data.path,
            mode=server_data.mode,
            backup_path=server_data.backup_path,
            interval=server_data.interval,
            status='active'
        )
        
        db.add(new_server)
        db.commit()
        db.refresh(new_server)
        
        # Start monitoring in background
        # background_tasks.add_task(start_monitoring_for_server, new_server.id)
        
        return {
            "id": new_server.id,
            "message": "Server added successfully",
            "server": server_data.dict()
        }
    except Exception as e:
        db.rollback()
        logger.error(f"Error adding server: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.put("/api/servers/{server_id}/mode", dependencies=[Depends(require_operator)])
async def update_server_mode(server_id: int, mode_update: ServerModeUpdate, db: Session = Depends(get_db)):
    """Update server monitoring mode (active/passive)"""
    try:
        server = db.query(Server).filter(Server.id == server_id).first()
        if not server:
            raise HTTPException(status_code=404, detail="Server not found")
        
        if mode_update.mode not in ["active", "passive"]:
            raise HTTPException(status_code=400, detail="Mode must be 'active' or 'passive'")
        
        server.mode = mode_update.mode
        db.commit()
        
        return {
            "message": f"Server mode updated to {mode_update.mode}",
            "server_id": server_id,
            "mode": mode_update.mode
        }
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Error updating server mode: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/api/servers/{server_id}", dependencies=[Depends(require_admin)])
async def delete_server(server_id: int, db: Session = Depends(get_db)):
    """Delete a server"""
    try:
        server = db.query(Server).filter(Server.id == server_id).first()
        if not server:
            raise HTTPException(status_code=404, detail="Server not found")
        
        db.delete(server)
        db.commit()
        
        return {"message": f"Server {server_id} deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Error deleting server: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/servers/{server_id}", dependencies=[Depends(require_viewer)])
async def get_server(server_id: int, db: Session = Depends(get_db)):
    """Get server details"""
    try:
        server = db.query(Server).filter(Server.id == server_id).first()
        if not server:
            raise HTTPException(status_code=404, detail="Server not found")
        
        return {
            "id": server.id,
            "name": server.name,
            "host": server.host,
            "port": server.port,
            "path": server.path,
            "mode": server.mode,
            "status": server.status
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting server: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# ========== Activity Endpoints ==========

@app.get("/api/activity", dependencies=[Depends(require_viewer)])
async def get_activity(limit: int = 50, db: Session = Depends(get_db)):
    """Get recent activity from all servers from centralized database"""
    try:
        # Query activities from the centralized activity_logs table
        activities = db.query(Activity).order_by(Activity.timestamp.desc()).limit(limit).all()
        
        result = []
        for activity in activities:
            activity_dict = {
                "timestamp": activity.timestamp,
                "server": activity.server_name,
                "type": activity.activity_type,
            }
            
            if activity.activity_type == "permission":
                activity_dict.update({
                    "change_type": activity.change_type,
                    "path": activity.path,
                    "details": f"{activity.old_value} → {activity.new_value}" if activity.old_value and activity.new_value else activity.details
                })
            elif activity.activity_type == "file":
                activity_dict.update({
                    "operation": activity.operation,
                    "src_path": activity.src_path,
                    "dst_path": activity.dst_path
                })
            
            result.append(activity_dict)
        
        return result
    except Exception as e:
        logger.error(f"Error getting activity: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# ========== Alerts Endpoints ==========

@app.get("/api/alerts", dependencies=[Depends(require_viewer)])
async def get_alerts(filter: str = "all", db: Session = Depends(get_db)):
    """Get alerts with optional filtering from centralized database"""
    try:
        # Get recent activities
        activities = db.query(Activity).order_by(Activity.timestamp.desc()).limit(100).all()
        
        # Transform activities into alerts
        alerts = []
        for activity in activities[:50]:
            severity = "critical" if activity.activity_type == "permission" else "warning"
            
            alerts.append({
                "time": datetime.fromtimestamp(activity.timestamp).strftime("%Y-%m-%d %H:%M:%S"),
                "server": activity.server_name,
                "type": activity.change_type or activity.operation or activity.activity_type,
                "severity": severity,
                "path": activity.path or activity.src_path
            })
        
        if filter != "all":
            alerts = [a for a in alerts if a["severity"] == filter]
        
        return alerts
    except Exception as e:
        logger.error(f"Error getting alerts: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# ========== File Changes Endpoints ==========

@app.get("/api/files", dependencies=[Depends(require_viewer)])
async def get_file_changes(server_id: Optional[int] = None, db: Session = Depends(get_db)):
    """Get file changes from centralized database"""
    try:
        query = db.query(Activity).filter(Activity.activity_type == 'file').order_by(Activity.timestamp.desc())
        
        if server_id:
            query = query.filter(Activity.server_id == server_id)
        
        activities = query.limit(50).all()
        
        file_changes = []
        for activity in activities:
            file_changes.append({
                "timestamp": datetime.fromtimestamp(activity.timestamp).strftime("%H:%M:%S"),
                "server": activity.server_name,
                "operation": activity.operation,
                "src_path": activity.src_path,
                "dst_path": activity.dst_path,
                "details": activity.details
            })
        
        return file_changes
    except Exception as e:
        logger.error(f"Error getting file changes: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# ========== Permission Changes Endpoints ==========

@app.get("/api/permissions", dependencies=[Depends(require_viewer)])
async def get_permission_changes(server_id: Optional[int] = None, db: Session = Depends(get_db)):
    """Get permission changes from centralized database"""
    try:
        query = db.query(Activity).filter(Activity.activity_type == 'permission').order_by(Activity.timestamp.desc())
        
        if server_id:
            query = query.filter(Activity.server_id == server_id)
        
        activities = query.limit(50).all()
        
        perm_changes = []
        for activity in activities:
            perm_changes.append({
                "timestamp": datetime.fromtimestamp(activity.timestamp).strftime("%H:%M:%S"),
                "server": activity.server_name,
                "change_type": activity.change_type,
                "path": activity.path,
                "old_value": activity.old_value,
                "new_value": activity.new_value
            })
        
        return perm_changes
    except Exception as e:
        logger.error(f"Error getting permission changes: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# ========== Backups Endpoints ==========

@app.get("/api/backups", dependencies=[Depends(require_viewer)])
async def get_backups(db: Session = Depends(get_db)):
    """Get backup information from centralized database"""
    try:
        backups = db.query(Backup).order_by(Backup.created_at.desc()).all()
        
        result = []
        for backup in backups:
            result.append({
                "id": backup.id,
                "server": backup.server_name,
                "backup_path": backup.backup_path,
                "last_backup": backup.created_at.strftime("%Y-%m-%d %H:%M:%S") if backup.created_at else "N/A",
                "size": f"{backup.size_bytes / (1024 * 1024):.1f} MB",
                "files": backup.file_count,
                "status": backup.status
            })
        
        return result
    except Exception as e:
        logger.error(f"Error getting backups: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/backups", dependencies=[Depends(require_operator)])
async def create_backup(server_id: int, db: Session = Depends(get_db)):
    """Create a new backup for a server"""
    try:
        # Implement backup creation logic
        server = db.query(Server).filter(Server.id == server_id).first()
        if not server:
            raise HTTPException(status_code=404, detail="Server not found")
        
        return {"message": f"Backup created for server {server_id}"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating backup: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/backups/{backup_id}/restore", dependencies=[Depends(require_operator)])
async def restore_backup(backup_id: int, db: Session = Depends(get_db)):
    """Restore from backup"""
    try:
        # Implement restore logic
        return {"message": f"Restore initiated for backup {backup_id}"}
    except Exception as e:
        logger.error(f"Error restoring backup: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# ========== Settings Endpoints ==========

@app.get("/api/settings/alerts", dependencies=[Depends(require_viewer)])
async def get_alert_config(db: Session = Depends(get_db)):
    """Get alert configuration"""
    try:
        settings = {}
        results = db.query(Setting).filter(Setting.key.like('alert_%')).all()
        for setting in results:
            # Remove 'alert_' prefix
            key = setting.key.replace('alert_', '')
            settings[key] = setting.value
        return settings
    except Exception as e:
        logger.error(f"Error getting alert config: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.put("/api/settings/alerts", dependencies=[Depends(require_admin)])
async def update_alert_config(config: AlertConfigUpdate, db: Session = Depends(get_db)):
    """Update alert configuration"""
    try:
        for key, value in config.dict(exclude_none=True).items():
            setting_key = f"alert_{key}"
            setting = db.query(Setting).filter(Setting.key == setting_key).first()
            if setting:
                setting.value = str(value)
            else:
                new_setting = Setting(key=setting_key, value=str(value))
                db.add(new_setting)
        
        db.commit()
        return {"message": "Alert configuration updated successfully"}
    except Exception as e:
        db.rollback()
        logger.error(f"Error updating alert config: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/settings/general", dependencies=[Depends(require_viewer)])
async def get_general_settings(db: Session = Depends(get_db)):
    """Get general settings"""
    try:
        settings = {}
        results = db.query(Setting).filter(Setting.key.like('general_%')).all()
        for setting in results:
            # Remove 'general_' prefix
            key = setting.key.replace('general_', '')
            settings[key] = setting.value
        return settings
    except Exception as e:
        logger.error(f"Error getting general settings: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.put("/api/settings/general", dependencies=[Depends(require_admin)])
async def update_general_settings(settings: GeneralSettingsUpdate, db: Session = Depends(get_db)):
    """Update general settings"""
    try:
        for key, value in settings.dict().items():
            setting_key = f"general_{key}"
            setting = db.query(Setting).filter(Setting.key == setting_key).first()
            if setting:
                setting.value = str(value)
            else:
                new_setting = Setting(key=setting_key, value=str(value))
                db.add(new_setting)
        
        db.commit()
        return {"message": "General settings updated successfully"}
    except Exception as e:
        db.rollback()
        logger.error(f"Error updating general settings: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# ==================== WebSocket Endpoints ====================

ws_manager = get_connection_manager()

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """WebSocket endpoint for real-time updates"""
    await ws_manager.connect(websocket)
    try:
        while True:
            # Keep connection alive and handle incoming messages
            data = await websocket.receive_text()
            message = json.loads(data)
            
            # Handle subscription requests
            if message.get("type") == "subscribe":
                topic = message.get("topic")
                if topic:
                    await ws_manager.subscribe(websocket, topic)
                    await ws_manager.send_personal_message(
                        {"type": "subscribed", "topic": topic},
                        websocket
                    )
            
            # Handle unsubscription requests
            elif message.get("type") == "unsubscribe":
                topic = message.get("topic")
                if topic:
                    await ws_manager.unsubscribe(websocket, topic)
                    await ws_manager.send_personal_message(
                        {"type": "unsubscribed", "topic": topic},
                        websocket
                    )
            
            # Handle ping/pong for keep-alive
            elif message.get("type") == "ping":
                await ws_manager.send_personal_message(
                    {"type": "pong"},
                    websocket
                )
    
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket)
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
        ws_manager.disconnect(websocket)

async def broadcast_stats_update():
    """Background task to broadcast stats updates periodically"""
    while True:
        db = None
        try:
            from sqlalchemy import func
            # Get a database session for this task
            db = db_manager.get_session()
            
            # Get current stats from unified database
            total_servers = db.query(func.count(Server.id)).filter(Server.status == 'active').scalar() or 0
            active_monitors = total_servers * 3 if total_servers > 0 else 0
            
            # Calculate alerts today from activity_logs
            today_start = datetime.now().replace(hour=0, minute=0, second=0).timestamp()
            alerts_today = count_activity_records(db, time_filter=today_start)
            restored_files = alerts_today // 2 if alerts_today > 0 else 0
            
            # Broadcast to all connected clients
            await ws_manager.broadcast({
                "type": "stats_update",
                "data": {
                    "totalServers": total_servers,
                    "activeMonitors": active_monitors,
                    "alertsToday": alerts_today,
                    "restoredFiles": restored_files,
                    "timestamp": datetime.now().isoformat()
                }
            })
            
        except Exception as e:
            logger.error(f"Error broadcasting stats: {e}")
        finally:
            # Always close the database session
            if db:
                db.close()
        
        # Wait 5 seconds before next update
        await asyncio.sleep(5)

@app.on_event("startup")
async def startup_event():
    """Start background tasks on app startup"""
    # Start the stats broadcast task
    asyncio.create_task(broadcast_stats_update())
    logger.info("Background tasks started")

# ==================== Main ====================

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)