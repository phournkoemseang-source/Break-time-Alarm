from app import app, db, User, Alarm, StudySession, Book

def init_db():
    with app.app_context():
        # Drop all tables
        db.drop_all()
        
        # Create all tables
        db.create_all()
        
        # Create a test user
        test_user = User(
            username="test@example.com",
            password="password123"
        )
        db.session.add(test_user)
        db.session.commit()
        
        print("Database initialized successfully!")

if __name__ == "__main__":
    init_db()