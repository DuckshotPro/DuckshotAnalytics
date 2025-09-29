"""
Server Logging Module

This module provides standardized logging functions for the Python agent system.
It supports different log levels and formats logs consistently.
"""

import os
import logging
from datetime import datetime
from pathlib import Path
from typing import Dict, Any, Optional
import json


class CustomFormatter(logging.Formatter):
    """Custom formatter that adds context information to log messages"""
    
    def format(self, record):
        # Add timestamp
        timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S.%f')[:-3]
        
        # Format base message
        log_message = f"[{timestamp}] [{record.levelname}] {record.getMessage()}"
        
        # Add context if available
        if hasattr(record, 'context') and record.context:
            log_message += f" {json.dumps(record.context)}"
        
        # Add exception info if present
        if record.exc_info:
            log_message += f"\n{self.formatException(record.exc_info)}"
        
        return log_message


class Logger:
    """Standardized logger for the agent system"""
    
    def __init__(self, name: str = "agent_system"):
        self.logger = logging.getLogger(name)
        self.logger.setLevel(logging.INFO)
        
        # Prevent duplicate handlers
        if self.logger.handlers:
            return
        
        # Console handler
        console_handler = logging.StreamHandler()
        console_handler.setFormatter(CustomFormatter())
        self.logger.addHandler(console_handler)
        
        # File handler
        log_dir = Path.cwd() / "logs"
        log_dir.mkdir(exist_ok=True)
        
        log_file = log_dir / f"{datetime.now().strftime('%Y-%m-%d')}.log"
        file_handler = logging.FileHandler(log_file)
        file_handler.setFormatter(CustomFormatter())
        self.logger.addHandler(file_handler)
    
    def debug(self, message: str, context: Optional[Dict[str, Any]] = None):
        """Log debug message"""
        extra = {'context': context} if context else {}
        self.logger.debug(message, extra=extra)
    
    def info(self, message: str, context: Optional[Dict[str, Any]] = None):
        """Log info message"""
        extra = {'context': context} if context else {}
        self.logger.info(message, extra=extra)
    
    def warn(self, message: str, context: Optional[Dict[str, Any]] = None):
        """Log warning message"""
        extra = {'context': context} if context else {}
        self.logger.warning(message, extra=extra)
    
    def error(self, message: str, context: Optional[Dict[str, Any]] = None):
        """Log error message"""
        extra = {'context': context} if context else {}
        self.logger.error(message, extra=extra)


# Create default logger instance
logger = Logger()