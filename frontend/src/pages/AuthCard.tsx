import React, { useState } from "react";
import { AtSymbolIcon, LockClosedIcon, UserIcon, EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";

const AuthCard: React.FC = () => {
  const [showSignup, setShowSignup] = useState(false);

  // Estado login
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPass, setLoginPass] = useState('');
  const [showLoginPass, setShowLoginPass] = useState(false);

  // Estado signup
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPass, setSignupPass] = useState('');
  const [showSignupPass, setShowSignupPass] = useState(false);

  // Handler login
  const handleLogin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const token = btoa(`${loginEmail}:${loginPass}`);
    localStorage.setItem("basicAuthToken", token);
    setLoginEmail('');
    setLoginPass('');
    alert("Login realizado y token guardado en localStorage!");
  };

  // Handler signup
  const handleSignup = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const token = btoa(`${signupEmail}:${signupPass}`);
    localStorage.setItem("basicAuthToken", token);
    localStorage.setItem("userName", signupName);
    setSignupName('');
    setSignupEmail('');
    setSignupPass('');
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 overflow-x-hidden">
      <div className="w-[360px] max-w-full h-[400px] [perspective:1200px] mt-8">
        <div
          className={`w-full h-full relative transition-transform duration-700 ease-in-out ${
            showSignup ? "[transform:rotateY(180deg)]" : ""
          }`}
          style={{
            transformStyle: "preserve-3d",
          }}
        >
          {/* Card Front (Login) */}
          <div
            className="absolute w-full h-full bg-gray-50 rounded-lg shadow-xl"
            style={{
              backfaceVisibility: "hidden",
              backgroundImage:
                "url('https://s3-us-west-2.amazonaws.com/s.cdpn.io/1462889/pat.svg')",
              backgroundPosition: "bottom center",
              backgroundRepeat: "no-repeat",
              backgroundSize: "300%",
            }}
          >
            <div className="flex flex-col justify-center items-center h-full px-10">
              <h4 className="mb-4 pb-2 text-2xl text-gray-900 font-semibold">Log In</h4>
              <form className="w-full space-y-4" onSubmit={handleLogin}>
                <div className="relative">
                  <input
                    type="email"
                    id="logemail"
                    value={loginEmail}
                    onChange={e => setLoginEmail(e.target.value)}
                    placeholder="Your Email"
                    autoComplete="off"
                    className="w-full pl-12 pr-4 py-3 rounded bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-300 font-medium shadow-md placeholder-gray-400"
                  />
                  <AtSymbolIcon className="absolute left-3 top-2.5 h-6 w-6 text-blue-400" />
                </div>
                <div className="relative flex items-center">
                  <input
                    type={showLoginPass ? "text" : "password"}
                    id="logpass"
                    value={loginPass}
                    onChange={e => setLoginPass(e.target.value)}
                    placeholder="Your Password"
                    autoComplete="off"
                    className="w-full pl-12 pr-10 py-3 rounded bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-300 font-medium shadow-md placeholder-gray-400"
                  />
                  <LockClosedIcon className="absolute left-3 top-2.5 h-6 w-6 text-blue-400 pointer-events-none" />
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setShowLoginPass(v => !v)}
                    className="absolute right-2 top-3 h-6 w-6 text-blue-400 cursor-pointer focus:outline-none"
                  >
                    {showLoginPass ? <EyeSlashIcon /> : <EyeIcon />}
                  </button>
                </div>
                <button
                  type="submit"
                  className="w-full mt-4 bg-blue-400 text-white rounded font-semibold py-2 uppercase tracking-wide shadow hover:bg-blue-600 transition-all duration-150"
                >
                  Submit
                </button>
              </form>
              <p className="mb-0 mt-4 text-center">
                <a href="#" className="text-gray-500 hover:text-blue-400 text-sm transition-colors">
                  Forgot your password?
                </a>
              </p>
              <button
                className="mt-5 text-sm text-gray-400 hover:text-blue-400 uppercase font-semibold transition"
                onClick={() => setShowSignup(true)}
              >
                Go to Sign Up
              </button>
            </div>
          </div>

          {/* Card Back (Signup) */}
          <div
            className="absolute w-full h-full bg-gray-50 rounded-lg shadow-xl [transform:rotateY(180deg)]"
            style={{
              backfaceVisibility: "hidden",
              backgroundImage:
                "url('https://s3-us-west-2.amazonaws.com/s.cdpn.io/1462889/pat.svg')",
              backgroundPosition: "bottom center",
              backgroundRepeat: "no-repeat",
              backgroundSize: "300%",
            }}
          >
            <div className="flex flex-col justify-center items-center h-full px-10">
              <h4 className="mb-4 pb-2 text-2xl text-gray-900 font-semibold">Sign Up</h4>
              <form className="w-full space-y-4" onSubmit={handleSignup}>
                <div className="relative">
                  <input
                    type="text"
                    id="logname"
                    value={signupName}
                    onChange={e => setSignupName(e.target.value)}
                    placeholder="Your Full Name"
                    autoComplete="off"
                    className="w-full pl-12 pr-4 py-3 rounded bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-300 font-medium shadow-md placeholder-gray-400"
                  />
                  <UserIcon className="absolute left-3 top-2.5 h-6 w-6 text-blue-400" />
                </div>
                <div className="relative">
                  <input
                    type="email"
                    id="regemail"
                    value={signupEmail}
                    onChange={e => setSignupEmail(e.target.value)}
                    placeholder="Your Email"
                    autoComplete="off"
                    className="w-full pl-12 pr-4 py-3 rounded bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-300 font-medium shadow-md placeholder-gray-400"
                  />
                  <AtSymbolIcon className="absolute left-3 top-2.5 h-6 w-6 text-blue-400" />
                </div>
                <div className="relative flex items-center">
                  <input
                    type={showSignupPass ? "text" : "password"}
                    id="regpass"
                    value={signupPass}
                    onChange={e => setSignupPass(e.target.value)}
                    placeholder="Your Password"
                    autoComplete="off"
                    className="w-full pl-12 pr-10 py-3 rounded bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-300 font-medium shadow-md placeholder-gray-400"
                  />
                  <LockClosedIcon className="absolute left-3 top-2.5 h-6 w-6 text-blue-400 pointer-events-none" />
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setShowSignupPass(v => !v)}
                    className="absolute right-2 top-3 h-6 w-6 text-blue-400 cursor-pointer focus:outline-none"
                  >
                    {showSignupPass ? <EyeSlashIcon /> : <EyeIcon />}
                  </button>
                </div>
                <button
                  type="submit"
                  className="w-full mt-4 bg-blue-400 text-white rounded font-semibold py-2 uppercase tracking-wide shadow hover:bg-blue-600 transition-all duration-150"
                >
                  Submit
                </button>
              </form>
              <button
                className="mt-5 text-sm text-gray-400 hover:text-blue-400 uppercase font-semibold transition"
                onClick={() => setShowSignup(false)}
              >
                Go to Log In
              </button>
            </div>
          </div>
        </div>
      </div>
      {/* Switch labels (Log In/Sign Up) */}
      <div className="absolute top-24 left-1/2 -translate-x-1/2 z-10 flex items-center space-x-5">
        <button
          className={`uppercase font-bold text-lg ${!showSignup ? "text-blue-400 border-b-2 border-blue-400" : "text-gray-400"}`}
          onClick={() => setShowSignup(false)}
        >
          Log In
        </button>
        <button
          className={`uppercase font-bold text-lg ${showSignup ? "text-blue-400 border-b-2 border-blue-400" : "text-gray-400"}`}
          onClick={() => setShowSignup(true)}
        >
          Sign Up
        </button>
      </div>
    </div>
  );
};

export default AuthCard;