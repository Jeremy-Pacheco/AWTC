import React, { useEffect, useState } from "react";
import HeroImage from "../components/HeroImage";

type Project = {
  id: number;
  name: string;
  description: string;
  start_date: string;
  end_date: string;
  location: string;
  capacity: number;
  status: string;
  filename?: string;
  categoryId?: number | null;
  category?: { id: number; name: string } | null;
};

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';
const IMAGE_URL = import.meta.env.VITE_IMAGE_URL || 'http://localhost:8080/images';

const Volunteering: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    start_date: "",
    end_date: "",
    location: "",
    capacity: 0,
    status: "active",
    file: null as File | null,
    categoryId: '' as number | ''
  });

  const [categories, setCategories] = useState<{ id: number; name: string }[]>([]);

  useEffect(() => {
    fetch(`${API_URL}/api/projects`)
      .then(res => res.json())
      .then((data: Project[]) => setProjects(data))
      .catch(err => console.error("Error fetching projects:", err));

    // fetch categories for filter and form
    fetch(`${API_URL}/api/categories`)
      .then(res => res.json())
      .then((cats: any[]) => setCategories(cats || []))
      .catch(err => console.error('Error fetching categories:', err));
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === "capacity" ? parseInt(value) : value
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData(prev => ({ ...prev, file: e.target.files![0] }));
    }
  };

  const openAddModal = () => {
    setEditingProject(null);
    setFormData({
      name: "",
      description: "",
      start_date: "",
      end_date: "",
      location: "",
      capacity: 0,
      status: "active",
      file: null,
      categoryId: ''
    });
    setShowModal(true);
  };

  const openEditModal = (project: Project) => {
    setEditingProject(project);
    setFormData({
      name: project.name || "",
      description: project.description || "",
      start_date: project.start_date ? project.start_date.split("T")[0] : "",
      end_date: project.end_date ? project.end_date.split("T")[0] : "",
      location: project.location || "",
      capacity: project.capacity || 0,
      status: project.status || "active",
      file: null,
      categoryId: project.categoryId ?? ''
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const data = new FormData();
    data.append("name", formData.name);
    data.append("description", formData.description);
    data.append("start_date", formData.start_date);
    data.append("end_date", formData.end_date);
    data.append("location", formData.location);
    data.append("capacity", formData.capacity.toString());
    data.append("status", formData.status);
    if (formData.categoryId !== '') data.append('categoryId', String(formData.categoryId));
    if (formData.file) data.append("file", formData.file);

    try {
      let url = `${API_URL}/api/projects`;
      let method = "POST";

      if (editingProject) {
        url += `/${editingProject.id}`;
        method = "PUT";
      }

      const res = await fetch(url, { method, body: data });
      if (!res.ok) {
        const errData = await res.json();
        alert("Error: " + JSON.stringify(errData));
        return;
      }

      const savedProject = await res.json();

      if (editingProject) {
        setProjects(prev => prev.map(p => (p.id === savedProject.id ? savedProject : p)));
      } else {
        setProjects(prev => [...prev, savedProject]);
      }

      setShowModal(false);
      setEditingProject(null);
      setFormData({
        name: "",
        description: "",
        start_date: "",
        end_date: "",
        location: "",
        capacity: 0,
        status: "active",
        file: null,
        categoryId: ''
      });
    } catch (err) {
      console.error(err);
      alert("Network error: " + err);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this project?")) return;

    try {
      const res = await fetch(`${API_URL}/api/projects/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      setProjects(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      console.error(err);
      alert("Error deleting project");
    }
  };

  return (
    <>
      {/* Hero */}
      <HeroImage
        title={<h1 className="Display">A Will To Change</h1>}
        imgSrc="/hero-img.jpg"
        heightClass="h-64 md:h-96"
      />

      <div className="p-4">
        <div className="flex flex-col md:flex-row justify-between items-center mt-8 mb-6 px-4 md:px-16">
        <div>
          <h2 className="text-3xl font-bold">Active Projects</h2>
          <p className="text-lg text-gray-600">Small actions, big impact.</p>
        </div>
        <div className="mt-4 md:mt-0 flex items-center gap-2">
          <select className="border rounded p-2">
            <option value="">All Categories</option>
          </select>
          <span>Filter by category</span>
        </div>
      </div>

      <div className="px-4 md:px-16 mb-4 flex justify-end">
        <button
          className="bg-[#F0BB00] text-black hover:bg-[#1f2124] hover:text-white px-4 py-2 rounded-2xl font-semibold shadow"
          onClick={openAddModal}
        >
          Add Project
        </button>
      </div>

      <div className="flex flex-col gap-6 px-4 md:px-16">
        {projects.map(proj => (
          <div
            key={proj.id}
            className="flex flex-col md:flex-row bg-white rounded p-4 md:p-6 gap-4 shadow-lg"
          >
            {proj.filename && (
              <img
                src={`${IMAGE_URL}/${proj.filename}`}
                alt={proj.name}
                className="w-full md:w-48 h-48 object-cover rounded"
              />
            )}
            <div className="flex flex-col justify-between">
              <h3 className="text-2xl font-bold mb-2">{proj.name}</h3>
              <p className="mb-4">{proj.description}</p>
              <div className="flex gap-2">
                <button
                  className="bg-[#F0BB00] text-black px-4 py-2 rounded"
                  onClick={() => openEditModal(proj)}
                >
                  Edit
                </button>
                <button
                  className="bg-red-500 text-white px-4 py-2 rounded"
                  onClick={() => handleDelete(proj.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">{editingProject ? "Edit Project" : "Add Project"}</h2>
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <input
                type="text"
                name="name"
                placeholder="Project Name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="border p-2 rounded"
              />
              <textarea
                name="description"
                placeholder="Description"
                value={formData.description}
                onChange={handleInputChange}
                required
                className="border p-2 rounded"
              />
              <input
                type="date"
                name="start_date"
                value={formData.start_date}
                onChange={handleInputChange}
                required
                className="border p-2 rounded"
              />
              <input
                type="date"
                name="end_date"
                value={formData.end_date}
                onChange={handleInputChange}
                required
                className="border p-2 rounded"
              />
              <input
                type="text"
                name="location"
                placeholder="Location"
                value={formData.location}
                onChange={handleInputChange}
                required
                className="border p-2 rounded"
              />
              <input
                type="number"
                name="capacity"
                placeholder="Capacity"
                value={formData.capacity}
                onChange={handleInputChange}
                required
                className="border p-2 rounded"
              />
              <input
                type="file"
                name="file"
                onChange={handleFileChange}
                className="border p-2 rounded"
              />
              <select
                name="categoryId"
                value={formData.categoryId}
                onChange={e => setFormData(prev => ({ ...prev, categoryId: e.target.value === '' ? '' : Number(e.target.value) }))}
                className="border p-2 rounded"
              >
                <option value="">-- No category --</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              <div className="flex justify-end gap-2 mt-2">
                <button type="button" className="bg-gray-300 px-4 py-2 rounded" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="bg-[#F0BB00] px-4 py-2 rounded">
                  {editingProject ? "Save Changes" : "Add"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      </div>
    </>
  );
};

export default Volunteering;