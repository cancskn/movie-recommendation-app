require('dotenv').config();
const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');
const { saveMovieToDB } = require('./db');

const API_KEY = process.env.TMDB_API_KEY;
const BASE_URL = 'https://api.themoviedb.org/3';

// Command-line arguments: node import-movies.js 10 3
const totalPages = parseInt(process.argv[2]) || 5;
const startPage = parseInt(process.argv[3]) || 1;

async function importMovies(pages = 5, start = 1) {
  try {
    // Fetch genre list for mapping genre_ids to names
    const genreRes = await fetch(`${BASE_URL}/genre/movie/list?api_key=${API_KEY}`);
    const genreData = await genreRes.json();

    const genreMap = {};
    genreData.genres.forEach(g => {
      genreMap[g.id] = g.name;
    });

    let totalImported = 0;

    for (let page = start; page < start + pages; page++) {
      console.log(` Fetching page ${page}...`);

      const res = await fetch(`${BASE_URL}/movie/popular?api_key=${API_KEY}&page=${page}`);
      const data = await res.json();
      const movies = data.results || [];

      // Cache page as JSON
      const filePath = path.join(__dirname, `movies-page-${page}.json`);
      fs.writeFileSync(filePath, JSON.stringify(movies, null, 2));
      console.log(`💾 Cached: movies-page-${page}.json`);

      // Save to DB
      movies.forEach(movie => {
        // Add genre names to the movie object
        movie.genres = movie.genre_ids.map(id => ({ id, name: genreMap[id] || 'Unknown' }));
        saveMovieToDB(movie);
        totalImported++;
      });

      await new Promise(resolve => setTimeout(resolve, 300)); // delay between requests
    }

    console.log(`✅ Finished importing ${totalImported} movies.`);
  } catch (error) {
    console.error('🔥 Error importing movies:', error.message);
  }
}

importMovies(totalPages, startPage);
