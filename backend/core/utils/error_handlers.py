from flask import jsonify
from marshmallow import ValidationError
from sqlalchemy.exc import IntegrityError, DataError

def register_error_handlers(app):
    @app.errorhandler(ValidationError)
    def handle_validation_error(error):
        return jsonify({
            'error': 'Validation Error',
            'messages': error.messages,
            'status': 'error',
            'fields': error.field_names
        }), 422

    @app.errorhandler(IntegrityError)
    def handle_integrity_error(error):
        return jsonify({
            'error': 'Database Integrity Error',
            'message': str(error.orig),
            'status': 'error'
        }), 400

    @app.errorhandler(403)
    def forbidden_error(error):
        return jsonify({
            'error': 'Forbidden',
            'message': 'You do not have permission to access this resource',
            'status': 'error'
        }), 403

    @app.errorhandler(429)
    def ratelimit_error(error):
        return jsonify({
            'error': 'Too Many Requests',
            'message': 'Please wait before making more requests',
            'status': 'error',
            'retry_after': error.description.get('retry_after', 60)
        }), 429

    return app