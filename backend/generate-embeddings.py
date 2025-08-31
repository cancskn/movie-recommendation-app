import sqlite3
import numpy as np
from sentence_transformers import SentenceTransformer

# Load HuggingFace model
model = SentenceTransformer('all-MiniLM-L6-v2')

# Connect to SQLite database
conn = sqlite3.connect('movies.db')
cursor = conn.cursor()

# Ensure embedding column exists in movies table
cursor.execute("PRAGMA table_info(movies)")
columns = [col[1] for col in cursor.fetchall()]
if "embedding" not in columns:
    cursor.execute("ALTER TABLE movies ADD COLUMN embedding BLOB")
    conn.commit()
    print("Added 'embedding' column to 'movies' table.")


# Fetch movies
cursor.execute("SELECT id, title, overview FROM movies")
movies = cursor.fetchall()
print(f"Found {len(movies)} movies in DB.")

# Insert/Update embeddings
for movie_id, title, overview in movies:
    text = f"{title} {overview or ''}".strip()
    if not text:
        print(f"Skipping movie {movie_id} (empty text)")
        continue

    embedding = model.encode(text)

    # Convert to binary (BLOB)
    embedding_bytes = np.array(embedding, dtype=np.float32).tobytes()

    cursor.execute(
       "UPDATE movies SET embedding = ? WHERE id = ?",
        (embedding_bytes, movie_id)
    )

    print(f"✅ Embedded: {title}")

# Save and close
conn.commit()
conn.close()
print(" All embeddings generated and stored in movies table.")
