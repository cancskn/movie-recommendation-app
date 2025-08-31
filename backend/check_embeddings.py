import sqlite3
import numpy as np

# Connect to the database
conn = sqlite3.connect("movies.db")
cursor = conn.cursor()

# How many embeddings are stored?
cursor.execute("SELECT COUNT(*) FROM movies WHERE embedding IS NOT NULL")
print("Embeddings count:", cursor.fetchone()[0])

# Check one embedding length
cursor.execute("SELECT embedding FROM movies WHERE embedding IS NOT NULL LIMIT 1")
row = cursor.fetchone()
if row:
    blob = row[0]
    print("One embedding length (bytes):", len(blob))

    # Convert back to numpy array to check dimension
    arr = np.frombuffer(blob, dtype=np.float32)
    print("One embedding dimension:", arr.shape[0])
else:
    print("No embeddings found.")

# First 5 embeddings (movie_id and length)
cursor.execute(
    "SELECT id, length(embedding) FROM movies WHERE embedding IS NOT NULL LIMIT 5"
)

print("First 5 rows:", cursor.fetchall())

conn.close()
