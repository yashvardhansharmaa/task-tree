"""
Authentication blueprint handling user registration, login, and session management.
"""

from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from datetime import datetime
from core.models import Users, db
from core.utils.decorators import handle_exceptions
from flask_login import login_user, logout_user
from flask_cors import CORS, cross_origin
from werkzeug.security import generate_password_hash, check_password_hash
from email_validator import validate_email, EmailNotValidError

bp_auth = Blueprint("auth", __name__)
CORS(bp_auth, resources={
    r"/*": {
        "origins": [
            "http://localhost:3000",
            "http://127.0.0.1:3000",
            "http://localhost:5173",  # Vite's default dev server
            "http://127.0.0.1:5173"
        ],
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization", "X-Requested-With", "Accept"],
        "supports_credentials": True,
        "expose_headers": ["Content-Type", "Authorization", "X-Total-Count"],
        "max_age": 3600  # Cache preflight requests for 1 hour
    }
})

def hash_password(password):
    return generate_password_hash(password)

def is_valid_email(email):
    """Validate email format using email-validator package."""
    try:
        validate_email(email)
        return True
    except EmailNotValidError:
        return False

@bp_auth.route("/register", methods=["POST"])
@cross_origin(supports_credentials=True)
@handle_exceptions(endpoint='register')
def register():
    data = request.get_json()
    
    # Validate input data
    if not data or not data.get('username') or not data.get('email') or not data.get('password'):
        return jsonify({
            'ok': False,
            'message': 'Missing required fields'
        }), 400
        
    try:
        # Validate email format
        if not is_valid_email(data['email']):
            return jsonify({
                'ok': False,
                'message': 'Invalid email format'
            }), 400

        # Check if user already exists
        if Users.query.filter_by(username=data['username']).first():
            return jsonify({
                'ok': False,
                'message': 'Username already exists'
            }), 409
        if Users.query.filter_by(email=data['email']).first():
            return jsonify({
                'ok': False,
                'message': 'Email already exists'
            }), 409
            
        # Create new user
        new_user = Users(
            username=data['username'],
            email=data['email']
        )
        new_user.set_password(data['password'])
        
        db.session.add(new_user)
        db.session.commit()
        
        # Create access token
        access_token = create_access_token(identity=new_user.id)
        
        return jsonify({
            'ok': True,
            'message': 'User registered successfully',
            'token': access_token,
            'user': {
                'username': new_user.username,
                'email': new_user.email
            }
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': str(e)}), 500

@bp_auth.route("/login", methods=["POST"])
@handle_exceptions
def login():
    """Authenticate user and create session."""
    try:
        data = request.get_json()
        
        if not data or 'login' not in data or 'password' not in data:
            return jsonify({
                "ok": False,
                "message": "Login and password are required."
            }), 400
            
        user = Users.query.filter(
            (Users.username == data['login']) | 
            (Users.email == data['login'])
        ).first()
        
        if not user or not user.check_password(data['password']):
            return jsonify({
                "ok": False,
                "message": "Invalid login credentials."
            }), 401
        
        # Create access token
        access_token = create_access_token(identity=user.id)
        
        # Update last login
        user.last_login = datetime.utcnow()
        db.session.commit()
        
        return jsonify({
            "ok": True,
            "message": "Login successful",
            "token": access_token,
            "user": {
                "id": user.id,
                "username": user.username,
                "email": user.email
            }
        }), 200
        
    except Exception as e:
        current_app.logger.error(f"Login error: {str(e)}")
        return jsonify({
            "ok": False,
            "message": "An error occurred during login."
        }), 500

@bp_auth.route("/logout", methods=["POST"])
@jwt_required()
@handle_exceptions(endpoint='logout')
def logout():
    # Get current user
    current_user_id = get_jwt_identity()
    user = Users.query.get(current_user_id)
    
    if user:
        logout_user()
        # Here you might want to add token to a blacklist if implementing token invalidation
        
        return jsonify({
            'success': True,
            'message': "Successfully logged out"
        }), 200
    
    return jsonify({
        'success': False,
        'message': "User not found"
    }), 404

@bp_auth.route("/ping", methods=["GET"])
@cross_origin(supports_credentials=True)
def ping():
    """Test endpoint to verify API connectivity"""
    print("Ping endpoint hit!")  # Server-side logging
    return jsonify({"status": "success", "message": "API is working"}), 200