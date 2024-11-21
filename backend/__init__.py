"""
Backend package initialization.
"""

from flask import Flask
from flask_login import LoginManager

def create_app():
    app = Flask(__name__)
    
    # Initialize Flask-Login
    login_manager = LoginManager()
    login_manager.init_app(app)
    login_manager.login_view = 'auth.login'
    
    @login_manager.user_loader
    def load_user(user_id):
        from core.models import Users
        return Users.query.get(int(user_id))
    
    # When registering blueprints, make sure each has a unique name
    from core.blueprints.bp_auth import bp_auth
    app.register_blueprint(bp_auth, url_prefix='/api/auth')
    
    return app