import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AtSymbolIcon,
  LockClosedIcon,
  UserIcon,
  EyeIcon,
  EyeSlashIcon,
} from "@heroicons/react/24/outline";

interface AuthModalProps {
  open: boolean;
  mode: "login" | "signup";
  onClose: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ open, mode, onClose }) => {
  const [currentMode, setCurrentMode] = useState<"login" | "signup">(mode);
  const [showPass, setShowPass] = useState(false);

  // Form state
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [name, setName] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:8080/api/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password: pass }),
      });

      const data = await res.json();
      if (!res.ok)
        throw new Error(data.message || "Usuario o contraseña incorrecta");

      // Guardamos token para autenticación básica en futuras peticiones a rutas protegidas
      const token = btoa(`${email}:${pass}`);
      localStorage.setItem("basicAuthToken", token);
      localStorage.setItem("userName", data.user.name);
      localStorage.setItem("userRole", data.user.role);

      alert(`Bienvenido ${data.user.name}!`);
      onClose();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:8080/api/users/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          password: pass,
        //   role: "volunteer",
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || "Error al crear usuario");
      }

      alert("Usuario creado correctamente!");
      setCurrentMode("login"); // Cambia a login automáticamente
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          onClick={onClose}
        >
          <motion.div
            className="relative bg-white rounded-2xl shadow-xl w-[90%] max-w-sm p-6 text-gray-800"
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ duration: 0.3, type: "spring", stiffness: 120 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Botón cerrar */}
            <button
              className="absolute top-3 right-4 text-gray-500 text-2xl hover:text-gray-700 transition"
              onClick={onClose}
            >
              ✕
            </button>

            {/* Título */}
            <h2 className="text-2xl font-semibold mb-4 text-center">
              {currentMode === "login" ? "Log In" : "Sign Up"}
            </h2>

            <form
              className="space-y-4"
              onSubmit={currentMode === "login" ? handleLogin : handleSignup}
            >
              {currentMode === "signup" && (
                <div className="relative">
                  <UserIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
                    required
                  />
                </div>
              )}

              <div className="relative">
                <AtSymbolIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
                  required
                />
              </div>

              <div className="relative">
                <LockClosedIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type={showPass ? "text" : "password"}
                  placeholder="Password"
                  value={pass}
                  onChange={(e) => setPass(e.target.value)}
                  className="w-full pl-10 pr-10 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-2 top-2.5 text-gray-400 hover:text-gray-600"
                >
                  {showPass ? (
                    <EyeSlashIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </button>
              </div>

              <button
                type="submit"
                className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition font-semibold"
              >
                {currentMode === "login" ? "Log In" : "Sign Up"}
              </button>
            </form>

            <p className="text-center text-sm mt-4 text-gray-600">
              {currentMode === "login" ? (
                <>
                  Don’t have an account?{" "}
                  <button
                    onClick={() => setCurrentMode("signup")}
                    className="text-blue-500 hover:underline"
                  >
                    Sign Up
                  </button>
                </>
              ) : (
                <>
                  Already have an account?{" "}
                  <button
                    onClick={() => setCurrentMode("login")}
                    className="text-blue-500 hover:underline"
                  >
                    Log In
                  </button>
                </>
              )}
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AuthModal;
