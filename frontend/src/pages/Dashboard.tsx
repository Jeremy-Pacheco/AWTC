import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

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
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<
    "profile" | "projects" | "settings"
  >("profile");
  const [showEditModal, setShowEditModal] = useState(false);
  const [editName, setEditName] = useState("");
  const [editFile, setEditFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [imageVersion, setImageVersion] = useState<number>(Date.now());
  const [token, setToken] = useState<string | null>(null);

  // Load token and fetch user data from backend
  // Load user from backend or localStorage
  useEffect(() => {
    const storedToken = localStorage.getItem("jwtToken");
    if (!storedToken) return;

    setToken(storedToken);

    const fetchUser = async () => {
      try {
        const res = await fetch(`${API_URL}/api/users/dashboard`, {
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
            profileImage: storedProfileImage || null,
          });
          setEditName(storedName);
        }
      }
    };

    fetchUser();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      setEditFile(selected);
      setPreview(URL.createObjectURL(selected));
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !token) return alert("Authentication required");

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
        return alert("Error: " + err.message);
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
      alert("Profile updated successfully");

      setPreview(null);
      setImageVersion(Date.now());
      setShowEditModal(false);
      alert("Profile updated successfully");
    } catch (err) {
      console.error(err);
      alert("Error updating profile");
    }
  };

  if (!user) return <div className="p-6">Loading user...</div>;

  const profileImageUrl = user.profileImage
    ? `${API_URL}/images/${user.profileImage}?v=${imageVersion}`
    : "/images/default-avatar.png";

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold mb-6 text-center">Dashboard</h2>

      {/* Tabs */}
      <div className="flex gap-4 mb-6 justify-center">
        {["profile", "projects", "settings"].map((tab) => (
          <button
            key={tab}
            className={`px-4 py-2 rounded font-semibold ${
              activeTab === tab ? "bg-yellow-400" : "bg-gray-200"
            }`}
            onClick={() => setActiveTab(tab as any)}
          >
            {tab === "profile"
              ? "My Profile"
              : tab === "projects"
              ? "My Projects"
              : "Settings"}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="bg-gray-100 p-6 rounded-lg shadow-md">
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
              className="mt-3 bg-yellow-400 text-black px-4 py-2 rounded"
              onClick={() => setShowEditModal(true)}
            >
              Edit Profile
            </button>
          </div>
        )}
        {activeTab === "projects" && <div>My projects content here...</div>}
        {activeTab === "settings" && <div>Settings content here...</div>}
      </div>

      {/* Edit Profile Modal */}
      <AnimatePresence>
        {showEditModal && (
          <motion.div
            className="fixed inset-0 z-50 flex justify-center items-center bg-black/30 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={() => setShowEditModal(false)}
          >
            <motion.div
              className="bg-white rounded p-6 w-full max-w-md"
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              transition={{ duration: 0.3 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-2xl font-bold mb-4">Edit Profile</h2>
              <form
                onSubmit={handleUpdateProfile}
                className="flex flex-col gap-3"
              >
                <div className="flex flex-col items-center">
                  <img
                    src={preview || profileImageUrl}
                    alt="Profile"
                    className="w-32 h-32 rounded-full object-cover border"
                  />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="mt-2"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">Name:</label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full border rounded p-2"
                    required
                  />
                </div>

                <div className="flex justify-end gap-2 mt-2">
                  <button
                    type="button"
                    className="bg-gray-300 px-4 py-2 rounded"
                    onClick={() => setShowEditModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-yellow-400 px-4 py-2 rounded font-semibold"
                  >
                    Save
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Dashboard;
