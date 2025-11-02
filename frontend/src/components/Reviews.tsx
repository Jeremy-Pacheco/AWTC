import { useEffect, useState } from "react";
import { getReviews } from "../api";

interface Review {
  id: number;
  user: string;
  comment: string;
  rating: number;
}

export default function Reviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getReviews()
      .then(data => setReviews(data))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Cargando reviews...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div>
      <h2>Reseñas</h2>
      <ul>
        {reviews.map(r => (
          <li key={r.id}>
            <strong>{r.user}</strong> ({r.rating}/5): {r.comment}
          </li>
        ))}
      </ul>
    </div>
  );
}
