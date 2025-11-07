import React, { useEffect, useState } from "react";

type Review = {
  id: number; // ¡Ahora necesitas el id!
  content: string;
  date: string;
};

const API_URL = "https://awtc-production.up.railway.app/api/reviews";

const Reviews: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [newContent, setNewContent] = useState("");
  const [editingIdx, setEditingIdx] = useState<number | null>(null);
  const [editContent, setEditContent] = useState("");

  // Cargar reviews
  useEffect(() => {
    fetch(API_URL)
      .then(res => res.json())
      .then((data: Review[]) => setReviews(data));
  }, []);

  // Añadir review
  const handleAddReview = async () => {
    const today = new Date().toISOString().slice(0, 10);
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: newContent, date: today }),
    });
    if (res.ok) {
      const saved = await res.json();
      setReviews([saved, ...reviews]);
      setNewContent("");
    }
  };

  // Empezar a editar
  const handleEditClick = (idx: number) => {
    setEditingIdx(idx);
    setEditContent(reviews[idx].content);
  };

  // Guardar edición
  const handleSaveEdit = async (idx: number) => {
    const reviewToEdit = reviews[idx];
    const res = await fetch(`${API_URL}/${reviewToEdit.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: editContent }),
    });
    if (res.ok) {
      const updated = await res.json();
      const updatedList = reviews.map((r, i) => (i === idx ? updated : r));
      setReviews(updatedList);
      setEditingIdx(null);
      setEditContent("");
    }
  };

  // Eliminar review
  const handleDelete = async (idx: number) => {
    const reviewToDelete = reviews[idx];
    const res = await fetch(`${API_URL}/${reviewToDelete.id}`, {
      method: "DELETE",
    });
    if (res.ok) {
      setReviews(reviews.filter((_, i) => i !== idx));
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold mb-4">Reviews</h1>
      <form
        className="mb-4 flex gap-2"
        onSubmit={async e => {
          e.preventDefault();
          if (newContent.trim()) await handleAddReview();
        }}
      >
        <input
          type="text"
          value={newContent}
          onChange={e => setNewContent(e.target.value)}
          placeholder="Añade una review..."
          className="border p-2 rounded w-full"
        />
        <button type="submit" className="bg-blue-500 text-white px-4 rounded">
          Añadir Review
        </button>
      </form>
      {!reviews.length ? (
        <div>Cargando reviews...</div>
      ) : (
        <ul>
          {reviews.map((review, idx) => (
            <li key={review.id} className="border rounded p-2 mb-3">
              <div>
                <strong>Fecha:</strong> {review.date}
              </div>
              <div>
                <strong>Comentario:</strong>
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
                      Guardar
                    </button>
                    <button
                      onClick={() => setEditingIdx(null)}
                      className="ml-2 px-2 bg-gray-300 rounded"
                    >
                      Cancelar
                    </button>
                  </>
                ) : (
                  <>
                    <span> {review.content}</span>
                    <button
                      onClick={() => handleEditClick(idx)}
                      className="ml-3 px-2 bg-yellow-400 text-black rounded"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(idx)}
                      className="ml-2 px-2 bg-red-500 text-white rounded"
                    >
                      Eliminar
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