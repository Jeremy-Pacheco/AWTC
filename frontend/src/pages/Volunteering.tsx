import React, { useEffect, useState } from "react";

type Project = {
  name: string;
  description: string;
  start_date: string;
  end_date: string;
  location: string;
  capacity: number;
  status: string;
};

type Category = {
  name: string;
  description: string;
};

const Volunteering: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    fetch('https://awtc-production.up.railway.app/api/projects')
      .then(res => res.json())
      .then((data: Project[]) => setProjects(data));
  }, []);

  useEffect(() => {
    fetch('https://awtc-production.up.railway.app/api/categories')
      .then(res => res.json())
      .then((data: Category[]) => setCategories(data));
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold mb-4">Volunteering</h1>
      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-2">Proyectos</h2>
        {!projects.length ? (
          <div>Cargando proyectos...</div>
        ) : (
          <ul>
            {projects.map((proj, idx) => (
              <li key={idx} className="mb-4 p-2 border rounded">
                <div><strong>Nombre:</strong> {proj.name}</div>
                <div><strong>Descripción:</strong> {proj.description}</div>
                <div><strong>Fecha de inicio:</strong> {proj.start_date}</div>
                <div><strong>Fecha de fin:</strong> {proj.end_date}</div>
                <div><strong>Localización:</strong> {proj.location}</div>
                <div><strong>Cupo:</strong> {proj.capacity}</div>
                <div><strong>Estado:</strong> {proj.status}</div>
              </li>
            ))}
          </ul>
        )}
      </section>
      <section>
        <h2 className="text-2xl font-semibold mb-2">Categorías</h2>
        {!categories.length ? (
          <div>Cargando categorías...</div>
        ) : (
          <ul>
            {categories.map((cat, idx) => (
              <li key={idx} className="mb-2 p-2 border rounded">
                <div><strong>Nombre:</strong> {cat.name}</div>
                <div><strong>Descripción:</strong> {cat.description}</div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
};

export default Volunteering;
