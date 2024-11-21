from functools import wraps
from flask import request, jsonify
from datetime import datetime, timedelta
from collections import defaultdict

# Simple in-memory rate limiting store
rate_limit_store = defaultdict(list)

def rate_limit(limit=60, window=60):  # default: 60 requests per 60 seconds
    def decorator(f):
        @wraps(f)
        def wrapped(*args, **kwargs):
            # Get client IP
            client_ip = request.remote_addr
            now = datetime.now()
            
            # Clean old requests
            rate_limit_store[client_ip] = [
                timestamp for timestamp in rate_limit_store[client_ip]
                if timestamp > now - timedelta(seconds=window)
            ]
            
            # Check if limit is exceeded
            if len(rate_limit_store[client_ip]) >= limit:
                return jsonify({
                    "error": "Rate limit exceeded",
                    "message": f"Maximum {limit} requests per {window} seconds"
                }), 429
            
            # Add current request timestamp
            rate_limit_store[client_ip].append(now)
            
            return f(*args, **kwargs)
        return wrapped
    return decorator
