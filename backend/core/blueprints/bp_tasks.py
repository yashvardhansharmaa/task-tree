"""
Tasks blueprint handling todo task management with enhanced features and error handling.
"""

from flask import Blueprint, request, jsonify, current_app
from flask_login import login_required, current_user
from marshmallow import ValidationError
from sqlalchemy import and_
from core.models import Tasks, Lists, db
from core.schemas import TaskSchema, TaskResponseSchema
from core.utils.decorators import handle_exceptions
from flask_jwt_extended import jwt_required

bp_task = Blueprint("task", __name__)

@bp_task.route("/batch", methods=["POST"])
@login_required
@handle_exceptions
def batch_update_tasks():
    """Batch update multiple tasks efficiently."""
    try:
        data = request.get_json()
        tasks = data.get('tasks', [])
        
        # Collect all task IDs
        task_ids = [task['id'] for task in tasks if 'id' in task]
        
        # Verify ownership in single query
        authorized_tasks = Tasks.query.join(Lists).filter(
            and_(
                Tasks.id.in_(task_ids),
                Lists.user_id == current_user.id
            )
        ).all()
        
        authorized_ids = {task.id for task in authorized_tasks}
        
        # Batch update
        updates = []
        for task_data in tasks:
            if task_data.get('id') in authorized_ids:
                task = next(t for t in authorized_tasks if t.id == task_data['id'])
                for key, value in task_data.items():
                    if key != 'id' and hasattr(task, key):
                        setattr(task, key, value)
                updates.append(task)
        
        if updates:
            db.session.bulk_save_objects(updates)
            db.session.commit()
        
        return jsonify({
            "message": f"Successfully updated {len(updates)} tasks",
            "updated_count": len(updates)
        }), 200

    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Batch update failed: {str(e)}")
        raise


@bp_task.route("/<int:task_id>/move", methods=["POST"])
@login_required
@handle_exceptions
def move_task(task_id):
    """Move task to different parent or list with proper depth recalculation."""
    try:
        data = request.get_json()
        new_parent_id = data.get('new_parent_id')
        new_list_id = data.get('new_list_id')
        
        task = Tasks.query.join(Lists).filter(
            Tasks.id == task_id,
            Lists.user_id == current_user.id
        ).first_or_404()
        
        if new_parent_id:
            new_parent = Tasks.query.join(Lists).filter(
                Tasks.id == new_parent_id,
                Lists.user_id == current_user.id
            ).first_or_404()
            
            # Check for circular reference
            if task.id == new_parent_id or any(t.id == task.id for t in new_parent.get_ancestors()):
                return jsonify({"error": "Cannot move task under itself"}), 400
            
            task.parent_id = new_parent_id
            task.list_id = new_parent.list_id
            
        elif new_list_id:
            # Verify list ownership
            if not Lists.query.filter_by(
                id=new_list_id,
                user_id=current_user.id
            ).first():
                return jsonify({"error": "List not found"}), 404
            
            task.list_id = new_list_id
            task.parent_id = None
        
        # Recalculate depths
        task.recalculate_depths()
        db.session.commit()
        
        return jsonify({
            "message": "Task moved successfully",
            "task": TaskResponseSchema().dump(task)
        }), 200

    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Task move failed: {str(e)}")
        raise


@bp_task.route("/<int:task_id>/toggle", methods=["POST"])
@login_required
@handle_exceptions
def toggle_task_completion(task_id):
    """Toggle task completion status and handle subtasks."""
    try:
        task = Tasks.query.join(Lists).filter(
            Tasks.id == task_id
        ).first_or_404()
        
        # Verify user owns the task
        if task.list.user_id != current_user.id:
            return jsonify({"error": "Unauthorized"}), 403
        
        # Toggle completion status
        task.is_completed = not task.is_completed
        
        # If completing task, complete all subtasks
        if task.is_completed:
            for subtask in task.subtasks:
                subtask.is_completed = True
        
        db.session.commit()
        
        return jsonify({
            "message": "Task status updated",
            "task": TaskSchema().dump(task)
        }), 200

    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Task toggle failed: {str(e)}")
        raise

@bp_task.route("/", methods=["POST"])
@jwt_required()
def create_task():
    # Your create task logic here
    pass

@bp_task.route("/<int:task_id>", methods=["PUT"])
@jwt_required()
def update_task(task_id):
    # Your update task logic here
    pass