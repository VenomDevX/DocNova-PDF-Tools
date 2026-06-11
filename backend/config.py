import os
from datetime import timedelta

class Config:
    """Base configuration"""
    DEBUG = False
    TESTING = False
    
    # Upload settings
    UPLOAD_FOLDER = os.path.join(os.path.dirname(__file__), 'uploads')
    MAX_CONTENT_LENGTH = 100 * 1024 * 1024  # 100MB
    
    # Allowed file types
    ALLOWED_PDF = {'pdf'}
    ALLOWED_IMAGES = {'jpg', 'jpeg', 'png'}
    ALLOWED_DOCS = {'docx', 'doc'}
    
    # CORS settings
    CORS_ORIGINS = "*"

class DevelopmentConfig(Config):
    """Development configuration"""
    DEBUG = True
    TESTING = False

class ProductionConfig(Config):
    """Production configuration"""
    DEBUG = False
    TESTING = False
    CORS_ORIGINS = [
        "https://doc-nova.vercel.app",
        "https://docnova-pdf-tools-production.up.railway.app"
    ]
    # Optimize uploads
    JSON_SORT_KEYS = False
    SEND_FILE_MAX_AGE_DEFAULT = 0
    PREFERRED_URL_SCHEME = 'https'

class TestingConfig(Config):
    """Testing configuration"""
    TESTING = True
    DEBUG = True

config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'testing': TestingConfig,
    'default': DevelopmentConfig
}
