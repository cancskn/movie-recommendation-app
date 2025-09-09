const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("./movies.db");

db.run("ALTER TABLE movies ADD COLUMN poster_checked INTEGER DEFAULT 0", (err) => {
  if (err) {
    console.error("Error:", err.message);
  } else {
    console.log("Column poster_checked added.");
  }
  db.close();
});
