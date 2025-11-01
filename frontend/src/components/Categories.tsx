import { useEffect, useState } from "react";
import { getCategories } from "../api";

interface Category {
  id: number;
  name: string;
}

export default function Categories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getCategories()
      .then(data => setCategories(data))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Cargando categorías...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div>
      <h2>Categorías</h2>
      <ul>
        {categories.map(c => (
          <li key={c.id}>{c.name}</li>
        ))}
      </ul>
    </div>
  );
}
