import os
import sys

# Ensure the parent project directory is on sys.path so we can import app
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from app import app, db, User

def create_user(username: str, password: str):
    with app.app_context():
        existing_user = User.query.filter_by(username=username).first()
        if existing_user:
            print(f'User {username} already exists')
            return False
        new_user = User(username=username, password=password)
        db.session.add(new_user)
        db.session.commit()
        print(f'Created new user: {username}')
        print(f'Password: {password}')
        return True

if __name__ == '__main__':
    # Change these values if you want a different test user
    username = 'user123'
    password = 'pass123'
    create_user(username, password)