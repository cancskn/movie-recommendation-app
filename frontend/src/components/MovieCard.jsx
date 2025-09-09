import { Card, Badge } from "flowbite-react";

export default function MovieCard({ movie }) {
  return (
    <Card
      imgAlt={movie.title}
      imgSrc={
        movie.poster_path
          ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
          : "https://via.placeholder.com/500x750?text=No+Image"
      }
      className="max-w-sm hover:shadow-lg transition"
    >
      <h5 className="text-lg font-bold tracking-tight text-gray-900 dark:text-white">
        {movie.title}
      </h5>

      <p className="text-sm text-gray-700 dark:text-gray-400 line-clamp-3">
        {movie.overview || "No description available."}
      </p>

      <div className="flex items-center justify-between mt-2">
        <p className="text-xs text-gray-500">
          {movie.release_date ? `📅 ${movie.release_date}` : ""}
        </p>
        {movie.vote_average && (
          <span className="text-xs font-semibold text-yellow-600">
            ⭐ {movie.vote_average.toFixed(1)}
          </span>
        )}
      </div>

      {movie.genres && (
        <div className="flex flex-wrap gap-1 mt-2">
          {Array.isArray(movie.genres)
            ? movie.genres.map((g) => (
                <Badge key={g} color="gray" size="xs">
                  {g}
                </Badge>
              ))
            : movie.genres
            ? movie.genres.split(",").map((g) => (
                <Badge key={g.trim()} color="gray" size="xs">
                  {g.trim()}
                </Badge>
              ))
            : null}
        </div>
)}
    </Card>
  );
}
