"""
Marshmallow schemas for serialization and validation of Todo application models.
Includes enhanced validation, custom fields, and nested relationships.
"""

from marshmallow import (
    Schema, fields, validate, validates, validates_schema,
    ValidationError, EXCLUDE, post_load, pre_load
)
from datetime import datetime
import re

class BaseSchema(Schema):
    """Base schema with common configuration and fields."""
    class Meta:
        unknown = EXCLUDE
        ordered = True
        fields = ('id', 'created_at', 'updated_at')

    id = fields.Int(dump_only=True)
    created_at = fields.DateTime(dump_only=True)
    updated_at = fields.DateTime(dump_only=True)

    @pre_load
    def strip_strings(self, data, **kwargs):
        """Strip whitespace from string fields."""
        if isinstance(data, dict):
            for key, value in data.items():
                if isinstance(value, str):
                    data[key] = value.strip()
        return data

class UserSchema(BaseSchema):
    """Schema for User model with enhanced validation."""
    username = fields.Str(
        required=True,
        validate=[
            validate.Length(min=3, max=50),
            validate.Regexp(
                r'^[\w.-]+$',
                error="Username can only contain letters, numbers, dots, and dashes"
            )
        ]
    )
    email = fields.Email(
        required=True,
        validate=validate.Length(max=120)
    )
    password = fields.Str(
        required=True,
        load_only=True,
        validate=[
            validate.Length(min=8, max=128),
            validate.Regexp(
                regex=r'^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$',
                error="Password must contain at least one uppercase letter, lowercase letter, number, and special character"
            )
        ]
    )
    is_active = fields.Bool(dump_only=True)
    last_login = fields.DateTime(dump_only=True)
    lists = fields.List(fields.Nested(lambda: ListSchema(exclude=("user",))), dump_only=True)

    @validates("username")
    def validate_username(self, value):
        """Additional username validation."""
        if value.lower() in ["admin", "administrator", "root", "system"]:
            raise ValidationError("This username is reserved")
        return value

    @validates("email")
    def validate_email(self, value):
        """Additional email validation."""
        if not re.match(r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$", value):
            raise ValidationError("Invalid email format")
        # Add check for disposable email domains if needed
        return value

class ListSchema(BaseSchema):
    """Schema for List model with nested relationships."""
    name = fields.Str(
        required=True,
        validate=[
            validate.Length(min=1, max=50),
            validate.Regexp(
                r'^[\w\s.-]+$',
                error="List name can only contain letters, numbers, spaces, dots, and dashes"
            )
        ]
    )
    description = fields.Str(validate=validate.Length(max=500))
    order_index = fields.Int(validate=validate.Range(min=0))
    is_archived = fields.Bool()
    user_id = fields.Int(dump_only=True)
    total_tasks = fields.Int(dump_only=True)
    completed_tasks = fields.Int(dump_only=True)
    tasks = fields.List(fields.Nested(lambda: TaskSchema(exclude=("list",))), dump_only=True)

    @validates("name")
    def validate_name(self, value):
        """Validate list name."""
        if value.strip() == "":
            raise ValidationError("List name cannot be empty")
        return value

class TaskSchema(BaseSchema):
    """Schema for Task model with nested relationships and custom validation."""
    name = fields.Str(
        required=True,
        validate=[
            validate.Length(min=1, max=100),
            validate.Regexp(
                r'^[\w\s.,-]+$',
                error="Task name can contain letters, numbers, spaces, dots, commas, and dashes"
            )
        ]
    )
    description = fields.Str(validate=validate.Length(max=1000))
    list_id = fields.Int(required=True)
    task_depth = fields.Int(validate=validate.Range(min=0, max=5), dump_only=True)
    parent_id = fields.Int(allow_none=True)
    is_completed = fields.Bool()
    due_date = fields.DateTime(allow_none=True)
    priority = fields.Int(validate=validate.Range(min=0, max=3))
    subtasks = fields.List(fields.Nested(lambda: TaskSchema()), dump_only=True)
    has_subtasks = fields.Bool(dump_only=True)

    @validates_schema
    def validate_task(self, data, **kwargs):
        """Validate task data consistency."""
        if "due_date" in data and data["due_date"]:
            if data["due_date"] < datetime.now():
                raise ValidationError("Due date cannot be in the past")

        if "parent_id" in data and data["parent_id"]:
            # Add any parent-child relationship validations here
            pass

    class Meta(BaseSchema.Meta):
        fields = BaseSchema.Meta.fields + (
            "name", "description", "list_id", "task_depth",
            "parent_id", "is_completed", "due_date", "priority",
            "subtasks", "has_subtasks"
        )

# Custom fields if needed
class TrimmedString(fields.String):
    """Custom field that automatically strips whitespace."""
    def _deserialize(self, value, attr, data, **kwargs):
        if value is None:
            return None
        return str(value).strip()

# Response schemas for specific endpoints
class TaskResponseSchema(TaskSchema):
    """Schema for task response with additional metadata."""
    path = fields.List(fields.Int(), dump_only=True)  # For hierarchical path
    list_name = fields.Str(dump_only=True)
    parent_name = fields.Str(dump_only=True)

class ListResponseSchema(ListSchema):
    """Schema for list response with additional metadata."""
    task_count = fields.Int(dump_only=True)
    completion_rate = fields.Float(dump_only=True)

class UserLoginSchema(Schema):
    """Schema for user login validation."""
    class Meta:
        unknown = EXCLUDE

    login = fields.Str(required=True)
    password = fields.Str(required=True)