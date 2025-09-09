const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("./movies.db");

db.run(
  "UPDATE movies SET poster_checked = 1 WHERE poster_path IS NOT NULL",
  function (err) {
    if (err) {
      console.error("DB error:", err);
    } else {
      console.log(`✅ Fixed: ${this.changes} rows marked as checked`);
    }
    db.close();
  }
);
