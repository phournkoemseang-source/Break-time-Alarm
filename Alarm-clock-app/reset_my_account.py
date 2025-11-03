import os
import sys

# Add the project root to sys.path
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '.'))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from app import app, db, User

def create_my_account(email, password):
    with app.app_context():
        # Check if user already exists
        existing = User.query.filter_by(username=email).first()
        if existing:
            print(f'Deleting old account for {email}')
            db.session.delete(existing)
            db.session.commit()
        
        # Create new user
        user = User(username=email, password=password)
        db.session.add(user)
        db.session.commit()
        print(f'Created new account:')
        print(f'Email: {email}')
        print(f'Password: {password}')
        print('\nYou can now login with these credentials at http://127.0.0.1:5000')