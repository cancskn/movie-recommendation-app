import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  // State to manage the list of movies, user inputs
  const [category, setCategory] = useState('');
  const [favoriteMovies, setFavoriteMovies] = useState([]);
  const [keywords, setKeywords] = useState('');
  const [recommendations, setRecommendations] = useState([]);

  // State for year-based filtering
  const [yearType, setYearType] = useState(''); // 'specific', 'between', 'beforeAfter'
  const [specificYear, setSpecificYear] = useState('');
  const [startYear, setStartYear] = useState('');
  const [endYear, setEndYear] = useState('');
  const [beforeAfter, setBeforeAfter] = useState('after'); // 'before' or 'after'
  const [yearValue, setYearValue] = useState('');

  // Smart Search
  const [smartMode, setSmartMode] = useState(false);


  // When the film category changes
  const handleCategoryChange = (e) => {
    setCategory(e.target.value);
  };

  // When the favorite movies input changes
  const handleFavoriteMoviesChange = (e) => {
    setFavoriteMovies(e.target.value.split(',').map(movie => movie.trim()));
  };

  // When the keywords input changes
  const handleKeywordsChange = (e) => {
    setKeywords(e.target.value);
  };

  // Function to get recommendations based on user inputs
  const getRecommendations = async () => {
    try {
      // Request to the backend server
      const response = await axios.post('http://localhost:5000/api/movies', {
        category,
        favoriteMovies,
        keywords,
        yearType,
        specificYear,
        startYear,
        endYear,
        beforeAfter,
        yearValue,
        // smartMode,
      });

      // Set the recommendations state with the response data
      setRecommendations(response.data);
    } catch (error) {
      console.error('Error fetching data from backend:', error);
      setRecommendations([]);
    }
  }; // <- Burada fonksiyonun kapanış parantezi eksikti.

  return (
    <div className="App">
      <h1>AI Movie Recommendation</h1>

      <div>
        <label>Category: </label>
        <select value={category} onChange={handleCategoryChange}>
          <option value="">Select a category</option>
          <option value="action">Action</option>
          <option value="adventure">Adventure</option>
          <option value="animation">Animation</option>
          <option value="comedy">Comedy</option>
          <option value="crime">Crime</option>
          <option value="documentary">Documentary</option>
          <option value="drama">Drama</option>
          <option value="family">Family</option>
          <option value="fantasy">Fantasy</option>
          <option value="history">History</option>
          <option value="horror">Horror</option>
          <option value="music">Music</option>
          <option value="mystery">Mystery</option>
          <option value="romance">Romance</option>
          <option value="science fiction">Science Fiction</option>
          <option value="tv movie">TV Movie</option>
          <option value="thriller">Thriller</option>
          <option value="war">War</option>
          <option value="western">Western</option>
        </select>
      </div>

      <div>
        <label>Favorite Movies: </label>
        <input
          type="text"
          value={favoriteMovies.join(', ')}
          onChange={handleFavoriteMoviesChange}
          placeholder="Enter your favorite movies, separated by commas"
        />
      </div>

      <div>
        <label>Keywords: </label>
        <input
          type="text"
          value={keywords}
          onChange={handleKeywordsChange}
          placeholder="Enter keywords for recommendations"
        />
      </div>

      <div>
        <label>Year: </label>

        <select value={yearType} onChange={(e) => setYearType(e.target.value)}>
          <option value="">None</option>
          <option value="specific">Specific Year</option>
          <option value="between">Between Years</option>
          <option value="beforeAfter">Before / After</option>
        </select>

        {yearType === 'specific' && (
          <input
            type="number"
            value={specificYear}
            onChange={(e) => setSpecificYear(e.target.value)}
            placeholder="e.g. 2023"
          />
        )}

        {yearType === 'between' && (
          <>
            <input
              type="number"
              value={startYear}
              onChange={(e) => setStartYear(e.target.value)}
              placeholder="Start Year"
            />
            <input
              type="number"
              value={endYear}
              onChange={(e) => setEndYear(e.target.value)}
              placeholder="End Year"
            />
          </>
        )}

        {yearType === 'beforeAfter' && (
          <>
            <select value={beforeAfter} onChange={(e) => setBeforeAfter(e.target.value)}>
              <option value="after">After</option>
              <option value="before">Before</option>
            </select>
            <input
              type="number"
              value={yearValue}
              onChange={(e) => setYearValue(e.target.value)}
              placeholder="Year"
            />
          </>
        )}
      </div>

      <div style={{ marginTop: '10px', textAlign: 'center' }}>
        <label style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
          <input
            type="checkbox"
            id="smartMode"
            checked={smartMode}
            onChange={() => setSmartMode(!smartMode)}
            title="Enables the AI search based on your choices"
          />
          Smart Recommendation
        </label>
      </div>


      <button onClick={getRecommendations}>Get Recommendations</button>

      <div>
        <h2>Recommended Movies</h2>
        <ul>
          {recommendations.map((movie, index) => (
            <li key={index}>
              {movie.title} ({movie.release_date})
            </li>
          ))}
        </ul>
      </div>
     
    </div>
  );
}

export default App;
