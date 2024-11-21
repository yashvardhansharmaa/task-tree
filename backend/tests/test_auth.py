"""
Tests for authentication functionality.
"""
import pytest
from backend.core.models import Users
from werkzeug.security import generate_password_hash
from flask_cors import CORS

@pytest.fixture
def auth_user(client, app):
    """Create test user and handle authentication."""
    with app.app_context():
        user = Users(
            username='testuser',
            email='test@example.com',
            password_hash=generate_password_hash('TestPass123!')
        )
        app.db.session.add(user)
        app.db.session.commit()
        return user

def test_register_success(client):
    """Test successful user registration."""
    response = client.post('/api/auth/register', json={
        'username': 'newuser',
        'email': 'new@example.com',
        'password': 'TestPass123!'
    })
    assert response.status_code == 201
    assert b'User registered successfully' in response.data

def test_register_duplicate_username(client, auth_user):
    """Test registration with existing username."""
    response = client.post('/register', json={
        'username': 'testuser',
        'email': 'another@example.com',
        'password': 'TestPass123!'
    })
    assert response.status_code == 400
    assert b'Username already exists' in response.data

def test_login_success(client, auth_user):
    """Test successful login."""
    response = client.post('/api/auth/login', json={
        'login': 'testuser',
        'password': 'TestPass123!'
    })
    assert response.status_code == 200
    assert b'Logged in successfully' in response.data

def test_login_invalid_credentials(client):
    """Test login with invalid credentials."""
    response = client.post('/api/auth/login', json={
        'login': 'nonexistent',
        'password': 'WrongPass123!'
    })
    assert response.status_code == 401

def test_login_rate_limit(client, auth_user):
    """Test rate limiting on login endpoint."""
    for _ in range(5):  # Attempt 5 rapid logins
        client.post('/api/auth/login', json={
            'login': 'testuser',
            'password': 'wrong'
        })
    
    response = client.post('/api/auth/login', json={
        'login': 'testuser',
        'password': 'TestPass123!'
    })
    assert response.status_code == 429