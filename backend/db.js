const Database = require('better-sqlite3');

// Create database connection
const db = new Database('movies.db', { verbose: console.log });

console.log("✅ Database connection established.");

// Create the movies table if it doesn't exist
db.prepare(`
  CREATE TABLE IF NOT EXISTS movies (
    id INTEGER PRIMARY KEY,
    title TEXT,
    year INTEGER,
    genres TEXT,
    rating REAL,
    overview TEXT
  )
`).run();

console.log("✅ Table check/creation completed.");

// Save a movie object to the database
function saveMovieToDB(movie) {
  const insert = db.prepare(`
    INSERT OR IGNORE INTO movies (id, title, year, genres, rating, overview)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  const year = movie.release_date ? parseInt(movie.release_date.split('-')[0]) : null;

  const genres = Array.isArray(movie.genres)
    ? movie.genres.map(g => g.name).join(', ')
    : Array.isArray(movie.genre_ids)
      ? movie.genre_ids.join(', ')
      : '';

  const result = insert.run(
    movie.id,
    movie.title,
    year,
    genres,
    movie.vote_average,
    movie.overview
  );

  if (result.changes > 0) {
    console.log(`✅ Inserted: ${movie.title}`);
  } else {
    console.log(`⏭️ Skipped (duplicate): ${movie.title}`);
  }
}

// Export database connection and saving function
module.exports = {
  db,
  saveMovieToDB
};
