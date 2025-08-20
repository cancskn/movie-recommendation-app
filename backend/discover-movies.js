require('dotenv').config();
const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');
const { saveMovieToDB } = require('./db');

const API_KEY = process.env.TMDB_API_KEY;
const BASE_URL = 'https://api.themoviedb.org/3';

const releaseYear = parseInt(process.argv[2]) || 2020;
const totalPages = parseInt(process.argv[3]) || 500;

async function importDiscoverMovies(year = 2020, pages = 500) {
    let totalImported = 0;

    for (let page = 1; page <= pages; page++) {
        const url = `${BASE_URL}/discover/movie?api_key=${API_KEY}&language=en-US&sort_by=popularity.desc&primary_release_year=${year}&page=${page}`;

        try {
            const res = await fetch(url);
            const data = await res.json();
            const movies = data.results || [];

            // Cache only the movies array
            const filePath = path.join(__dirname, `discover-${year}-page-${page}.json`);
            fs.writeFileSync(filePath, JSON.stringify(movies, null, 2));
            console.log(`💾 Cached: discover-${year}-page-${page}.json`);

            // Save to DB
            movies.forEach(movie => {
                saveMovieToDB(movie);
                totalImported++;
            });

            console.log(`✅ Imported ${movies.length} movies from year ${year}, page ${page}`);

            await new Promise(resolve => setTimeout(resolve, 300)); // Delay to avoid hitting rate limits

        } catch (err) {
            console.error(`❌ Error on year ${year}, page ${page}: ${err.message}`);
        }
    }

    console.log(`🎉 Finished importing ${totalImported} movies for year ${year}`);
}

importDiscoverMovies(releaseYear, totalPages);
