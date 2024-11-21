"""
Security middleware and utilities.
"""
from functools import wraps
from flask import request, current_app, g, jsonify
import re

def security_headers():
    """Add security headers to response."""
    def decorator(f):
        @wraps(f)
        def wrapped(*args, **kwargs):
            response = current_app.make_response(f(*args, **kwargs))
            response.headers['Content-Security-Policy'] = "default-src 'self'"
            response.headers['X-Content-Type-Options'] = 'nosniff'
            response.headers['X-Frame-Options'] = 'SAMEORIGIN'
            response.headers['X-XSS-Protection'] = '1; mode=block'
            return response
        return wrapped
    return decorator

def sanitize_input(text):
    """Basic input sanitization."""
    if not isinstance(text, str):
        return text
    # Remove any HTML/script tags
    text = re.sub(r'<[^>]*?>', '', text)
    return text.strip()

def validate_request_data():
    """Validate and sanitize request data."""
    def decorator(f):
        @wraps(f)
        def wrapped(*args, **kwargs):
            if request.is_json:
                data = request.get_json()
                if isinstance(data, dict):
                    sanitized_data = {
                        k: sanitize_input(v) for k, v in data.items()
                    }
                    g.sanitized_data = sanitized_data
            return f(*args, **kwargs)
        return wrapped
    return decorator

def validate_json_content_type():
    def decorator(f):
        @wraps(f)
        def wrapped(*args, **kwargs):
            if request.method in ['POST', 'PUT', 'PATCH']:
                if not request.is_json:
                    return jsonify({"error": "Content-Type must be application/json"}), 415
            return f(*args, **kwargs)
        return wrapped
    return decorator