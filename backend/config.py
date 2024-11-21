from datetime import timedelta
import os

class Config:
    SECRET_KEY = 'your-secret-key'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    JWT_SECRET_KEY = "your-jwt-secret"
    JWT_ACCESS_TOKEN_EXPIRES = 3600
    
    # CORS configuration
    CORS_HEADERS = 'Content-Type'
    CORS_ORIGINS = ["http://localhost:3000"]
    CORS_SUPPORTS_CREDENTIALS = True 