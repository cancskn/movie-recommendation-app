const express = require('express');
const axios = require('axios');
require('dotenv').config();
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const { spawn } = require('child_process');
const path = require('path');

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const tmdbApiKey = process.env.REACT_APP_TMDB_API_KEY;

// Connect to SQLite
const db = new sqlite3.Database('./movies.db');

// Genre mapping for TMDB
const genreIds = {
  action: 28,
  adventure: 12,
  animation: 16,
  comedy: 35,
  crime: 80,
  documentary: 99,
  drama: 18,
  family: 10751,
  fantasy: 14,
  history: 36,
  horror: 27,
  music: 10402,
  mystery: 9648,
  romance: 10749,
  'science fiction': 878,
  'tv movie': 10770,
  thriller: 53,
  war: 10752,
  western: 37,
};

// --- Existing TMDB endpoint ---
app.post('/api/movies', async (req, res) => {
  const { 
    category, 
    yearType,
    specificYear,
    startYear,
    endYear,
    beforeAfter,
    yearValue 
  } = req.body;

  console.log('Received data:', req.body);

  const genreId = genreIds[category?.toLowerCase()] || '';

  // Year filter
  let yearQuery = '';
  if (yearType === 'specific' && specificYear) {
    yearQuery = `&primary_release_year=${specificYear}`;
  } else if (yearType === 'between' && startYear && endYear) {
    yearQuery = `&primary_release_date.gte=${startYear}-01-01&primary_release_date.lte=${endYear}-12-31`;
  } else if (yearType === 'beforeAfter' && yearValue) {
    if (beforeAfter === 'before') {
      yearQuery = `&primary_release_date.lte=${yearValue}-12-31`;
    } else {
      yearQuery = `&primary_release_date.gte=${yearValue}-01-01`;
    }
  }

  try {
    const response = await axios.get(
      `https://api.themoviedb.org/3/discover/movie?api_key=${tmdbApiKey}&language=en-US&sort_by=popularity.desc&page=1&with_genres=${genreId}${yearQuery}`
    );

    res.json(response.data.results);
  } catch (error) {
    console.error(
      'Error fetching data from TMDB API:',
      error.response ? error.response.data : error.message
    );
    res.status(500).send('Error fetching data from TMDB API');
  }
});

// --- Cosine similarity (typed & fast) ---
function cosineSimilarityTyped(userVecNormed, movieVec) {
  let dot = 0.0, normB = 0.0;
  const n = userVecNormed.length;
  for (let i = 0; i < n; i++) {
    const b = movieVec[i];
    dot += userVecNormed[i] * b;
    normB += b * b;
  }
  if (normB === 0) return 0;
  return dot / Math.sqrt(normB);
}

// --- Decode BLOB embedding (safe) ---
function decodeEmbedding(blob) {
  if (!blob) return null;

  // Bazı satırlar TEXT olabilir ("[]")
  if (typeof blob === 'string') {
    return null;
  }

  const buf = Buffer.from(blob);

  // Geçersiz boyut kontrolü
  if (buf.length % 4 !== 0) {
    console.warn("Invalid embedding size:", buf.length);
    return null;
  }

  return new Float32Array(buf.buffer, buf.byteOffset, buf.length / 4);
}

// --- Keyword helper ---
function getKeywordEmbedding(keyword) {
  return new Promise((resolve, reject) => {
    console.log("Calling Python for keyword:", keyword);
    const scriptPath = path.join(__dirname, 'keyword_embedding.py');
    const py = spawn('python', [scriptPath, keyword], {
      cwd: __dirname,
      windowsHide: true
    });

    let data = '';
    let errData = '';

    py.stdout.on('data', (chunk) => {
      const s = chunk.toString();
      console.log("Python stdout:", s.slice(0, 200) + (s.length > 200 ? '...<truncated>' : ''));
      data += s;
    });

    py.stderr.on('data', (err) => {
      const s = err.toString();
      console.error("Python error:", s);
      errData += s;
    });

    py.on('error', (err) => {
      console.error('Spawn error:', err);
      reject(err);
    });

    py.on('close', (code) => {
      console.log("Python process exited with code:", code);
      if (code !== 0) {
        return reject(new Error("Python process failed: " + errData));
      }
      try {
        const vec = JSON.parse(data);
        resolve(vec);
      } catch (e) {
        console.error('JSON parse error from Python:', e);
        reject(e);
      }
    });
  });
}

