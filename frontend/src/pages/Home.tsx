import React, { useState, useEffect } from "react";
import AuthModal from "../components/AuthModal";
import HeroImage from "../components/HeroImage";
import AlertModal from "../components/AlertModal";
import logo4 from "../../public/home/charity.png";
import { NavLink, useNavigate } from "react-router-dom";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";
const IMAGE_URL = import.meta.env.VITE_IMAGE_URL || "http://localhost:8080/images";

// --- CAROUSEL ---
function Carousel() {
  const [current, setCurrent] = useState<number>(0);
  const [projects, setProjects] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/projects`)
      .then((res) => res.json())
      .then((data: any[]) => {
        // Take exactly 3 projects with images
        const projectsWithImages = data.filter((p) => p.filename).slice(0, 3);
        
        // Only show carousel if we have at least 3 projects
        if (projectsWithImages.length >= 3) {
          setProjects(projectsWithImages);
        } else {
          setProjects([]);
        }
      })
      .catch((err) =>
        console.error("Error fetching projects for carousel:", err)
      );
  }, []);

  const prev = () => setCurrent((c) => (c === 0 ? projects.length - 1 : c - 1));
  const next = () => setCurrent((c) => (c === projects.length - 1 ? 0 : c + 1));

  const handleImageClick = (projectId: number) => {
    navigate(`/Volunteering?project=${projectId}`);
  };

  if (projects.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400">
        Not enough projects available for carousel
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center my-4 md:my-8 space-x-2 md:space-x-4 px-2">
      <button
        onClick={prev}
        className="text-2xl md:text-3xl px-2 md:px-3 text-gray-600 shrink-0"
      >
        &lt;
      </button>
      <div className="flex space-x-3 md:space-x-6 items-center justify-center overflow-hidden">
        <img
          src={`${
            IMAGE_URL
          }/${projects[(current - 1 + projects.length) % projects.length].filename}`}
          className="hidden sm:block w-24 md:w-40 h-32 md:h-52 object-cover rounded opacity-50 cursor-pointer hover:opacity-70 transition-opacity"
          alt={
            projects[(current - 1 + projects.length) % projects.length].name
          }
          onClick={() =>
            handleImageClick(
              projects[(current - 1 + projects.length) % projects.length].id
            )
          }
        />
        <img
          src={`${IMAGE_URL}/${projects[current].filename}`}
          className="w-56 md:w-96 h-40 md:h-72 object-cover rounded shadow-lg shrink-0 cursor-pointer hover:opacity-90 transition-opacity"
          alt={projects[current].name}
          onClick={() => handleImageClick(projects[current].id)}
        />
        <img
          src={`${
            IMAGE_URL
          }/${projects[(current + 1) % projects.length].filename}`}
          className="hidden sm:block w-24 md:w-40 h-32 md:h-52 object-cover rounded opacity-50 cursor-pointer hover:opacity-70 transition-opacity"
          alt={
            projects[(current + 1) % projects.length].name
          }
          onClick={() =>
            handleImageClick(
              projects[(current + 1) % projects.length].id
            )
          }
        />
      </div>
      <button
        onClick={next}
        className="text-2xl md:text-3xl px-2 md:px-3 text-gray-600 shrink-0"
      >
        &gt;
      </button>
    </div>
  );
}

// --- ABOUT SECTION ---
function AboutSection() {
  return (
    <section className="flex flex-col md:flex-row items-center justify-between gap-4 md:gap-6 my-8 md:my-12 bg-white px-4 md:px-0">
      <img
        src={logo4}
        alt="Volunteers"
        className="w-full md:w-auto md:max-w-sm h-auto rounded"
      />
      <div className="flex-1 pl-0 md:pl-8 mt-4 md:mt-0">
        <p className="mb-6 md:mb-4">
          Our mission is to make joining social and environmental projects
          simple, safe, and meaningful, connecting volunteers with opportunities
          that create real impact and strengthen communities. We provide
          support, guidance, and a network where everyone can contribute, learn,
          and grow.
        </p>
        <NavLink to="/AboutUs">
          <button className="bg-[#F0BB00] text-black hover:bg-[#1f2124] hover:text-white px-5 py-2 rounded-3xl font-semibold shadow text-sm md:text-base w-full md:w-auto text-center transition-colors duration-300">
            Read more
          </button>
        </NavLink>
      </div>
    </section>
  );
}

// --- REVIEWS SECTION ---
interface ReviewsSectionProps {
  onOpenSignup: () => void;
  refreshTrigger: number;
}

interface Review {
  id: number;
  content: string;
  date: string;
  image?: string | null;
  userId: number;
  user?: { email?: string; name?: string };
}

function ReviewsSection({
  onOpenSignup,
  refreshTrigger,
}: ReviewsSectionProps) {
  const [reviews, setReviews] = useState<Review[]>([]);

  const [showReviewModal, setShowReviewModal] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editContent, setEditContent] = useState("");
  const [editSelectedFile, setEditSelectedFile] = useState<File | null>(null);
  const [editRemoveImage, setEditRemoveImage] = useState(false);

  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem("jwtToken")
  );
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const isLoggedIn = !!token;

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === "jwtToken") {
        setToken(e.newValue);
      }
    };

    const onAuthChanged = () => {
      setToken(localStorage.getItem("jwtToken"));
    };

    window.addEventListener("storage", onStorage);
    window.addEventListener("authChanged", onAuthChanged);

    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("authChanged", onAuthChanged);
    };
  }, []);

  useEffect(() => {
    if (!token) {
      setCurrentUserId(null);
      return;
    }
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      setCurrentUserId(payload.id ?? null);
    } catch (e) {
      console.error("Error decoding token", e);
      setCurrentUserId(null);
    }
  }, [token]);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/reviews`)
      .then((res) => {
        if (!res.ok) throw new Error("Error fetching reviews");
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data)) {
          const validReviews = data.filter(
            (review) => review.user && (review.user.name || review.user.email)
          );
          setReviews(validReviews);
        }
      })
      .catch((err) => console.error(err));
  }, [refreshTrigger]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      const formData = new FormData();
      formData.append("content", newComment);
      if (selectedFile) {
        formData.append("image", selectedFile);
      }

      const res = await fetch(`${API_BASE_URL}/api/reviews`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (res.ok) {
        const savedReview = await res.json();
        setReviews([savedReview, ...reviews]);
        setNewComment("");
        setSelectedFile(null);
        setShowReviewModal(false);
      } else {
        setAlertMessage("Error creating review");
        setAlertOpen(true);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure?")) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/reviews/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setReviews(reviews.filter((r) => r.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const saveEdit = async (id: number) => {
    try {
      let res;
      if (editSelectedFile || editRemoveImage) {
        const formData = new FormData();
        formData.append("content", editContent);
        if (editSelectedFile) formData.append("image", editSelectedFile);
        if (editRemoveImage) formData.append("removeImage", "true");

        res = await fetch(`${API_BASE_URL}/api/reviews/${id}`, {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });
      } else {
        res = await fetch(`${API_BASE_URL}/api/reviews/${id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ content: editContent }),
        });
      }

      if (res.ok) {
        const updatedReview = await res.json();
        setReviews(
          reviews.map((r) =>
            r.id === id
              ? { ...r, content: updatedReview.content, image: updatedReview.image ?? null }
              : r
          )
        );
        setEditingId(null);
        setEditSelectedFile(null);
        setEditRemoveImage(false);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("jwtToken");
    localStorage.removeItem("userName");
    localStorage.removeItem("userRole");
    window.location.reload();
  };

  const getUserDisplayName = (user?: { email?: string; name?: string }) => {
    if (user?.name) return user.name;
    if (user?.email) return user.email.split("@")[0];
    return "User";
  };

  return (
    <>
      <section className="my-12 px-4 md:px-0">
      <div className="flex flex-col md:flex-row gap-8 items-start">
        <div className="flex-1 w-full">
          <div className="flex justify-between items-baseline mb-6 border-b pb-2">
            <h5 className="text-xl font-bold text-gray-800">Reviews</h5>
            <span className="text-sm text-gray-500">
              {reviews.length} comments
            </span>
          </div>

          <div className="space-y-6 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
            {reviews.length === 0 ? (
              <div className="text-center py-10 text-gray-400">
                No reviews yet. Be the first!
              </div>
            ) : (
              reviews.map((review) => (
                <div
                  key={review.id}
                  className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex flex-col">
                      <span className="font-bold text-gray-900 text-base capitalize">
                        {getUserDisplayName(review.user)}
                      </span>
                      <span className="text-xs text-gray-400 mt-0.5">
                        {new Date(review.date).toLocaleDateString(undefined, {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </div>

                    {currentUserId === review.userId && !editingId && (
                      <div className="flex gap-3 text-sm font-medium">
                        <button
                          onClick={() => {
                            setEditingId(review.id);
                            setEditContent(review.content);
                          }}
                          className="text-green-600 hover:text-green-800 transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(review.id)}
                          className="text-red-500 hover:text-red-700 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>

                  {review.image && (
                    <div className="mb-4">
                      <img
                        src={`${API_BASE_URL}${review.image}`}
                        alt="Attached"
                        className="h-32 w-auto object-cover rounded-xl cursor-zoom-in hover:opacity-95"
                        onClick={() =>
                          window.open(
                            `${API_BASE_URL}${review.image}`,
                            "_blank"
                          )
                        }
                      />
                    </div>
                  )}

                  {editingId === review.id ? (
                    <div className="mt-2 animate-fade-in">
                      <textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        className="w-full border border-gray-200 p-3 rounded-xl text-sm focus:ring-2 focus:ring-yellow-400 outline-none resize-none bg-gray-50"
                      />

                      {review.image && !editRemoveImage && !editSelectedFile && (
                        <div className="mt-3 mb-2">
                          <img
                            src={`${API_BASE_URL}${review.image}`}
                            alt="Current"
                            className="h-24 w-auto object-cover rounded-lg"
                          />
                        </div>
                      )}

                      {editSelectedFile && (
                        <div className="mt-3 mb-2">
                          <img
                            src={URL.createObjectURL(editSelectedFile)}
                            alt="New preview"
                            className="h-24 w-auto object-cover rounded-lg"
                          />
                        </div>
                      )}

                      <div className="flex items-center justify-between gap-4 mt-3">
                        <div>
                          <input
                            id={`editFileInput-${review.id}`}
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const f = e.target.files && e.target.files[0];
                              setEditSelectedFile(f ?? null);
                              if (f) setEditRemoveImage(false);
                            }}
                            className="hidden"
                          />
                          <label
                            htmlFor={`editFileInput-${review.id}`}
                            className="cursor-pointer flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-black transition-colors"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              strokeWidth={1.5}
                              stroke="currentColor"
                              className="w-5 h-5"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M4.5 12.75l6 6 9-13.5"
                              />
                            </svg>
                            {editSelectedFile
                              ? editSelectedFile.name
                              : "Add / Replace image"}
                          </label>
                        </div>

                        {review.image && (
                          <button
                            type="button"
                            onClick={() => {
                              setEditRemoveImage((prev) => {
                                const next = !prev;
                                if (next) setEditSelectedFile(null);
                                return next;
                              });
                            }}
                            className={`text-sm px-3 py-1 rounded-full border ${
                              editRemoveImage
                                ? "bg-red-50 text-red-600 border-red-200"
                                : "bg-gray-100 text-gray-700 border-gray-200"
                            }`}
                          >
                            {editRemoveImage
                              ? "Image will be removed"
                              : "Remove image"}
                          </button>
                        )}
                      </div>

                      <div className="flex gap-2 mt-3 justify-end">
                        <button
                          onClick={() => {
                            setEditingId(null);
                            setEditSelectedFile(null);
                            setEditRemoveImage(false);
                          }}
                          className="px-4 py-1.5 rounded-full text-xs font-medium bg-gray-100 hover:bg-gray-200"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => saveEdit(review.id)}
                          className="px-4 py-1.5 rounded-full text-xs font-medium bg-[#F0BB00] text-black hover:bg-[#1f2124] hover:text-white"
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-600 leading-relaxed text-sm">
                      {review.content}
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        <div className="md:w-1/4 flex flex-col items-center sticky top-8">
          {isLoggedIn ? (
            <div className="w-full bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-center">
              <div className="mb-4">
              </div>

              <button
                onClick={() => setShowReviewModal(true)}
                className="bg-[#F0BB00] text-black hover:bg-[#1f2124] hover:text-white px-5 py-2 rounded-3xl font-semibold shadow text-sm md:text-base w-full transition-colors duration-300 mb-3"
              >
                Write a Review
              </button>
            </div>
          ) : (
            <div className="w-full bg-yellow-50 p-8 rounded-3xl text-center border border-yellow-100">
              <h3 className="font-bold text-lg mb-2 text-gray-800">
                Join the conversation
              </h3>
              <p className="text-xs text-gray-500 mb-6">
                Share your experience with the community.
              </p>

              <button
                onClick={onOpenSignup}
                className="bg-[#F0BB00] text-black hover:bg-[#1f2124] hover:text-white px-5 py-2 rounded-3xl font-semibold shadow text-sm md:text-base w-full transition-colors duration-300"
              >
                Add Review
              </button>
            </div>
          )}
        </div>
      </div>

      {showReviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg p-8 relative">
            <button
              onClick={() => setShowReviewModal(false)}
              className="absolute top-4 right-5 text-gray-400 hover:text-black text-xl font-light"
            >
              ✕
            </button>

            <h3 className="text-2xl font-bold mb-1 text-gray-900">
              New Review
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              How was your experience?
            </p>

            <form onSubmit={handleCreate}>
              <textarea
                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 h-40 resize-none mb-4 focus:ring-2 focus:ring-[#F0BB00] focus:bg-white outline-none transition-all placeholder-gray-400"
                placeholder="Write something meaningful..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                autoFocus
              />

              <div className="flex items-center justify-between mb-8">
                <div>
                  <input
                    id="fileInputModal"
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      e.target.files && setSelectedFile(e.target.files[0])
                    }
                    className="hidden"
                  />
                  <label
                    htmlFor="fileInputModal"
                    className="cursor-pointer flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-black transition-colors"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-5 h-5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
                      />
                    </svg>
                    {selectedFile ? (
                      <span className="text-green-600">
                        {selectedFile.name}
                      </span>
                    ) : (
                      "Add photo"
                    )}
                  </label>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowReviewModal(false)}
                  className="flex-1 py-3 rounded-full font-semibold text-gray-500 hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-[#F0BB00] text-black hover:bg-[#1f2124] hover:text-white font-bold py-3 rounded-full transition-all shadow-lg hover:shadow-xl"
                >
                  Post Review
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      </section>
      <AlertModal open={alertOpen} message={alertMessage} onAccept={() => setAlertOpen(false)} />
    </>
  );
}

// --- HOME PAGE ---
function Home() {
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const [refreshKey, setRefreshKey] = useState(0);

  const handleOpenSignup = () => {
    setAuthMode("signup");
    setAuthOpen(true);
  };

  const handleCloseAuth = () => {
    setAuthOpen(false);
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <>
      <HeroImage
        title={
          <div className="text-center px-4">
            <h1 className="Display">A Will To Change</h1>
            <h4 className="text-base md:text-2xl">
              Join social and environmental initiatives and make an impact today
            </h4>
          </div>
        }
        imgSrc="/hero-img.jpg"
        heightClass="h-48 md:h-96"
        titleClass="Display text-white"
      />

      <main className="max-w-6xl mx-auto px-4 md:px-6 py-8 md:py-12">
        <h2>Newest Projects</h2>
        <p className="text-lg text-gray-600">Discover volunteer projects and make an impact.</p>
        <Carousel />

        <h2>About Us</h2>
        <p className="text-lg text-gray-600">At our platform, we believe that everyone can make a difference</p>
        <AboutSection />
        <ReviewsSection
          onOpenSignup={handleOpenSignup}
          refreshTrigger={refreshKey}
        />
      </main>

      <AuthModal open={authOpen} mode={authMode} onClose={handleCloseAuth} />
    </>
  );
}

export default Home;