import sqlite3

conn = sqlite3.connect("movies.db")
cursor = conn.cursor()

# Check if movies table exists
cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='movies'")
table = cursor.fetchone()
if not table:
    print("❌ No 'movies' table found in movies.db")
else:
    cursor.execute("SELECT COUNT(*) FROM movies")
    count = cursor.fetchone()[0]
    print(f"✅ movies table exists, row count = {count}")

conn.close()
