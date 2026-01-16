import React, { useEffect, useState, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { useTranslation } from "react-i18next";
import HeroImage from "../components/HeroImage";
import AuthModal from "../components/AuthModal";
import AlertModal from "../components/AlertModal";
import { useSearchParams } from "react-router-dom";
import { handleAuthFetch } from "../utils/auth";

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
  volunteerCount?: number;
};

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';
const IMAGE_URL = import.meta.env.VITE_IMAGE_URL || 'http://localhost:8080/images';

const Volunteering: React.FC = () => {
  const { t } = useTranslation();
  const [projects, setProjects] = useState<Project[]>([]);
  const [searchParams] = useSearchParams();
  const projectRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});
  const socketRef = useRef<Socket | null>(null);

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
  
  // Volunteer count state: Map of projectId -> { enrolled: number, capacity: number }
  const [volunteerCounts, setVolunteerCounts] = useState<{ [key: number]: { enrolled: number; capacity: number } }>({});

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 5;

  // Initialize WebSocket connection
  useEffect(() => {
    const socket = io(`${API_URL}/volunteering`, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5
    });

    socket.on('connected', (data) => {
      console.log('Connected to volunteering WebSocket:', data);
    });

    // Listen for volunteer count updates
    socket.on('volunteer_count_updated', (data) => {
      const { projectId, enrolled, capacity } = data;
      setVolunteerCounts((prev) => ({
        ...prev,
        [projectId]: { enrolled, capacity }
      }));
      console.log(`Volunteer count updated for project ${projectId}: ${enrolled}/${capacity}`);
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from volunteering WebSocket');
    });

    socketRef.current = socket;

    return () => {
      socket.disconnect();
    };
  }, []);

  const fetchEnrolledProjects = async () => {
    const token = localStorage.getItem("jwtToken");
    if (!token) {
      setEnrolledProjectIds([]);
      setBannedProjectIds([]);
      return;
    }

    try {
      // Fetch enrolled projects
      const resProjects = await handleAuthFetch(`${API_URL}/api/users/dashboard/projects`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (resProjects.ok) {
        const data = await resProjects.json();
        const projectIds = data.projects?.map((p: Project) => p.id) || [];
        setEnrolledProjectIds(projectIds);
      }

      // Fetch banned projects
      const resBans = await handleAuthFetch(`${API_URL}/api/users/dashboard/bans`, {
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
    const fetchProjects = async () => {
      try {
        const res = await fetch(`${API_URL}/api/projects`);
        const data = await res.json();
        setProjects(data);
        
        // Initialize volunteer counts from project data
        const initialCounts: { [key: number]: { enrolled: number; capacity: number } } = {};
        data.forEach((p: Project) => {
          initialCounts[p.id] = {
            enrolled: p.volunteerCount || 0,
            capacity: p.capacity
          };
        });
        setVolunteerCounts(initialCounts);
        
        // Scroll to specific project if ID in URL
        const projectId = searchParams.get("project");
        if (projectId) {
          // Clear any category filter to ensure the project is visible
          setSelectedCategory("");
          
          setTimeout(() => {
            const element = projectRefs.current[Number(projectId)];
            if (element) {
              element.scrollIntoView({ behavior: "smooth", block: "center" });
              // Add highlight effect
              element.classList.add("ring-4", "ring-yellow-400");
              setTimeout(() => {
                element.classList.remove("ring-4", "ring-yellow-400");
              }, 2000);
            }
          }, 300);
        }
      } catch (err) {
        console.error("Error fetching projects:", err);
      }
    };

    fetchProjects();

    // Fetch categories for filter
    fetch(`${API_URL}/api/categories`)
      .then(res => res.json())
      .then((cats: { id: number; name: string }[]) => setCategories(cats || []))
      .catch(err => console.error('Error fetching categories:', err));

    // Fetch enrolled projects if logged in
    fetchEnrolledProjects();
  }, [searchParams]);

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
          setAlertMessage(t('volunteering.alreadyEnrolled'));
          setAlertOpen(true);
        } else if (res.status === 403) {
          setAlertMessage(t('volunteering.cannotEnroll'));
          setAlertOpen(true);
        } else if (res.status === 400) {
          setAlertMessage(data.message || t('volunteering.fullCapacity'));
          setAlertOpen(true);
        } else {
          setAlertMessage(data.message || t('volunteering.errorEnrolling'));
          setAlertOpen(true);
        }
        return;
      }

      setAlertMessage(t('volunteering.enrollSuccess'));
      setAlertOpen(true);
      // Refresh enrolled projects
      await fetchEnrolledProjects();
    } catch (err) {
      console.error(err);
      setAlertMessage(t('volunteering.networkError'));
      setAlertOpen(true);
    }
  };

  // Check if a project is at full capacity
  const isProjectFull = (projectId: number): boolean => {
    const count = volunteerCounts[projectId];
    if (!count) return false;
    return count.enrolled >= count.capacity;
  };

  const filteredProjects = selectedCategory
    ? projects.filter(p => p.categoryId === Number(selectedCategory))
    : projects;

  // Reset to page 1 when category changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory]);

  // Pagination logic
  const totalPages = Math.ceil(filteredProjects.length / ITEMS_PER_PAGE);
  const paginatedProjects = filteredProjects.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Generate page numbers to display
  const getPageNumbers = (): (number | string)[] => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;
    
    if (totalPages <= maxVisible + 2) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      
      if (currentPage > 3) {
        pages.push('...');
      }
      
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      
      if (currentPage < totalPages - 2) {
        pages.push('...');
      }
      
      pages.push(totalPages);
    }
    
    return pages;
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll to top of projects section
    window.scrollTo({ top: 300, behavior: 'smooth' });
  };

  return (
    <>
      {/* Hero */}
      <HeroImage
        title={<h1 className="Display">{t('common.appName')}</h1>}
        imgSrc="/hero-img.jpg"
        heightClass="h-64 md:h-96"
      />

      <div className="p-4">
        <div className="flex flex-col md:flex-row justify-between items-center mt-8 mb-6 px-4 md:px-16">
          <div>
            <h2 className="text-3xl font-bold">{t('volunteering.activeProjects')}</h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">{t('volunteering.subtitle')}</p>
          </div>
          <div className="mt-4 md:mt-0 flex items-center gap-2">
            <span className="text-gray-700 dark:text-gray-300">{t('volunteering.filterByCategory')}</span>
            <select
              className="border border-gray-300 rounded p-2 bg-white text-gray-800 dark:bg-[var(--bg-secondary)] dark:border-gray-600 dark:text-white"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="">{t('volunteering.allCategories')}</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex flex-col gap-6 px-4 md:px-16 pb-8">
          {paginatedProjects.map(proj => {
            const isFull = isProjectFull(proj.id);
            const count = volunteerCounts[proj.id];
            
            return (
              <div
                key={proj.id}
                ref={(el) => {
                  if (el) projectRefs.current[proj.id] = el;
                }}
                className="flex flex-col md:flex-row bg-white dark:bg-[var(--card-bg)] rounded-xl p-4 md:p-6 gap-4 shadow-xl dark:shadow-2xl dark:shadow-black/30 border border-gray-100 dark:border-gray-700 transition-all duration-300 hover:shadow-2xl hover:scale-[1.01]"
              >
                {proj.filename && (
                  <img
                    src={`${IMAGE_URL}/${proj.filename}`}
                    alt={proj.name}
                    className="w-full md:w-48 h-48 object-cover rounded"
                  />
                )}
                <div className="flex flex-col justify-between w-full">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-2xl font-bold">{proj.name}</h3>
                      {proj.category && (
                        <span className="bg-[#1f2124] text-white px-3 py-1 rounded-full text-xs font-bold">
                          {proj.category.name}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">📍 {proj.location}</p>
                    
                    <p className="mb-4">{proj.description}</p>
                  </div>
                  
                  {/* Button and Capacity section */}
                  <div className="flex flex-col-reverse sm:flex-row justify-between items-end gap-2 sm:gap-4">
                    <div className="flex gap-2 w-full sm:w-auto">
                      {bannedProjectIds.includes(proj.id) ? (
                        <button
                          disabled
                          className="bg-[#B33A3A] text-white px-4 py-2 rounded-3xl font-semibold cursor-not-allowed w-full sm:w-fit text-center"
                        >
                          {t('volunteering.notAvailable')}
                        </button>
                      ) : enrolledProjectIds.includes(proj.id) ? (
                        <button
                          disabled
                          className="bg-gray-400 text-white px-4 py-2 rounded-3xl font-semibold cursor-not-allowed w-full sm:w-fit text-center"
                        >
                          {t('volunteering.alreadyEnrolledBtn')}
                        </button>
                      ) : isFull ? (
                        <button
                          disabled
                          className="bg-red-600 text-white px-4 py-2 rounded-3xl font-semibold cursor-not-allowed w-full sm:w-fit text-center"
                        >
                          {t('volunteering.full')}
                        </button>
                      ) : (
                        <button
                          onClick={() => handleEnroll(proj.id)}
                          className="bg-[#F0BB00] text-black hover:bg-[#1f2124] hover:text-white px-4 py-2 rounded-3xl font-semibold transition-colors w-full sm:w-fit text-center"
                        >
                          {t('volunteering.enroll')}
                        </button>
                      )}
                    </div>

                    {/* Display volunteer capacity */}
                    <div className="text-sm font-semibold whitespace-nowrap self-end">
                      <span className={isFull ? 'text-red-600 font-bold' : 'text-[#F0BB00] font-bold'}>
                        {t('volunteering.volunteers')}: {count ? `${count.enrolled}/${count.capacity}` : `0/${proj.capacity}`}
                      </span>
                      {isFull}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-1 mb-8 flex-wrap px-4">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-2 rounded border border-gray-300 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-700 text-sm"
            >
              {t('dashboard.previous')}
            </button>
            
            {getPageNumbers().map((page, index) => (
              typeof page === 'number' ? (
                <button
                  key={index}
                  onClick={() => handlePageChange(page)}
                  className={`px-3 py-2 rounded border text-sm min-w-[40px] ${
                    currentPage === page
                      ? 'bg-[#F0BB00] text-black border-[#F0BB00] font-semibold'
                      : 'border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  {page}
                </button>
              ) : (
                <span key={index} className="px-2 py-2 text-gray-500">
                  {page}
                </span>
              )
            ))}
            
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-3 py-2 rounded border border-gray-300 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-700 text-sm"
            >
              {t('dashboard.next')}
            </button>
          </div>
        )}

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