import { useState } from "react";
import { TextInput, Select, Button } from "flowbite-react";

export default function SearchBar({ onSearch }) {
  const [smartMode, setSmartMode] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    const form = new FormData(e.target);
    const data = {
      category: form.get("category"),
      favoriteMovies: form.get("favorites")
        ? form.get("favorites").split(",").map((m) => m.trim())
        : [],
      keywords: form.get("keywords"),
      yearType: form.get("yearType"),
      specificYear: form.get("specificYear"),
      startYear: form.get("startYear"),
      endYear: form.get("endYear"),
      beforeAfter: form.get("beforeAfter"),
      yearValue: form.get("yearValue"),
      smartMode: smartMode,
    };
    onSearch(data);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 bg-white p-6 rounded-xl shadow-md"
    >
      {/* Category */}
      <Select name="category">
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
      </Select>

      {/* Favorites */}
      <TextInput
        type="text"
        name="favorites"
        placeholder="Enter your favorite movies (comma separated)"
        disabled={!smartMode}
      />

      {/* Keywords */}
      <TextInput
        type="text"
        name="keywords"
        placeholder="Enter keywords..."
        disabled={!smartMode}
      />

      {/* Year type */}
      <Select name="yearType">
        <option value="">None</option>
        <option value="specific">Specific Year</option>
        <option value="between">Between Years</option>
        <option value="beforeAfter">Before / After</option>
      </Select>

      {/* Specific year */}
      <TextInput type="number" name="specificYear" placeholder="e.g. 2023" />

      {/* Between years */}
      <div className="flex gap-2">
        <TextInput type="number" name="startYear" placeholder="Start Year" />
        <TextInput type="number" name="endYear" placeholder="End Year" />
      </div>

      {/* Before / After */}
      <div className="flex gap-2">
        <Select name="beforeAfter">
          <option value="after">After</option>
          <option value="before">Before</option>
        </Select>
        <TextInput type="number" name="yearValue" placeholder="Year" />
      </div>

      {/* Smart toggle */}
      <div className="flex items-center gap-3">
        <label htmlFor="smartMode" className="text-sm font-medium">
          Smart Recommendation
        </label>
        <label className="inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            id="smartMode"
            name="smartMode"
            className="sr-only peer"
            checked={smartMode}
            onChange={(e) => setSmartMode(e.target.checked)}
          />
          <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-blue-600 relative transition">
            <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition peer-checked:translate-x-5"></div>
          </div>
        </label>
      </div>

      {/* Submit */}
      <Button type="submit" color="blue">
        Get Recommendations
      </Button>
    </form>
  );
}
