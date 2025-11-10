import { useEffect, useState } from "react";
import { getProjects } from "../api";

interface Project {
  id: number;
  name: string;
  description: string;
  categoryId: number;
}

export default function Projects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getProjects()
      .then(data => setProjects(data))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading projects...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div>
      <h2>Projects</h2>
      <ul>
        {projects.map(p => (
          <li key={p.id}>
            <strong>{p.name}</strong>: {p.description}
          </li>
        ))}
      </ul>
    </div>
  );
}
