import React, { useEffect, useState } from "react";
import Categories from "../components/Categories";

// Tipado de proyecto según tu modelo/sequelize
type Project = {
  name: string;
  description: string;
  start_date: string;
  end_date: string;
  location: string;
  capacity: number;
  status: string;
};

const Volunteering: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    fetch('https://tu-backend.up.railway.app/api/projects')
      .then(res => res.json())
      .then((data: Project[]) => setProjects(data));
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
        <Categories />
      </section>
    </div>
  );
};

export default Volunteering;
