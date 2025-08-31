import { useState } from "react";

export default function SmartSearch() {
  const [keyword, setKeyword] = useState("");
  const [favMovieIds, setFavMovieIds] = useState(""); // "12,1891,550" gibi
  const [year, setYear] = useState("");
  const [categoryIds, setCategoryIds] = useState(""); // "28,12" gibi (TMDb genre ids)
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);

  const onSubmit = async (e) => {
    e.preventDefault();
    const favIds = favMovieIds
      .split(",")
      .map(s => s.trim())
      .filter(Boolean)
      .map(Number);

    if (!keyword && favIds.length === 0) {
      alert("Provide at least Keyword or Fav Movies.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/smart-search", {
        method: "POST",
        headers: {"Content-Type":"application/json"},
        body: JSON.stringify({
          keyword: keyword || null,
          favMovieIds: favIds.length ? favIds : null,
          year: year ? Number(year) : null,
          categoryIds: categoryIds
            ? categoryIds.split(",").map(s=>Number(s.trim())).filter(Boolean)
            : null,
          limit: 10
        })
      });
      const data = await res.json();
      setResults(data.results || []);
    } catch (err) {
      console.error(err);
      alert("Search failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="smart-search">
      <form onSubmit={onSubmit} style={{display:"grid", gap:12, maxWidth:640}}>
        <input
          placeholder="Keyword (optional if Fav Movies provided)"
          value={keyword}
          onChange={(e)=>setKeyword(e.target.value)}
        />
        <input
          placeholder="Fav Movies (comma-separated IDs, e.g. 550,603)"
          value={favMovieIds}
          onChange={(e)=>setFavMovieIds(e.target.value)}
        />
        <input
          placeholder="Year (optional)"
          value={year}
          onChange={(e)=>setYear(e.target.value)}
        />
        <input
          placeholder="Category IDs (comma-separated, optional)"
          value={categoryIds}
          onChange={(e)=>setCategoryIds(e.target.value)}
        />
        <button type="submit" disabled={loading}>
          {loading ? "Searching..." : "Smart Search"}
        </button>
      </form>

      <ul style={{marginTop:16, display:"grid", gap:8}}>
        {results.map(r=>(
          <li key={r.id} style={{border:"1px solid #ddd", padding:12, borderRadius:8}}>
            <div style={{fontWeight:600}}>{r.title} ({r.year})</div>
            <div>Score: {r.score.toFixed(4)}</div>
            {r.genres?.length ? <div>Genres: {r.genres.join(", ")}</div> : null}
          </li>
        ))}
      </ul>
    </div>
  );
}
