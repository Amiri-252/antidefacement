#!/usr/bin/env python3
"""
Database module supporting both SQLite and MySQL
"""

import os
from typing import Optional
from sqlalchemy import create_engine, Column, Integer, String, DateTime, Text, Boolean, Float
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from datetime import datetime
import logging

Base = declarative_base()

# Database Models

class Server(Base):
    __tablename__ = "servers"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(255), nullable=False)
    host = Column(String(255), nullable=False)
    port = Column(Integer, default=22)
    username = Column(String(255), nullable=False)
    password = Column(Text, nullable=True)
    key_path = Column(Text, nullable=True)
    path = Column(Text, nullable=False)
    mode = Column(String(50), default='passive')
    backup_path = Column(Text, nullable=True)
    interval = Column(Integer, default=1)
    status = Column(String(50), default='active')
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class Setting(Base):
    __tablename__ = "settings"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    key = Column(String(255), unique=True, nullable=False)
    value = Column(Text, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class Activity(Base):
    __tablename__ = "activity_logs"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    timestamp = Column(Float, nullable=False)
    server_id = Column(Integer, nullable=False)
    server_name = Column(String(255), nullable=False)
    activity_type = Column(String(50), nullable=False)  # 'permission' or 'file'
    change_type = Column(String(100), nullable=True)  # e.g., 'permission_change', 'file_modified'
    operation = Column(String(100), nullable=True)
    path = Column(Text, nullable=True)
    src_path = Column(Text, nullable=True)
    dst_path = Column(Text, nullable=True)
    old_value = Column(Text, nullable=True)
    new_value = Column(Text, nullable=True)
    details = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class Backup(Base):
    __tablename__ = "backups"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    server_id = Column(Integer, nullable=False)
    server_name = Column(String(255), nullable=False)
    backup_path = Column(Text, nullable=False)
    size_bytes = Column(Integer, default=0)
    file_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    status = Column(String(50), default='completed')


class DatabaseManager:
    """Database manager supporting both SQLite and MySQL"""
    
    def __init__(self, db_url: Optional[str] = None):
        """
        Initialize database connection
        
        Args:
            db_url: Database URL. Format:
                - SQLite: "sqlite:///antidefacement.db"
                - MySQL: "mysql+pymysql://user:password@localhost:3306/antidefacement"
        """
        if db_url is None:
            # Default to SQLite for backward compatibility
            db_url = os.getenv("DATABASE_URL", "sqlite:///antidefacement.db")
        
        self.db_url = db_url
        self.engine = create_engine(
            db_url,
            pool_pre_ping=True,
            echo=False
        )
        self.SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=self.engine)
        
        # Create all tables
        self._create_tables()
        
        logging.info(f"Database initialized: {self._get_db_type()}")
    
    def _get_db_type(self) -> str:
        """Get database type from URL"""
        if "mysql" in self.db_url:
            return "MySQL"
        elif "sqlite" in self.db_url:
            return "SQLite"
        else:
            return "Unknown"
    
    def _create_tables(self):
        """Create all database tables"""
        Base.metadata.create_all(bind=self.engine)
    
    def get_session(self) -> Session:
        """Get database session"""
        return self.SessionLocal()
    
    def close(self):
        """Close database connection"""
        self.engine.dispose()


# Singleton instance
_db_manager = None


def get_db_manager() -> DatabaseManager:
    """Get database manager singleton"""
    global _db_manager
    if _db_manager is None:
        _db_manager = DatabaseManager()
    return _db_manager


def get_db() -> Session:
    """Get database session (for FastAPI dependency injection)"""
    db = get_db_manager().get_session()
    try:
        yield db
    finally:
        db.close()
