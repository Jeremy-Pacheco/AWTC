import React, { useEffect, useState } from "react";
import { useTranslation } from 'react-i18next';
import ConfirmModal from '../components/ConfirmModal';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from "framer-motion";
import { handleAuthFetch } from '../utils/auth';

const API_URL = import.meta.env.VITE_API_URL;

type User = {
  id: number;
  name: string;
  email?: string;
  profileImage?: string;
  role: string;
};

const modalVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.95 },
};

const Dashboard: React.FC = () => {
  const { t } = useTranslation();
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<
    "profile" | "myprojects" | "projects" | "users" | "contacts" | "categories" | "reviews"
  >("profile");
  const [showEditModal, setShowEditModal] = useState(false);
  const [confirmModal, setConfirmModal] = useState<{ open: boolean; title?: string; message?: string; onConfirm?: (() => void) | null; danger?: boolean }>({ open: false, title: '', message: '', onConfirm: null, danger: false });
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [editName, setEditName] = useState("");
  const [editFile, setEditFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [imageVersion, setImageVersion] = useState<number>(Date.now());
  const [token, setToken] = useState<string | null>(null);
  const [myProjects, setMyProjects] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [projectsFilter, setProjectsFilter] = useState<number | "">("");
  const [projectModalOpen, setProjectModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<any | null>(null);
  const [projectForm, setProjectForm] = useState<any>({ name: '', description: '', start_date: '', end_date: '', location: '', capacity: 1, status: 'active', categoryId: '' });
  const [projectFile, setProjectFile] = useState<File | null>(null);
  const [projectFileName, setProjectFileName] = useState<string>("");
  const [usersData, setUsersData] = useState<any[]>([]);
  const [userRoleFilter, setUserRoleFilter] = useState<string | "">("");
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [userProjects, setUserProjects] = useState<any[]>([]);
  const [userModalOpen, setUserModalOpen] = useState(false);

  const [newUserForm, setNewUserForm] = useState({ name: '', email: '', password: '', role: 'volunteer' });
  const [createUserModalOpen, setCreateUserModalOpen] = useState(false);
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any | null>(null);
  const [categoryForm, setCategoryForm] = useState({ name: '', description: '' });
  const navigate = useNavigate();
  // old inline project creation state removed; using modal projectForm/projectFile
  const [contacts, setContacts] = useState<any[]>([]);
  const [contactsFilter, setContactsFilter] = useState<'open'|'closed'|'all'>('open');
  const [reviews, setReviews] = useState<any[]>([]);

  // Pagination states
  const [myProjectsPage, setMyProjectsPage] = useState(1);
  const [projectsPage, setProjectsPage] = useState(1);
  const [categoriesPage, setCategoriesPage] = useState(1);
  const [reviewsPage, setReviewsPage] = useState(1);
  const [usersPage, setUsersPage] = useState(1);
  const [incidentsPage, setIncidentsPage] = useState(1);
  const [userProjectsPage, setUserProjectsPage] = useState(1);

  // Items per page
  const ITEMS_PER_PAGE = {
    myProjects: 5,
    projects: 5,
    categories: 10,
    reviews: 3,
    users: 5,
    incidents: 5,
    userProjects: 5
  };

  // Pagination helper functions
  const paginate = (items: any[], page: number, itemsPerPage: number) => {
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return items.slice(startIndex, endIndex);
  };

  const getTotalPages = (totalItems: number, itemsPerPage: number) => {
    return Math.ceil(totalItems / itemsPerPage);
  };

  // Generate page numbers to display
  const getPageNumbers = (currentPage: number, totalPages: number): (number | string)[] => {
    const pages: (number | string)[] = [];
    const maxVisible = 5; // Max number of page buttons to show
    
    if (totalPages <= maxVisible + 2) {
      // Show all pages if total is small
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);
      
      if (currentPage > 3) {
        pages.push('...');
      }
      
      // Show pages around current
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      
      if (currentPage < totalPages - 2) {
        pages.push('...');
      }
      
      // Always show last page
      pages.push(totalPages);
    }
    
    return pages;
  };

  // Pagination component
  const PaginationControls: React.FC<{
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
  }> = ({ currentPage, totalPages, onPageChange }) => {
    if (totalPages <= 1) return null;

    const pageNumbers = getPageNumbers(currentPage, totalPages);

    return (
      <div className="flex justify-center items-center gap-1 mt-4 flex-wrap">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-3 py-1 rounded border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 text-sm"
        >
          {t('dashboard.previous')}
        </button>
        
        {pageNumbers.map((page, index) => (
          typeof page === 'number' ? (
            <button
              key={index}
              onClick={() => onPageChange(page)}
              className={`px-3 py-1 rounded border text-sm min-w-[36px] ${
                currentPage === page
                  ? 'bg-[#F0BB00] text-black border-[#F0BB00] font-semibold'
                  : 'border-gray-300 hover:bg-gray-100'
              }`}
            >
              {page}
            </button>
          ) : (
            <span key={index} className="px-2 py-1 text-gray-500">
              {page}
            </span>
          )
        ))}
        
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-3 py-1 rounded border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 text-sm"
        >
          {t('dashboard.next')}
        </button>
      </div>
    );
  };

  // Load token and fetch user data from backend
  // Load user from backend or localStorage
  useEffect(() => {
    const storedToken = localStorage.getItem("jwtToken");
    if (!storedToken) return;

    setToken(storedToken);

    const fetchUser = async () => {
      try {
        const res = await handleAuthFetch(`${API_URL}/api/users/dashboard`, {
          headers: { Authorization: `Bearer ${storedToken}` },
        });
        
        if (!res.ok) throw new Error("Failed to fetch user data");

        const data = await res.json();
        setUser(data.user);
        setEditName(data.user.name || "");

        localStorage.setItem("userName", data.user.name);
        localStorage.setItem("userRole", data.user.role);
        localStorage.setItem("userEmail", data.user.email || "");
        if (data.user.profileImage) {
          localStorage.setItem("userProfileImage", data.user.profileImage);
        }
      } catch (err) {
        console.error("Error fetching user:", err);

        const storedName = localStorage.getItem("userName");
        const storedRole = localStorage.getItem("userRole");
        const storedEmail = localStorage.getItem("userEmail");
        const storedProfileImage = localStorage.getItem("userProfileImage");

        if (storedName && storedRole) {
          setUser({
            id: 0,
            name: storedName,
            role: storedRole,
            email: storedEmail || "",
            profileImage: storedProfileImage || undefined,
          });
          setEditName(storedName);
        }
      }
    };

    fetchUser();
  }, [navigate]);

  useEffect(() => {
    if (!token) return;
    // fetch my projects
    async function fetchMyProjects() {
      try {
        const res = await fetch(`${API_URL}/api/users/dashboard/projects`, { headers: { Authorization: `Bearer ${token}` } });
        if (!res.ok) throw new Error('Failed to fetch projects');
        const data = await res.json();
        setMyProjects(data.projects || []);
      } catch (err) {
        console.error('Error fetching my projects', err);
      }
    }
    fetchMyProjects();

    // fetch reviews
    async function fetchReviews() {
      try {
        const res = await fetch(`${API_URL}/api/reviews`);
        if (!res.ok) throw new Error('Failed to fetch reviews');
        const data = await res.json();
        setReviews(data || []);
      } catch (err) {
        console.error('Error fetching reviews', err);
      }
    }
    fetchReviews();

    // fetch contacts if admin
    async function fetchContacts() {
      try {
        if (!user || user.role !== 'admin') return;
        const res = await fetch(`${API_URL}/api/contacts`, { headers: { Authorization: `Bearer ${token}` } });
        if (!res.ok) throw new Error('Failed to fetch contacts');
        const data = await res.json();
        setContacts(data);
      } catch (err) {
        console.error('Error fetching contacts', err);
      }
    }
    fetchContacts();
  }, [token, user]);

  // Clear status messages automatically after 4 seconds
  useEffect(() => {
    if (!statusMessage) return;
    const id = setTimeout(() => setStatusMessage(null), 4000);
    return () => clearTimeout(id);
  }, [statusMessage]);

  useEffect(() => {
    if (!token || !user) return;
    // fetch categories
    fetch(`${API_URL}/api/categories`).then(r => r.json()).then(setCategories).catch(console.error);
    // fetch all projects for admin/coordinator
    if (user.role === 'admin' || user.role === 'coordinator') {
      fetch(`${API_URL}/api/projects`).then(r => r.json()).then(setProjects).catch(console.error);
    }
    // fetch users if admin
    if (user.role === 'admin') {
      fetch(`${API_URL}/api/users`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()).then(setUsersData).catch(console.error);
    }
  }, [token, user]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      setEditFile(selected);
      setPreview(URL.createObjectURL(selected));
    }
  };

  const handleProjectFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setProjectFile(e.target.files[0]);
      setProjectFileName(e.target.files[0].name);
    }
  };

  const handleSubmitProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return setStatusMessage({ type: 'error', text: t('dashboard.loginRequired') });
    try {
      const fd = new FormData();
      fd.append('name', projectForm.name);
      fd.append('description', projectForm.description);
      fd.append('start_date', projectForm.start_date);
      fd.append('end_date', projectForm.end_date);
      fd.append('location', projectForm.location);
      fd.append('capacity', String(projectForm.capacity));
      fd.append('status', projectForm.status);
      if (projectForm.categoryId !== '') fd.append('categoryId', String(projectForm.categoryId));
      if (projectFile) fd.append('file', projectFile);
      let url = `${API_URL}/api/projects`;
      let method = 'POST';
      if (editingProject) { url = `${API_URL}/api/projects/${editingProject.id}`; method = 'PUT'; }
      const res = await fetch(url, { method, headers: { Authorization: `Bearer ${token}` }, body: fd });
      if (!res.ok) { const err = await res.json(); return setStatusMessage({ type: 'error', text: err.message || t('dashboard.errorSaving') }); }
      await res.json();
      // reload projects
      const all = await fetch(`${API_URL}/api/projects`).then(r => r.json());
      setProjects(all);
      setProjectModalOpen(false);
      setEditingProject(null);
    } catch (err) { console.error(err); setStatusMessage({ type: 'error', text: t('dashboard.errorSaving') }); }
  };

  const openConfirm = (title: string, message: string, onConfirm: () => void, danger = false) => {
    setConfirmModal({ open: true, title, message, onConfirm, danger });
  };

  const closeConfirm = () => setConfirmModal({ open: false, title: '', message: '', onConfirm: null, danger: false });

  const unregisterFromProject = async (projectId: number) => {
    if (!token) return setStatusMessage({ type: 'error', text: t('dashboard.loginRequired') });
    try {
      const res = await fetch(`${API_URL}/api/projects/${projectId}/unregister`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) { const err = await res.json(); return setStatusMessage({ type: 'error', text: err.message || t('dashboard.errorSaving') }); }
      // refresh my projects
      const d = await fetch(`${API_URL}/api/users/dashboard/projects`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json());
      setMyProjects(d.projects || []);
      setStatusMessage({ type: 'success', text: t('dashboard.unregistered') });
    } catch (err) { console.error(err); setStatusMessage({ type: 'error', text: t('dashboard.networkError') }); }
  };

  const handleRejectUserFromProject = async (projectId: number, userId: number) => {
    if (!token) return setStatusMessage({ type: 'error', text: t('dashboard.loginRequired') });
    try {
      const res = await fetch(`${API_URL}/api/projects/${projectId}/volunteers/${userId}/reject`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) { const err = await res.json(); return setStatusMessage({ type: 'error', text: err.message || t('dashboard.networkError') }); }
      // reload user projects
      const d = await fetch(`${API_URL}/api/users/${userId}/projects`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json());
      setUserProjects(d.projects || []);
      setStatusMessage({ type: 'success', text: t('dashboard.userBanned') });
    } catch (err) { console.error(err); setStatusMessage({ type: 'error', text: t('dashboard.networkError') }); }
  };

  const handleUnbanUserFromProject = async (projectId: number, userId: number) => {
    if (!token) return setStatusMessage({ type: 'error', text: t('dashboard.loginRequired') });
    try {
      const res = await fetch(`${API_URL}/api/projects/${projectId}/volunteers/${userId}/unban`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) { const err = await res.json(); return setStatusMessage({ type: 'error', text: err.message || t('dashboard.networkError') }); }
      const d = await fetch(`${API_URL}/api/users/${userId}/projects`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json());
      setUserProjects(d.projects || []);
      setStatusMessage({ type: 'success', text: t('dashboard.userUnbanned') });
    } catch (err) { console.error(err); setStatusMessage({ type: 'error', text: t('dashboard.networkError') }); }
  };

  const handleDeleteOwnProfile = async () => {
    if (!token) return setStatusMessage({ type: 'error', text: t('dashboard.loginRequired') });
    try {
      const res = await fetch(`${API_URL}/api/users/dashboard`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) { const err = await res.json(); return setStatusMessage({ type: 'error', text: err.message || t('dashboard.errorDeleting') }); }
      // Clear local storage and navigate home
      localStorage.removeItem('jwtToken');
      localStorage.removeItem('userName');
      localStorage.removeItem('userRole');
      localStorage.removeItem('userEmail');
      localStorage.removeItem('userProfileImage');
      setStatusMessage({ type: 'success', text: t('dashboard.profileDeleted') });
      navigate('/home');
    } catch (err) { console.error(err); setStatusMessage({ type: 'error', text: t('dashboard.errorDeleting') }); }
  };

  const createUser = async () => {
    if (!token) return setStatusMessage({ type: 'error', text: t('dashboard.loginRequired') });
    try {
      const res = await fetch(`${API_URL}/api/users/signup`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ name: newUserForm.name, email: newUserForm.email, password: newUserForm.password }) });
      if (!res.ok) { const err = await res.json(); return setStatusMessage({ type: 'error', text: err.message || t('dashboard.errorSaving') }); }
      const data = await res.json();
      if (newUserForm.role && newUserForm.role !== 'volunteer') {
        const res2 = await fetch(`${API_URL}/api/users/${data.user.id}/role`, { method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ role: newUserForm.role }) });
        if (!res2.ok) { const err = await res2.json(); return setStatusMessage({ type: 'error', text: err.message || t('dashboard.errorSaving') }); }
      }
      const users = await fetch(`${API_URL}/api/users`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json());
      setUsersData(users);
      setNewUserForm({ name: '', email: '', password: '', role: 'volunteer' });
      setCreateUserModalOpen(false);
      setStatusMessage({ type: 'success', text: t('dashboard.userCreated') });
    } catch (err) {
      console.error(err);
      setStatusMessage({ type: 'error', text: t('dashboard.errorSaving') });
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !token) return setStatusMessage({ type: 'error', text: t('dashboard.authRequired') });

    const formData = new FormData();
    formData.append("name", editName);
    if (editFile) formData.append("file", editFile);

    try {
      const res = await fetch(`${API_URL}/api/users/dashboard`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json();
        return setStatusMessage({ type: 'error', text: err.message || t('dashboard.errorSaving') });
      }

      const data = await res.json();

      setUser({
        ...user,
        name: data.user.name,
        profileImage: data.user.profileImage,
      });

      localStorage.setItem("userName", data.user.name);
      if (data.user.profileImage) {
        localStorage.setItem("userProfileImage", data.user.profileImage);
      }

      setPreview(null);
      setImageVersion(Date.now());
      setShowEditModal(false);
      setStatusMessage({ type: 'success', text: t('dashboard.profileUpdated') });

      setPreview(null);
      setImageVersion(Date.now());
      setShowEditModal(false);
      setStatusMessage({ type: 'success', text: t('dashboard.profileUpdated') });
    } catch (err) {
      console.error(err);
      setStatusMessage({ type: 'error', text: t('dashboard.errorSaving') });
    }
  };

  if (!user) return <div className="p-6">{t('dashboard.loadingUser')}</div>;

  const profileImageUrl = user.profileImage
    ? `${API_URL}/images/${user.profileImage}?v=${imageVersion}`
    : "/images/default-avatar.png";

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto">
      <h2 className="text-2xl md:text-3xl font-bold mb-6 text-center">{t('dashboard.title')}</h2>
      {statusMessage && (
        <div className={`mb-4 p-3 rounded ${statusMessage.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {statusMessage.text}
        </div>
      )}

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 md:gap-4 mb-6 justify-center">
        {([
          "profile",
          "myprojects",
          ...(user && (user.role === 'admin' || user.role === 'coordinator') ? ["projects", "categories", "reviews"] : []),
          ...(user && user.role === 'admin' ? ["users", "contacts", "analytics"] : []),
        ] as const).map((tab) => (
          <button
            key={tab}
            className={`px-3 md:px-4 py-2 rounded-3xl font-semibold transition text-sm md:text-base ${
              activeTab === tab ? "bg-[#F0BB00] text-black" : "bg-gray-200 hover:bg-[#1f2124] hover:text-white"
            }`}
            onClick={() => {
              if (tab === "analytics") {
                // In development, use API_URL (localhost:8080), in production use Nginx /admin/ route
                const analyticsUrl = import.meta.env.DEV 
                  ? API_URL 
                  : `${window.location.origin}/admin/`;
                window.open(analyticsUrl, '_blank');
              } else {
                setActiveTab(tab as 'profile' | 'myprojects' | 'projects' | 'users' | 'contacts' | 'categories' | 'reviews');
              }
            }}
          >
            {tab === "profile"
              ? t('dashboard.profile')
              : tab === "myprojects"
              ? t('dashboard.myProjects')
              : tab === "reviews"
              ? t('dashboard.reviews')
              : tab === "projects"
              ? t('dashboard.projects')
              : tab === "contacts"
              ? t('dashboard.incidents')
              : tab === "users"
              ? t('dashboard.users')
              : tab === "categories"
              ? t('dashboard.categories')
              : tab === "analytics"
              ? t('dashboard.analytics')
              : ""}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="bg-gray-100 p-4 md:p-6 rounded-lg shadow-md">
        {activeTab === "profile" && (
          <div className="flex flex-col items-center gap-4">
            <img
              src={preview || profileImageUrl}
              alt="Profile"
              className="w-32 h-32 rounded-full object-cover border"
            />
            <h3 className="text-xl font-bold">{user.name}</h3>
            <p>{user.email}</p>
            <button
              className="mt-3 border border-[#767676] text-black px-4 py-2 rounded-3xl hover:bg-[#1f2124] hover:text-white transition"
              onClick={() => setShowEditModal(true)}
            >
              {t('dashboard.editProfile')}
            </button>
            <button
              className="mt-3 bg-[#B33A3A] text-white px-4 py-2 rounded-3xl hover:bg-[#1f2124] hover:text-white transition"
              onClick={() => openConfirm(t('dashboard.deleteProfile'), t('dashboard.deleteProfileConfirm'), async () => { closeConfirm(); await handleDeleteOwnProfile(); }, true)}
            >
              {t('dashboard.deleteProfile')}
            </button>
            
          </div>
        )}
        {activeTab === "projects" && user && (user.role === 'admin' || user.role === 'coordinator') && (
          <div>
            <div className="mb-6 flex flex-col md:flex-row justify-between md:items-center gap-3">
              <h3 className="font-bold mb-2 md:mb-0">{t('dashboard.projects')}</h3>
              <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2">
                <select className="border rounded p-2 text-sm" value={projectsFilter} onChange={(e) => setProjectsFilter(e.target.value === '' ? '' : Number(e.target.value))}>
                  <option value="">{t('dashboard.allCategories')}</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
                <button className="bg-[#F0BB00] text-black hover:bg-[#1f2124] hover:text-white px-4 py-2 rounded-3xl font-semibold shadow text-sm" onClick={() => { setProjectModalOpen(true); setEditingProject(null); setProjectForm({ name: '', description: '', start_date: '', end_date: '', location: '', capacity: 1, status: 'active', categoryId: '' }); setProjectFile(null); setProjectFileName(''); }}>
                  {t('dashboard.addProject')}
                </button>
              </div>
            </div>

            <div className="mb-4">
              {paginate((projects || []).filter(p => projectsFilter === '' ? true : p.categoryId === projectsFilter), projectsPage, ITEMS_PER_PAGE.projects).map(p => (
                <div key={p.id} className="border p-3 mb-2 rounded">
                  <div className="flex flex-col md:flex-row justify-between md:items-start gap-3">
                    <div className="flex-1">
                      <strong className="text-sm md:text-base">{p.name}</strong> {p.status && <span className="text-gray-500 text-sm">({p.status})</span>}<br />
                      <div className="text-sm">{p.description}</div>
                    </div>
                    <div className="flex gap-2 flex-wrap md:flex-nowrap">
                      <button className="border border-[#767676] text-black hover:bg-[#1f2124] hover:text-white transition px-3 py-1 rounded-3xl text-sm" onClick={() => { setEditingProject(p); setProjectModalOpen(true); setProjectForm({ name: p.name, description: p.description, start_date: p.start_date?.split('T')[0] || '', end_date: p.end_date?.split('T')[0] || '', location: p.location || '', capacity: p.capacity || 1, status: p.status || 'active', categoryId: p.categoryId || '' }); setProjectFile(null); setProjectFileName(''); }}>{t('common.edit')}</button>
                      <button className="bg-[#B33A3A] text-white hover:bg-[#1f2124] hover:text-white transition px-3 py-1 rounded-3xl text-sm" onClick={() => openConfirm(t('dashboard.deleteProject'), t('dashboard.deleteProjectConfirm'), async () => { closeConfirm(); try { const res = await fetch(`${API_URL}/api/projects/${p.id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } }); if (!res.ok) { const err = await res.json(); setStatusMessage({ type: 'error', text: err.message || t('dashboard.errorDeleting') }); return; } setProjects(prev => prev.filter(x => x.id !== p.id)); setStatusMessage({ type: 'success', text: t('dashboard.projectDeleted') }); } catch (err) { console.error(err); setStatusMessage({ type: 'error', text: t('dashboard.errorDeleting') }); } }, true)}>{t('common.delete')}</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {projects && projects.length > 0 && (
              <PaginationControls
                currentPage={projectsPage}
                totalPages={getTotalPages((projects || []).filter(p => projectsFilter === '' ? true : p.categoryId === projectsFilter).length, ITEMS_PER_PAGE.projects)}
                onPageChange={setProjectsPage}
              />
            )}
          </div>
        )}
        {activeTab === 'myprojects' && (
          <div>
            <h3 className="font-bold mb-2">{t('dashboard.myProjects')}</h3>
            <div>
              {paginate(myProjects, myProjectsPage, ITEMS_PER_PAGE.myProjects).map(p => (
                <div key={p.id} className="border p-3 mb-2 rounded flex flex-col md:flex-row justify-between md:items-start gap-3">
                  <div className="flex-1">
                    <strong className="text-sm md:text-base">{p.name}</strong> {p.status && <span className="text-gray-500 text-sm">({p.status})</span>}<br />
                    <div className="text-sm">{p.description}</div>
                  </div>
                  <div className="flex gap-2 flex-wrap md:flex-nowrap">
                    <button className="bg-[#B33A3A] text-white hover:bg-[#1f2124] hover:text-white transition px-3 py-1 rounded-3xl text-sm" onClick={() => openConfirm(t('dashboard.unregister'), t('dashboard.unregisterConfirm'), async () => { closeConfirm(); await unregisterFromProject(p.id); }, true)}>{t('dashboard.unregister')}</button>
                  </div>
                </div>
              ))}
            </div>
            <PaginationControls
              currentPage={myProjectsPage}
              totalPages={getTotalPages(myProjects.length, ITEMS_PER_PAGE.myProjects)}
              onPageChange={setMyProjectsPage}
            />
          </div>
        )}
        {activeTab === 'reviews' && (
          <div>
            <h3 className="font-bold mb-2">{t('dashboard.reviews')}</h3>
            <div>
              {reviews.length === 0 ? (
                <p className="text-gray-500 text-center py-4">{t('dashboard.noReviews')}</p>
              ) : (
                paginate(reviews, reviewsPage, ITEMS_PER_PAGE.reviews).map(r => (
                  <div key={r.id} className="border p-4 mb-3 rounded bg-white shadow-sm">
                    <div className="flex flex-col md:flex-row justify-between md:items-start gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <strong className="text-sm md:text-base">{r.user?.name || r.user?.email || 'Anonymous'}</strong>
                          <span className="text-xs text-gray-500">{new Date(r.date).toLocaleDateString()}</span>
                        </div>
                        <p className="text-sm text-gray-700 mb-2">{r.content}</p>
                        {r.image && (
                          <img 
                            src={`${API_URL}${r.image}`} 
                            alt="Review" 
                            className="mt-2 max-w-xs rounded border"
                          />
                        )}
                      </div>
                      {user && (user.role === 'admin' || user.role === 'coordinator') && (
                        <div className="flex gap-2 flex-wrap md:flex-nowrap">
                          <button 
                            className="bg-[#B33A3A] text-white hover:bg-[#1f2124] hover:text-white transition px-3 py-1 rounded-3xl text-sm" 
                            onClick={() => openConfirm(t('dashboard.deleteReview'), t('dashboard.deleteReviewConfirm'), async () => {
                              closeConfirm();
                              try {
                                const res = await fetch(`${API_URL}/api/reviews/${r.id}`, {
                                  method: 'DELETE',
                                  headers: { Authorization: `Bearer ${token}` }
                                });
                                if (!res.ok) {
                                  const err = await res.json();
                                  return setStatusMessage({ type: 'error', text: err.message || t('dashboard.errorDeleting') });
                                }
                                setReviews(prev => prev.filter(x => x.id !== r.id));
                                setStatusMessage({ type: 'success', text: t('dashboard.reviewDeleted') });
                              } catch (err) {
                                console.error(err);
                                setStatusMessage({ type: 'error', text: t('dashboard.errorDeleting') });
                              }
                            }, true)}
                          >
                            {t('common.delete')}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
            {reviews.length > 0 && (
              <PaginationControls
                currentPage={reviewsPage}
                totalPages={getTotalPages(reviews.length, ITEMS_PER_PAGE.reviews)}
                onPageChange={setReviewsPage}
              />
            )}
          </div>
        )}
                {activeTab === 'users' && user && user.role === 'admin' && (
                  <div>
                    <h3 className="font-bold mb-2">{t('dashboard.users')}</h3>
                    <div className="mb-4 flex flex-col md:flex-row gap-2 md:items-center">
                      <select className="border p-2 text-sm" value={userRoleFilter} onChange={(e)=>setUserRoleFilter(e.target.value === '' ? '' : e.target.value)}>
                        <option value="">{t('dashboard.allRoles')}</option>
                        <option value="admin">{t('dashboard.admin')}</option>
                        <option value="coordinator">{t('dashboard.coordinator')}</option>
                        <option value="volunteer">{t('dashboard.volunteer')}</option>
                      </select>
                      <div className="md:ml-auto">
                        <button className="bg-[#F0BB00] text-black hover:bg-[#1f2124] hover:text-white px-4 py-2 rounded-3xl font-semibold shadow text-sm w-full md:w-auto" onClick={() => setCreateUserModalOpen(true)}>{t('dashboard.createUser')}</button>
                      </div>
                    </div>
                    <div>
                      {paginate(usersData.filter(u => userRoleFilter === '' ? true : u.role === userRoleFilter), usersPage, ITEMS_PER_PAGE.users).map(u => (
                        <div key={u.id} className="border p-3 mb-2 rounded flex flex-col md:flex-row justify-between md:items-start gap-3">
                          <div className="flex items-start gap-3 flex-1 min-w-0">
                            {u.profileImage ? (
                              <img
                                src={`${API_URL}/images/${u.profileImage}`}
                                alt={u.name}
                                className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                              />
                            ) : (
                              <div className="w-12 h-12 rounded-full bg-[#F0BB00] flex items-center justify-center flex-shrink-0">
                                <span className="text-black font-bold text-lg">
                                  {u.name.charAt(0).toUpperCase()}
                                </span>
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <strong className="text-sm md:text-base block">{u.name}</strong> <small className="text-gray-500 text-xs md:text-sm block truncate">{u.email}</small> <span className="text-xs md:text-sm text-gray-600">({u.role})</span>
                              <div className="mt-2 flex flex-col sm:flex-row gap-2 items-start sm:items-center">
                                <label className="text-sm">{t('dashboard.role')}:</label>
                                <select defaultValue={u.role} onChange={async (e)=>{ const newRole = e.target.value; try { const res = await fetch(`${API_URL}/api/users/${u.id}/role`, { method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ role: newRole }) }); if (!res.ok) { const err = await res.json(); return setStatusMessage({ type: 'error', text: err.message || t('dashboard.errorSaving') }); } const updated = await res.json(); setUsersData(prev => prev.map(x => x.id === u.id ? { ...x, role: updated.user.role } : x)); setStatusMessage({ type: 'success', text: t('dashboard.roleUpdated') }); } catch (err) { console.error(err); setStatusMessage({ type: 'error', text: t('dashboard.networkError') }); } }} className="text-sm border rounded p-1">
                                  <option value="volunteer">{t('dashboard.volunteer')}</option>
                                  <option value="coordinator">{t('dashboard.coordinator')}</option>
                                  <option value="admin">{t('dashboard.admin')}</option>
                                </select>
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2 flex-wrap md:flex-nowrap md:justify-end">
                            <button className="border border-[#767676] text-black hover:bg-[#1f2124] hover:text-white transition px-3 py-1 rounded-3xl text-sm" onClick={async ()=>{
                              try {
                                const res = await fetch(`${API_URL}/api/users/${u.id}/projects`, { headers: { Authorization: `Bearer ${token}` } });
                                if (!res.ok) { const err = await res.json(); return setStatusMessage({ type: 'error', text: err.message || 'Error' }); }
                                const d = await res.json();
                                const res2 = await fetch(`${API_URL}/api/users/${u.id}/bans`, { headers: { Authorization: `Bearer ${token}` } });
                                const b = res2.ok ? await res2.json() : { projects: [] };
                                // combine projects and bans
                                const projectsWithBanFlag = (d.projects || []).map((p: any) => ({ ...p, banned: (b.projects || []).some((bp: any) => bp.id === p.id) }));
                                // for bans that are not in projects, add them
                                (b.projects || []).forEach((bp: any) => {
                                  if (!projectsWithBanFlag.some((pp: any) => pp.id === bp.id)) {
                                    projectsWithBanFlag.push({ id: bp.id, name: bp.name || '', description: '', banned: true });
                                  }
                                });
                                setSelectedUser(u); setUserProjects(projectsWithBanFlag); setUserModalOpen(true);
                              } catch (err) { console.error(err); setStatusMessage({ type: 'error', text: 'Error fetching user projects' }); }
                            }}>{t('dashboard.viewProjects')}</button>
                            <button className="bg-[#B33A3A] text-white hover:bg-[#1f2124] hover:text-white transition px-3 py-1 rounded-3xl text-sm" onClick={() => openConfirm(t('dashboard.deleteUser'), t('dashboard.deleteUserConfirm'), async () => { closeConfirm(); try { const res = await fetch(`${API_URL}/api/users/${u.id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } }); if (!res.ok) { const err = await res.json(); setStatusMessage({ type: 'error', text: err.message || t('dashboard.errorDeleting') }); return; } setUsersData(prev => prev.filter(x => x.id !== u.id)); setStatusMessage({ type: 'success', text: t('dashboard.userDeleted') }); } catch (err) { console.error(err); setStatusMessage({ type: 'error', text: t('dashboard.errorDeleting') }); } }, true)}>{t('common.delete')}</button>
                          </div>
                        </div>
                      ))}
                    </div>
                    {usersData && usersData.length > 0 && (
                      <PaginationControls
                        currentPage={usersPage}
                        totalPages={getTotalPages(usersData.filter(u => userRoleFilter === '' ? true : u.role === userRoleFilter).length, ITEMS_PER_PAGE.users)}
                        onPageChange={setUsersPage}
                      />
                    )}
                  </div>
                )}

                {activeTab === 'contacts' && user && user.role === 'admin' && (
                  <div>
                    <h3 className="font-bold mb-2">{t('dashboard.incidents')}</h3>
                    <div className="mb-4 flex flex-col sm:flex-row gap-2 sm:items-center">
                      <label className="text-sm">{t('dashboard.filter')}:</label>
                      <select value={contactsFilter} onChange={(e) => setContactsFilter(e.target.value as 'open'|'closed'|'all')} className="text-sm border rounded p-2">
                        <option value="open">{t('dashboard.open')}</option>
                        <option value="closed">{t('dashboard.closed')}</option>
                        <option value="all">{t('dashboard.all')}</option>
                      </select>
                    </div>
                    <div>
                      {paginate(contacts.filter(c => contactsFilter === 'all' ? true : (contactsFilter === 'open' ? !c.read : c.read)), incidentsPage, ITEMS_PER_PAGE.incidents).map(c => (
                        <div key={c.id} className="border p-3 mb-2 rounded">
                          <div className="flex flex-col md:flex-row justify-between gap-2 md:items-start">
                            <div><strong className="text-sm md:text-base">{c.name}</strong> — <span className="text-xs md:text-sm text-gray-700">{c.email}</span></div>
                            <div className="flex gap-2 flex-wrap md:justify-end">
                              { !c.read && <button className="border border-[#767676] text-black hover:bg-[#1f2124] hover:text-white transition px-3 py-1 rounded-3xl text-sm" onClick={async ()=>{
                                // mark as read/closed
                                try {
                                  const res = await fetch(`${API_URL}/api/contacts/${c.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ read: true }) });
                                  if (!res.ok) { const err = await res.json(); return setStatusMessage({ type: 'error', text: err.message || t('dashboard.networkError') }); }
                                  const updated = await res.json();
                                  setContacts(prev => prev.map(x => x.id === c.id ? updated : x));
                                } catch (err) { console.error(err); setStatusMessage({ type: 'error', text: t('dashboard.networkError') }); }
                              }}>{t('dashboard.close')}</button> }
                              <button className="bg-[#B33A3A] text-white hover:bg-[#1f2124] hover:text-white transition px-3 py-1 rounded-3xl text-sm" onClick={() => openConfirm(t('dashboard.deleteMessage'), t('dashboard.deleteMessageConfirm'), async () => { closeConfirm(); try { const res = await fetch(`${API_URL}/api/contacts/${c.id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } }); if (!res.ok) { const err = await res.json(); setStatusMessage({ type: 'error', text: err.message || t('dashboard.networkError') }); return; } setContacts(prev => prev.filter(x => x.id !== c.id)); setStatusMessage({ type: 'success', text: t('dashboard.messageDeleted') }); } catch (err) { console.error(err); setStatusMessage({ type: 'error', text: t('dashboard.errorDeleting') }); } }, true)}>{t('common.delete')}</button>
                            </div>
                          </div>
                          <div className="mt-2 text-sm">{c.message}</div>
                          <div className="mt-2 text-xs md:text-sm text-gray-500">{new Date(c.createdAt).toLocaleString()}</div>
                        </div>
                      ))}
                    </div>
                    {contacts && contacts.length > 0 && (
                      <PaginationControls
                        currentPage={incidentsPage}
                        totalPages={getTotalPages(contacts.filter(c => contactsFilter === 'all' ? true : (contactsFilter === 'open' ? !c.read : c.read)).length, ITEMS_PER_PAGE.incidents)}
                        onPageChange={setIncidentsPage}
                      />
                    )}
                  </div>
                )}

                {activeTab === 'categories' && user && (user.role === 'admin' || user.role === 'coordinator') && (
                  <div>
                    <div className="mb-6 flex flex-col md:flex-row justify-between md:items-center gap-3">
                      <h3 className="font-bold mb-2 md:mb-0">{t('dashboard.categories')}</h3>
                      <button className="bg-[#F0BB00] text-black hover:bg-[#1f2124] hover:text-white px-4 py-2 rounded-2xl font-semibold shadow text-sm w-full md:w-auto" onClick={() => { setCategoryModalOpen(true); setEditingCategory(null); setCategoryForm({ name: '', description: '' }); }}>
                        {t('dashboard.addCategory')}
                      </button>
                    </div>
                    <div className="mb-4">
                      {paginate((categories || []), categoriesPage, ITEMS_PER_PAGE.categories).map(c => (
                        <div key={c.id} className="border p-3 mb-2 rounded">
                          <div className="flex flex-col md:flex-row justify-between md:items-start gap-3">
                            <div className="flex-1">
                              <strong className="text-sm md:text-base">{c.name}</strong><br />
                              <div className="text-xs md:text-sm text-gray-600">{c.description}</div>
                            </div>
                            <div className="flex gap-2 flex-wrap md:flex-nowrap">
                              <button className="border border-[#767676] text-black hover:bg-[#1f2124] hover:text-white transition px-3 py-1 rounded-3xl text-sm" onClick={() => { setEditingCategory(c); setCategoryModalOpen(true); setCategoryForm({ name: c.name, description: c.description || '' }); }}>{t('common.edit')}</button>
                              <button className="bg-[#B33A3A] text-white hover:bg-[#1f2124] hover:text-white transition px-3 py-1 rounded-3xl text-sm" onClick={() => openConfirm(t('dashboard.deleteCategory'), t('dashboard.deleteCategoryConfirm'), async () => { closeConfirm(); try { const res = await fetch(`${API_URL}/api/categories/${c.id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } }); if (!res.ok) { const err = await res.json(); setStatusMessage({ type: 'error', text: err.message || t('dashboard.errorDeleting') }); return; } setCategories(prev => prev.filter(x => x.id !== c.id)); setStatusMessage({ type: 'success', text: t('dashboard.categoryDeleted') }); } catch (err) { console.error(err); setStatusMessage({ type: 'error', text: t('dashboard.errorDeleting') }); } }, true)}>{t('common.delete')}</button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    {categories && categories.length > 0 && (
                      <PaginationControls
                        currentPage={categoriesPage}
                        totalPages={getTotalPages(categories.length, ITEMS_PER_PAGE.categories)}
                        onPageChange={setCategoriesPage}
                      />
                    )}
                  </div>
                )}
        {/** Removed settings tab per new requirements */}
      </div>

      {/* Edit Profile Modal */}
      <AnimatePresence>
        {showEditModal && (
          <motion.div
            className="fixed inset-0 z-50 flex justify-center items-center bg-black/40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={() => setShowEditModal(false)}
          >
            <motion.div
              className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md"
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              transition={{ duration: 0.3, type: "spring", stiffness: 120 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-xl md:text-2xl font-bold mb-4">{t('dashboard.editProfile')}</h2>
              <form
                onSubmit={handleUpdateProfile}
                className="flex flex-col gap-3"
              >
                <div className="flex flex-col items-center">
                  <img
                    src={preview || profileImageUrl}
                    alt="Profile"
                    className="w-24 md:w-32 h-24 md:h-32 rounded-full object-cover border"
                  />
                  <label className="mt-4 px-6 py-3 border-2 border-dashed border-[#F0BB00] rounded-lg bg-yellow-50 hover:bg-yellow-100 cursor-pointer transition-colors text-center">
                    <span className="text-sm font-semibold text-gray-700">{t('dashboard.uploadImage')}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-sm">{t('dashboard.name')}:</label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-400 outline-none text-sm"
                    required
                  />
                </div>

                <div className="flex gap-2 mt-2 flex-col sm:flex-row w-full sm:w-auto sm:ml-auto">
                  <button
                    type="button"
                    className="px-4 py-2 rounded-3xl border border-[#767676] hover:bg-[#1f2124] hover:text-white transition-colors duration-200 text-sm flex-1 sm:flex-none"
                    onClick={() => setShowEditModal(false)}
                  >
                    {t('common.cancel')}
                  </button>
                  <button
                    type="submit"
                    className="bg-[#F0BB00] text-black hover:bg-[#1f2124] hover:text-white px-4 py-2 rounded-3xl font-semibold transition-colors text-sm flex-1 sm:flex-none"
                  >
                    {t('common.save')}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Project Modal (Admin/Coordinator) */}
      <AnimatePresence>
        {projectModalOpen && (
          <motion.div
            className="fixed inset-0 z-50 flex justify-center items-center bg-black/10 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={() => { setProjectModalOpen(false); setEditingProject(null); }}
          >
            <motion.div
              className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-2xl"
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              transition={{ duration: 0.3, type: "spring", stiffness: 120 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-2xl font-bold mb-4">{editingProject ? t('dashboard.editProject') : t('dashboard.createProject')}</h2>
              <form onSubmit={handleSubmitProject} className="flex flex-col gap-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input className="border rounded-lg p-2 focus:ring-2 focus:ring-blue-400 outline-none text-sm" placeholder={t('dashboard.name')} value={projectForm.name} onChange={(e)=>setProjectForm({...projectForm, name: e.target.value})} required />
                  <input type="date" className="border rounded-lg p-2 focus:ring-2 focus:ring-blue-400 outline-none text-sm" value={projectForm.start_date} onChange={(e)=>setProjectForm({...projectForm, start_date: e.target.value})} />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input type="date" className="border rounded-lg p-2 focus:ring-2 focus:ring-blue-400 outline-none text-sm" value={projectForm.end_date} onChange={(e)=>setProjectForm({...projectForm, end_date: e.target.value})} />
                  <input className="border rounded-lg p-2 focus:ring-2 focus:ring-blue-400 outline-none text-sm" placeholder={t('dashboard.location')} value={projectForm.location} onChange={(e)=>setProjectForm({...projectForm, location: e.target.value})} />
                </div>
                <textarea className="border rounded-lg p-2 focus:ring-2 focus:ring-blue-400 outline-none text-sm" placeholder={t('dashboard.description')} value={projectForm.description} onChange={(e)=>setProjectForm({...projectForm, description: e.target.value})} />
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <input type="number" className="border rounded-lg p-2 focus:ring-2 focus:ring-blue-400 outline-none text-sm" value={projectForm.capacity} onChange={(e)=>setProjectForm({...projectForm, capacity: Number(e.target.value)})} />
                  <select className="border rounded-lg p-2 focus:ring-2 focus:ring-blue-400 outline-none text-sm" value={projectForm.status} onChange={(e)=>setProjectForm({...projectForm, status: e.target.value})}>
                    <option value="active">{t('dashboard.active')}</option>
                    <option value="cancelled">{t('dashboard.cancelled')}</option>
                    <option value="finished">{t('dashboard.finished')}</option>
                  </select>
                  <select className="border rounded-lg p-2 focus:ring-2 focus:ring-blue-400 outline-none text-sm" value={projectForm.categoryId} onChange={(e)=>setProjectForm({...projectForm, categoryId: e.target.value === '' ? '' : Number(e.target.value)})}>
                    <option value="">{t('dashboard.noCategory')}</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div className="flex flex-col gap-3">
                  <label className="px-4 py-3 border-2 border-dashed border-[#F0BB00] rounded-lg bg-yellow-50 hover:bg-yellow-100 cursor-pointer transition-colors text-center">
                    <span className="text-sm font-semibold text-gray-700">{t('dashboard.uploadFile')}</span>
                    <input type="file" onChange={handleProjectFileChange} className="hidden" />
                  </label>
                  {projectFileName && <p className="text-xs text-gray-600 text-center">📄 {projectFileName}</p>}
                  <div className="flex gap-2 flex-col sm:flex-row w-full sm:w-auto sm:ml-auto">
                    <button type="button" className="px-4 py-2 rounded-3xl border border-[#767676] hover:bg-[#1f2124] hover:text-white transition-colors duration-200 text-sm flex-1 sm:flex-none" onClick={() => { setProjectModalOpen(false); setEditingProject(null); }}>{t('common.cancel')}</button>
                    <button type="submit" className="bg-[#F0BB00] text-black hover:bg-[#1f2124] hover:text-white px-4 py-2 rounded-3xl font-semibold transition-colors text-sm flex-1 sm:flex-none">{editingProject ? t('common.save') : t('dashboard.createProject')}</button>
                  </div>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* User Projects Modal */}
      <AnimatePresence>
        {userModalOpen && selectedUser && (
          <motion.div className="fixed inset-0 z-50 flex justify-center items-center bg-black/10 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => { setUserModalOpen(false); setSelectedUser(null); setUserProjectsPage(1); }}>
          <motion.div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto" variants={modalVariants} initial="hidden" animate="visible" exit="exit" transition={{ duration: 0.3, type: "spring", stiffness: 120 }} onClick={(e)=>e.stopPropagation()}>
            <h2 className="text-2xl font-bold mb-4">{selectedUser.name} - {t('dashboard.projects')}</h2>
              <div className="mb-4">
                {userProjects.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">{t('dashboard.noProjects')}</p>
                ) : (
                  paginate(userProjects, userProjectsPage, ITEMS_PER_PAGE.userProjects).map((p: any) => (
                    <div key={p.id} className="border p-3 mb-2 rounded flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                      <div className="flex-1 min-w-0">
                        <strong className="block truncate">{p.name}</strong>
                        <span className="text-sm text-gray-600 block truncate">{p.description}</span>
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        {!p.banned ? (
                          <button className="bg-[#B33A3A] text-white px-4 py-2 rounded-3xl hover:bg-[#1f2124] transition text-sm" onClick={() => openConfirm(t('dashboard.removeBan'), t('dashboard.removeBanConfirm'), async () => { closeConfirm(); await handleRejectUserFromProject(p.id, selectedUser.id); }, true)}>{t('dashboard.removeBan')}</button>
                        ) : (
                          <button className="px-4 py-2 rounded-3xl border border-[#767676] hover:bg-[#1f2124] hover:text-white transition-colors duration-200 text-sm" onClick={() => openConfirm(t('dashboard.unban'), t('dashboard.unbanConfirm'), async () => { closeConfirm(); await handleUnbanUserFromProject(p.id, selectedUser.id); }, false)}>{t('dashboard.unban')}</button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
              {userProjects.length > ITEMS_PER_PAGE.userProjects && (
                <PaginationControls
                  currentPage={userProjectsPage}
                  totalPages={getTotalPages(userProjects.length, ITEMS_PER_PAGE.userProjects)}
                  onPageChange={setUserProjectsPage}
                />
              )}
              <div className="flex justify-end mt-4">
                <button className="px-4 py-2 rounded-3xl bg-[#1f2124] text-white border hover:border-[#767676] hover:bg-[#3B3E42] hover:text-white transition-colors duration-200" onClick={() => { setUserModalOpen(false); setSelectedUser(null); setUserProjectsPage(1); }}>{t('dashboard.close')}</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Create User Modal */}
      <AnimatePresence>
        {createUserModalOpen && (
          <motion.div className="fixed inset-0 z-50 flex justify-center items-center bg-black/10 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setCreateUserModalOpen(false)}>
            <motion.div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md" variants={modalVariants} initial="hidden" animate="visible" exit="exit" transition={{ duration: 0.3, type: "spring", stiffness: 120 }} onClick={(e)=>e.stopPropagation()}>
              <h2 className="text-2xl font-bold mb-4">{t('dashboard.createUser')}</h2>
              <form onSubmit={async (e)=>{ e.preventDefault(); await createUser(); }} className="flex flex-col gap-3">
                <input placeholder={t('dashboard.name')} className="border rounded-lg p-2 focus:ring-2 focus:ring-blue-400 outline-none" value={newUserForm.name} onChange={(e)=>setNewUserForm({...newUserForm, name: e.target.value})} required />
                <input placeholder={t('dashboard.email')} className="border rounded-lg p-2 focus:ring-2 focus:ring-blue-400 outline-none" value={newUserForm.email} onChange={(e)=>setNewUserForm({...newUserForm, email: e.target.value})} required />
                <input placeholder={t('dashboard.password')} type="password" className="border rounded-lg p-2 focus:ring-2 focus:ring-blue-400 outline-none" value={newUserForm.password} onChange={(e)=>setNewUserForm({...newUserForm, password: e.target.value})} required />
                <select className="border rounded-lg p-2 focus:ring-2 focus:ring-blue-400 outline-none" value={newUserForm.role} onChange={(e)=>setNewUserForm({...newUserForm, role: e.target.value})}>
                  <option value="volunteer">{t('dashboard.volunteer')}</option>
                  <option value="coordinator">{t('dashboard.coordinator')}</option>
                  <option value="admin">{t('dashboard.admin')}</option>
                </select>
                <div className="flex justify-end gap-2">
                  <button type="button" className="px-4 py-2 rounded-3xl border border-[#767676] hover:bg-[#1f2124] hover:text-white transition-colors duration-200" onClick={()=>setCreateUserModalOpen(false)}>{t('common.cancel')}</button>
                  <button type="submit" className="bg-[#F0BB00] text-black px-4 py-2 rounded-3xl hover:bg-[#1f2124] hover:text-white transition font-semibold">{t('dashboard.createUser')}</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Category Modal (Admin/Coordinator) */}
      <AnimatePresence>
        {categoryModalOpen && (
          <motion.div
            className="fixed inset-0 z-50 flex justify-center items-center bg-black/10 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={() => { setCategoryModalOpen(false); setEditingCategory(null); }}
          >
            <motion.div
              className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md"
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              transition={{ duration: 0.3, type: "spring", stiffness: 120 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-2xl font-bold mb-4">{editingCategory ? t('dashboard.editCategory') : t('dashboard.createCategory')}</h2>
              <form onSubmit={async (e) => {
                e.preventDefault();
                if (!token) return setStatusMessage({ type: 'error', text: t('dashboard.loginRequired') });
                try {
                  let url = `${API_URL}/api/categories`;
                  let method = 'POST';
                  if (editingCategory) { url = `${API_URL}/api/categories/${editingCategory.id}`; method = 'PUT'; }
                  const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify(categoryForm) });
                  if (!res.ok) { const err = await res.json(); return setStatusMessage({ type: 'error', text: err.message || t('dashboard.errorSaving') }); }
                  await res.json();
                  // reload categories
                  const all = await fetch(`${API_URL}/api/categories`).then(r => r.json());
                  setCategories(all);
                  setCategoryModalOpen(false);
                  setEditingCategory(null);
                  setStatusMessage({ type: 'success', text: editingCategory ? t('dashboard.categoryUpdated') : t('dashboard.categoryCreated') });
                } catch (err) { console.error(err); setStatusMessage({ type: 'error', text: t('dashboard.errorSaving') }); }
              }} className="flex flex-col gap-3">
                <div>
                  <label className="block font-semibold mb-1">{t('dashboard.name')}:</label>
                  <input className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-400 outline-none" placeholder={t('dashboard.categoryName')} value={categoryForm.name} onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })} required />
                </div>
                <div>
                  <label className="block font-semibold mb-1">{t('dashboard.description')}:</label>
                  <textarea className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-400 outline-none" placeholder={t('dashboard.categoryDescription')} rows={4} value={categoryForm.description} onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })} />
                </div>
                <div className="flex gap-2 mt-2 flex-col sm:flex-row w-full sm:w-auto sm:ml-auto">
                  <button type="button" className="px-4 py-2 rounded-3xl border border-[#767676] hover:bg-[#1f2124] hover:text-white transition-colors duration-200 text-sm flex-1 sm:flex-none" onClick={() => { setCategoryModalOpen(false); setEditingCategory(null); }}>{t('common.cancel')}</button>
                  <button type="submit" className="bg-[#F0BB00] text-black hover:bg-[#1f2124] hover:text-white px-4 py-2 rounded-3xl font-semibold transition-colors text-sm flex-1 sm:flex-none">{editingCategory ? t('common.save') : t('dashboard.createCategory')}</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confirm Modal - generic */}
      <ConfirmModal
        open={confirmModal.open}
        title={confirmModal.title}
        message={confirmModal.message}
        danger={confirmModal.danger}
        onCancel={() => { closeConfirm(); }}
        onConfirm={() => { if (confirmModal.onConfirm) { confirmModal.onConfirm(); } closeConfirm(); }}
      />
    </div>
  );
};

export default Dashboard;
