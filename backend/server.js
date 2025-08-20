const express = require('express');
const axios = require('axios');
require('dotenv').config();
const cors = require('cors');

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const tmdbApiKey = process.env.REACT_APP_TMDB_API_KEY;

// Kategori isimlerini TMDB genre ID'lerine eşleyen nesne
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



app.post('/api/movies', async (req, res) => {
  const { 
    category, 
    favoriteMovies, 
    keywords,
    yearType,
    specificYear,
    startYear,
    endYear,
    beforeAfter,
    yearValue 
  } = req.body;

  console.log('Received data:', req.body);

  const genreId = genreIds[category?.toLowerCase()] || '';

  // Query for year filtering
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

    console.log('TMDB API response:', response.data);
    res.json(response.data.results);
  } catch (error) {
    console.error(
      'Error fetching data from TMDB API:',
      error.response ? error.response.data : error.message
    );
    res.status(500).send('Error fetching data from TMDB API');
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
