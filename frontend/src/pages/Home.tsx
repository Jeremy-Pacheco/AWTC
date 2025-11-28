import React, { useEffect, useState } from "react";
import HeroImage from "../components/HeroImage";
import logo1 from "../img/medioambiente.png";
import logo2 from "../img/rd.png";
import logo3 from "../img/salud.png";
import { NavLink } from "react-router-dom";

// Carousel
const images = [logo1, logo2, logo3];
function Carousel() {
  const [current, setCurrent] = useState(0);
  const prev = () => setCurrent(c => (c === 0 ? images.length - 1 : c - 1));
  const next = () => setCurrent(c => (c === images.length - 1 ? 0 : c + 1));
  return (
    <div className="flex justify-center items-center my-8 space-x-4">
      <button onClick={prev} className="text-2xl px-2 text-gray-600">&lt;</button>
      <div className="flex space-x-4 items-center">
        <img src={images[(current - 1 + images.length) % images.length]} className="w-24 h-32 object-cover rounded" alt="" />
        <img src={images[current]} className="w-64 h-48 object-cover rounded shadow-lg" alt="" />
        <img src={images[(current + 1) % images.length]} className="w-24 h-32 object-cover rounded" alt="" />
      </div>
      <button onClick={next} className="text-2xl px-2 text-gray-600">&gt;</button>
    </div>
  );
}

function AboutSection() {
  return (
    <section className="flex flex-col md:flex-row items-center justify-between gap-4 md:gap-6 my-8 md:my-12 bg-white px-4 md:px-0">
      <img
        src={logo1}
        alt="Volunteers by river"
        className="w-full md:w-auto md:max-w-sm h-auto rounded"
      />
      <div className="flex-1 pl-0 md:pl-8 mt-4 md:mt-0">
        <p className="text-gray-700 text-xs sm:text-sm md:text-base mb-4 md:mb-6 leading-relaxed">
          Our mission is to make joining social and environmental projects simple, safe, and meaningful, connecting volunteers with opportunities that create real impact and strengthen communities. We provide support, guidance, and a network where everyone can contribute, learn, and grow, fostering collaboration, compassion, and lasting positive change. By bringing together people from all walks of life, we aim to empower individuals to take meaningful action, build stronger communities, and protect the planet for future generations.
        </p>
        <NavLink to="/AboutUs">
          <button className="bg-[#F0BB00] text-black hover:bg-[#1f2124] hover:text-white px-5 py-2 rounded-3xl font-semibold shadow text-sm md:text-base w-full md:w-auto text-center">
            Read more
          </button>
        </NavLink>
      </div>
    </section>
  );
}

const MOCK_USERS = [
  { user: "Juan", role: "Volunteer", label: "Beach cleaning", avatar: "https://randomuser.me/api/portraits/men/51.jpg" },
  { user: "Carlos", role: "Coordinator", label: "Rural community support", avatar: "https://randomuser.me/api/portraits/men/55.jpg" },
  { user: "Fernando", role: "Admin", label: "Community tree planting", avatar: "https://randomuser.me/api/portraits/men/56.jpg" }
];

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

