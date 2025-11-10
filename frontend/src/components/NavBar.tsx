import { useState } from "react";
import { NavLink } from "react-router-dom";
import Logo from "../assets/awtc-logo.png";
import User from "../assets/user-solid-full.svg";
import Hamburger from "hamburger-react";
import AuthModal from "./AuthModal";

function NavBar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");

  const openAuth = (mode: "login" | "signup") => {
    setAuthMode(mode);
    setAuthOpen(true);
  };

  return (
    <nav className="bg-white shadow-md relative z-30">
      <div className="mx-auto px-4 flex justify-between items-center h-16">
        <NavLink to="/Home" className="flex items-center">
          <img src={Logo} alt="Logo AWTC" className="h-10 w-10 mr-2" />
        </NavLink>

        {/* Versión desktop/tablet */}
        <div className="hidden md:flex items-center space-x-4">
          <NavLink to="/Home" className="text-gray-800 hover:text-blue-500">Home</NavLink>
          <NavLink to="/Volunteering" className="text-gray-800 hover:text-blue-500">Volunteering</NavLink>
          <NavLink to="/Reviews" className="text-gray-800 hover:text-blue-500">Reviews</NavLink>
          <NavLink to="/MoreInfo" className="text-gray-800 hover:text-blue-500">Info</NavLink>
          <button
            onClick={() => openAuth("login")}
            className="px-4 py-2 rounded-md border border-blue-500 text-blue-500 hover:bg-blue-50 transition"
          >
            Log In
          </button>
          <button
            onClick={() => openAuth("signup")}
            className="px-4 py-2 rounded-md bg-blue-500 text-white hover:bg-blue-600 transition"
          >
            Sign Up
          </button>
        </div>

        {/* Versión móvil */}
        <div className="flex items-center space-x-2 md:hidden">
          <img
            src={User}
            alt="User Icon"
            className="h-8 w-8 cursor-pointer"
            onClick={() => openAuth("login")}
          />
          <Hamburger toggled={menuOpen} toggle={setMenuOpen} size={26} color="#222" />
        </div>
      </div>

      {/* Drawer móvil */}
      <div
        className={`fixed top-0 right-0 h-full w-2/3 max-w-xs bg-white shadow-lg z-30
        transform transition-transform duration-300 ease-in-out
        ${menuOpen ? "translate-x-0" : "translate-x-full"}
        flex flex-col p-8 pt-24`}
      >
        <button
          className="absolute top-6 right-6 text-2xl"
          onClick={() => setMenuOpen(false)}
          aria-label="Cerrar menú"
        >
          ✕
        </button>
        <NavLink to="/Home" onClick={() => setMenuOpen(false)}>Home</NavLink>
        <NavLink to="/Volunteering" onClick={() => setMenuOpen(false)}>Volunteering</NavLink>
        <NavLink to="/Reviews" onClick={() => setMenuOpen(false)}>Reviews</NavLink>
        <NavLink to="/MoreInfo" onClick={() => setMenuOpen(false)}>Info</NavLink>
      </div>

      {/* Popup Auth */}
      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} mode={authMode} />
    </nav>
  );
}

export default NavBar;
