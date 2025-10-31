import { useState } from "react";
import { NavLink } from "react-router-dom";
import Logo from "../assets/awtc-logo.png";
import User from "../assets/user-solid-full.svg";
import Hamburger from "hamburger-react";

function NavBar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="bg-white-950 shadow-lg relative z-30">
      <div className="mx-auto px-4 flex justify-between items-center h-16">
        <NavLink to="/Home">
          <img src={Logo} alt="Logo AWTC" className="h-12 w-12 mr-2" />
        </NavLink>

        {/* Bloque usuario y hamburger, alineados */}
        <div className="flex items-center space-x-2">
          <img
            src={User}
            alt="User Icon"
            className="h-10 w-10 show-user-mobile"
          />
          <div className="burger-menu flex items-center">
            <Hamburger
              toggled={menuOpen}
              toggle={setMenuOpen}
              size={32}
              direction="right"
              color="#222"
            />
          </div>
        </div>

        {/* Menú horizontal solo visible >=769px */}
        <ul className="desktop-menu space-x-8">
          <li>
            <NavLink
              to="/Home"
              className={({ isActive }) =>
                `text-black ${isActive ? "font-semibold" : ""}`
              }
            >
              Home
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/Volunteering"
              className={({ isActive }) =>
                `text-black ${isActive ? "font-semibold" : ""}`
              }
            >
              Volunteering
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/Reviews"
              className={({ isActive }) =>
                `text-black ${isActive ? "font-semibold" : ""}`
              }
            >
              Reviews
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/MoreInfo"
              className={({ isActive }) =>
                `text-black ${isActive ? "font-semibold" : ""}`
              }
            >
              More Info
            </NavLink>
          </li>
        </ul>
      </div>

      {/* Drawer menú móvil */}
      <div
        className={`
          fixed top-0 right-0 h-full w-2/3 max-w-xs bg-white shadow-lg z-30
          transform transition-transform duration-300 ease-in-out
          ${menuOpen ? "translate-x-0" : "translate-x-full"}
          flex flex-col p-8 pt-24
        `}
        style={{ display: menuOpen ? "flex" : "none" }}
      >
        <button
          className="absolute top-6 right-6 text-2xl"
          onClick={() => setMenuOpen(false)}
          aria-label="Cerrar menú"
        >
          ✕
        </button>
        <NavLink
          to="/Home"
          className={({ isActive }) =>
            `mb-6 text-black text-xl ${isActive ? "font-semibold" : ""}`
          }
          onClick={() => setMenuOpen(false)}
        >
          Home
        </NavLink>
        <NavLink
          to="/Volunteering"
          className={({ isActive }) =>
            `mb-6 text-black text-xl ${isActive ? "font-semibold" : ""}`
          }
          onClick={() => setMenuOpen(false)}
        >
          Volunteering
        </NavLink>
        <NavLink
          to="/Reviews"
          className={({ isActive }) =>
            `mb-6 text-black text-xl ${isActive ? "font-semibold" : ""}`
          }
          onClick={() => setMenuOpen(false)}
        >
          Reviews
        </NavLink>
        <NavLink
          to="/MoreInfo"
          className={({ isActive }) =>
            `mb-6 text-black text-xl ${isActive ? "font-semibold" : ""}`
          }
          onClick={() => setMenuOpen(false)}
        >
          Info
        </NavLink>
      </div>
    </nav>
  );
}

export default NavBar;
