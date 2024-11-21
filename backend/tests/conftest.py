# tests/conftest.py
import pytest
from core.models import db, Users, Lists, Tasks
from run import create_app
from datetime import datetime

@pytest.fixture
def app():
    """Create application for testing."""
    app = create_app({
        'TESTING': True,
        'SQLALCHEMY_DATABASE_URI': 'sqlite:///:memory:',
        'SQLALCHEMY_TRACK_MODIFICATIONS': False,
        'SECRET_KEY': 'test-secret-key',
        'WTF_CSRF_ENABLED': False
    })

    with app.app_context():
        db.create_all()
        yield app
        db.session.remove()
        db.drop_all()

@pytest.fixture
def client(app):
    """Create test client."""
    return app.test_client()

@pytest.fixture
def runner(app):
    """Create test CLI runner."""
    return app.test_cli_runner()

@pytest.fixture
def auth_headers(client, test_user):
    """Get authentication headers."""
    response = client.post('/api/auth/login', json={
        'login': test_user.username,
        'password': 'TestPass123!'
    })
    token = response.json['token']
    return {'Authorization': f'Bearer {token}'}

@pytest.fixture
def test_user():
    """Create test user."""
    user = Users(
        username='testuser',
        email='test@example.com',
        password_hash='pbkdf2:sha256:260000$rqT6fTXHQZI$7e7e6b4f1335fc8ea54a56e672748e48f7e7b39e723783124924da738f7be5c8'
    )
    db.session.add(user)
    db.session.commit()
    return user

@pytest.fixture
def test_list(test_user):
    """Create test list."""
    list_item = Lists(
        name='Test List',
        user_id=test_user.id,
        order_index=0
    )
    db.session.add(list_item)
    db.session.commit()
    return list_item

@pytest.fixture
def test_task(test_list):
    """Create test task."""
    task = Tasks(
        name='Test Task',
        list_id=test_list.id,
        task_depth=0
    )
    db.session.add(task)
    db.session.commit()
    return task

@pytest.fixture
def test_client_with_db(app, db):
    with app.test_client() as client:
        with app.app_context():
            db.create_all()
            yield client
            db.session.remove()
            db.drop_all()