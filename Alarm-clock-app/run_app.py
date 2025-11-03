from app import app

if __name__ == '__main__':
    # Run app without the reloader to avoid multiple processes touching the SQLite DB
    app.run(debug=True, use_reloader=False)
