import React, { useEffect, useState } from "react";

type Review = {
  content: string;
  date: string;
};

const Reviews: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [newContent, setNewContent] = useState("");
  const [editingIdx, setEditingIdx] = useState<number | null>(null);
  const [editContent, setEditContent] = useState("");

  useEffect(() => {
    fetch('https://awtc-production.up.railway.app/api/reviews')
      .then(res => res.json())
      .then((data: Review[]) => setReviews(data));
  }, []);

  const handleAddReview = () => {
    const today = new Date().toISOString().slice(0, 10);
    const newReview = { content: newContent, date: today };
    setReviews([newReview, ...reviews]);
    setNewContent("");
  };

  const handleEditClick = (idx: number) => {
    setEditingIdx(idx);
    setEditContent(reviews[idx].content);
  };

  const handleSaveEdit = (idx: number) => {
    const updated = reviews.map((review, i) =>
      i === idx ? { ...review, content: editContent } : review
    );
    setReviews(updated);
    setEditingIdx(null);
    setEditContent("");
  };

  const handleDelete = (idx: number) => {
    setReviews(reviews.filter((_, i) => i !== idx));
  };

  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold mb-4">Reviews</h1>
      {/* Add review form */}
      <form
        className="mb-4 flex gap-2"
        onSubmit={e => {
          e.preventDefault();
          if (newContent.trim()) handleAddReview();
        }}
      >
        <input
          type="text"
          value={newContent}
          onChange={e => setNewContent(e.target.value)}
          placeholder="Add a review..."
          className="border p-2 rounded w-full"
        />
        <button type="submit" className="bg-blue-500 text-white px-4 rounded">
          Add Review
        </button>
      </form>
      {!reviews.length ? (
        <div>Loading reviews...</div>
      ) : (
        <ul>
          {reviews.map((review, idx) => (
            <li key={idx} className="border rounded p-2 mb-3">
              <div><strong>Date:</strong> {review.date}</div>
              <div>
                <strong>Message:</strong>
                {editingIdx === idx ? (
                  <>
                    <input
                      type="text"
                      value={editContent}
                      onChange={e => setEditContent(e.target.value)}
                      className="border ml-2"
                    />
                    <button
                      onClick={() => handleSaveEdit(idx)}
                      className="ml-2 px-2 bg-green-500 text-white rounded"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingIdx(null)}
                      className="ml-2 px-2 bg-gray-300 rounded"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <span> {review.content}</span>
                    <button
                      onClick={() => handleEditClick(idx)}
                      className="ml-3 px-2 bg-yellow-400 text-black rounded"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(idx)}
                      className="ml-2 px-2 bg-red-500 text-white rounded"
                    >
                      Delete
                    </button>
                  </>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Reviews;