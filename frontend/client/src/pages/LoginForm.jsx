import React, { useState, useEffect } from "react";
import API from "../api/axios"; // Adjust path if your axios file is in another folder
import Logo from "../assets/logo.png";
import Hero from "../assets/hero.png";

import {
  FaEye,
  FaEyeSlash,
  FaShieldHalved,
  FaUserDoctor,
  FaUserShield,
  FaUserTie,
  FaUser,
  FaArrowRight,
  FaHospital,
  FaCircleCheck,
  FaExclamation,
  FaHeadset,
  FaXmark,
} from "react-icons/fa6";

import { MdOutlineMailOutline } from "react-icons/md";
import { RiLockPasswordFill } from "react-icons/ri";

const LoginForm = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Forgot Password Modal States (Email Only)
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotMessage, setForgotMessage] = useState("");
  const [forgotError, setForgotError] = useState("");

  useEffect(() => {
    const savedEmail = localStorage.getItem("rememberedEmail");
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  const roles = [
    {
      name: "Patient",
      icon: FaUser,
      activeStyle: "border-emerald-500 bg-emerald-50/80 text-emerald-900 ring-4 ring-emerald-500/15 shadow-md",
      iconColor: "text-emerald-600",
      badgeBg: "bg-emerald-500",
    },
    {
      name: "Doctor",
      icon: FaUserDoctor,
      activeStyle: "border-blue-600 bg-blue-50/80 text-blue-900 ring-4 ring-blue-600/15 shadow-md",
      iconColor: "text-blue-600",
      badgeBg: "bg-blue-600",
    },
    {
      name: "Staff",
      icon: FaUserTie,
      activeStyle: "border-purple-600 bg-purple-50/80 text-purple-900 ring-4 ring-purple-600/15 shadow-md",
      iconColor: "text-purple-600",
      badgeBg: "bg-purple-600",
    },
    {
      name: "Admin",
      icon: FaUserShield,
      activeStyle: "border-amber-500 bg-amber-50/80 text-amber-900 ring-4 ring-amber-500/15 shadow-md",
      iconColor: "text-amber-600",
      badgeBg: "bg-amber-500",
    },
  ];

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (!email.trim() || !password || !role) {
      setErrorMessage("Please select your role and enter all credentials.");
      return;
    }

    try {
      setLoading(true);

      // Uses API instance: baseURL (/api) + /auth/login = /api/auth/login
      const response = await API.post("/auth/login", {
        email: email.trim(),
        password,
        role,
      });

      const token =
        response.data?.token ||
        response.data?.accessToken ||
        response.data?.data?.token ||
        response.data?.data?.accessToken;

      if (!token) {
        throw new Error("Security verification failed. No access token provided.");
      }

      localStorage.setItem("token", token);

      if (rememberMe) {
        localStorage.setItem("rememberedEmail", email.trim());
      } else {
        localStorage.removeItem("rememberedEmail");
      }

      onLoginSuccess?.(role);
    } catch (error) {
      console.error("Login error:", error.response || error);
      setErrorMessage(
        error.response?.data?.message ||
          error.response?.data?.error ||
          error.message ||
          "Unable to connect to the healthcare authentication gateway."
      );
    } finally {
      setLoading(false);
    }
  };

  // Submit registered email to dispatch link
  const handleForgotPasswordSubmit = async (e) => {
    e.preventDefault();
    setForgotError("");
    setForgotMessage("");

    if (!forgotEmail.trim()) {
      setForgotError("Please enter your registered email address.");
      return;
    }

    try {
      setForgotLoading(true);

      // Uses API instance: baseURL (/api) + /auth/forgot-password = /api/auth/forgot-password
      const response = await API.post("/auth/forgot-password", {
        email: forgotEmail.trim(),
      });

      setForgotMessage(
        response.data?.message ||
          "A password reset link has been dispatched to your email address."
      );
    } catch (error) {
      console.error("Forgot password error:", error.response || error);
      setForgotError(
        error.response?.data?.message ||
          error.response?.data?.error ||
          "Failed to request password reset. Please verify your email."
      );
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center bg-slate-950 p-4 sm:p-6 lg:p-8 font-sans overflow-y-auto">
      {/* Background Ambient Glow Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-blue-600/20 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-cyan-500/20 rounded-full blur-[160px] pointer-events-none" />

      {/* Main Container */}
      <div className="relative z-10 w-full max-w-[95%] xl:max-w-[1400px] min-h-[85vh] my-auto bg-white/95 backdrop-blur-2xl rounded-3xl lg:rounded-[2.5rem] overflow-hidden shadow-[0_30px_90px_rgba(0,0,0,0.45)] border border-white/20 grid grid-cols-1 lg:grid-cols-12">
        {/* LEFT PANEL */}
        <div
          className="hidden lg:flex lg:col-span-5 relative flex-col justify-between p-12 xl:p-16 text-white bg-cover bg-center overflow-hidden"
          style={{ backgroundImage: `url(${Hero})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-slate-950/95 via-blue-950/90 to-cyan-950/80 backdrop-blur-[2px]" />

          <div className="relative z-10">
            <div className="inline-flex items-center gap-4 bg-white/10 backdrop-blur-md p-3 pr-8 rounded-2xl border border-white/20 shadow-xl">
              <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center shadow-lg">
                <img
                  src={Logo}
                  alt="Medicare Logo"
                  className="w-10 h-10 object-contain"
                />
              </div>

              <div>
                <h1 className="text-2xl font-black tracking-tight text-white leading-none">
                  Medicare
                </h1>
                <p className="text-xs tracking-[0.35em] font-black text-cyan-300 uppercase mt-1">
                  Health System
                </p>
              </div>
            </div>
          </div>

          <div className="relative z-10 my-auto py-4">
            <h2 className="text-5xl xl:text-6xl font-black leading-[1.12] tracking-tight text-white mb-6">
              Empowering <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-sky-200 to-white">
                Modern Health.
              </span>
            </h2>

            <p className="text-lg xl:text-xl text-slate-300 leading-relaxed font-normal max-w-lg mb-12">
              Secure digital access for medical practitioners, staff members, and patients worldwide.
            </p>

            <div className="flex items-center gap-5 bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-2xl max-w-lg">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center flex-shrink-0 shadow-lg shadow-cyan-500/20">
                <FaShieldHalved className="text-2xl text-white" />
              </div>
              <div>
                <p className="font-bold text-base text-white">
                  Zero-Trust Medical Security
                </p>
                <p className="text-sm text-slate-300 mt-0.5">
                  Full healthcare privacy and secure access portal.
                </p>
              </div>
            </div>
          </div>

          <div className="relative z-10 text-sm text-slate-400 font-medium">
            © {new Date().getFullYear()} Medicare Hospital Systems. All rights reserved.
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="lg:col-span-7 flex flex-col justify-center p-8 sm:p-12 lg:p-16 xl:p-20 bg-white min-h-full">
          <div>
            <div className="flex lg:hidden justify-center items-center gap-4 mb-8">
              <img
                src={Logo}
                alt="Medicare Logo"
                className="w-14 h-14 object-contain"
              />
              <div>
                <h1 className="text-3xl font-black text-slate-900 leading-none">
                  Medicare
                </h1>
                <p className="text-xs tracking-[0.3em] font-extrabold text-blue-600 uppercase mt-1">
                  Hospital Portal
                </p>
              </div>
            </div>

            <div className="mb-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-sm font-extrabold tracking-wide uppercase mb-4">
                <FaHospital className="text-blue-600 text-base" />
                Secure Hospital Gateway
              </div>

              <h2 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight">
                Welcome Back
              </h2>

              <p className="text-slate-600 mt-2 text-lg sm:text-xl font-semibold">
                Please enter your credentials to access your dashboard.
              </p>
            </div>

            {errorMessage && (
              <div
                role="alert"
                className="mb-6 flex items-start gap-4 p-5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-lg font-semibold"
              >
                <div className="w-7 h-7 rounded-full bg-rose-600 text-white flex items-center justify-center flex-shrink-0 mt-0.5">
                  <FaExclamation className="text-sm" />
                </div>
                <p className="leading-snug">{errorMessage}</p>
              </div>
            )}

            <form onSubmit={handleLoginSubmit} className="space-y-6">
              {/* EMAIL FIELD */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-lg font-bold text-slate-800 mb-2.5"
                >
                  Email Address
                </label>

                <div className="relative group">
                  <MdOutlineMailOutline className="absolute left-5 top-1/2 -translate-y-1/2 text-2xl text-slate-400 group-focus-within:text-blue-600 transition-colors pointer-events-none" />

                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@medicare.com"
                    required
                    className="w-full pl-16 pr-5 py-5 bg-slate-50/80 border-2 border-slate-200 rounded-2xl text-slate-900 text-xl sm:text-2xl font-semibold placeholder:text-slate-400 placeholder:font-normal outline-none transition-all duration-200 focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-600/15 shadow-sm"
                  />
                </div>
              </div>

              {/* PASSWORD FIELD */}
              <div>
                <label
                  htmlFor="password"
                  className="block text-lg font-bold text-slate-800 mb-2.5"
                >
                  Password
                </label>

                <div className="relative group">
                  <RiLockPasswordFill className="absolute left-5 top-1/2 -translate-y-1/2 text-2xl text-slate-400 group-focus-within:text-blue-600 transition-colors pointer-events-none" />

                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    required
                    className="w-full pl-16 pr-16 py-5 bg-slate-50/80 border-2 border-slate-200 rounded-2xl text-slate-900 text-xl sm:text-2xl font-semibold placeholder:text-slate-400 placeholder:font-normal outline-none transition-all duration-200 focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-600/15 shadow-sm"
                  />

                  <button
                    type="button"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-5 top-1/2 -translate-y-1/2 p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                  >
                    {showPassword ? (
                      <FaEyeSlash className="text-2xl" />
                    ) : (
                      <FaEye className="text-2xl" />
                    )}
                  </button>
                </div>
              </div>

              {/* REMEMBER & FORGOT */}
              <div className="flex items-center justify-between gap-4 pt-1">
                <label className="flex items-center gap-3 text-lg font-bold text-slate-700 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-6 h-6 accent-blue-600 rounded cursor-pointer border-slate-300 focus:ring-2 focus:ring-blue-500/20"
                  />
                  Remember me
                </label>

                {/* MODAL TRIGGER FOR FORGOT PASSWORD */}
                <button
                  type="button"
                  onClick={() => {
                    setForgotEmail(email || "");
                    setForgotError("");
                    setForgotMessage("");
                    setShowForgotModal(true);
                  }}
                  className="text-lg font-extrabold text-blue-600 hover:text-blue-800 hover:underline transition cursor-pointer"
                >
                  Forgot Password?
                </button>
              </div>

              {/* ROLE SELECTION */}
              <div className="pt-3">
                <div className="flex items-center justify-between mb-3">
                  <label className="text-lg font-bold text-slate-800">
                    Select Role
                  </label>
                  <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full uppercase tracking-wider">
                    Required
                  </span>
                </div>

                <div
                  className="grid grid-cols-2 sm:grid-cols-4 gap-4"
                  role="group"
                  aria-label="Select user role"
                >
                  {roles.map((item) => {
                    const Icon = item.icon;
                    const selected = role === item.name;

                    return (
                      <button
                        key={item.name}
                        type="button"
                        aria-pressed={selected}
                        onClick={() => {
                          setRole(item.name);
                          setErrorMessage("");
                        }}
                        className={`relative flex flex-col items-center justify-center gap-3 py-5 px-4 rounded-2xl border-2 transition-all duration-200 outline-none cursor-pointer ${
                          selected
                            ? item.activeStyle
                            : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/80 text-slate-700"
                        }`}
                      >
                        <Icon
                          className={`text-4xl ${
                            selected ? item.iconColor : "text-slate-500"
                          }`}
                        />

                        <span className="text-lg font-extrabold tracking-tight">
                          {item.name}
                        </span>

                        {selected && (
                          <div
                            className={`absolute top-2.5 right-2.5 w-5 h-5 rounded-full ${item.badgeBg} text-white flex items-center justify-center shadow-md`}
                          >
                            <FaCircleCheck className="text-xs" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* ACTION BUTTON */}
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-4 py-5 px-8 rounded-2xl bg-gradient-to-r from-blue-700 via-blue-600 to-cyan-600 text-white font-black text-2xl tracking-wide shadow-xl shadow-blue-600/25 hover:shadow-2xl hover:shadow-blue-600/35 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none mt-4"
              >
                {loading ? (
                  <>
                    <span className="w-7 h-7 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    <span>Authenticating...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In</span>
                    <FaArrowRight className="text-xl" />
                  </>
                )}
              </button>

              <div className="pt-3 text-center">
                <p className="text-sm font-semibold text-slate-500 inline-flex items-center justify-center gap-2">
                  <FaHeadset className="text-blue-600 text-base" />
                  Need login support? Contact Medicare Hospital IT Helpdesk
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* FORGOT PASSWORD MODAL */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 p-8 sm:p-10 animate-in fade-in zoom-in-95 duration-200">
            {/* Close Button */}
            <button
              onClick={() => setShowForgotModal(false)}
              className="absolute top-6 right-6 p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
              aria-label="Close modal"
            >
              <FaXmark className="text-xl" />
            </button>

            {/* Modal Header */}
            <div className="mb-6">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center text-2xl mb-4">
                <RiLockPasswordFill />
              </div>
              <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Reset Password
              </h3>
              <p className="text-slate-600 mt-2 text-base font-medium">
                Enter your account email. We will send a secure link granting access to change your password.
              </p>
            </div>

            {/* Success Banner */}
            {forgotMessage && (
              <div className="mb-5 flex items-start gap-3 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-base font-semibold">
                <FaCircleCheck className="text-emerald-600 text-lg flex-shrink-0 mt-0.5" />
                <p className="leading-snug">{forgotMessage}</p>
              </div>
            )}

            {/* Error Banner */}
            {forgotError && (
              <div className="mb-5 flex items-start gap-3 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-base font-semibold">
                <FaExclamation className="text-rose-600 text-lg flex-shrink-0 mt-0.5" />
                <p className="leading-snug">{forgotError}</p>
              </div>
            )}

            {/* Email Form */}
            <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-800 mb-1.5">
                  Account Email
                </label>
                <div className="relative">
                  <MdOutlineMailOutline className="absolute left-4 top-1/2 -translate-y-1/2 text-xl text-slate-400" />
                  <input
                    type="email"
                    required
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="doctor@medicare.com"
                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-2 border-slate-200 rounded-xl text-slate-900 text-base font-semibold placeholder:text-slate-400 outline-none focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 transition"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowForgotModal(false)}
                  className="flex-1 py-3.5 rounded-xl border-2 border-slate-200 text-slate-700 font-bold text-base hover:bg-slate-50 transition cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={forgotLoading}
                  className="flex-1 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-base shadow-lg shadow-blue-600/20 transition disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer"
                >
                  {forgotLoading ? (
                    <>
                      <span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      <span>Sending Link...</span>
                    </>
                  ) : (
                    <span>Send Reset Link</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoginForm;