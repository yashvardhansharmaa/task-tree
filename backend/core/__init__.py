from flask import Flask
from flask_sqlalchemy import SQLAlchemy
import os

db = SQLAlchemy()

def create_app(config=None):
    app = Flask(__name__)
    
    # Default configuration
    app.config.update(
        SQLALCHEMY_DATABASE_URI='sqlite:///instance/todo.db',
        SQLALCHEMY_TRACK_MODIFICATIONS=False,
        SECRET_KEY=os.getenv('SECRET_KEY', 'dev-key-please-change')
    )
    
    # Override with any passed config
    if config:
        app.config.update(config)
        
    # Initialize extensions
    db.init_app(app)
    
    return app
