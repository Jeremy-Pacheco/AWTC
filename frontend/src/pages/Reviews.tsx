import React, { useEffect, useState } from "react";

type Review = {
  content: string;
  date: string;
};

const Reviews: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>([]);

  useEffect(() => {
    fetch('https://awtc-production.up.railway.app/api/reviews')
      .then(res => res.json())
      .then((data: Review[]) => setReviews(data));
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold mb-4">Reviews</h1>
      {!reviews.length ? (
        <div>Cargando reviews...</div>
      ) : (
        <ul>
          {reviews.map((review, idx) => (
            <li key={idx}>
              <div><strong>Fecha:</strong> {review.date}</div>
              <div><strong>Comentario:</strong> {review.content}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Reviews;
