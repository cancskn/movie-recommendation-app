const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("./movies.db");

db.serialize(() => {
  db.run("ALTER TABLE movies ADD COLUMN last_updated TEXT", (err) => {
    if (err) {
      console.error("❌ Error:", err.message);
    } else {
      console.log("✅ last_updated column added successfully");
    }
  });
});

db.close();
