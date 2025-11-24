import React, { useEffect, useState } from "react";
import HeroImage from "../components/HeroImage";
import logo from "../assets/awtc-logo.png";
import { NavLink } from "react-router-dom";

// Carousel
const images = [logo, logo, logo, logo];
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
    <section className="flex flex-col md:flex-row items-center justify-between gap-6 my-12 bg-white">
      <img
        src={logo}
        alt="Volunteers by river"
      />
      <div className="flex-1 pl-0 md:pl-8 mt-6 md:mt-0">
        <p className="text-gray-700 text-sm mb-6">
          Our mission is to make joining social and environmental projects simple, safe, and meaningful, connecting volunteers with opportunities that create real impact and strengthen communities. We provide support, guidance, and a network where everyone can contribute, learn, and grow, fostering collaboration, compassion, and lasting positive change. By bringing together people from all walks of life, we aim to empower individuals to take meaningful action, build stronger communities, and protect the planet for future generations.
        </p>
        <NavLink to="/AboutUs">
          <button className="bg-yellow-400 hover:bg-yellow-500 px-5 py-2 rounded-3xl font-semibold shadow">
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

function ReviewsSection() {
  const [reviews, setReviews] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [newContent, setNewContent] = useState("");
  const [newImage, setNewImage] = useState("");

  useEffect(() => {
    fetch("https://awtc-production.up.railway.app/api/reviews")
      .then(res => res.json())
      .then(data => {
        const filled = data.map((review, i) => ({
          ...review,
          ...MOCK_USERS[i % MOCK_USERS.length]
        }));
        setReviews(filled.reverse());
      });
  }, []);

  const handleAddReview = async () => {
    const now = new Date();
    const iso = now.toISOString();
    const payload = {
      content: newContent,
      date: iso,
      image: newImage,
    };
    await fetch("https://awtc-production.up.railway.app/api/reviews", {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
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
          <div key={idx} className="bg-gray-100 rounded-lg shadow flex flex-col mx-auto w-full max-w-[350px] min-w-[240px]">
            <div className="flex flex-col flex-1 p-4">
              <span className="block text-xs text-gray-500 mb-1">
                {formatDate(review.date)}
              </span>
              <span className="inline-block bg-green-100 text-green-800 text-xs font-semibold px-2 py-1 rounded mb-2">
                {review.label}
              </span>
              {/* IMAGEN después del LABEL */}
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
                className="bg-yellow-400 hover:bg-yellow-500 px-4 py-2 rounded-2xl font-semibold shadow"
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
            className="bg-yellow-400 hover:bg-yellow-500 px-7 py-2 rounded-2xl font-semibold shadow text-black"
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
