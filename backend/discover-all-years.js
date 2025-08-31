const axios = require("axios");
const fs = require("fs");
require("dotenv").config();
const { saveMovieToDB } = require("./db");

const apiKey = process.env.REACT_APP_TMDB_API_KEY;

async function fetchMoviesByYear(year, maxPages) {11111
  console.log(`\n🎬 Fetching movies for year ${year} (max ${maxPages} pages)...`);

  let page = 1;
  let totalPages = 1;

  while (page <= totalPages && page <= maxPages) {
    try {
      const path = require("path");
      const cachePath = path.join(__dirname, "../data", `discover-${year}-page-${page}.json`);


      let movies;
      if (fs.existsSync(cachePath)) {
        // Cache'ten oku
        movies = JSON.parse(fs.readFileSync(cachePath, "utf8"));
        console.log(`💾 Loaded from cache: ${cachePath}`);
      } else {
        // API'den çek
        const url = `https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&language=en-US&sort_by=popularity.desc&primary_release_year=${year}&page=${page}`;
        const response = await axios.get(url);
        movies = response.data.results;
        totalPages = response.data.total_pages;

        fs.writeFileSync(cachePath, JSON.stringify(movies, null, 2));
        console.log(`💾 Cached: ${cachePath}`);
      }

      movies.forEach((movie) => {
        try {
          saveMovieToDB(movie);
        } catch (err) {
          console.error("❌ Error saving movie:", err.message);
        }
      });

      console.log(`✅ Imported page ${page} of ${totalPages} for ${year}`);
      page++;
    } catch (error) {
      console.error(`❌ Error fetching movies for year ${year}, page ${page}:`, error.message);
      break;
    }
  }
}

async function main() {
  console.log("🚀 Starting full import 1970 → 2025");

  for (let year = 1970; year <= 2025; year++) {
    let maxPages = 100; // default 100 pages (2000 film)
    if (year >= 2000 && year <= 2009) maxPages = 250; // 5000 film
    if (year >= 2010) maxPages = 500; // 10000 film (TMDB max)

    await fetchMoviesByYear(year, maxPages);
  }

  console.log("Import finished for all years.");
}

main();
