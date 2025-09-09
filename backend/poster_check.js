const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("./movies.db");

// Debug query
db.all(
  "SELECT poster_checked, COUNT(*) as cnt FROM movies GROUP BY poster_checked",
  (err, rows) => {
    if (err) {
      console.error("DB error:", err);
    } else {
      console.log("\n=== Debug: poster_checked distribution ===");
      rows.forEach(r => {
        console.log(`poster_checked = ${r.poster_checked} → ${r.cnt}`);
      });
      console.log("=========================================\n");
    }
    db.close();
  }
);
