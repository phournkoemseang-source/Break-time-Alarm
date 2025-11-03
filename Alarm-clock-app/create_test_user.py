import os
import sys

# Ensure the project root is on sys.path so 'import app' works when
# this script is executed from subfolders (like scripts/).
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '.'))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from app import app, db, User

def create_test_user():
    with app.app_context():
        username = 'test@example.com'
        password = 'testpass123'

        existing = User.query.filter_by(username=username).first()
        if existing:
            print(f"User already exists: {username}")
            return False

        test_user = User(username=username, password=password)
        db.session.add(test_user)
        db.session.commit()
        print(f'Created test user: email={test_user.username}, password={password}')
        return True


if __name__ == '__main__':
    create_test_user()