const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./movies.db');

db.serialize(() => {
  db.run("ALTER TABLE movies ADD COLUMN poster_path TEXT", (err) => {
    if (err) {
      console.error("❌ Error:", err.message);
    } else {
      console.log("✅ poster_path column added successfully");
    }
  });
});

db.close();
