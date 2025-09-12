import { useState } from "react";
import axios from "axios";
import SearchBar from "../components/SearchBar";
import MovieGrid from "../components/MovieGrid";

export default function SearchLogic() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSearch = async (formData) => {
    try {
      setLoading(true);
      setError("");

      const endpoint = formData.smartMode
        ? "http://localhost:5000/api/smart-search" // SMART SEARCH
        : "http://localhost:5000/api/movies";      // NORMAL SEARCH

      const res = await axios.post(endpoint, formData);

      setMovies(res.data || []);
    } catch (err) {
      console.error("Search error:", err);
      setError("Failed to fetch movies. Please try again.");
      setMovies([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold mb-6">🎬 Smart Film Suggestor</h1>

      <SearchBar onSearch={handleSearch} />

      {loading && <p className="mt-4 text-blue-600">Loading...</p>}
      {error && <p className="mt-4 text-red-600">{error}</p>}

      <MovieGrid movies={movies} />
    </div>
  );
}
