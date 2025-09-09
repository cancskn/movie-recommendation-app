import { useState } from "react";
import { TextInput, Select, Button } from "flowbite-react";

/**
 * SearchBar
 * - Keeps YearType selectable and disables/clears irrelevant year inputs.
 * - Sends only the fields that belong to the selected YearType.
 * - Favorites/Keywords are enabled only in Smart mode.
 */
export default function SearchBar({ onSearch }) {
  // General
  const [category, setCategory] = useState("");

  // Smart mode + inputs
  const [smartMode, setSmartMode] = useState(false);
  const [favorites, setFavorites] = useState("");
  const [keywords, setKeywords] = useState("");

  // Year filtering
  // yearType: '' | 'specific' | 'between' | 'beforeAfter'
  const [yearType, setYearType] = useState("");
  const [specificYear, setSpecificYear] = useState("");
  const [startYear, setStartYear] = useState("");
  const [endYear, setEndYear] = useState("");
  const [beforeAfter, setBeforeAfter] = useState("after"); // 'before' | 'after'
  const [yearValue, setYearValue] = useState("");

  function handleYearTypeChange(e) {
    const v = e.target.value;
    setYearType(v);

    // Clear irrelevant fields to avoid stale payload
    if (v !== "specific") setSpecificYear("");
    if (v !== "between") {
      setStartYear("");
      setEndYear("");
    }
    if (v !== "beforeAfter") {
      setBeforeAfter("after");
      setYearValue("");
    }
  }

  function buildYearPayload() {
    if (yearType === "specific" && specificYear) {
      return {
        yearType: "specific",
        specificYear,
        startYear: "",
        endYear: "",
        beforeAfter: "after",
        yearValue: "",
      };
    }
    if (yearType === "between" && startYear && endYear) {
      return {
        yearType: "between",
        specificYear: "",
        startYear,
        endYear,
        beforeAfter: "after",
        yearValue: "",
      };
    }
    if (yearType === "beforeAfter" && yearValue) {
      return {
        yearType: "beforeAfter",
        specificYear: "",
        startYear: "",
        endYear: "",
        beforeAfter,
        yearValue,
      };
    }
    // No valid year filter
    return {
      yearType: "",
      specificYear: "",
      startYear: "",
      endYear: "",
      beforeAfter: "after",
      yearValue: "",
    };
  }

  function handleSubmit(e) {
    e.preventDefault();

    const yearPart = buildYearPayload();

    const data = {
      category,
      favoriteMovies: smartMode && favorites
        ? favorites.split(",").map((m) => m.trim()).filter(Boolean)
        : [],
      keywords: smartMode ? keywords : "",
      smartMode,

      // year section (only valid fields populated)
      ...yearPart,
    };

    onSearch(data);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 bg-white p-6 rounded-xl shadow-md"
    >
      {/* Category */}
      <Select name="category" value={category} onChange={(e) => setCategory(e.target.value)}>
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

      {/* Smart inputs */}
      <TextInput
        type="text"
        name="favorites"
        placeholder="Enter your favorite movies (comma separated)"
        value={favorites}
        onChange={(e) => setFavorites(e.target.value)}
        disabled={!smartMode}
      />

      <TextInput
        type="text"
        name="keywords"
        placeholder="Enter keywords..."
        value={keywords}
        onChange={(e) => setKeywords(e.target.value)}
        disabled={!smartMode}
      />

      {/* Year type selector */}
      <Select name="yearType" value={yearType} onChange={handleYearTypeChange}>
        <option value="">No year filter</option>
        <option value="specific">Specific Year</option>
        <option value="between">Between Years</option>
        <option value="beforeAfter">Before / After</option>
      </Select>

      {/* Specific year */}
      <TextInput
        type="number"
        name="specificYear"
        placeholder="e.g. 2023"
        value={specificYear}
        onChange={(e) => setSpecificYear(e.target.value)}
        disabled={yearType !== "specific"}
        min="1870"
        max="2100"
      />

      {/* Between years */}
      <div className="flex gap-2">
        <TextInput
          type="number"
          name="startYear"
          placeholder="Start Year"
          value={startYear}
          onChange={(e) => setStartYear(e.target.value)}
          disabled={yearType !== "between"}
          min="1870"
          max="2100"
        />
        <TextInput
          type="number"
          name="endYear"
          placeholder="End Year"
          value={endYear}
          onChange={(e) => setEndYear(e.target.value)}
          disabled={yearType !== "between"}
          min="1870"
          max="2100"
        />
      </div>

      {/* Before / After */}
      <div className="flex gap-2">
        <Select
          name="beforeAfter"
          value={beforeAfter}
          onChange={(e) => setBeforeAfter(e.target.value)}
          disabled={yearType !== "beforeAfter"}
        >
          <option value="after">After</option>
          <option value="before">Before</option>
        </Select>
        <TextInput
          type="number"
          name="yearValue"
          placeholder="Year"
          value={yearValue}
          onChange={(e) => setYearValue(e.target.value)}
          disabled={yearType !== "beforeAfter"}
          min="1870"
          max="2100"
        />
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
            {/* toggle track */}
          <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-blue-600 relative transition">
            {/* toggle thumb */}
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
