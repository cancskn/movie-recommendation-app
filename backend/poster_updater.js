const sqlite3 = require("sqlite3").verbose();
const axios = require("axios");
require("dotenv").config();

const db = new sqlite3.Database("./movies.db");
const tmdbApiKey = process.env.REACT_APP_TMDB_API_KEY;

// Sleep helper to avoid API rate limits
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Batch counters (this run only)
let updatedCount = 0;
let noPosterCount = 0;
let failedCount = 0;

async function updatePoster(id) {
  try {
    const url = `https://api.themoviedb.org/3/movie/${id}?api_key=${tmdbApiKey}&language=en-US`;
    const res = await axios.get(url);
    const poster = res.data.poster_path || null;

    // ✅ Her durumda poster_checked = 1 işaretliyoruz
    await new Promise((resolve, reject) => {
      db.run(
        "UPDATE movies SET poster_path = ?, last_updated = datetime('now'), poster_checked = 1 WHERE id = ?",
        [poster, id],
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });

    if (poster) {
      updatedCount++;
      console.log(`✅ Poster saved for ID ${id}`);
    } else {
      noPosterCount++;
      console.log(`⚠️ No poster on TMDb for ID ${id}`);
    }

    return true;
  } catch (err) {
    failedCount++;
    console.error(
      `❌ Failed for ID ${id}:`,
      err.response?.data?.status_message || err.message
    );
    return false;
  }
}

async function main() {
  console.log("🔄 Starting poster update (resume mode)...");

  // tabloya poster_checked sütunu eklenmiş mi kontrol et
  db.run(
    "ALTER TABLE movies ADD COLUMN poster_checked INTEGER DEFAULT 0",
    (err) => {
      if (err && !err.message.includes("duplicate column name")) {
        console.error("DB alter error:", err);
      }
    }
  );

  // Kaç film kaldığını hesapla
  db.get(
    "SELECT COUNT(*) as count FROM movies WHERE poster_path IS NULL AND poster_checked = 0",
    (err, result) => {
      if (err) {
        console.error("DB error:", err);
        return;
      }

      const totalToUpdate = result.count;
      console.log(`📊 ${totalToUpdate} movies need poster update.`);

      db.all(
        "SELECT id FROM movies WHERE poster_path IS NULL AND poster_checked = 0 LIMIT 5000",
        async (err, rows) => {
          if (err) {
            console.error("DB error:", err);
            return;
          }

          console.log(`Found ${rows.length} movies in this batch.`);

          for (let i = 0; i < rows.length; i++) {
            const movie = rows[i];
            await updatePoster(movie.id);

            const done = i + 1;
            const percent = ((done / totalToUpdate) * 100).toFixed(2);
            process.stdout.write(
              `\r✅ Progress: ${done}/${totalToUpdate} (${percent}%)`
            );

            // Rate limit kontrolü
            if (i % 30 === 0 && i !== 0) {
              process.stdout.write(
                "\n⏳ Sleeping 10 seconds to avoid rate limit...\n"
              );
              await sleep(10000);
            }
          }

          console.log("\n🎉 Batch finished.");
          console.log(`
Batch Summary (this run only):
- Posters updated: ${updatedCount}
- No poster found: ${noPosterCount}
- Failed: ${failedCount}
          `);

          // 🔍 Global summary
          db.get("SELECT COUNT(*) as total FROM movies", (err, totalRes) => {
            db.get(
              "SELECT COUNT(*) as checked FROM movies WHERE poster_checked = 1",
              (err, checkedRes) => {
                db.get(
                  "SELECT COUNT(*) as withPosterChecked FROM movies WHERE poster_checked = 1 AND poster_path IS NOT NULL",
                  (err, withPosterRes) => {
                    db.get(
                      "SELECT COUNT(*) as noPosterChecked FROM movies WHERE poster_checked = 1 AND poster_path IS NULL",
                      (err, noPosterRes) => {
                        console.log(`
===== Global Summary (all time) =====
- Total movies: ${totalRes.total}
- Total checked: ${checkedRes.checked}
- With posters (checked): ${withPosterRes.withPosterChecked}
- Without posters (checked): ${noPosterRes.noPosterChecked}
=====================================
                        `);
                        db.close();
                      }
                    );
                  }
                );
              }
            );
          });
        }
      );
    }
  );
}

main();
