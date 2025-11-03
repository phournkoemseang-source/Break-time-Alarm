import sqlite3
import os

# locate the instance database relative to this script
p = os.path.join(os.path.dirname(__file__), '..', 'instance', 'database.db')
p = os.path.normpath(p)
print('db_path=', p)
print('exists=', os.path.exists(p))

conn = sqlite3.connect(p)
cur = conn.cursor()
cur.execute("SELECT name FROM sqlite_master WHERE type='table'")
print('tables=', cur.fetchall())

try:
    cur.execute('SELECT id, username, password FROM user')
    rows = cur.fetchall()
    print('users_count=', len(rows))
    for r in rows:
        print(r)
except Exception as e:
    print('query error', e)
finally:
    conn.close()
