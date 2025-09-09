const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("./movies.db");

db.serialize(() => {
  db.get("SELECT COUNT(*) as withPoster FROM movies WHERE poster_path IS NOT NULL", (err, row) => {
    if (err) return console.error(err.message);
    console.log(`🎬 Movies with poster: ${row.withPoster}`);
  });

  db.get("SELECT COUNT(*) as withoutPoster FROM movies WHERE poster_path IS NULL", (err, row) => {
    if (err) return console.error(err.message);
    console.log(`❌ Movies without poster: ${row.withoutPoster}`);
  });

  db.get("SELECT COUNT(*) as total FROM movies", (err, row) => {
    if (err) return console.error(err.message);
    console.log(`📊 Total movies in DB: ${row.total}`);
  });
});

db.close();
