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
  const [userRole, setUserRole] = useState<string | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    // Initialize
    setIsLoggedIn(!!localStorage.getItem("jwtToken"));
    setUserRole(localStorage.getItem("userRole"));

    const onStorage = (e: StorageEvent) => {
      if (e.key === "jwtToken" || e.key === "__auth_last_update" || e.key === "userRole") {
        setIsLoggedIn(!!localStorage.getItem("jwtToken"));
        setUserRole(localStorage.getItem("userRole"));
      }
    };

    const onAuthChanged = () => {
      setIsLoggedIn(!!localStorage.getItem("jwtToken"));
      setUserRole(localStorage.getItem("userRole"));
    };

    window.addEventListener("storage", onStorage);
    window.addEventListener("authChanged", onAuthChanged);

    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("authChanged", onAuthChanged);
    };
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
    setUserRole(null);

    // Notify other components
    window.dispatchEvent(new CustomEvent("authChanged", { detail: { loggedIn: false } }));
    try { localStorage.setItem("__auth_last_update", Date.now().toString()); } catch {}

    navigate("/");
  };

  return (
    <nav className="bg-white shadow-md relative z-30">
      <div className="mx-auto px-4 flex justify-between items-center h-16">
        <NavLink to="/home" className="flex items-center">
          <img src={Logo} alt="Logo AWTC" className="h-10 w-10 mr-2" />
        </NavLink>

        {/* desktop/tablet */}
        <div className="hidden md:flex items-center space-x-4">
          <NavLink
  to="/home"
  className={({ isActive }) =>
    `text-gray-800 transition-all duration-200 ${isActive ? "font-bold" : ""}`
  }
>
  Home
</NavLink>

<NavLink
  to="/volunteering"
  className={({ isActive }) =>
    `text-gray-800 transition-all duration-200 ${isActive ? "font-bold" : ""}`
  }
>
  Volunteering
</NavLink>

<NavLink
  to="/moreinfo"
  className={({ isActive }) =>
    `text-gray-800 transition-all duration-200 ${isActive ? "font-bold" : ""}`
  }
>
  Info
</NavLink>

<NavLink
  to="/aboutus"
  className={({ isActive }) =>
    `text-gray-800 transition-all duration-200 ${isActive ? "font-bold" : ""}`
  }
>
  About Us
</NavLink>

          {isLoggedIn ? (
            <>
              <button
                onClick={() => navigate("/dashboard")}
                className="px-4 py-2 rounded-3xl border border-[#767676] hover:bg-[#1f2124] hover:text-white transition-colors duration-200"
              >
                Profile
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 rounded-3xl bg-[#B33A3A] text-white hover:bg-[#1f2124] hover:text-white transition-colors duration-200"
              >
                Log Out
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => openAuth("login")}
                className="px-4 py-2 rounded-3xl border border-[#767676] hover:bg-[#1f2124] hover:text-white transition-colors duration-200"
              >
                Log In
              </button>
              <button
                onClick={() => openAuth("signup")}
                className="px-4 py-2 rounded-3xl bg-[#F0BB00] text-black hover:bg-[#1f2124] hover:text-white transition-colors duration-200"
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
      {/* Overlay */}
      {menuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setMenuOpen(false)}
        ></div>
      )}

      <div
        className={`fixed inset-0 bg-white z-50
        transform transition-transform duration-300 ease-in-out
        ${menuOpen ? "translate-x-0" : "translate-x-full"}
        flex flex-col p-6 pt-20 space-y-6 overflow-y-auto`}
      >
        <button
          className="absolute top-5 right-5 text-gray-600 hover:text-black transition-colors"
          onClick={() => setMenuOpen(false)}
          aria-label="Close menu"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="flex flex-col space-y-4">
          <NavLink 
            to="/home" 
            onClick={() => setMenuOpen(false)}
            className={({ isActive }) => `text-lg font-medium transition-colors ${isActive ? "text-[#F0BB00]" : "text-gray-800 hover:text-[#F0BB00]"}`}
          >
            Home
          </NavLink>
          <NavLink 
            to="/volunteering" 
            onClick={() => setMenuOpen(false)}
            className={({ isActive }) => `text-lg font-medium transition-colors ${isActive ? "text-[#F0BB00]" : "text-gray-800 hover:text-[#F0BB00]"}`}
          >
            Volunteering
          </NavLink>
          <NavLink 
            to="/moreinfo" 
            onClick={() => setMenuOpen(false)}
            className={({ isActive }) => `text-lg font-medium transition-colors ${isActive ? "text-[#F0BB00]" : "text-gray-800 hover:text-[#F0BB00]"}`}
          >
            Info
          </NavLink>
          <NavLink 
            to="/aboutus" 
            onClick={() => setMenuOpen(false)}
            className={({ isActive }) => `text-lg font-medium transition-colors ${isActive ? "text-[#F0BB00]" : "text-gray-800 hover:text-[#F0BB00]"}`}
          >
            About Us
          </NavLink>
        </div>

        <div className="h-px bg-gray-200 w-full my-4"></div>

        <div className="flex flex-col space-y-3">
          {isLoggedIn ? (
            <>
              <button 
                onClick={() => {navigate("/dashboard"); setMenuOpen(false)}} 
                className="w-full px-4 py-2 rounded-3xl border border-[#767676] text-center hover:bg-[#1f2124] hover:text-white transition-colors duration-200"
              >
                Profile
              </button>
              <button 
                onClick={() => {handleLogout(); setMenuOpen(false)}} 
                className="w-full px-4 py-2 rounded-3xl bg-[#B33A3A] text-white text-center hover:bg-[#1f2124] hover:text-white transition-colors duration-200"
              >
                Log Out
              </button>
            </>
          ) : (
            <>
              <button 
                onClick={() => {openAuth("login"); setMenuOpen(false)}} 
                className="w-full px-4 py-2 rounded-3xl border border-[#767676] text-center hover:bg-[#1f2124] hover:text-white transition-colors duration-200"
              >
                Log In
              </button>
              <button 
                onClick={() => {openAuth("signup"); setMenuOpen(false)}} 
                className="w-full px-4 py-2 rounded-3xl bg-[#F0BB00] text-black text-center hover:bg-[#1f2124] hover:text-white transition-colors duration-200"
              >
                Sign Up
              </button>
            </>
          )}
        </div>
      </div>

      {/* Popup Auth */}
      <AuthModal open={authOpen} onClose={() => {setAuthOpen(false); setIsLoggedIn(!!localStorage.getItem("jwtToken"))}} mode={authMode} />
    </nav>
  );
}

export default NavBar;
