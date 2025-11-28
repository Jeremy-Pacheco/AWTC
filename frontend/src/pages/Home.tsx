import React, { useState, useEffect } from "react";
// Asegúrate de que AuthModal existe en esta ruta
import AuthModal from "../components/AuthModal"; 
import HeroImage from "../components/HeroImage";
import logo1 from "../img/medioambiente.png";
import logo2 from "../img/rd.png";
import logo3 from "../img/salud.png";
import logo4 from "../img/charity.png";
import { NavLink } from "react-router-dom";

// Configuración de la API (Asegúrate de que coincida con tu backend)
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';
const images: string[] = [logo1, logo2, logo3];

// --- CAROUSEL ---
function Carousel() {
  const [current, setCurrent] = useState<number>(0);
  const prev = () => setCurrent(c => (c === 0 ? images.length - 1 : c - 1));
  const next = () => setCurrent(c => (c === images.length - 1 ? 0 : c + 1));

  return (
    <div className="flex justify-center items-center my-4 md:my-8 space-x-2 md:space-x-4 px-2">
      <button onClick={prev} className="text-2xl md:text-3xl px-2 md:px-3 text-gray-600 shrink-0">&lt;</button>
      <div className="flex space-x-3 md:space-x-6 items-center justify-center overflow-hidden">
        <img src={images[(current - 1 + images.length) % images.length]} className="hidden sm:block w-20 md:w-32 h-28 md:h-44 object-cover rounded opacity-50" alt="" />
        <img src={images[current]} className="w-48 md:w-80 h-36 md:h-64 object-cover rounded shadow-lg shrink-0" alt="" />
        <img src={images[(current + 1) % images.length]} className="hidden sm:block w-20 md:w-32 h-28 md:h-44 object-cover rounded opacity-50" alt="" />
      </div>
      <button onClick={next} className="text-2xl md:text-3xl px-2 md:px-3 text-gray-600 shrink-0">&gt;</button>
    </div>
  );
}

