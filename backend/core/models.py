"""
Database models for the Todo application using SQLAlchemy.
"""

from flask_sqlalchemy import SQLAlchemy
from flask_login import UserMixin
from datetime import datetime
from sqlalchemy import event
from sqlalchemy.orm import relationship, backref
from sqlalchemy import ForeignKey
from sqlalchemy.types import JSON
from werkzeug.security import generate_password_hash, check_password_hash

db = SQLAlchemy()

class Users(db.Model, UserMixin):
    """User model representing application users."""
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(256))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    lists = relationship('Lists', backref='user', lazy=True, cascade="all, delete-orphan")

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    
    def check_password(self, password):
        print(f"Checking password for user: {self.username}")
        print(f"Password hash in DB: {self.password_hash}")
        result = check_password_hash(self.password_hash, password)
        print(f"Password check result: {result}")
        return result
    
    def get_id(self):
        return str(self.id)

    def to_dict(self):
        return {
            "id": self.id,
            "username": self.username,
            "email": self.email,
            "created_at": self.created_at.isoformat()
        }

class Lists(db.Model):
    """List model representing todo lists."""
    __tablename__ = 'lists'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(200), nullable=False)
    user_id = db.Column(db.Integer, ForeignKey("users.id", ondelete="CASCADE"), index=True)
    order_index = db.Column(db.Integer, index=True)
    description = db.Column(db.Text)
    is_archived = db.Column(db.Boolean, default=False)
    collapsed_tasks = db.Column(JSON, default=list)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, onupdate=datetime.utcnow)

    tasks = relationship(
        "Tasks",
        backref="list",
        lazy="select",  # Changed from selectin to select
        cascade="all, delete-orphan",
        primaryjoin="and_(Lists.id==Tasks.list_id, Tasks.parent_id==None)",
        order_by="Tasks.created_at"
    )

    def to_dict(self, include_tasks=True):
        data = {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "order_index": self.order_index,
            "is_archived": self.is_archived,
            "collapsed_tasks": self.collapsed_tasks or [],
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat() if self.updated_at else None
        }
        if include_tasks:
            # Changed how we access tasks
            data["tasks"] = [task.to_dict() for task in self.tasks]
        return data

class Tasks(db.Model):
    """Task model representing individual todo items."""
    __tablename__ = 'tasks'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    list_id = db.Column(db.Integer, ForeignKey("lists.id", ondelete="CASCADE"))
    parent_id = db.Column(db.Integer, db.ForeignKey('tasks.id'))
    is_completed = db.Column(db.Boolean, default=False)
    due_date = db.Column(db.DateTime)
    priority = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, onupdate=datetime.utcnow)

    parent = db.relationship('Tasks', 
        remote_side=[id],  # Specify which side is "remote"
        backref=db.backref('subtasks', lazy='dynamic'),
        uselist=False,  # This makes it many-to-one instead of many-to-many
        foreign_keys=[parent_id]
    )

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "list_id": self.list_id,
            "parent_id": self.parent_id,
            "is_completed": self.is_completed,
            "due_date": self.due_date.isoformat() if self.due_date else None,
            "priority": self.priority,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat() if self.updated_at else None
        }

    @property
    def user_id(self):
        """Proxy property to get the user_id from the associated List."""
        return self.list.user_id


@event.listens_for(Tasks, 'before_insert')
@event.listens_for(Tasks, 'before_update')
def validate_task_depth(mapper, connection, target):
    if target.depth_level > 2:  # 0, 1, 2 are valid levels
        raise ValueError("Tasks cannot be nested deeper than 3 levels")


@event.listens_for(Tasks, 'after_update')
def update_parent_completion(mapper, connection, target):
    """Update parent task completion status based on subtasks."""
    if target.parent_id:
        parent = db.session.get(Tasks, target.parent_id)
        if parent:
            all_completed = all(subtask.is_completed for subtask in parent.subtasks)
            if parent.is_completed != all_completed:
                parent.is_completed = all_completed
                db.session.add(parent)