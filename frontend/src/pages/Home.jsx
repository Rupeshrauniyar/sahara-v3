import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

import {
  Activity,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Droplets,
  HeartPulse,
  Hospital,
  LayoutDashboard,
  LogOut,
  Menu,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  X,
} from "lucide-react";

import saharaLogo from "../assets/sahara-logo.png";

const Home = () => {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [mobileMenu, setMobileMenu] = useState(false);

  useEffect(() => {
    const token =
      localStorage.getItem("token") ||
      sessionStorage.getItem("token");

    const storedUser =
      localStorage.getItem("user") ||
      sessionStorage.getItem("user");

    if (!token || !storedUser) {
      setUser(null);
      return;
    }

    try {
      setUser(JSON.parse(storedUser));
    } catch {
      setUser(null);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("profile");

    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
    sessionStorage.removeItem("profile");

    setUser(null);
    setMobileMenu(false);

    navigate("/", {
      replace: true,
    });
  };

  const firstName =
    user?.fullName?.split(" ")[0] || "";

  const initials =
    user?.fullName
      ?.split(" ")
      .filter(Boolean)
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "U";

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#F8FAFF] text-[#12233E]">

      {/* =====================================================
          NAVBAR
      ===================================================== */}

      <header className="fixed inset-x-0 top-0 z-50 border-b border-[#E2E8F3] bg-white/95 backdrop-blur-xl">

        <div className="mx-auto flex min-h-[78px] max-w-[1440px] items-center justify-between gap-6 px-5 sm:px-8 lg:px-10">

          {/* LOGO — ALWAYS RETURNS HOME */}

          <Link
            to="/"
            aria-label="Go to SAHARA home"
            className="flex shrink-0 items-center"
          >
            <img
              src={saharaLogo}
              alt="SAHARA"
              className="h-[46px] w-auto max-w-[180px] object-contain sm:h-[50px]"
            />
          </Link>

          {/* DESKTOP NAV */}

          <nav className="hidden items-center gap-1 lg:flex">
            <a
              href="#services"
              className="rounded-xl px-4 py-2.5 text-[11px] font-bold text-[#60748B] transition hover:bg-[#F0F4FF] hover:text-[#1717E8]"
            >
              Services
            </a>

            <Link
              to="/doctor"
              className="rounded-xl px-4 py-2.5 text-[11px] font-bold text-[#60748B] transition hover:bg-[#F0F4FF] hover:text-[#1717E8]"
            >
              Doctors
            </Link>

            <Link
              to="/blood-donor"
              className="rounded-xl px-4 py-2.5 text-[11px] font-bold text-[#60748B] transition hover:bg-[#F0F4FF] hover:text-[#1717E8]"
            >
              Blood Network
            </Link>

            <Link
              to="/ai-bot"
              className="rounded-xl px-4 py-2.5 text-[11px] font-bold text-[#60748B] transition hover:bg-[#F0F4FF] hover:text-[#1717E8]"
            >
              SAHARA AI
            </Link>
          </nav>

          {/* LOGGED IN */}

          <div className="hidden items-center gap-2 lg:flex">

            {user ? (
              <>
                <div className="flex items-center gap-2.5 rounded-[14px] border border-[#E0E6F0] bg-[#F8FAFD] px-3 py-2">

                  <div className="grid h-9 w-9 place-items-center rounded-[11px] bg-[#1717E8] text-[9px] font-extrabold text-white">
                    {initials}
                  </div>

                  <div className="max-w-[130px]">

                    <p className="truncate text-[10px] font-extrabold text-[#263D58]">
                      {user.fullName}
                    </p>

                    <p className="mt-0.5 text-[8px] font-semibold text-[#8897A8]">
                      {user.role}
                    </p>
                  </div>
                </div>

                <Link
                  to="/dashboard"
                  className="inline-flex h-[43px] items-center gap-2 rounded-[12px] bg-[#1717E8] px-4 text-[10px] font-extrabold !text-white shadow-[0_10px_24px_rgba(23,23,232,0.18)] transition hover:bg-[#1010C9]"
                >
                  <LayoutDashboard size={15} />

                  <span className="!text-white">
                    Dashboard
                  </span>
                </Link>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="grid h-[43px] w-[43px] place-items-center rounded-[12px] border border-red-100 bg-red-50 text-red-600 transition hover:bg-red-100"
                  title="Logout"
                >
                  <LogOut size={16} />
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 text-[11px] font-extrabold text-[#506880]"
                >
                  Sign in
                </Link>

                <Link
                  to="/signup"
                  className="inline-flex h-[43px] items-center gap-2 rounded-[12px] bg-[#1717E8] px-5 text-[10px] font-extrabold !text-white shadow-[0_10px_24px_rgba(23,23,232,0.18)]"
                >
                  <span className="!text-white">
                    Create Account
                  </span>

                  <ArrowRight size={14} />
                </Link>
              </>
            )}
          </div>

          <button
            type="button"
            onClick={() =>
              setMobileMenu((value) => !value)
            }
            className="grid h-10 w-10 place-items-center rounded-xl border border-[#E0E6EF] bg-white text-[#405870] lg:hidden"
          >
            {mobileMenu ? (
              <X size={18} />
            ) : (
              <Menu size={18} />
            )}
          </button>
        </div>

        {/* MOBILE MENU */}

        {mobileMenu && (
          <div className="border-t border-[#EDF1F5] bg-white px-5 py-5 shadow-xl lg:hidden">

            {user && (
              <div className="mb-4 flex items-center gap-3 rounded-[15px] bg-[#F2F4FF] p-3">

                <div className="grid h-10 w-10 place-items-center rounded-[11px] bg-[#1717E8] text-[10px] font-extrabold text-white">
                  {initials}
                </div>

                <div>
                  <p className="text-[11px] font-extrabold text-[#263E59]">
                    {user.fullName}
                  </p>

                  <p className="text-[9px] text-[#8291A2]">
                    {user.role}
                  </p>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <MobileLink to="/" label="Home" />
              <MobileLink to="/doctor" label="Find Doctors" />
              <MobileLink to="/blood-donor" label="Blood Network" />
              <MobileLink to="/bloodRequest" label="Blood Request" />
              <MobileLink to="/ai-bot" label="SAHARA AI" />

              {user ? (
                <>
                  <MobileLink
                    to="/dashboard"
                    label="Open Dashboard"
                    featured
                  />

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-[10px] font-extrabold text-red-600"
                  >
                    <LogOut size={15} />
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <MobileLink to="/login" label="Sign in" />
                  <MobileLink
                    to="/signup"
                    label="Create Account"
                    featured
                  />
                </>
              )}
            </div>
          </div>
        )}
      </header>

      <main className="pt-[78px]">

        {/* =====================================================
            HERO — MUCH LIGHTER
        ===================================================== */}

        <section className="relative overflow-hidden bg-[linear-gradient(135deg,#FFFFFF_0%,#F6F8FF_48%,#EEF3FF_100%)]">

          <div className="absolute right-[5%] top-[10%] h-[400px] w-[400px] rounded-full bg-[#1717E8]/[0.04] blur-3xl" />

          <div className="mx-auto grid min-h-[650px] max-w-[1440px] items-center gap-12 px-5 py-14 sm:px-8 md:py-20 lg:grid-cols-[1fr_0.9fr] lg:px-10">

            {/* COPY */}

            <motion.div
              initial={{
                opacity: 0,
                y: 18,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              className="relative z-10"
            >

              <div className="inline-flex items-center gap-2 rounded-full border border-[#D7DEFF] bg-white px-3.5 py-2 shadow-sm">

                <HeartPulse
                  size={14}
                  className="text-[#1717E8]"
                />

                <span className="text-[9px] font-extrabold uppercase tracking-[0.13em] text-[#1717E8]">
                  {user
                    ? `Welcome back, ${firstName}`
                    : "Healthcare coordination for Nepal"}
                </span>
              </div>

              <h1 className="mt-7 max-w-[760px] font-[Manrope] text-[44px] font-extrabold leading-[1.04] tracking-[-0.055em] text-[#102846] sm:text-[58px] lg:text-[66px]">

                Healthcare,
                <span className="block text-[#1717E8]">
                  connected when you need it.
                </span>
              </h1>

              <p className="mt-6 max-w-[620px] text-[14px] leading-7 text-[#60768C]">
                Find doctors, book appointments, request blood,
                join the donor network and use SAHARA AI from one
                connected healthcare platform.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">

                {user ? (
                  <>
                    <Link
                      to="/dashboard"
                      className="inline-flex min-h-[52px] items-center gap-2.5 rounded-[14px] bg-[#1717E8] px-6 text-[11px] font-extrabold !text-white shadow-[0_15px_32px_rgba(23,23,232,0.20)] transition hover:-translate-y-0.5"
                    >
                      <LayoutDashboard size={17} />

                      <span className="!text-white">
                        Open My Dashboard
                      </span>

                      <ArrowRight size={15} />
                    </Link>

                    <Link
                      to="/ai-bot"
                      className="inline-flex min-h-[52px] items-center gap-2 rounded-[14px] border border-[#D6DFEA] bg-white px-5 text-[11px] font-extrabold !text-[#263E59] shadow-sm"
                    >
                      <Sparkles
                        size={16}
                        className="text-[#1717E8]"
                      />

                      <span className="!text-[#263E59]">
                        Ask SAHARA AI
                      </span>
                    </Link>
                  </>
                ) : (
                  <>
                    <Link
                      to="/signup"
                      className="inline-flex min-h-[52px] items-center gap-2.5 rounded-[14px] bg-[#1717E8] px-6 text-[11px] font-extrabold !text-white shadow-[0_15px_32px_rgba(23,23,232,0.20)]"
                    >
                      <span className="!text-white">
                        Get Started
                      </span>

                      <ArrowRight size={16} />
                    </Link>

                    <Link
                      to="/ai-bot"
                      className="inline-flex min-h-[52px] items-center gap-2 rounded-[14px] border border-[#D6DFEA] bg-white px-5 text-[11px] font-extrabold !text-[#263E59] shadow-sm"
                    >
                      <Sparkles
                        size={16}
                        className="text-[#1717E8]"
                      />

                      <span className="!text-[#263E59]">
                        Explore SAHARA AI
                      </span>
                    </Link>
                  </>
                )}
              </div>

              <div className="mt-9 flex flex-wrap gap-5">

                <TrustItem text="Emergency focused" />
                <TrustItem text="Doctor access" />
                <TrustItem text="Blood network" />
                <TrustItem text="AI navigation" />
              </div>
            </motion.div>

            {/* PRODUCT CARD */}

            <motion.div
              initial={{
                opacity: 0,
                x: 20,
              }}
              animate={{
                opacity: 1,
                x: 0,
              }}
              className="relative z-10"
            >

              <div className="rounded-[30px] border border-[#DEE5F0] bg-white p-5 shadow-[0_30px_80px_rgba(36,59,91,0.12)]">

                <div className="flex items-center justify-between">

                  <div>
                    <p className="text-[9px] font-extrabold uppercase tracking-[0.13em] text-[#1717E8]">
                      SAHARA Health
                    </p>

                    <h2 className="mt-2 font-[Manrope] text-[19px] font-extrabold text-[#1D3652]">
                      What do you need today?
                    </h2>
                  </div>

                  <div className="grid h-11 w-11 place-items-center rounded-[14px] bg-[#EEF2FF] text-[#1717E8]">
                    <HeartPulse size={21} />
                  </div>
                </div>

                <Link
                  to="/ai-bot"
                  className="mt-5 flex items-center justify-between rounded-[18px] border border-red-100 bg-red-50/60 p-4"
                >

                  <div className="flex items-center gap-3">

                    <div className="grid h-11 w-11 place-items-center rounded-[13px] bg-red-100 text-red-600">
                      <Activity size={20} />
                    </div>

                    <div>
                      <p className="text-[9px] font-extrabold text-red-600">
                        Emergency Support
                      </p>

                      <p className="mt-1 text-[9px] text-[#75879A]">
                        Get healthcare guidance quickly
                      </p>
                    </div>
                  </div>

                  <ChevronRight
                    size={17}
                    className="text-red-500"
                  />
                </Link>

                <div className="mt-4 grid grid-cols-2 gap-3">

                  <MiniCard
                    icon={Stethoscope}
                    title="Doctors"
                    text="Find a specialist"
                    to="/doctor"
                  />

                  <MiniCard
                    icon={CalendarDays}
                    title="Appointment"
                    text="Book consultation"
                    to="/appointment"
                  />

                  <MiniCard
                    icon={Droplets}
                    title="Blood"
                    text="Request support"
                    to="/bloodRequest"
                    red
                  />

                  <MiniCard
                    icon={Sparkles}
                    title="SAHARA AI"
                    text="Health assistant"
                    to="/ai-bot"
                  />
                </div>

                {user && (
                  <div className="mt-4 flex items-center justify-between rounded-[16px] border border-[#DDE3FF] bg-[#F4F6FF] p-4">

                    <div className="flex items-center gap-3">

                      <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#1717E8] text-[9px] font-extrabold text-white">
                        {initials}
                      </div>

                      <div>
                        <p className="text-[10px] font-extrabold text-[#29425C]">
                          {user.fullName}
                        </p>

                        <p className="mt-0.5 text-[8px] text-[#8392A3]">
                          Logged in as {user.role}
                        </p>
                      </div>
                    </div>

                    <Link
                      to="/dashboard"
                      className="rounded-[10px] bg-[#1717E8] px-3 py-2 text-[8.5px] font-extrabold !text-white"
                    >
                      <span className="!text-white">
                        Dashboard
                      </span>
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </section>

        {/* =====================================================
            SERVICES
        ===================================================== */}

        <section
          id="services"
          className="border-y border-[#E5EAF1] bg-white py-20"
        >

          <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-10">

            <div className="mx-auto max-w-[700px] text-center">

              <p className="text-[9px] font-extrabold uppercase tracking-[0.15em] text-[#1717E8]">
                Core Services
              </p>

              <h2 className="mt-4 font-[Manrope] text-[32px] font-extrabold tracking-[-0.04em] text-[#122B48] sm:text-[42px]">
                One healthcare platform.
              </h2>

              <p className="mt-4 text-[11px] leading-6 text-[#73869A]">
                Access the essential healthcare services SAHARA is
                designed to coordinate.
              </p>
            </div>

            <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">

              <ServiceCard
                icon={Activity}
                title="Emergency SOS"
                text="Get immediate healthcare guidance."
                to="/ai-bot"
                red
              />

              <ServiceCard
                icon={Stethoscope}
                title="Doctor Search"
                text="Find available medical professionals."
                to="/doctor"
              />

              <ServiceCard
                icon={Droplets}
                title="Blood Support"
                text="Create requests or join the donor network."
                to="/bloodRequest"
                red
              />

              <ServiceCard
                icon={Sparkles}
                title="SAHARA AI"
                text="AI-powered healthcare navigation."
                to="/ai-bot"
                featured
              />
            </div>
          </div>
        </section>

        {/* =====================================================
            WHY SAHARA
        ===================================================== */}

        <section className="bg-[#F4F7FF] py-20">

          <div className="mx-auto grid max-w-[1300px] gap-10 px-5 sm:px-8 lg:grid-cols-2 lg:items-center lg:px-10">

            <div>

              <p className="text-[9px] font-extrabold uppercase tracking-[0.15em] text-[#1717E8]">
                Connected Care
              </p>

              <h2 className="mt-4 font-[Manrope] text-[32px] font-extrabold leading-[1.1] tracking-[-0.04em] text-[#122B48] sm:text-[42px]">
                Your healthcare journey in one place.
              </h2>

              <p className="mt-5 max-w-[560px] text-[11px] leading-6 text-[#718398]">
                Patients, doctors and hospitals each receive their own
                SAHARA workspace while staying connected through the
                same healthcare network.
              </p>

              {user ? (
                <Link
                  to="/dashboard"
                  className="mt-7 inline-flex items-center gap-2 rounded-[12px] bg-[#1717E8] px-5 py-3 text-[10px] font-extrabold !text-white"
                >
                  <span className="!text-white">
                    Return to Dashboard
                  </span>

                  <ArrowRight size={14} />
                </Link>
              ) : (
                <Link
                  to="/signup"
                  className="mt-7 inline-flex items-center gap-2 rounded-[12px] bg-[#1717E8] px-5 py-3 text-[10px] font-extrabold !text-white"
                >
                  <span className="!text-white">
                    Join SAHARA
                  </span>

                  <ArrowRight size={14} />
                </Link>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">

              <InfoCard
                icon={Hospital}
                title="Hospital Network"
                text="Connect patients with registered facilities."
              />

              <InfoCard
                icon={Stethoscope}
                title="Doctors"
                text="Discover specialists and consultation options."
              />

              <InfoCard
                icon={Droplets}
                title="Blood Coordination"
                text="Request blood and discover active donors."
              />

              <InfoCard
                icon={ShieldCheck}
                title="Role-based Workspace"
                text="Different dashboards for every healthcare role."
              />
            </div>
          </div>
        </section>

        {/* =====================================================
            FINAL CTA — LIGHT VERSION
        ===================================================== */}

        <section className="px-5 py-20 sm:px-8 lg:px-10">

          <div className="mx-auto max-w-[1300px] overflow-hidden rounded-[30px] border border-[#DCE3F1] bg-[linear-gradient(135deg,#F2F5FF,#E9EEFF)] p-8 sm:p-11 lg:p-14">

            <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-center">

              <div className="max-w-[660px]">

                <p className="text-[9px] font-extrabold uppercase tracking-[0.15em] text-[#1717E8]">
                  SAHARA HEALTHCARE
                </p>

                <h2 className="mt-4 font-[Manrope] text-[31px] font-extrabold leading-[1.1] tracking-[-0.04em] text-[#132B48] sm:text-[42px]">
                  Healthcare should feel easier to reach.
                </h2>

                <p className="mt-4 text-[11px] leading-6 text-[#6E8196]">
                  Doctors, appointments, blood support and intelligent
                  healthcare navigation — connected through SAHARA.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">

                {user ? (
                  <>
                    <Link
                      to="/dashboard"
                      className="inline-flex min-h-[48px] items-center gap-2 rounded-[12px] bg-[#1717E8] px-5 text-[10px] font-extrabold !text-white shadow-[0_12px_28px_rgba(23,23,232,0.18)]"
                    >
                      <LayoutDashboard size={15} />

                      <span className="!text-white">
                        My Dashboard
                      </span>
                    </Link>

                    <button
                      type="button"
                      onClick={handleLogout}
                      className="inline-flex min-h-[48px] items-center gap-2 rounded-[12px] border border-red-200 bg-white px-5 text-[10px] font-extrabold text-red-600"
                    >
                      <LogOut size={15} />

                      Logout
                    </button>
                  </>
                ) : (
                  <Link
                    to="/signup"
                    className="inline-flex min-h-[48px] items-center gap-2 rounded-[12px] bg-[#1717E8] px-5 text-[10px] font-extrabold !text-white"
                  >
                    <span className="!text-white">
                      Create Account
                    </span>

                    <ArrowRight size={15} />
                  </Link>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* =====================================================
          FOOTER
      ===================================================== */}

      <footer className="border-t border-[#E5EAF2] bg-white">

        <div className="mx-auto flex max-w-[1440px] flex-col justify-between gap-5 px-5 py-8 sm:px-8 md:flex-row md:items-center lg:px-10">

          <Link
            to="/"
            aria-label="Return to SAHARA home"
          >
            <img
              src={saharaLogo}
              alt="SAHARA"
              className="h-[40px] w-auto"
            />
          </Link>

          <p className="text-[9px] text-[#8B99A9]">
            Connected healthcare for patients, doctors and hospitals.
          </p>
        </div>
      </footer>
    </div>
  );
};

/* =========================================================
   SMALL COMPONENTS
========================================================= */

const TrustItem = ({ text }) => (
  <div className="flex items-center gap-2">

    <CheckCircle2
      size={14}
      className="text-emerald-500"
    />

    <span className="text-[9.5px] font-bold text-[#687C91]">
      {text}
    </span>
  </div>
);

const MobileLink = ({
  to,
  label,
  featured = false,
}) => (
  <Link
    to={to}
    className={`flex items-center justify-between rounded-xl px-4 py-3 text-[10px] font-extrabold ${
      featured
        ? "bg-[#1717E8] !text-white"
        : "bg-[#F6F8FB] text-[#536A82]"
    }`}
  >
    <span className={featured ? "!text-white" : ""}>
      {label}
    </span>

    <ChevronRight size={14} />
  </Link>
);

const MiniCard = ({
  icon: Icon,
  title,
  text,
  to,
  red = false,
}) => (
  <Link
    to={to}
    className="rounded-[16px] border border-[#E2E8F1] bg-[#FAFCFF] p-4 transition hover:-translate-y-0.5 hover:bg-white hover:shadow-md"
  >

    <div
      className={`grid h-10 w-10 place-items-center rounded-[12px] ${
        red
          ? "bg-red-50 text-red-600"
          : "bg-[#EEF2FF] text-[#1717E8]"
      }`}
    >
      <Icon size={18} />
    </div>

    <p className="mt-4 text-[10px] font-extrabold text-[#2E465F]">
      {title}
    </p>

    <p className="mt-1 text-[8px] text-[#8A98A8]">
      {text}
    </p>
  </Link>
);

const ServiceCard = ({
  icon: Icon,
  title,
  text,
  to,
  red = false,
  featured = false,
}) => (
  <Link
    to={to}
    className={`rounded-[21px] border p-6 transition-all hover:-translate-y-1 hover:shadow-lg ${
      featured
        ? "border-[#CDD5FF] bg-[#F0F2FF]"
        : "border-[#E0E7F0] bg-white"
    }`}
  >

    <div
      className={`grid h-12 w-12 place-items-center rounded-[14px] ${
        red
          ? "bg-red-50 text-red-600"
          : "bg-[#EEF2FF] text-[#1717E8]"
      }`}
    >
      <Icon size={21} />
    </div>

    <h3 className="mt-6 font-[Manrope] text-[14px] font-extrabold text-[#263E59]">
      {title}
    </h3>

    <p className="mt-2 text-[9.5px] leading-5 text-[#7D8FA1]">
      {text}
    </p>

    <div
      className={`mt-5 inline-flex items-center gap-1 text-[9px] font-extrabold ${
        red
          ? "text-red-600"
          : "text-[#1717E8]"
      }`}
    >
      Explore
      <ArrowRight size={12} />
    </div>
  </Link>
);

const InfoCard = ({
  icon: Icon,
  title,
  text,
}) => (
  <div className="rounded-[19px] border border-[#DDE5EF] bg-white p-5 shadow-[0_10px_30px_rgba(30,54,87,0.04)]">

    <div className="grid h-10 w-10 place-items-center rounded-[12px] bg-[#EEF2FF] text-[#1717E8]">
      <Icon size={18} />
    </div>

    <p className="mt-4 text-[11px] font-extrabold text-[#304861]">
      {title}
    </p>

    <p className="mt-2 text-[9px] leading-5 text-[#8191A2]">
      {text}
    </p>
  </div>
);

export default Home;