import { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import Logo from "../assets/awtc-logo.png";
import User from "../assets/user-solid-full.svg";
import Hamburger from "hamburger-react";
import AuthModal from "./AuthModal";

function NavBar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("jwtToken");
    setIsLoggedIn(!!token);
  }, []);

  // listen for global requests to open the auth modal (from other pages/components)
  useEffect(() => {
    const handler = (e: Event) => {
      const custom = e as CustomEvent;
      const detail = custom.detail as { mode?: "login" | "signup" } | undefined;
      const mode = detail?.mode || "signup";
      openAuth(mode);
    };
    window.addEventListener("openAuthModal", handler as EventListener);
    return () => window.removeEventListener("openAuthModal", handler as EventListener);
  }, []);

  const openAuth = (mode: "login" | "signup") => {
    setAuthMode(mode);
    setAuthOpen(true);
  };

  const handleLogout = () => {
    localStorage.removeItem("jwtToken");
    localStorage.removeItem("userName");
    localStorage.removeItem("userRole");
    setIsLoggedIn(false);
    navigate("/");
  };

  return (
    <nav className="bg-white shadow-md relative z-30">
      <div className="mx-auto px-4 flex justify-between items-center h-16">
        <NavLink to="/Home" className="flex items-center">
          <img src={Logo} alt="Logo AWTC" className="h-10 w-10 mr-2" />
        </NavLink>

        {/* desktop/tablet */}
        <div className="hidden md:flex items-center space-x-4">
          <NavLink
  to="/Home"
  className={({ isActive }) =>
    `text-gray-800 transition-all duration-200 ${isActive ? "font-bold" : ""}`
  }
>
  Home
</NavLink>

<NavLink
  to="/Volunteering"
  className={({ isActive }) =>
    `text-gray-800 transition-all duration-200 ${isActive ? "font-bold" : ""}`
  }
>
  Volunteering
</NavLink>

<NavLink
  to="/Reviews"
  className={({ isActive }) =>
    `text-gray-800 transition-all duration-200 ${isActive ? "font-bold" : ""}`
  }
>
  Reviews
</NavLink>

<NavLink
  to="/MoreInfo"
  className={({ isActive }) =>
    `text-gray-800 transition-all duration-200 ${isActive ? "font-bold" : ""}`
  }
>
  Info
</NavLink>

<NavLink
  to="/AboutUs"
  className={({ isActive }) =>
    `text-gray-800 transition-all duration-200 ${isActive ? "font-bold" : ""}`
  }
>
  About
</NavLink>

          {isLoggedIn ? (
            <>
              <button
                onClick={() => navigate("/dashboard")}
                className="px-4 py-2 rounded-md border border-[#767676] hover:bg-[#EDEBEB] transition"
              >
                Profile
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 rounded-md bg-red-500 text-white hover:bg-red-600 transition"
              >
                Log Out
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => openAuth("login")}
                className="px-4 py-2 rounded-md border border-[#767676] hover:bg-[#EDEBEB] transition"
              >
                Log In
              </button>
              <button
                onClick={() => openAuth("signup")}
                className="px-4 py-2 rounded-md bg-[#F0BB00] border border-[#767676] hover:bg-[#C68900] transition"
              >
                Sign Up
              </button>
            </>
          )}
        </div>

        {/* phone */}
        <div className="flex items-center space-x-2 md:hidden">
          <img
            src={User}
            alt="User Icon"
            className="h-8 w-8 cursor-pointer"
            onClick={() => (isLoggedIn ? navigate("/dashboard") : openAuth("login"))}
          />
          <Hamburger toggled={menuOpen} toggle={setMenuOpen} size={26} color="#222" />
        </div>
      </div>

      {/* Drawer phone */}
      <div
        className={`fixed top-0 right-0 h-full w-2/3 max-w-xs bg-white shadow-lg z-30
        transform transition-transform duration-300 ease-in-out
        ${menuOpen ? "translate-x-0" : "translate-x-full"}
        flex flex-col p-8 pt-24`}
      >
        <button
          className="absolute top-6 right-6 text-2xl"
          onClick={() => setMenuOpen(false)}
          aria-label="Close menu"
        >
          ✕
        </button>
        <NavLink to="/Home" onClick={() => setMenuOpen(false)}>Home</NavLink>
        <NavLink to="/Volunteering" onClick={() => setMenuOpen(false)}>Volunteering</NavLink>
        <NavLink to="/Reviews" onClick={() => setMenuOpen(false)}>Reviews</NavLink>
  <NavLink to="/MoreInfo" onClick={() => setMenuOpen(false)}>Info</NavLink>
  <NavLink to="/About" onClick={() => setMenuOpen(false)}>About</NavLink>
        {isLoggedIn && (
          <>
            <button onClick={() => {navigate("/dashboard"); setMenuOpen(false)}} className="mt-4 text-left">Profile</button>
            <button onClick={() => {handleLogout(); setMenuOpen(false)}} className="mt-2 text-left text-red-500">Log Out</button>
          </>
        )}
      </div>

      {/* Popup Auth */}
      <AuthModal open={authOpen} onClose={() => {setAuthOpen(false); setIsLoggedIn(!!localStorage.getItem("jwtToken"))}} mode={authMode} />
    </nav>
  );
}

export default NavBar;
