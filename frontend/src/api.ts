const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

export async function getProjects() {
  const response = await fetch(`${API_URL}/api/projects`);
  if (!response.ok) throw new Error('Error al obtener proyectos');
  return response.json();
}

export async function getCategories() {
  const response = await fetch(`${API_URL}/api/categories`);
  if (!response.ok) throw new Error('Error al obtener categorías');
  return response.json();
}

export async function getReviews() {
  const response = await fetch(`${API_URL}/api/reviews`);
  if (!response.ok) throw new Error('Error al obtener reviews');
  return response.json();
}
