console.log("🧪 Test başladı...");

const { db } = require('./db');

const row = db.prepare('SELECT COUNT(*) AS count FROM movies').get();

console.log(`Total movies in database: ${row.count}`);