function ReviewsSection() {
  const [reviews, setReviews] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [newContent, setNewContent] = useState("");
  const [newImage, setNewImage] = useState("");

  useEffect(() => {
    fetch(`${API_URL}/api/reviews`)
      .then(res => res.json())
      .then(data => {
        if (!Array.isArray(data)) {
          console.error("Expected array of reviews, got:", data);
          setReviews([]);
          return;
        }
        const filled = data.map((review, i) => ({
          ...review,
          ...MOCK_USERS[i % MOCK_USERS.length]
        }));
        setReviews(filled.reverse());
      })
      .catch(err => console.error("Error fetching reviews:", err));
  }, []);

  const handleAddReview = async () => {
    const now = new Date();
    const iso = now.toISOString();
    const payload = {
      content: newContent,
      date: iso,
      image: newImage,
    };
    try {
      const res = await fetch(`${API_URL}/api/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed to save review");
      
      setReviews([
        {
          ...payload,
          ...MOCK_USERS[reviews.length % MOCK_USERS.length],
        },
        ...reviews
      ]);
      setNewContent("");
      setNewImage("");
      setShowForm(false);
    } catch (err) {
      console.error(err);
      alert("Error saving review");
    }
  };

  const handleFileChange = e => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setNewImage(reader.result);
      reader.readAsDataURL(file);
    } else {
      setNewImage("");
    }
  };

  function formatDate(isoString) {
    if (!isoString) return "";
    const d = new Date(isoString);
    return d.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: '2-digit'
    });
  }

  return (
    <section className="py-8">
      <div className="flex flex-col md:flex-row md:flex-wrap gap-6 justify-center items-stretch mb-8">
        {reviews.map((review, idx) => (
            <div key={idx} className="bg-white rounded-lg shadow-lg flex flex-col mx-auto w-full max-w-[350px] min-w-[240px]">
            {/* Title bar: full-width block aligned with card edges */}
            <div className="w-full">
              <span className="block w-full text-left text-black text-sm font-semibold px-4 py-2 border-b border-gray-200">{review.label}</span>
            </div>
            <div className="flex flex-col flex-1 p-4">
              <span className="block text-xs text-gray-500 mb-1">
                {formatDate(review.date)}
              </span>
              {review.image && (
                <img src={review.image} alt="review" className="w-full h-40 object-cover rounded mb-2" />
              )}
              <p className="text-sm text-gray-700 mb-4">{review.content}</p>
              <div className="flex items-center mt-auto">
                <img
                  src={review.avatar}
                  alt={review.user}
                  className="w-8 h-8 rounded-full border-2 border-gray-300 mr-3"
                />
                <div>
                  <span className="font-semibold text-sm">{review.user}</span>
                  <div className="text-xs text-gray-500">{review.role}</div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-center">
        {showForm ? (
          <form
            className="flex flex-col gap-2 items-center"
            onSubmit={e => {
              e.preventDefault();
              if (newContent.trim()) handleAddReview();
            }}
          >
            <input
              type="text"
              value={newContent}
              onChange={e => setNewContent(e.target.value)}
              placeholder="Write your review..."
              className="border p-2 rounded w-72"
              maxLength={120}
              required
            />
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="border p-2 rounded w-72"
            />
            {newImage && (
              <img src={newImage} alt="Preview" className="max-h-28 rounded shadow mb-2" />
            )}
            <div className="flex gap-2">
              <button
                type="submit"
                className="bg-[#F0BB00] text-black hover:bg-[#1f2124] hover:text-white px-4 py-2 rounded-2xl font-semibold shadow"
              >
                Save review
              </button>
              <button
                type="button"
                className="bg-gray-300 rounded-2xl px-4 py-2"
                onClick={() => { setShowForm(false); setNewImage(""); setNewContent(""); }}
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <button
            className="bg-[#F0BB00] text-black hover:bg-[#1f2124] hover:text-white px-7 py-2 rounded-2xl font-semibold shadow"
            onClick={() => setShowForm(true)}
          >
            Add a review
          </button>
        )}
      </div>
    </section>
  );
}

function Home() {
  return (
    <>
      <HeroImage
        title={
          <div className="text-center">
            <h1 className="Display">A Will To Change</h1>
            <h4>
              Join social and environmental initiatives and make an impact today
            </h4>
          </div>
        }
        imgSrc="/hero-img.jpg"
        heightClass="h-64 md:h-96"
        titleClass="Display text-white"
      />
      <main className="max-w-6xl mx-auto px-6 py-12">
        <h3>Newests Proyects</h3>
        <h4>Discover volunteer projects and make an impact.</h4>
        <Carousel />
        <h3>About Us</h3>
        <h4>At our platform, we believe that everyone can make a difference</h4>
        <AboutSection />
        <h3>Reviews</h3>
        <h4>Feedback and califications</h4>
        <ReviewsSection />
      </main>
    </>
  );
}

export default Home;