// --- ABOUT SECTION ---
function AboutSection() {
  return (
    <section className="flex flex-col md:flex-row items-center justify-between gap-4 md:gap-6 my-8 md:my-12 bg-white px-4 md:px-0">
      <img src={logo4} alt="Volunteers" className="w-full md:w-auto md:max-w-sm h-auto rounded" />
      <div className="flex-1 pl-0 md:pl-8 mt-4 md:mt-0">
        <p className="text-gray-700 text-xs sm:text-sm md:text-base mb-4 md:mb-6 leading-relaxed text-justify">
          Our mission is to make joining social and environmental projects simple, safe, and meaningful, connecting volunteers with opportunities that create real impact and strengthen communities. We provide support, guidance, and a network where everyone can contribute, learn, and grow.
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
  onOpenLogin: () => void;
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

function ReviewsSection({ onOpenLogin, onOpenSignup, refreshTrigger }: ReviewsSectionProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  
  // Estados de Creación
  const [newComment, setNewComment] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Estados de Edición
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editContent, setEditContent] = useState("");

  // Autenticación
  const token = localStorage.getItem("jwtToken"); 
  const isLoggedIn = !!token;

  // Decodificar Token para obtener ID del usuario actual (para mostrar botones de borrar/editar)
  let currentUserId: number | null = null;
  if (token) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      currentUserId = payload.id;
    } catch (e) { console.error("Error decoding token", e); }
  }

  // 1. OBTENER RESEÑAS (GET)
  useEffect(() => {
    fetch(`${API_BASE_URL}/api/reviews`)
      .then((res) => {
        if(!res.ok) throw new Error("Error fetching reviews");
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data)) setReviews(data);
      })
      .catch((err) => console.error(err));
  }, [refreshTrigger]); 

  // 2. CREAR RESEÑA (POST con FormData para Imagen)
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
            headers: { Authorization: `Bearer ${token}` }, // FormData no necesita Content-Type manual
            body: formData
        });

        if (res.ok) {
            const savedReview = await res.json();
            setReviews([savedReview, ...reviews]);
            setNewComment("");
            setSelectedFile(null);
            // Limpiar input file visualmente
            const fileInput = document.getElementById('fileInput') as HTMLInputElement;
            if(fileInput) fileInput.value = "";
        } else {
            alert("Error creating review");
        }
    } catch (error) { console.error(error); }
  };

  // 3. BORRAR RESEÑA (DELETE)
  const handleDelete = async (id: number) => {
    if(!window.confirm("Are you sure you want to delete this review?")) return;
    try {
        const res = await fetch(`${API_BASE_URL}/api/reviews/${id}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` }
        });
        if(res.ok) {
            setReviews(reviews.filter(r => r.id !== id));
        } else {
            alert("Could not delete review");
        }
    } catch(err) { console.error(err); }
  };

  // 4. EDITAR RESEÑA (PUT - Texto)
  const saveEdit = async (id: number) => {
    try {
        const res = await fetch(`${API_BASE_URL}/api/reviews/${id}`, {
            method: "PUT",
            headers: { 
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}` 
            },
            body: JSON.stringify({ content: editContent }) 
        });
        if(res.ok) {
            const updatedReview = await res.json();
            // Actualizamos la lista manteniendo la imagen antigua si no se cambió
            setReviews(reviews.map(r => r.id === id ? { ...r, content: updatedReview.content } : r));
            setEditingId(null);
        }
    } catch(err) { console.error(err); }
  };

  const handleLogout = () => {
    localStorage.removeItem("jwtToken");
    localStorage.removeItem("userName");
    localStorage.removeItem("userRole");
    window.location.reload(); 
  };

  return (
    <section className="my-12 px-4 md:px-0 bg-gray-50 p-6 rounded-lg">
      <div className="flex flex-col md:flex-row gap-8">
        
        {/* LISTA DE RESEÑAS */}
        <div className="flex-1">
          <h5 className="text-lg font-bold mb-4">Community Feedback</h5>
          <div className="space-y-4 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
            {reviews.length === 0 ? <p className="text-gray-500 italic">No reviews yet.</p> : 
              reviews.map((review) => (
                <div key={review.id} className="bg-white p-4 rounded shadow-sm border border-gray-100 relative group">
                  
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold text-gray-800 text-sm">
                      {review.user?.name || review.user?.email || "User"}
                    </span>
                    
                    {/* Botones de Acción (Solo dueño) */}
                    {currentUserId === review.userId && !editingId && (
                        <div className="flex gap-2 text-xs">
                           <button onClick={() => { setEditingId(review.id); setEditContent(review.content); }} className="text-blue-500 hover:underline">Edit</button>
                           <button onClick={() => handleDelete(review.id)} className="text-red-500 hover:underline">Delete</button>
                        </div>
                    )}
                    
                    {/* Fecha (si no es dueño, o a la derecha) */}
                    {currentUserId !== review.userId && (
                        <span className="text-xs text-gray-400">{new Date(review.date).toLocaleDateString()}</span>
                    )}
                  </div>

                  {/* IMAGEN DE LA RESEÑA */}
                  {review.image && (
                      <div className="mb-2">
                          <img 
                            src={`${API_BASE_URL}${review.image}`} 
                            alt="Review attachment" 
                            className="w-24 h-24 object-cover rounded cursor-pointer hover:opacity-90 transition"
                            onClick={() => window.open(`${API_BASE_URL}${review.image}`, '_blank')}
                          />
                      </div>
                  )}

                  {/* CONTENIDO (Edición vs Lectura) */}
                  {editingId === review.id ? (
                      <div className="mt-2">
                          <textarea 
                              value={editContent} 
                              onChange={(e) => setEditContent(e.target.value)} 
                              className="w-full border p-2 rounded text-sm mb-2"
                          />
                          <div className="flex gap-2">
                              <button onClick={() => saveEdit(review.id)} className="bg-green-500 text-white px-2 py-1 rounded text-xs">Save</button>
                              <button onClick={() => setEditingId(null)} className="bg-gray-300 text-black px-2 py-1 rounded text-xs">Cancel</button>
                          </div>
                      </div>
                  ) : (
                      <p className="text-gray-600 text-sm">{review.content}</p>
                  )}
                </div>
              ))
            }
          </div>
        </div>

        {/* FORMULARIO */}
        <div className="md:w-1/3 bg-white p-6 rounded shadow-md h-fit">
          {isLoggedIn ? (
            <div>
               <div className="flex justify-between items-center mb-4">
                  <h5 className="text-lg font-bold">Write a Review</h5>
                  <button onClick={handleLogout} className="text-xs text-red-500 underline">Logout</button>
               </div>
               <form onSubmit={handleCreate}>
                <textarea
                  className="w-full border border-gray-300 rounded p-2 h-24 resize-none mb-3"
                  placeholder="Share your experience..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                />
                
                {/* Input Imagen */}
                <div className="mb-4">
                    <label className="block text-xs font-medium text-gray-700 mb-1">Add a photo (optional)</label>
                    <input 
                        id="fileInput"
                        type="file" 
                        accept="image/*"
                        onChange={(e) => e.target.files && setSelectedFile(e.target.files[0])}
                        className="text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-yellow-50 file:text-yellow-700 hover:file:bg-yellow-100"
                    />
                </div>

                <button type="submit" className="w-full bg-[#F0BB00] text-black hover:bg-[#1f2124] hover:text-white font-semibold py-2 rounded transition-colors">
                  Submit Review
                </button>
              </form>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-600 mb-4 font-medium">Want to share your experience?</p>
              <div className="flex flex-col gap-3">
                <button 
                  onClick={onOpenLogin}
                  className="w-full bg-gray-800 text-white px-6 py-2 rounded hover:bg-black transition-colors shadow-lg"
                >
                  Login to Review
                </button>
                
                <p className="text-xs text-gray-400">or</p>

                <button 
                  onClick={onOpenSignup}
                  className="w-full border-2 border-gray-800 text-gray-800 px-6 py-2 rounded hover:bg-gray-100 transition-colors"
                >
                  Sign Up
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-4">You need to be logged in to post.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

// --- HOME PAGE ---
function Home() {
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const [refreshKey, setRefreshKey] = useState(0);

  const handleOpenLogin = () => {
    setAuthMode("login");
    setAuthOpen(true);
  };

  const handleOpenSignup = () => {
    setAuthMode("signup");
    setAuthOpen(true);
  };

  const handleCloseAuth = () => {
    setAuthOpen(false);
    // Forzamos recarga de Reviews por si el usuario se logueó
    setRefreshKey(prev => prev + 1);
  };

  return (
    <>
      <HeroImage
        title={
          <div className="text-center px-4">
            <h1 className="Display">A Will To Change</h1>
            <h4 className="text-base md:text-2xl">Join social and environmental initiatives and make an impact today</h4>
          </div>
        }
        imgSrc="/hero-img.jpg"
        heightClass="h-48 md:h-96"
        titleClass="Display text-white"
      />
      
      <main className="max-w-6xl mx-auto px-4 md:px-6 py-8 md:py-12">
        <h3 className="text-xl font-bold mb-2">Newest Projects</h3>
        <h4 className="text-gray-600 mb-6">Discover volunteer projects and make an impact.</h4>
        <Carousel />

        <h3 className="text-xl font-bold mb-2 mt-12">About Us</h3>
        <h4 className="text-gray-600 mb-6">At our platform, we believe that everyone can make a difference</h4>
        <AboutSection />

        <h3 className="text-xl font-bold mb-2 mt-12">Reviews</h3>
        <h4 className="text-gray-600 mb-6">Feedback and qualifications</h4>
        
        <ReviewsSection 
          onOpenLogin={handleOpenLogin} 
          onOpenSignup={handleOpenSignup}
          refreshTrigger={refreshKey}
        />
      </main>

      <AuthModal 
        open={authOpen} 
        mode={authMode} 
        onClose={handleCloseAuth} 
      />
    </>
  );
}

export default Home;