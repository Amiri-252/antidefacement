#!/usr/bin/env python3
"""
WebSocket manager for real-time updates
"""

from typing import List, Dict, Any
from fastapi import WebSocket, WebSocketDisconnect
import json
import asyncio
import logging

logger = logging.getLogger(__name__)


class ConnectionManager:
    """Manages WebSocket connections for real-time updates"""
    
    def __init__(self):
        self.active_connections: List[WebSocket] = []
        self.subscribers: Dict[str, List[WebSocket]] = {}
    
    async def connect(self, websocket: WebSocket, client_id: str = None):
        """Accept and register a new WebSocket connection"""
        await websocket.accept()
        self.active_connections.append(websocket)
        logger.info(f"WebSocket connected. Total connections: {len(self.active_connections)}")
    
    def disconnect(self, websocket: WebSocket):
        """Remove a WebSocket connection"""
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
            logger.info(f"WebSocket disconnected. Total connections: {len(self.active_connections)}")
        
        # Remove from all subscriptions
        for topic in self.subscribers:
            if websocket in self.subscribers[topic]:
                self.subscribers[topic].remove(websocket)
    
    async def subscribe(self, websocket: WebSocket, topic: str):
        """Subscribe a WebSocket to a specific topic"""
        if topic not in self.subscribers:
            self.subscribers[topic] = []
        if websocket not in self.subscribers[topic]:
            self.subscribers[topic].append(websocket)
            logger.info(f"WebSocket subscribed to topic: {topic}")
    
    async def unsubscribe(self, websocket: WebSocket, topic: str):
        """Unsubscribe a WebSocket from a specific topic"""
        if topic in self.subscribers and websocket in self.subscribers[topic]:
            self.subscribers[topic].remove(websocket)
            logger.info(f"WebSocket unsubscribed from topic: {topic}")
    
    async def broadcast(self, message: Dict[str, Any]):
        """Broadcast a message to all connected clients"""
        disconnected = []
        for connection in self.active_connections:
            try:
                await connection.send_json(message)
            except Exception as e:
                logger.error(f"Error broadcasting to connection: {e}")
                disconnected.append(connection)
        
        # Clean up disconnected clients
        for connection in disconnected:
            self.disconnect(connection)
    
    async def broadcast_to_topic(self, topic: str, message: Dict[str, Any]):
        """Broadcast a message to all subscribers of a specific topic"""
        if topic not in self.subscribers:
            return
        
        disconnected = []
        for connection in self.subscribers[topic]:
            try:
                await connection.send_json(message)
            except Exception as e:
                logger.error(f"Error broadcasting to topic {topic}: {e}")
                disconnected.append(connection)
        
        # Clean up disconnected clients
        for connection in disconnected:
            self.disconnect(connection)
    
    async def send_personal_message(self, message: Dict[str, Any], websocket: WebSocket):
        """Send a message to a specific client"""
        try:
            await websocket.send_json(message)
        except Exception as e:
            logger.error(f"Error sending personal message: {e}")
            self.disconnect(websocket)


# Singleton instance
manager = ConnectionManager()


def get_connection_manager() -> ConnectionManager:
    """Get the connection manager singleton"""
    return manager
