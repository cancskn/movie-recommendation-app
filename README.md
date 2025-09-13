# Smart Film Suggestor

A full-stack movie recommendation system that combines TMDb’s movie data with semantic embeddings.

▶ [Watch demo](https://youtu.be/P5eRsLlewbg) – Regular vs Smart Search, Year filters, favorite movies, and keyword search.


---

The app supports **two search modes**:

- **Regular Search** – fetches results directly from TMDb’s API (using filters like popularity, year, genre). No AI involved.  
- **Smart Search** – user keywords and/or favorite movies are converted into vectors with Hugging Face’s [all-MiniLM-L6-v2](https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2) model.  
  These embeddings (384-dim float32 arrays stored as SQLite BLOBs) are compared against movie embeddings using the cosine similarity formula:

  ```text
  cos(A,B) = (A · B) / (||A|| · ||B||)
  ```

This enables **semantic similarity search**, so movies with related meaning (not just matching words) are recommended.

---

## Technologies

- **Backend:** Node.js (Express), Python (embeddings), SQLite  
- **Frontend:** React  
- **External API:** TMDb API  
- **API Design:** RESTful API

## Prerequisites

- Node.js ≥ 18, npm  
- Python ≥ 3.10 (tested with 3.13.5)  
- [TMDb API key](https://developer.themoviedb.org/docs/getting-started)

---

## Environment Variables

Create **backend/.env**:

```env
TMDB_API_KEY=your_tmdb_api_key_here
```

(Optional) Create **frontend/.env** used for test purposes:

```env
REACT_APP_TMDB_API_KEY=your_tmdb_api_key_here
```

---

## Dependencies

- **Backend:** dependencies are listed in `backend/package.json`.  
  Install them with:
  ```bash
  cd backend
  npm install
  ```

- **Frontend:** dependencies are listed in `frontend/package.json`.  
  Install them with:
  ```bash
  cd frontend
  npm install
  ```

- **Python (embeddings):** required for Smart Search.  
  Install from `requirements.txt`:
  ```bash
  pip install -r requirements.txt
  ```
  Packages: `sentence-transformers`, `numpy`, `torch`

---

## Install & Run

### 1) Prepare embeddings (one-time, offline)

Stores float32 embeddings as SQLite BLOBs.

**Windows (PyCharm Terminal / PowerShell):**

```powershell
cd scripts
py -m venv .venv
.\.venv\Scripts\activate
python -m pip install -U pip
pip install -r requirements.txt
python generate-embeddings.py
# optional sanity check
python check-embeddings.py
```

**macOS/Linux:**

```bash
cd scripts
python -m venv .venv
source .venv/bin/activate
python -m pip install -U pip
pip install -r requirements.txt
python generate-embeddings.py
# optional sanity check
python check-embeddings.py
```

### 2) Start the backend

```bash
cd backend
npm install
node server.js   # or: npm start
```

### 3) Start the frontend

```bash
cd frontend
npm install
npm start
```

Now open the app at **http://localhost:3000**

---

## How Smart Search Works

- **Offline**: `generate-embeddings.py` writes 384-dim float32 vectors to SQLite BLOBs.  
- **Online**: User keywords → `keyword-embedding.py` encodes to a vector.  
- **Ranking**: Backend decodes BLOB to `Float32Array` and sorts by cosine similarity:

  ```text
  cos(A,B) = (A · B) / (||A|| · ||B||)
  ```

---

## API Endpoints (Backend)

### Regular Search (filter-based, no text query)

```http
GET  /api/regular-search?genre=<TMDbGenreId>&year=<YYYY>&page=1
GET  /api/regular-search?genre=28&year=2020&page=1
GET  /api/regular-search?year=1999&page=1
GET  /api/regular-search?startYear=1990&endYear=1999&page=1
```

### Smart Search

```http
POST /api/smart-search
Content-Type: application/json

{
  "keywords": "funny space adventure",
  "favoriteMovies": ["Guardians of the Galaxy"],
  "limit": 10
}
```

---

⚠️ **Note:** Smart Search requires pre-imported movies with embeddings in the SQLite DB.  
Run `generate-embeddings.py` first.  
Regular Search works without this step since it fetches data directly from TMDb.
