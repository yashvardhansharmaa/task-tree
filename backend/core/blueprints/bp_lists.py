"""
Lists blueprint handling todo list management with improved error handling and validation.
"""

from flask import Blueprint, request, jsonify, current_app
from flask_cors import CORS, cross_origin
from flask_jwt_extended import jwt_required, get_jwt_identity
from core.models import db, Lists
from marshmallow import Schema, fields, ValidationError
from sqlalchemy.exc import SQLAlchemyError
from functools import wraps
import logging

# Set up logging
logger = logging.getLogger(__name__)

# Schema Definition
class ListSchema(Schema):
    id = fields.Int(dump_only=True)
    name = fields.Str(required=True, validate=lambda x: len(x.strip()) > 0)
    description = fields.Str(allow_none=True)
    user_id = fields.Int(dump_only=True)
    created_at = fields.DateTime(dump_only=True)
    updated_at = fields.DateTime(dump_only=True)

bp_list = Blueprint("lists", __name__)
CORS(bp_list, resources={
    r"/*": {
        "origins": ["http://localhost:3000"],
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"],
        "supports_credentials": True
    }
})

list_schema = ListSchema()

def handle_db_error(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        try:
            return f(*args, **kwargs)
        except SQLAlchemyError as e:
            db.session.rollback()
            logger.error(f"Database error: {str(e)}")
            return jsonify({
                "ok": False,
                "message": "Database error occurred"
            }), 500
        except Exception as e:
            logger.error(f"Unexpected error: {str(e)}")
            return jsonify({
                "ok": False,
                "message": "An unexpected error occurred"
            }), 500
    return decorated_function

@bp_list.route("", methods=["GET"])
@jwt_required()
@handle_db_error
def get_lists():
    """Get all lists for the current user."""
    current_user_id = get_jwt_identity()
    lists = Lists.query.filter_by(user_id=current_user_id).all()
    return jsonify({
        "ok": True,
        "lists": [list_schema.dump(list_) for list_ in lists]
    }), 200

@bp_list.route("", methods=["POST"])
@jwt_required()
@cross_origin(supports_credentials=True)
@handle_db_error
def create_list():
    """Create a new list."""
    current_user_id = get_jwt_identity()
    
    try:
        data = request.get_json()
        if not data:
            return jsonify({
                "ok": False,
                "message": "No data provided"
            }), 400

        # Use schema validation instead of manual checks
        list_data = list_schema.load(data)
        
        new_list = Lists(
            name=list_data['name'],
            description=list_data.get('description', ''),
            user_id=current_user_id
        )
        
        db.session.add(new_list)
        db.session.commit()
        
        return jsonify({
            "ok": True,
            "message": "List created successfully",
            "list": list_schema.dump(new_list)
        }), 201
        
    except ValidationError as e:
        return jsonify({
            "ok": False,
            "message": "Validation error",
            "errors": e.messages
        }), 400

@bp_list.route("/<int:list_id>", methods=["DELETE"])
@jwt_required()
@handle_db_error
def delete_list(list_id):
    """Delete a list."""
    current_user_id = get_jwt_identity()
    list_item = Lists.query.filter_by(id=list_id, user_id=current_user_id).first()
    
    if not list_item:
        return jsonify({
            "ok": False,
            "message": "List not found"
        }), 404
        
    db.session.delete(list_item)
    db.session.commit()
    
    return jsonify({
        "ok": True,
        "message": "List deleted successfully"
    }), 200