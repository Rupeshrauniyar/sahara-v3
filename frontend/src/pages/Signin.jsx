import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Activity,
  ArrowRight,
  Bot,
  CheckCircle2,
  Droplets,
  Eye,
  EyeOff,
  HeartPulse,
  Hospital,
  LockKeyhole,
  Mail,
  ShieldCheck,
  Stethoscope,
} from "lucide-react";
import { motion } from "framer-motion";

const Signin = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ==========================================
  // INPUT HANDLER
  // ==========================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (error) {
      setError("");
    }
  };

  // ==========================================
  // REDIRECT USER BASED ON ROLE
  // ==========================================

  const redirectUser = (role) => {
    switch (role) {
      case "Patient":
        navigate("/dashboard");
        break;

      case "Doctor":
        navigate("/doctor/dashboard");
        break;

      case "HospitalAdmin":
        navigate("/hospital/dashboard");
        break;

      case "Admin":
        navigate("/admin/dashboard");
        break;

      default:
        navigate("/dashboard");
    }
  };

  // ==========================================
  // LOGIN
  // ==========================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    if (!formData.email || !formData.password) {
      setError("Please enter your email and password.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        "http://localhost:3000/api/auth/login",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            email: formData.email,
            password: formData.password,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Invalid email or password.",
        );
      }

      localStorage.setItem("token", data.token);

      localStorage.setItem(
        "user",
        JSON.stringify(data.user),
      );

      setTimeout(() => {
        navigate("/dashboard");
      }, 900);
    } catch (err) {
      setError(
        err.message ||
          "Something went wrong while signing in.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F6FAFF] text-[#10233F]">
      <div className="grid min-h-screen lg:grid-cols-[1.05fr_.95fr]">

        {/* ================================================= */}
        {/* LEFT SIDE */}
        {/* ================================================= */}

        <section className="relative hidden overflow-hidden lg:flex">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(62,153,255,0.35),transparent_30%),radial-gradient(circle_at_85%_80%,rgba(17,185,206,0.18),transparent_30%),linear-gradient(145deg,#0B2446_0%,#0C3E82_45%,#1769E0_100%)]" />

          <div className="absolute -left-24 top-24 h-72 w-72 rounded-full border-[42px] border-white/5" />

          <div className="absolute -bottom-28 -right-20 h-96 w-96 rounded-full border-[58px] border-cyan-300/10" />

          <svg
            className="absolute left-0 top-[42%] w-full opacity-20"
            viewBox="0 0 800 150"
          >
            <path
              d="M0 75 H220 L265 20 L315 130 L360 48 L395 75 H800"
              fill="none"
              stroke="#7DD3FC"
              strokeWidth="2"
              strokeDasharray="9 8"
            >
              <animate
                attributeName="stroke-dashoffset"
                from="0"
                to="-150"
                dur="5s"
                repeatCount="indefinite"
              />
            </path>
          </svg>

          <div className="relative z-10 flex w-full flex-col justify-between p-12 xl:p-16">

            {/* Logo */}

            <Link
              to="/"
              className="flex w-fit items-center gap-3"
            >
              <div className="grid h-12 w-12 place-items-center rounded-[15px] bg-white/12 text-white ring-1 ring-white/15 backdrop-blur-md">
                <HeartPulse size={26} />
              </div>

              <div>
                <p className="font-[Manrope] text-xl font-extrabold tracking-[0.05em] text-white">
                  SAHARA
                </p>

                <p className="mt-0.5 text-[10px] text-blue-100/70">
                  Healthcare coordination
                </p>
              </div>
            </Link>

            {/* Main */}

            <motion.div
              initial={{
                opacity: 0,
                y: 24,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                duration: 0.65,
              }}
              className="max-w-[620px]"
            >
              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/8 px-3.5 py-2 backdrop-blur-md">
                <span className="h-2 w-2 rounded-full bg-cyan-300" />

                <span className="text-[11px] font-bold text-blue-100">
                  Healthcare access in one place
                </span>
              </div>

              <h1 className="mt-6 font-[Manrope] text-[clamp(3rem,5vw,5rem)] font-extrabold leading-[1.02] tracking-[-0.055em] text-white">
                Welcome back to your healthcare network.
              </h1>

              <p className="mt-6 max-w-[560px] text-[16px] leading-7 text-blue-100/80">
                Sign in to access your dashboard, manage
                appointments, use SAHARA AI, request blood
                support and connect with healthcare services.
              </p>

              {/* Feature grid */}

              <div className="mt-10 grid grid-cols-2 gap-3">
                <Feature
                  icon={Bot}
                  title="AI Navigator"
                  description="Get healthcare guidance"
                />

                <Feature
                  icon={Stethoscope}
                  title="Doctors"
                  description="Find medical professionals"
                />

                <Feature
                  icon={Hospital}
                  title="Hospitals"
                  description="Access healthcare facilities"
                />

                <Feature
                  icon={Droplets}
                  title="Blood Support"
                  description="Request or donate blood"
                />
              </div>
            </motion.div>

            {/* Footer */}

            <div className="flex items-center justify-between gap-4">
              <span className="text-xs text-blue-100/60">
                © {new Date().getFullYear()} SAHARA
              </span>

              <div className="flex items-center gap-2 text-xs font-medium text-blue-100/70">
                <ShieldCheck size={15} />
                Protected healthcare access
              </div>
            </div>
          </div>
        </section>

        {/* ================================================= */}
        {/* RIGHT SIDE */}
        {/* ================================================= */}

        <section className="relative flex items-center justify-center px-5 py-10 sm:px-8 lg:px-12">
          <div className="absolute right-10 top-10 hidden h-40 w-40 rounded-full bg-[#DDEEFF]/70 blur-3xl sm:block" />

          <motion.div
            initial={{
              opacity: 0,
              y: 20,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.5,
              delay: 0.05,
            }}
            className="relative w-full max-w-[470px]"
          >

            {/* Mobile logo */}

            <div className="mb-10 flex justify-center lg:hidden">
              <Link
                to="/"
                className="flex items-center gap-3"
              >
                <div className="grid h-11 w-11 place-items-center rounded-[14px] bg-gradient-to-br from-[#1977EA] to-[#0752B9] text-white shadow-lg shadow-blue-600/20">
                  <HeartPulse size={23} />
                </div>

                <div>
                  <p className="font-[Manrope] text-lg font-extrabold tracking-[0.05em]">
                    SAHARA
                  </p>

                  <p className="text-[9px] text-slate-400">
                    Healthcare coordination
                  </p>
                </div>
              </Link>
            </div>

            {/* Heading */}

            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-[#EAF4FF] px-3 py-1.5">
                <Activity
                  size={14}
                  className="text-[#1769E0]"
                />

                <span className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-[#1769E0]">
                  Secure access
                </span>
              </div>

              <h2 className="mt-4 font-[Manrope] text-4xl font-extrabold tracking-[-0.045em] text-[#0B213F] sm:text-[44px]">
                Sign in to SAHARA.
              </h2>

              <p className="mt-3 text-[14px] leading-6 text-[#6A7D92]">
                Continue to your personalized healthcare
                dashboard.
              </p>
            </div>

            {/* Error */}

            {error && (
              <motion.div
                initial={{
                  opacity: 0,
                  y: -5,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                className="mt-6 flex items-start gap-3 rounded-[14px] border border-red-200 bg-red-50 px-4 py-3.5"
              >
                <div className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-red-100 text-xs font-extrabold text-red-600">
                  !
                </div>

                <p className="pt-1 text-[13px] leading-5 text-red-700">
                  {error}
                </p>
              </motion.div>
            )}

            {/* Form */}

            <form
              onSubmit={handleSubmit}
              className="mt-8 space-y-5"
            >

              {/* Email */}

              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-[12px] font-bold text-[#42586F]"
                >
                  Email address
                </label>

                <div className="group relative">
                  <Mail
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-[#91A1B4] transition group-focus-within:text-[#1769E0]"
                  />

                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    required
                    className="h-[54px] w-full rounded-[14px] border border-[#DCE7F1] bg-white pl-12 pr-4 text-[14px] text-[#17304D] outline-none transition placeholder:text-[#A2AFBD] focus:border-[#1769E0] focus:ring-4 focus:ring-blue-500/10"
                  />
                </div>
              </div>

              {/* Password */}

              <div>
                <div className="mb-2 flex items-center justify-between gap-4">
                  <label
                    htmlFor="password"
                    className="block text-[12px] font-bold text-[#42586F]"
                  >
                    Password
                  </label>

                  <Link
                    to="/forgot-password"
                    className="text-[11px] font-bold text-[#1769E0] hover:text-[#0D55B9]"
                  >
                    Forgot password?
                  </Link>
                </div>

                <div className="group relative">
                  <LockKeyhole
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-[#91A1B4] transition group-focus-within:text-[#1769E0]"
                  />

                  <input
                    id="password"
                    name="password"
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    autoComplete="current-password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    required
                    className="h-[54px] w-full rounded-[14px] border border-[#DCE7F1] bg-white pl-12 pr-12 text-[14px] text-[#17304D] outline-none transition placeholder:text-[#A2AFBD] focus:border-[#1769E0] focus:ring-4 focus:ring-blue-500/10"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword(
                        (current) =>
                          !current,
                      )
                    }
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8595A7] transition hover:text-[#1769E0]"
                    aria-label={
                      showPassword
                        ? "Hide password"
                        : "Show password"
                    }
                  >
                    {showPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>
              </div>

              {/* Remember */}

              <div className="flex items-center justify-between">
                <label className="flex cursor-pointer items-center gap-3">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) =>
                      setRememberMe(
                        e.target.checked,
                      )
                    }
                    className="h-4 w-4 rounded border-slate-300 accent-[#1769E0]"
                  />

                  <span className="text-[12px] font-medium text-[#65788D]">
                    Remember me
                  </span>
                </label>

                <div className="hidden items-center gap-1.5 text-[10px] font-semibold text-[#8A99AA] sm:flex">
                  <ShieldCheck
                    size={13}
                    className="text-[#16A36A]"
                  />

                  Secure login
                </div>
              </div>

              {/* Submit */}

              <button
                type="submit"
                disabled={loading}
                className="flex min-h-[54px] w-full items-center justify-center gap-2.5 rounded-[14px] bg-gradient-to-r from-[#1977EA] to-[#0D5FC7] px-5 text-[14px] font-bold text-white shadow-[0_14px_32px_rgba(23,105,224,0.22)] transition hover:-translate-y-0.5 hover:shadow-[0_18px_38px_rgba(23,105,224,0.28)] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
              >
                {loading ? (
                  <>
                    <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/35 border-t-white" />

                    Signing in...
                  </>
                ) : (
                  <>
                    Sign in

                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>

            {/* Status row */}

            <div className="mt-6 grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2.5 rounded-[13px] border border-[#E2EBF4] bg-white px-3.5 py-3">
                <CheckCircle2
                  size={17}
                  className="shrink-0 text-[#16A36A]"
                />

                <span className="text-[10px] font-semibold text-[#6C7E92]">
                  Role-based dashboard
                </span>
              </div>

              <div className="flex items-center gap-2.5 rounded-[13px] border border-[#E2EBF4] bg-white px-3.5 py-3">
                <ShieldCheck
                  size={17}
                  className="shrink-0 text-[#1769E0]"
                />

                <span className="text-[10px] font-semibold text-[#6C7E92]">
                  Protected account
                </span>
              </div>
            </div>

            {/* Divider */}

            <div className="my-7 flex items-center gap-4">
              <div className="h-px flex-1 bg-[#E1EAF3]" />

              <span className="text-[10px] font-semibold uppercase tracking-[0.11em] text-[#9AA7B6]">
                New to SAHARA?
              </span>

              <div className="h-px flex-1 bg-[#E1EAF3]" />
            </div>

            {/* Signup */}

            <Link
              to="/signup"
              className="flex min-h-[52px] w-full items-center justify-center gap-2 rounded-[14px] border border-[#D8E5F1] bg-white text-[13px] font-bold text-[#28415D] transition hover:border-[#AFCBE8] hover:bg-[#F7FBFF] hover:text-[#1769E0]"
            >
              Create an account

              <ArrowRight size={17} />
            </Link>

            {/* Home */}

            <p className="mt-7 text-center text-[11px] text-[#8D9BAB]">
              Want to explore first?{" "}

              <Link
                to="/"
                className="font-bold text-[#1769E0]"
              >
                Return to homepage
              </Link>
            </p>
          </motion.div>
        </section>
      </div>
    </div>
  );
};

/* =========================================================
   FEATURE
========================================================= */

const Feature = ({
  icon: Icon,
  title,
  description,
}) => {
  return (
    <div className="flex items-center gap-3 rounded-[16px] border border-white/10 bg-white/[0.07] p-4 backdrop-blur-md transition hover:bg-white/[0.11]">
      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-[11px] bg-white/10 text-cyan-200">
        <Icon size={19} />
      </div>

      <div>
        <p className="text-[12px] font-bold text-white">
          {title}
        </p>

        <p className="mt-1 text-[10px] leading-4 text-blue-100/65">
          {description}
        </p>
      </div>
    </div>
  );
};

export default Signin;