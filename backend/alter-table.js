const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./movies.db');

db.serialize(() => {
  db.run("ALTER TABLE movies RENAME TO movies_old", (err) => {
    if (err) {
      console.error("Rename failed:", err.message);
    } else {
      console.log("Renamed old table.");
    }
  });

  db.run(`
    CREATE TABLE movies (
      id INTEGER PRIMARY KEY,
      title TEXT,
      overview TEXT,
      year INTEGER,
      genres TEXT,
      rating REAL,
      embedding BLOB
    )
  `, (err) => {
    if (err) {
      console.error("Create failed:", err.message);
    } else {
      console.log("Created new movies table with embedding BLOB.");
    }
  });

  db.run(`
    INSERT INTO movies (id, title, overview, year, genres, rating)
    SELECT id, title, overview, year, genres, rating FROM movies_old
  `, (err) => {
    if (err) {
      console.error("Insert failed:", err.message);
    } else {
      console.log("Data migrated.");
    }
  });

  db.run("DROP TABLE movies_old", (err) => {
    if (err) {
      console.error("Drop failed:", err.message);
    } else {
      console.log("Dropped old table.");
    }
  });
});

db.close();
