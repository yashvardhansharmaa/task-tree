# decorators.py

from functools import wraps
from flask import jsonify, request, current_app
from flask_jwt_extended import get_jwt_identity
from core.models import Lists

def handle_exceptions(endpoint=None):
    def decorator(f):
        @wraps(f)
        def wrapped(*args, **kwargs):
            try:
                return f(*args, **kwargs)
            except Exception as e:
                current_app.logger.error(f"Error in {endpoint or f.__name__}: {str(e)}", exc_info=True)
                return jsonify({
                    "error": e.__class__.__name__,
                    "message": str(e)
                }), 500
        wrapped.__name__ = f"{f.__name__}_{endpoint}" if endpoint else f.__name__
        return wrapped
    
    # This allows the decorator to be used with or without parameters
    if callable(endpoint):
        f = endpoint
        endpoint = None
        return decorator(f)
    return decorator

def user_owns_resource(model):
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            current_user_id = get_jwt_identity()
            resource_id = kwargs.get('list_id') or kwargs.get('task_id')
            if not resource_id:
                return jsonify({"error": "Resource ID required"}), 400
                
            resource = model.query.get_or_404(resource_id)
            
            # For Tasks, check ownership via the associated List
            user_id = resource.list.user_id if model.__name__ == 'Tasks' else resource.user_id
            
            if user_id != current_user_id:
                return jsonify({"error": "Unauthorized"}), 403
            
            return f(*args, **kwargs)
        return decorated_function
    return decorator
