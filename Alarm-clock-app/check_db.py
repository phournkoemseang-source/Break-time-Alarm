from app import app, db, User
with app.app_context():
    try:
        users = User.query.all()
        print(f"Found {len(users)} users")
        for u in users:
            print(u.id, u.username, u.password)
    except Exception as e:
        print('ERROR', e)
