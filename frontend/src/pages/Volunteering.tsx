import React, { useEffect, useState } from "react";
import HeroImage from "../components/HeroImage";
import AuthModal from "../components/AuthModal";
import AlertModal from "../components/AlertModal";

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

  const [categories, setCategories] = useState<{ id: number; name: string }[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  
  // Alert Modal state
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  
  // Auth modal state
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const [enrolledProjectIds, setEnrolledProjectIds] = useState<number[]>([]);
  const [bannedProjectIds, setBannedProjectIds] = useState<number[]>([]);

  const fetchEnrolledProjects = async () => {
    const token = localStorage.getItem("jwtToken");
    if (!token) {
      setEnrolledProjectIds([]);
      setBannedProjectIds([]);
      return;
    }

    try {
      // Fetch enrolled projects
      const resProjects = await fetch(`${API_URL}/api/users/dashboard/projects`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (resProjects.ok) {
        const data = await resProjects.json();
        const projectIds = data.projects?.map((p: Project) => p.id) || [];
        setEnrolledProjectIds(projectIds);
      }

      // Fetch banned projects
      const resBans = await fetch(`${API_URL}/api/users/dashboard/bans`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (resBans.ok) {
        const data = await resBans.json();
        const bannedIds = data.projects?.map((p: { id: number }) => p.id) || [];
        setBannedProjectIds(bannedIds);
      }
    } catch (err) {
      console.error("Error fetching enrolled projects:", err);
    }
  };

  useEffect(() => {
    fetch(`${API_URL}/api/projects`)
      .then(res => res.json())
      .then((data: Project[]) => setProjects(data))
      .catch(err => console.error("Error fetching projects:", err));

    // fetch categories for filter and form
    fetch(`${API_URL}/api/categories`)
      .then(res => res.json())
      .then((cats: { id: number; name: string }[]) => setCategories(cats || []))
      .catch(err => console.error('Error fetching categories:', err));

    // fetch enrolled projects if logged in
    fetchEnrolledProjects();
  }, []);

  const handleEnroll = async (projectId: number) => {
    // Check if user is logged in
    const token = localStorage.getItem("jwtToken");
    
    if (!token) {
      // User is not logged in, open auth modal
      setAuthMode("login");
      setAuthOpen(true);
      return;
    }

    // User is logged in, proceed with enrollment
    try {
      const res = await fetch(`${API_URL}/api/projects/${projectId}/register`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 409) {
          setAlertMessage("You are already enrolled in this project");
          setAlertOpen(true);
        } else if (res.status === 403) {
          setAlertMessage("You cannot enroll in this project");
          setAlertOpen(true);
        } else {
          setAlertMessage(data.message || "Error enrolling");
          setAlertOpen(true);
        }
        return;
      }

      setAlertMessage("You have successfully enrolled in the project");
      setAlertOpen(true);
      // Refresh enrolled projects
      await fetchEnrolledProjects();
    } catch (err) {
      console.error(err);
      setAlertMessage("Network error enrolling");
      setAlertOpen(true);
    }
  };

  const filteredProjects = selectedCategory
    ? projects.filter(p => p.categoryId === Number(selectedCategory))
    : projects;

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
            <p className="text-lg text-gray-600">Small actions, big impact</p>
          </div>
          <div className="mt-4 md:mt-0 flex items-center gap-2">
                        <span>Filter by category</span>
            <select
              className="border rounded p-2"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>

          </div>
        </div>



        <div className="flex flex-col gap-6 px-4 md:px-16 pb-16">
          {filteredProjects.map(proj => (
            <div
              key={proj.id}
              className="flex flex-col md:flex-row bg-white rounded p-4 md:p-6 gap-4 shadow-2xl"
            >
              {proj.filename && (
                <img
                  src={`${IMAGE_URL}/${proj.filename}`}
                  alt={proj.name}
                  className="w-full md:w-48 h-48 object-cover rounded"
                />
              )}
              <div className="flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-2xl font-bold">{proj.name}</h3>
                    {proj.category && (
                      <span className="bg-[#1f2124] text-white px-3 py-1 rounded-full text-xs font-bold">
                        {proj.category.name}
                      </span>
                    )}
                  </div>
                  <p className="mb-4">{proj.description}</p>
                </div>
                {bannedProjectIds.includes(proj.id) ? (
                  <button
                    disabled
                    className="bg-[#B33A3A] text-white px-4 py-2 rounded-3xl font-semibold cursor-not-allowed w-fit"
                  >
                    Not Available
                  </button>
                ) : enrolledProjectIds.includes(proj.id) ? (
                  <button
                    disabled
                    className="bg-gray-400 text-white px-4 py-2 rounded-3xl font-semibold cursor-not-allowed w-fit"
                  >
                    Already Enrolled
                  </button>
                ) : (
                  <button
                    onClick={() => handleEnroll(proj.id)}
                    className="bg-[#F0BB00] text-black hover:bg-[#1f2124] hover:text-white px-4 py-2 rounded-3xl font-semibold transition-colors w-fit"
                  >
                    Enroll
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Auth Modal */}
        <AuthModal 
          open={authOpen} 
          onClose={() => {
            setAuthOpen(false);
            // Refresh enrolled projects
            fetchEnrolledProjects();
          }} 
          mode={authMode} 
        />

        <AlertModal open={alertOpen} message={alertMessage} onAccept={() => setAlertOpen(false)} />
      </div>
    </>
  );
};

export default Volunteering;