// --- Smart Search endpoint ---
app.post('/api/smart-search', async (req, res) => {
  const { keywords, favoriteMovies, limit, category, yearType, specificYear, startYear, endYear, beforeAfter, yearValue } = req.body;

  const TOP_K = Math.min(Math.max(parseInt(limit || 20, 10), 1), 100);

  console.log('Smart search input:', req.body);
  console.time('smart-search-total');

  try {
    // --- 1) Build user embedding ---
    let vectors = [];

    // Keywords embedding
    if (keywords) {
      const keywordVec = await getKeywordEmbedding(keywords);
      if (keywordVec) vectors.push(new Float32Array(keywordVec));
    }

    // Favorite movies embeddings
    if (favoriteMovies && favoriteMovies.length > 0) {
      const placeholders = favoriteMovies.map(() => '?').join(',');
      const favRows = await new Promise((resolve, reject) => {
        db.all(
          `SELECT embedding FROM movies WHERE LOWER(title) IN (${placeholders})`,
          favoriteMovies.map(m => m.toLowerCase()),
          (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
          }
        );
      });

      const favVecs = favRows
        .map(r => decodeEmbedding(r.embedding))
        .filter(v => v);

      if (favVecs.length > 0) {
        // average favorites
        const dim = favVecs[0].length;
        const avg = new Float32Array(dim);
        favVecs.forEach(v => {
          for (let i = 0; i < dim; i++) avg[i] += v[i];
        });
        for (let i = 0; i < dim; i++) avg[i] /= favVecs.length;
        vectors.push(avg);
      }
    }

    if (vectors.length === 0) {
      return res.json([]);
    }

    // Average all sources (keywords + favorites)
    const dim = vectors[0].length;
    const userArr = new Float32Array(dim);
    vectors.forEach(v => {
      for (let i = 0; i < dim; i++) userArr[i] += v[i];
    });
    for (let i = 0; i < dim; i++) userArr[i] /= vectors.length;

    // Normalize
    let normA = 0.0;
    for (let i = 0; i < userArr.length; i++) normA += userArr[i] * userArr[i];
    normA = Math.sqrt(normA) || 1.0;
    const userNormed = new Float32Array(userArr.length);
    for (let i = 0; i < userArr.length; i++) userNormed[i] = userArr[i] / normA;

    // --- 2) Build SQL with filters ---
    let conditions = [
      "embedding IS NOT NULL",
      "overview IS NOT NULL",
      "TRIM(overview) <> ''",
      "poster_path IS NOT NULL",
      "TRIM(poster_path) <> ''",
    ];
    let params = [];

    if (yearType === "specific" && specificYear) {
      conditions.push("year = ?");
      params.push(parseInt(specificYear, 10));
    } else if (yearType === "between" && startYear && endYear) {
      conditions.push("year BETWEEN ? AND ?");
      params.push(parseInt(startYear, 10), parseInt(endYear, 10));
    } else if (yearType === "beforeAfter" && yearValue) {
      if (beforeAfter === "before") {
        conditions.push("year <= ?");
        params.push(parseInt(yearValue, 10));
      } else {
        conditions.push("year >= ?");
        params.push(parseInt(yearValue, 10));
      }
    }


    if (category) {
      const gid = genreIds[category.toLowerCase()];
      if (gid) {
        // genres is like "12,16,878"
        conditions.push("(',' || genres || ',') LIKE ?");
        params.push(`%,${gid},%`);
    }
  }

    const sql = `
      SELECT id, title, overview, year AS release_date, rating AS vote_average, poster_path, genres, CAST(embedding AS BLOB) AS embedding
      FROM movies
      WHERE ${conditions.join(" AND ")}
    `;

    // --- 3) Scan and rank ---
    console.time('smart-search-scan');
    const top = [];

    function pushTop(item) {
      if (top.length === 0) {
        top.push(item);
        return;
      }
      if (top.length >= TOP_K && item.score <= top[top.length - 1].score) {
        return;
      }
      let inserted = false;
      for (let i = 0; i < top.length; i++) {
        if (item.score > top[i].score) {
          top.splice(i, 0, item);
          inserted = true;
          break;
        }
      }
      if (!inserted) top.push(item);
      if (top.length > TOP_K) top.length = TOP_K;
    }

    let rowCount = 0;
    db.each(
      sql,
      params,
      (err, r) => {
        if (err) {
          console.error('DB row error:', err);
          return;
        }
        rowCount++;

        const movieVec = decodeEmbedding(r.embedding);
        if (!movieVec || movieVec.length !== userNormed.length) return;

        const score = cosineSimilarityTyped(userNormed, movieVec);

        pushTop({
          id: r.id,
          title: r.title,
          overview: r.overview,
          release_date: r.release_date,
          vote_average: r.vote_average,
          poster_path: r.poster_path,
          genres: r.genres,
          score
        });
      },
      (err, num) => {
        console.timeEnd('smart-search-scan');
        if (err) {
          console.error('DB complete error:', err);
          return res.status(500).send('Database error');
        }
        console.log(`Scanned rows: ${num} (pushed: ${top.length})`);
        console.timeEnd('smart-search-total');
        return res.json(top);
      }
    );

  } catch (error) {
    console.error('Smart search error:', error);
    console.timeEnd('smart-search-total');
    res.status(500).send('Smart search failed');
  }
});


app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
