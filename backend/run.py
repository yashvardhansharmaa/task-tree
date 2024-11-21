"""
Todo List Application Server

This module serves as the entry point for the Todo List application.
It initializes the Flask application with proper security configurations
and logging setup.
"""

from flask import Flask
from flask_cors import CORS
from core.models import db
from core.blueprints.bp_auth import bp_auth
from core.blueprints.bp_lists import bp_list
from core.blueprints.bp_tasks import bp_task
from flask_jwt_extended import JWTManager
from flask_login import LoginManager
from config import Config
from datetime import timedelta
import os

def create_app():
    app = Flask(__name__)
    app.url_map.strict_slashes = False
    
    # Add CORS configuration
    CORS(app, 
         resources={
             r"/api/*": {
                 "origins": ["http://localhost:3000"],
                 "methods": ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
                 "allow_headers": ["Content-Type", "Authorization"],
                 "supports_credentials": True,
                 "expose_headers": ["Content-Type", "Authorization"]
             }
         },
         supports_credentials=True
    )
    
    # Load configuration
    app.config.from_object('config.Config')
    
    # JWT Configuration
    app.config['JWT_SECRET_KEY'] = 'your-secret-key-here'  # Change this to a secure secret key
    app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=1)
    jwt = JWTManager(app)
    
    # Create instance directory with absolute path
    instance_path = os.path.abspath(os.path.join(os.path.dirname(__file__), 'instance'))
    os.makedirs(instance_path, exist_ok=True)
    
    # Update SQLite database path to use absolute path
    app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///{os.path.join(instance_path, "database.db")}'
    
    # Initialize extensions
    db.init_app(app)
    
    # Register all blueprints
    app.register_blueprint(bp_auth, url_prefix='/api/auth')
    app.register_blueprint(bp_list, url_prefix='/api/lists')  # Add if you're using these
    app.register_blueprint(bp_task, url_prefix='/api/tasks')  # Add if you're using these
    
    # Create database tables
    with app.app_context():
        db.create_all()
    
    return app

if __name__ == '__main__':
    app = create_app()
    app.run(host='0.0.0.0', port=3001, debug=True)