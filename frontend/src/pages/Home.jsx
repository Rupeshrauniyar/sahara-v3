import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import {
  AnimatePresence,
  motion,
} from "framer-motion";

import {
  Activity,
  ArrowRight,
  Bot,
  CalendarDays,
  Check,
  ChevronRight,
  CircleCheck,
  Droplets,
  HeartHandshake,
  HeartPulse,
  Hospital,
  LockKeyhole,
  MapPin,
  Menu,
  PhoneCall,
  Search,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  UserRound,
  Users,
  X,
  Zap,
} from "lucide-react";

/* =========================================================
   DATA
========================================================= */

const services = [
  {
    icon: Zap,
    title: "Emergency SOS",
    description:
      "Start a simple emergency pathway designed to reduce confusion when every second matters.",
    path: "/ai-bot",
    accent: "red",
    label: "Emergency",
  },

  {
    icon: Bot,
    title: "AI Health Navigator",
    description:
      "Describe your concern and get guided toward an appropriate healthcare service or next action.",
    path: "/ai-bot",
    accent: "violet",
    label: "AI guidance",
  },

  {
    icon: Droplets,
    title: "Blood Support",
    description:
      "Create urgent blood requests or become part of the donor support network.",
    path: "/bloodRequest",
    accent: "rose",
    label: "Blood network",
  },

  {
    icon: Hospital,
    title: "Hospital Access",
    description:
      "Connect with hospitals and healthcare facilities through one coordinated platform.",
    path: "/dashboard",
    accent: "blue",
    label: "Hospitals",
  },

  {
    icon: Stethoscope,
    title: "Doctor Search",
    description:
      "Find medical professionals based on your healthcare needs and specialty.",
    path: "/doctor",
    accent: "cyan",
    label: "Doctors",
  },

  {
    icon: CalendarDays,
    title: "Appointments",
    description:
      "Move from finding a doctor to scheduling care without unnecessary steps.",
    path: "/appointment",
    accent: "green",
    label: "Booking",
  },
];

const platformFlow = [
  {
    number: "01",
    title: "Tell SAHARA what you need",
    description:
      "Start with an emergency, symptoms, blood requirement, doctor search or appointment.",
  },

  {
    number: "02",
    title: "Get routed clearly",
    description:
      "SAHARA helps move you toward the most relevant healthcare action instead of scattered searching.",
  },

  {
    number: "03",
    title: "Connect to healthcare",
    description:
      "Reach hospitals, doctors, blood support or an appropriate emergency pathway.",
  },

  {
    number: "04",
    title: "Continue from your dashboard",
    description:
      "Patients, doctors and hospitals each receive an experience suited to their role.",
  },
];

const roles = {
  patient: {
    label: "Patient",
    icon: UserRound,

    title:
      "Healthcare feels simpler when everything begins in one place.",

    description:
      "Patients can move between healthcare discovery, blood support, appointments and AI-guided navigation without jumping between separate services.",

    benefits: [
      "Find doctors and healthcare services",
      "Create blood requests",
      "Manage appointments",
      "Access AI healthcare navigation",
      "Use role-based patient dashboard",
    ],

    action: "/signup",
    actionLabel: "Create patient account",
  },

  doctor: {
    label: "Doctor",
    icon: Stethoscope,

    title:
      "A cleaner workspace for doctors to manage patient access.",

    description:
      "Doctor accounts provide a dedicated dashboard experience for appointments, availability and healthcare coordination.",

    benefits: [
      "Manage availability status",
      "View appointments",
      "Maintain doctor information",
      "Access role-specific dashboard",
      "Connect with patients through SAHARA",
    ],

    action: "/signup",
    actionLabel: "Join as doctor",
  },

  hospital: {
    label: "Hospital",
    icon: Hospital,

    title:
      "Hospitals become part of the coordination layer.",

    description:
      "Hospital administrators can maintain operational information and participate directly in SAHARA's healthcare network.",

    benefits: [
      "Manage bed information",
      "Monitor blood inventory",
      "Manage hospital doctors",
      "View admissions and capacity",
      "Use hospital administration dashboard",
    ],

    action: "/signup",
    actionLabel: "Register hospital",
  },
};

const trustPoints = [
  {
    icon: ShieldCheck,
    title: "Healthcare-first design",
    description:
      "Urgent actions are clearly separated from normal healthcare actions.",
  },

  {
    icon: LockKeyhole,
    title: "Protected accounts",
    description:
      "Authentication and role-based access keep user experiences separated.",
  },

  {
    icon: HeartHandshake,
    title: "Built around coordination",
    description:
      "Patients, doctors, donors and hospitals work inside the same platform.",
  },
];

/* =========================================================
   REUSABLE COMPONENTS
========================================================= */

const Reveal = ({
  children,
  delay = 0,
  className = "",
}) => {
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 24,
      }}
      whileInView={{
        opacity: 1,
        y: 0,
      }}
      viewport={{
        once: true,
        amount: 0.15,
      }}
      transition={{
        duration: 0.55,
        delay,
        ease: [0.22, 1, 0.36, 1],
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

const SectionLabel = ({
  children,
  light = false,
}) => {
  return (
    <span
      className={`inline-flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-[0.14em] ${
        light
          ? "text-sky-300"
          : "text-[#1769E0]"
      }`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${
          light
            ? "bg-cyan-300"
            : "bg-[#0CA9C4]"
        }`}
      />

      {children}
    </span>
  );
};

const Logo = ({
  light = false,
}) => {
  return (
    <Link
      to="/"
      className="flex items-center gap-3"
    >
      <div
        className={`w-10 h-10 rounded-[13px] flex items-center justify-center shadow-lg ${
          light
            ? "bg-white text-[#1769E0]"
            : "bg-gradient-to-br from-[#1A78ED] to-[#0752B9] text-white"
        }`}
      >
        <HeartPulse
          size={22}
          strokeWidth={2.4}
        />
      </div>

      <div className="flex flex-col leading-none">
        <span
          className={`font-[Manrope] text-[18px] font-extrabold tracking-[0.04em] ${
            light
              ? "text-white"
              : "text-[#0B213F]"
          }`}
        >
          SAHARA
        </span>

        <span
          className={`text-[9px] mt-1 tracking-wide ${
            light
              ? "text-blue-200"
              : "text-slate-400"
          }`}
        >
          Healthcare coordination
        </span>
      </div>
    </Link>
  );
};

const PrimaryButton = ({
  children,
  to,
  danger = false,
  secondary = false,
}) => {
  const classes = danger
    ? "bg-gradient-to-r from-[#EB4558] to-[#D73145] text-white shadow-[0_14px_34px_rgba(217,49,69,0.22)] hover:shadow-[0_18px_40px_rgba(217,49,69,0.3)]"
    : secondary
      ? "bg-white text-[#12233D] border border-[#D9E6F2] hover:border-[#A8C8EA] hover:text-[#1769E0]"
      : "bg-gradient-to-r from-[#1977EA] to-[#0B5FC7] text-white shadow-[0_14px_34px_rgba(23,105,224,0.22)] hover:shadow-[0_18px_42px_rgba(23,105,224,0.3)]";

  return (
    <Link
      to={to}
      className={`inline-flex min-h-[50px] items-center justify-center gap-2.5 rounded-[14px] px-5 text-[13px] font-bold transition-all duration-200 hover:-translate-y-0.5 ${classes}`}
    >
      {children}
    </Link>
  );
};

/* =========================================================
   MEDICAL DASHBOARD MOCKUP
========================================================= */

const ProductPreview = () => {
  return (
    <div className="relative w-full max-w-[520px]">
      {/* glow */}

      <div className="absolute inset-0 -z-10 scale-[1.12] rounded-full bg-[radial-gradient(circle,rgba(23,105,224,0.16),transparent_68%)] blur-xl" />

      {/* main card */}

      <motion.div
        animate={{
          y: [0, -8, 0],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="relative overflow-hidden rounded-[30px] border border-[#DCE8F3] bg-white p-5 sm:p-6 shadow-[0_38px_90px_rgba(17,50,88,0.15)]"
      >
        {/* header */}

        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-[#1769E0]">
              SAHARA Health
            </p>

            <h3 className="mt-1 font-[Manrope] text-[21px] font-extrabold text-[#10233F]">
              What do you need today?
            </h3>
          </div>

          <div className="grid h-12 w-12 place-items-center rounded-[15px] bg-[#EAF4FF] text-[#1769E0]">
            <Activity size={23} />
          </div>
        </div>

        {/* search */}

        <div className="mt-5 flex h-[52px] items-center gap-3 rounded-[14px] border border-[#E0EAF3] bg-[#F8FBFE] px-4">
          <Search
            size={18}
            className="text-[#7C90A7]"
          />

          <span className="text-[12px] text-[#91A0B2]">
            Search healthcare services...
          </span>
        </div>

        {/* emergency */}

        <div className="mt-4 overflow-hidden rounded-[19px] border border-[#F5CFD4] bg-gradient-to-r from-[#FFF5F6] to-[#FFFAFA] p-4">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-[13px] bg-[#E43C4F] text-white">
              <PhoneCall size={20} />
            </div>

            <div className="flex-1">
              <span className="text-[9px] font-bold uppercase tracking-wider text-[#E43C4F]">
                Emergency
              </span>

              <p className="text-[12px] font-bold text-[#74212C]">
                Need urgent healthcare assistance?
              </p>
            </div>

            <ChevronRight
              size={18}
              className="text-[#D74353]"
            />
          </div>
        </div>

        {/* services */}

        <div className="mt-4 grid grid-cols-2 gap-3">
          {[
            {
              icon: Bot,
              label: "AI Navigator",
              color:
                "bg-[#F2EEFF] text-[#7259D8]",
            },

            {
              icon: Stethoscope,
              label: "Find Doctor",
              color:
                "bg-[#EAF4FF] text-[#1769E0]",
            },

            {
              icon: Droplets,
              label: "Blood Support",
              color:
                "bg-[#FFF0F2] text-[#E43C4F]",
            },

            {
              icon: Hospital,
              label: "Hospitals",
              color:
                "bg-[#E8F9FC] text-[#0CA9C4]",
            },
          ].map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.label}
                className="rounded-[16px] border border-[#EDF2F7] bg-white p-3.5"
              >
                <div
                  className={`grid h-9 w-9 place-items-center rounded-[11px] ${item.color}`}
                >
                  <Icon size={18} />
                </div>

                <p className="mt-3 text-[11px] font-bold text-[#334A65]">
                  {item.label}
                </p>
              </div>
            );
          })}
        </div>

        {/* hospital preview */}

        <div className="mt-4 rounded-[18px] border border-[#E3EDF5] bg-[#F9FCFF] p-4">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <p className="text-[9px] uppercase tracking-wider text-slate-400">
                Nearby healthcare
              </p>

              <p className="mt-1 text-[12px] font-bold text-[#19304D]">
                Available facility
              </p>
            </div>

            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#EAF8F1] px-2.5 py-1 text-[9px] font-bold text-[#16915F]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#16A36A]" />

              Available
            </span>
          </div>

          <div className="flex items-center gap-3 rounded-[14px] bg-white p-3">
            <div className="grid h-11 w-11 place-items-center rounded-[12px] bg-[#EAF4FF] text-[#1769E0]">
              <Hospital size={20} />
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-[11px] font-bold text-[#172C48]">
                Nearby Medical Center
              </p>

              <span className="mt-1 flex items-center gap-1 text-[9px] text-slate-400">
                <MapPin size={11} />

                Kathmandu
              </span>
            </div>

            <div className="rounded-[8px] bg-[#EAF4FF] px-2 py-1 text-[9px] font-bold text-[#1769E0]">
              View
            </div>
          </div>
        </div>
      </motion.div>

      {/* floating AI */}

      <motion.div
        animate={{
          y: [0, -8, 0],
        }}
        transition={{
          duration: 4.5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute -right-4 top-[13%] hidden items-center gap-3 rounded-[15px] border border-[#E2EBF5] bg-white px-4 py-3 shadow-[0_18px_45px_rgba(13,47,85,0.12)] sm:flex"
      >
        <div className="grid h-9 w-9 place-items-center rounded-[11px] bg-[#F1EDFF] text-[#7157D8]">
          <Bot size={18} />
        </div>

        <div>
          <p className="text-[9px] text-slate-400">
            AI Health Navigator
          </p>

          <p className="text-[11px] font-bold text-[#1E344F]">
            Ready to help
          </p>
        </div>
      </motion.div>

      {/* floating trust */}

      <motion.div
        animate={{
          y: [0, 7, 0],
        }}
        transition={{
          duration: 5.5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute -left-5 bottom-[13%] hidden items-center gap-3 rounded-[15px] border border-[#E2EBF5] bg-white px-4 py-3 shadow-[0_18px_45px_rgba(13,47,85,0.12)] sm:flex"
      >
        <div className="grid h-9 w-9 place-items-center rounded-[11px] bg-[#EAF8F1] text-[#14955F]">
          <ShieldCheck size={18} />
        </div>

        <div>
          <p className="text-[9px] text-slate-400">
            Healthcare network
          </p>

          <p className="text-[11px] font-bold text-[#1E344F]">
            Connected & coordinated
          </p>
        </div>
      </motion.div>
    </div>
  );
};

/* =========================================================
   HOME
========================================================= */

const Home = () => {
  const [mobileOpen, setMobileOpen] =
    useState(false);

  const [scrolled, setScrolled] =
    useState(false);

  const [selectedRole, setSelectedRole] =
    useState("patient");

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    onScroll();

    window.addEventListener(
      "scroll",
      onScroll,
      {
        passive: true,
      },
    );

    return () => {
      window.removeEventListener(
        "scroll",
        onScroll,
      );
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow =
      mobileOpen
        ? "hidden"
        : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const currentRole =
    roles[selectedRole];

  const RoleIcon =
    currentRole.icon;

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#F8FBFF] text-[#12233D]">

      {/* =====================================================
          NAVBAR
      ===================================================== */}

      <header
        className={`sticky top-0 z-[100] transition-all duration-300 ${
          scrolled
            ? "border-b border-[#E1EBF4] bg-white/90 shadow-[0_12px_35px_rgba(15,48,84,0.06)] backdrop-blur-xl"
            : "border-b border-transparent bg-[#F8FBFF]/82 backdrop-blur-xl"
        }`}
      >
        <div className="mx-auto flex min-h-[76px] max-w-[1240px] items-center justify-between gap-5 px-5 sm:px-8 lg:px-10">

          <Logo />

          {/* desktop nav */}

          <nav className="hidden items-center gap-1 lg:flex">
            {[
              ["Services", "#services"],
              ["How it works", "#how-it-works"],
              ["For everyone", "#roles"],
              ["Why SAHARA", "#trust"],
            ].map(([label, href]) => (
              <a
                key={label}
                href={href}
                className="rounded-[10px] px-3.5 py-2.5 text-[13px] font-semibold text-[#5E7188] transition hover:bg-[#EEF6FF] hover:text-[#1769E0]"
              >
                {label}
              </a>
            ))}
          </nav>

          {/* actions */}

          <div className="flex items-center gap-2">

            <Link
              to="/login"
              className="hidden min-h-[42px] items-center justify-center gap-2 rounded-[12px] px-4 text-[13px] font-bold text-[#425970] transition hover:bg-[#EEF5FB] sm:flex"
            >
              <UserRound size={17} />

              Sign in
            </Link>

            <Link
              to="/signup"
              className="hidden min-h-[43px] items-center justify-center rounded-[12px] bg-[#1769E0] px-4 text-[13px] font-bold text-white shadow-[0_9px_24px_rgba(23,105,224,0.18)] transition hover:bg-[#0D59C4] sm:flex"
            >
              Get started
            </Link>

            <Link
              to="/ai-bot"
              className="grid h-[43px] w-[43px] place-items-center rounded-[12px] bg-[#E43C4F] text-white shadow-[0_9px_24px_rgba(228,60,79,0.2)] sm:hidden"
              aria-label="Emergency healthcare"
            >
              <PhoneCall size={18} />
            </Link>

            <button
              type="button"
              onClick={() =>
                setMobileOpen(
                  (current) => !current,
                )
              }
              className="grid h-[43px] w-[43px] place-items-center rounded-[12px] border border-[#DFE8F2] bg-white text-[#16304D] lg:hidden"
              aria-label="Toggle navigation"
            >
              {mobileOpen
                ? (
                  <X size={21} />
                )
                : (
                  <Menu size={21} />
                )}
            </button>
          </div>
        </div>
      </header>

      {/* =====================================================
          MOBILE NAVIGATION
      ===================================================== */}

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{
              opacity: 0,
              y: -15,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            exit={{
              opacity: 0,
              y: -15,
            }}
            transition={{
              duration: 0.22,
            }}
            className="fixed inset-x-3 top-[84px] z-[99] rounded-[22px] border border-[#DCE8F3] bg-white p-3 shadow-[0_28px_65px_rgba(17,46,80,0.16)] lg:hidden"
          >
            <div className="flex flex-col">
              {[
                ["Services", "#services"],
                [
                  "How it works",
                  "#how-it-works",
                ],
                [
                  "For everyone",
                  "#roles",
                ],
                [
                  "Why SAHARA",
                  "#trust",
                ],
              ].map(
                ([label, href]) => (
                  <a
                    key={label}
                    href={href}
                    onClick={() =>
                      setMobileOpen(false)
                    }
                    className="rounded-[12px] px-4 py-3 text-[14px] font-semibold text-[#4E637A] hover:bg-[#F2F7FC]"
                  >
                    {label}
                  </a>
                ),
              )}

              <div className="my-2 h-px bg-[#EDF2F7]" />

              <Link
                to="/login"
                onClick={() =>
                  setMobileOpen(false)
                }
                className="rounded-[12px] px-4 py-3 text-center text-[14px] font-bold text-[#1769E0]"
              >
                Sign in
              </Link>

              <Link
                to="/signup"
                onClick={() =>
                  setMobileOpen(false)
                }
                className="mt-1 rounded-[12px] bg-[#1769E0] px-4 py-3 text-center text-[14px] font-bold text-white"
              >
                Create account
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <main>

        {/* =====================================================
            HERO
        ===================================================== */}

        <section className="relative overflow-hidden border-b border-[#E5EDF5]">

          {/* background */}

          <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_12%_15%,rgba(23,105,224,0.10),transparent_28%),radial-gradient(circle_at_85%_22%,rgba(12,169,196,0.10),transparent_23%),linear-gradient(180deg,#FBFDFF_0%,#F5FAFF_100%)]" />

          <div className="mx-auto grid max-w-[1240px] items-center gap-12 px-5 pb-20 pt-16 sm:px-8 sm:pb-24 sm:pt-20 lg:grid-cols-[1.02fr_.98fr] lg:px-10 lg:pb-28">

            {/* text */}

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
                duration: 0.6,
                ease: [
                  0.22,
                  1,
                  0.36,
                  1,
                ],
              }}
            >
              <div className="inline-flex items-center gap-2 rounded-full border border-[#CFE3F7] bg-white/80 px-3 py-2 text-[11px] font-bold text-[#1769E0] shadow-sm">
                <Sparkles size={14} />

                Healthcare coordination built for Nepal
              </div>

              <h1 className="mt-6 max-w-[720px] font-[Manrope] text-[clamp(2.8rem,5.6vw,5rem)] font-extrabold leading-[1.02] tracking-[-0.055em] text-[#0B213F]">
                One place to find the{" "}

                <span className="sahara-gradient-text">
                  right healthcare action.
                </span>
              </h1>

              <p className="mt-6 max-w-[640px] text-[15.5px] leading-7 text-[#60758C] sm:text-[17px]">
                SAHARA connects patients with
                emergency support, AI-guided
                navigation, hospitals, doctors,
                appointments and blood assistance
                through one coordinated healthcare
                platform.
              </p>

              {/* actions */}

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">

                <PrimaryButton to="/signup">
                  Get started

                  <ArrowRight size={18} />
                </PrimaryButton>

                <PrimaryButton
                  to="/ai-bot"
                  secondary
                >
                  <Bot size={18} />

                  Ask SAHARA AI
                </PrimaryButton>

                <PrimaryButton
                  to="/bloodRequest"
                  danger
                >
                  <Droplets size={18} />

                  Request Blood
                </PrimaryButton>
              </div>

              {/* trust */}

              <div className="mt-9 flex flex-wrap gap-x-6 gap-y-3">

                <div className="flex items-center gap-2 text-[12px] font-semibold text-[#61758C]">
                  <CircleCheck
                    size={17}
                    className="text-[#16A36A]"
                  />

                  Role-based healthcare access
                </div>

                <div className="flex items-center gap-2 text-[12px] font-semibold text-[#61758C]">
                  <ShieldCheck
                    size={17}
                    className="text-[#1769E0]"
                  />

                  Emergency-first experience
                </div>

                <div className="flex items-center gap-2 text-[12px] font-semibold text-[#61758C]">
                  <Bot
                    size={17}
                    className="text-[#7157D8]"
                  />

                  AI healthcare navigator
                </div>
              </div>
            </motion.div>

            {/* visual */}

            <motion.div
              initial={{
                opacity: 0,
                x: 35,
              }}
              animate={{
                opacity: 1,
                x: 0,
              }}
              transition={{
                duration: 0.7,
                delay: 0.08,
              }}
              className="flex items-center justify-center"
            >
              <ProductPreview />
            </motion.div>
          </div>

          {/* service bar */}

          <div className="border-t border-[#E2EBF4] bg-white/85 backdrop-blur-lg">
            <div className="mx-auto grid max-w-[1240px] grid-cols-2 px-5 sm:px-8 md:grid-cols-4 lg:px-10">

              {[
                {
                  icon: Hospital,
                  title: "Hospitals",
                  text: "Healthcare access",
                },

                {
                  icon: Stethoscope,
                  title: "Doctors",
                  text: "Professional care",
                },

                {
                  icon: Droplets,
                  title: "Blood",
                  text: "Request support",
                },

                {
                  icon: Bot,
                  title: "AI Navigator",
                  text: "Guided next steps",
                },
              ].map((item) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.title}
                    className="flex items-center gap-3 border-[#EEF2F6] px-3 py-5 md:border-r md:last:border-r-0"
                  >
                    <div className="grid h-10 w-10 place-items-center rounded-[12px] bg-[#EEF6FF] text-[#1769E0]">
                      <Icon size={20} />
                    </div>

                    <div>
                      <p className="text-[12px] font-bold text-[#203650]">
                        {item.title}
                      </p>

                      <p className="mt-0.5 text-[10px] text-[#91A0B1]">
                        {item.text}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* =====================================================
            SERVICES
        ===================================================== */}

        <section
          id="services"
          className="bg-white py-24 sm:py-28"
        >
          <div className="mx-auto max-w-[1240px] px-5 sm:px-8 lg:px-10">

            <Reveal className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
              <div className="max-w-[700px]">
                <SectionLabel>
                  SAHARA services
                </SectionLabel>

                <h2 className="mt-3 font-[Manrope] text-[clamp(2.1rem,4vw,3.3rem)] font-extrabold leading-[1.1] tracking-[-0.045em] text-[#0B213F]">
                  Healthcare tools that work
                  together.
                </h2>
              </div>

              <p className="max-w-[430px] text-[14px] leading-7 text-[#64778D]">
                Instead of sending users through
                disconnected services, SAHARA
                creates a clearer pathway from
                need to action.
              </p>
            </Reveal>

            <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

              {services.map(
                (
                  service,
                  index,
                ) => {
                  const Icon =
                    service.icon;

                  const accents = {
                    red:
                      "bg-[#FFF0F2] text-[#E43C4F]",

                    violet:
                      "bg-[#F2EEFF] text-[#7259D8]",

                    rose:
                      "bg-[#FFF0F2] text-[#E43C4F]",

                    blue:
                      "bg-[#EAF4FF] text-[#1769E0]",

                    cyan:
                      "bg-[#E8F9FC] text-[#0CA9C4]",

                    green:
                      "bg-[#EAF8F1] text-[#16A36A]",
                  };

                  return (
                    <Reveal
                      key={
                        service.title
                      }
                      delay={
                        index * 0.06
                      }
                    >
                      <motion.article
                        whileHover={{
                          y: -6,
                        }}
                        transition={{
                          duration: 0.2,
                        }}
                        className="group flex min-h-[285px] flex-col rounded-[24px] border border-[#E2EBF4] bg-white p-6 shadow-[0_12px_35px_rgba(17,48,82,0.04)] transition hover:border-[#D4E5F6] hover:shadow-[0_25px_55px_rgba(17,48,82,0.10)]"
                      >
                        <div className="flex items-start justify-between gap-5">
                          <div
                            className={`grid h-[52px] w-[52px] place-items-center rounded-[15px] ${accents[service.accent]}`}
                          >
                            <Icon size={25} />
                          </div>

                          <span className="rounded-full bg-[#F5F8FB] px-3 py-1 text-[9px] font-bold uppercase tracking-wider text-[#8393A6]">
                            {
                              service.label
                            }
                          </span>
                        </div>

                        <h3 className="mt-6 font-[Manrope] text-[19px] font-extrabold text-[#122844]">
                          {
                            service.title
                          }
                        </h3>

                        <p className="mt-3 flex-1 text-[13px] leading-6 text-[#6B7D91]">
                          {
                            service.description
                          }
                        </p>

                        <Link
                          to={
                            service.path
                          }
                          className="mt-6 inline-flex w-fit items-center gap-2 text-[12px] font-bold text-[#1769E0]"
                        >
                          Open service

                          <ArrowRight
                            size={16}
                            className="transition group-hover:translate-x-1"
                          />
                        </Link>
                      </motion.article>
                    </Reveal>
                  );
                },
              )}
            </div>
          </div>
        </section>

        {/* =====================================================
            HOW IT WORKS
        ===================================================== */}

        <section
          id="how-it-works"
          className="border-y border-[#E1EBF4] bg-[#F5FAFF] py-24 sm:py-28"
        >
          <div className="mx-auto max-w-[1240px] px-5 sm:px-8 lg:px-10">

            <Reveal className="max-w-[760px]">
              <SectionLabel>
                One coordinated journey
              </SectionLabel>

              <h2 className="mt-3 font-[Manrope] text-[clamp(2.1rem,4vw,3.3rem)] font-extrabold leading-[1.1] tracking-[-0.045em] text-[#0B213F]">
                From confusion to the next
                healthcare action.
              </h2>

              <p className="mt-4 max-w-[650px] text-[14px] leading-7 text-[#65788E]">
                SAHARA is designed as a
                coordination layer, not simply a
                collection of unrelated healthcare
                pages.
              </p>
            </Reveal>

            <div className="relative mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-4">

              <div className="absolute left-[12%] right-[12%] top-[26px] hidden border-t border-dashed border-[#C9DBED] lg:block" />

              {platformFlow.map(
                (
                  step,
                  index,
                ) => (
                  <Reveal
                    key={
                      step.number
                    }
                    delay={
                      index * 0.08
                    }
                  >
                    <div className="relative">
                      <div className="relative z-10 grid h-[54px] w-[54px] place-items-center rounded-full border border-[#CFE0F1] bg-white text-[12px] font-extrabold text-[#1769E0] shadow-sm">
                        {
                          step.number
                        }
                      </div>

                      <h3 className="mt-5 font-[Manrope] text-[17px] font-extrabold text-[#19314D]">
                        {
                          step.title
                        }
                      </h3>

                      <p className="mt-2 text-[12.5px] leading-6 text-[#6C7E92]">
                        {
                          step.description
                        }
                      </p>
                    </div>
                  </Reveal>
                ),
              )}
            </div>
          </div>
        </section>

        {/* =====================================================
            ROLE SECTION
        ===================================================== */}

        <section
          id="roles"
          className="bg-white py-24 sm:py-28"
        >
          <div className="mx-auto max-w-[1240px] px-5 sm:px-8 lg:px-10">

            <Reveal>
              <SectionLabel>
                Built for the whole healthcare network
              </SectionLabel>

              <h2 className="mt-3 max-w-[760px] font-[Manrope] text-[clamp(2.1rem,4vw,3.3rem)] font-extrabold leading-[1.1] tracking-[-0.045em] text-[#0B213F]">
                One platform. Different experiences.
              </h2>
            </Reveal>

            {/* tabs */}

            <div className="mt-9 inline-flex rounded-[15px] border border-[#DCE7F2] bg-[#F6F9FC] p-1.5">

              {Object.entries(
                roles,
              ).map(
                ([
                  key,
                  item,
                ]) => {
                  const Icon =
                    item.icon;

                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() =>
                        setSelectedRole(
                          key,
                        )
                      }
                      className={`inline-flex items-center gap-2 rounded-[11px] px-4 py-2.5 text-[12px] font-bold transition ${
                        selectedRole ===
                        key
                          ? "bg-white text-[#1769E0] shadow-sm"
                          : "text-[#66798F]"
                      }`}
                    >
                      <Icon size={16} />

                      {
                        item.label
                      }
                    </button>
                  );
                },
              )}
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={selectedRole}
                initial={{
                  opacity: 0,
                  y: 14,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                exit={{
                  opacity: 0,
                  y: -10,
                }}
                transition={{
                  duration: 0.26,
                }}
                className="mt-10 grid items-center gap-10 rounded-[28px] border border-[#DCE8F3] bg-gradient-to-br from-[#F9FCFF] to-[#F0F7FF] p-7 sm:p-10 lg:grid-cols-[1fr_.85fr]"
              >

                <div>
                  <div className="grid h-[55px] w-[55px] place-items-center rounded-[16px] bg-[#EAF4FF] text-[#1769E0]">
                    <RoleIcon size={26} />
                  </div>

                  <h3 className="mt-6 max-w-[650px] font-[Manrope] text-[clamp(1.8rem,3vw,2.6rem)] font-extrabold leading-[1.12] tracking-[-0.04em] text-[#0C2544]">
                    {
                      currentRole.title
                    }
                  </h3>

                  <p className="mt-4 max-w-[620px] text-[14px] leading-7 text-[#65798F]">
                    {
                      currentRole.description
                    }
                  </p>

                  <Link
                    to={
                      currentRole.action
                    }
                    className="mt-7 inline-flex min-h-[48px] items-center gap-2 rounded-[13px] bg-[#1769E0] px-5 text-[13px] font-bold text-white shadow-[0_12px_25px_rgba(23,105,224,0.18)]"
                  >
                    {
                      currentRole.actionLabel
                    }

                    <ArrowRight size={17} />
                  </Link>
                </div>

                <div className="rounded-[22px] border border-[#DCE7F1] bg-white p-5 shadow-[0_18px_45px_rgba(18,51,87,0.07)]">

                  <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.13em] text-[#8B9AAC]">
                    Included experience
                  </p>

                  <div className="space-y-3">

                    {currentRole.benefits.map(
                      (benefit) => (
                        <div
                          key={
                            benefit
                          }
                          className="flex items-center gap-3 rounded-[13px] border border-[#EDF2F7] bg-[#FBFDFF] p-3"
                        >
                          <div className="grid h-8 w-8 place-items-center rounded-[9px] bg-[#EAF8F1] text-[#16A36A]">
                            <Check size={16} />
                          </div>

                          <span className="text-[12px] font-semibold text-[#50657B]">
                            {
                              benefit
                            }
                          </span>
                        </div>
                      ),
                    )}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </section>

        {/* =====================================================
            BLOOD NETWORK
        ===================================================== */}

        <section className="border-y border-[#F4D2D7] bg-gradient-to-r from-[#FFF8F9] to-[#FFFDFD] py-20 sm:py-24">

          <div className="mx-auto grid max-w-[1240px] items-center gap-12 px-5 sm:px-8 lg:grid-cols-[1fr_.9fr] lg:px-10">

            <Reveal>
              <SectionLabel>
                Blood support
              </SectionLabel>

              <h2 className="mt-3 max-w-[680px] font-[Manrope] text-[clamp(2.1rem,4vw,3.3rem)] font-extrabold leading-[1.1] tracking-[-0.045em] text-[#40151D]">
                When blood is needed, searching
                should not become another crisis.
              </h2>

              <p className="mt-4 max-w-[620px] text-[14px] leading-7 text-[#82636A]">
                SAHARA gives users one dedicated
                blood request pathway while also
                supporting donor coordination.
              </p>

              <div className="mt-7 flex flex-col gap-3 sm:flex-row">

                <PrimaryButton
                  to="/bloodRequest"
                  danger
                >
                  <Droplets size={18} />

                  Create Blood Request
                </PrimaryButton>

                <PrimaryButton
                  to="/blood-donor"
                  secondary
                >
                  <HeartHandshake size={18} />

                  Become a Donor
                </PrimaryButton>
              </div>
            </Reveal>

            <Reveal>
              <div className="space-y-3">

                {[
                  [
                    "01",
                    "Create request",
                    "Add blood group, hospital and urgency.",
                  ],

                  [
                    "02",
                    "Request enters the network",
                    "The blood need becomes easier to track and coordinate.",
                  ],

                  [
                    "03",
                    "Donor support",
                    "Matching donors can respond through the blood network.",
                  ],

                  [
                    "04",
                    "Healthcare handoff",
                    "The request carries the important hospital and patient information.",
                  ],
                ].map(
                  ([
                    number,
                    title,
                    text,
                  ]) => (
                    <div
                      key={
                        number
                      }
                      className="flex gap-4 rounded-[18px] border border-[#F2DADF] bg-white p-4 shadow-sm"
                    >
                      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-[12px] bg-[#FFF0F2] text-[11px] font-extrabold text-[#E43C4F]">
                        {
                          number
                        }
                      </div>

                      <div>
                        <p className="text-[13px] font-bold text-[#55232B]">
                          {
                            title
                          }
                        </p>

                        <p className="mt-1 text-[11.5px] leading-5 text-[#8B7277]">
                          {
                            text
                          }
                        </p>
                      </div>
                    </div>
                  ),
                )}
              </div>
            </Reveal>
          </div>
        </section>

        {/* =====================================================
            TRUST
        ===================================================== */}

        <section
          id="trust"
          className="bg-[#F8FBFF] py-24 sm:py-28"
        >
          <div className="mx-auto max-w-[1240px] px-5 sm:px-8 lg:px-10">

            <Reveal className="mx-auto max-w-[740px] text-center">

              <SectionLabel>
                Designed for trust
              </SectionLabel>

              <h2 className="mt-3 font-[Manrope] text-[clamp(2.1rem,4vw,3.3rem)] font-extrabold leading-[1.1] tracking-[-0.045em] text-[#0B213F]">
                Healthcare software should feel
                calm, clear and dependable.
              </h2>

              <p className="mt-4 text-[14px] leading-7 text-[#65798F]">
                SAHARA uses a medical-first
                interface where emergency actions
                are prominent without making the
                entire experience feel alarming.
              </p>
            </Reveal>

            <div className="mt-12 grid gap-5 md:grid-cols-3">

              {trustPoints.map(
                (
                  point,
                  index,
                ) => {
                  const Icon =
                    point.icon;

                  return (
                    <Reveal
                      key={
                        point.title
                      }
                      delay={
                        index *
                        0.07
                      }
                    >
                      <div className="h-full rounded-[23px] border border-[#DFE9F3] bg-white p-6 shadow-[0_14px_40px_rgba(19,50,85,0.05)]">

                        <div className="grid h-[48px] w-[48px] place-items-center rounded-[14px] bg-[#EAF4FF] text-[#1769E0]">
                          <Icon size={22} />
                        </div>

                        <h3 className="mt-5 font-[Manrope] text-[17px] font-extrabold text-[#17304D]">
                          {
                            point.title
                          }
                        </h3>

                        <p className="mt-2 text-[12.5px] leading-6 text-[#6F8195]">
                          {
                            point.description
                          }
                        </p>
                      </div>
                    </Reveal>
                  );
                },
              )}
            </div>
          </div>
        </section>

        {/* =====================================================
            HOSPITAL CTA
        ===================================================== */}

        <section className="bg-white pb-24">

          <div className="mx-auto max-w-[1240px] px-5 sm:px-8 lg:px-10">

            <div className="relative overflow-hidden rounded-[30px] bg-[radial-gradient(circle_at_10%_20%,#164D99,#0B2446_55%)] px-6 py-14 text-white shadow-[0_30px_70px_rgba(10,38,75,0.18)] sm:px-10 lg:px-14">

              <div className="absolute -right-20 -top-24 h-[280px] w-[280px] rounded-full border-[40px] border-white/5" />

              <div className="relative grid items-center gap-10 lg:grid-cols-[1.1fr_.9fr]">

                <Reveal>

                  <SectionLabel light>
                    For hospitals and providers
                  </SectionLabel>

                  <h2 className="mt-3 max-w-[670px] font-[Manrope] text-[clamp(2.1rem,4vw,3.3rem)] font-extrabold leading-[1.1] tracking-[-0.045em] text-white">
                    Connect your healthcare team
                    to the SAHARA network.
                  </h2>

                  <p className="mt-4 max-w-[620px] text-[14px] leading-7 text-blue-100/80">
                    Hospitals receive a role-based
                    operational dashboard for
                    capacity, doctors, blood
                    inventory and healthcare
                    coordination.
                  </p>

                  <Link
                    to="/signup"
                    className="mt-7 inline-flex min-h-[49px] items-center gap-2 rounded-[13px] bg-white px-5 text-[13px] font-bold text-[#0D3E81] shadow-lg"
                  >
                    Register healthcare provider

                    <ArrowRight size={17} />
                  </Link>
                </Reveal>

                <Reveal>
                  <div className="rounded-[22px] border border-white/15 bg-white/8 p-5 backdrop-blur-md">

                    <div className="mb-4 flex items-center justify-between">

                      <div>
                        <p className="text-[9px] uppercase tracking-wider text-blue-200/70">
                          Hospital operations
                        </p>

                        <p className="mt-1 text-[13px] font-bold">
                          Capacity overview
                        </p>
                      </div>

                      <Hospital
                        size={22}
                        className="text-cyan-300"
                      />
                    </div>

                    {[
                      [
                        "General Beds",
                        "34 available",
                        "70%",
                      ],

                      [
                        "ICU Capacity",
                        "4 available",
                        "42%",
                      ],

                      [
                        "Blood Inventory",
                        "51 units",
                        "60%",
                      ],
                    ].map(
                      ([
                        name,
                        info,
                        width,
                      ]) => (
                        <div
                          key={
                            name
                          }
                          className="border-t border-white/10 py-4 first:border-t-0"
                        >
                          <div className="flex items-center justify-between gap-5">

                            <span className="text-[12px] font-semibold text-blue-50">
                              {
                                name
                              }
                            </span>

                            <span className="text-[10px] font-bold text-cyan-300">
                              {
                                info
                              }
                            </span>
                          </div>

                          <div className="mt-2 h-[5px] overflow-hidden rounded-full bg-white/10">
                            <motion.div
                              initial={{
                                width:
                                  0,
                              }}
                              whileInView={{
                                width,
                              }}
                              viewport={{
                                once:
                                  true,
                              }}
                              transition={{
                                duration:
                                  0.9,
                              }}
                              className="h-full rounded-full bg-cyan-300"
                            />
                          </div>
                        </div>
                      ),
                    )}
                  </div>
                </Reveal>
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================
            FINAL CTA
        ===================================================== */}

        <section className="border-t border-[#E1EBF4] bg-[#F5FAFF] py-20">

          <div className="mx-auto max-w-[900px] px-5 text-center sm:px-8">

            <Reveal>

              <div className="mx-auto grid h-[58px] w-[58px] place-items-center rounded-[17px] bg-[#EAF4FF] text-[#1769E0]">
                <HeartPulse size={27} />
              </div>

              <h2 className="mt-6 font-[Manrope] text-[clamp(2.1rem,4vw,3.3rem)] font-extrabold leading-[1.1] tracking-[-0.045em] text-[#0B213F]">
                Healthcare should feel connected,
                not complicated.
              </h2>

              <p className="mx-auto mt-4 max-w-[680px] text-[14px] leading-7 text-[#66798F]">
                Create your SAHARA account and
                access the healthcare experience
                built for your role.
              </p>

              <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">

                <PrimaryButton to="/signup">
                  Create account

                  <ArrowRight size={18} />
                </PrimaryButton>

                <PrimaryButton
                  to="/login"
                  secondary
                >
                  Sign in
                </PrimaryButton>
              </div>
            </Reveal>
          </div>
        </section>
      </main>

      {/* =====================================================
          FOOTER
      ===================================================== */}

      <footer className="border-t border-[#E0EAF3] bg-white">

        <div className="mx-auto max-w-[1240px] px-5 py-12 sm:px-8 lg:px-10">

          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1fr]">

            <div>
              <Logo />

              <p className="mt-5 max-w-[360px] text-[12.5px] leading-6 text-[#728397]">
                SAHARA is a healthcare
                coordination platform connecting
                patients, doctors, hospitals,
                blood support and AI-guided
                healthcare navigation.
              </p>

              <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#EAF4FF] px-3 py-2 text-[10px] font-bold text-[#1769E0]">
                <MapPin size={14} />

                Built for Nepal
              </div>
            </div>

            <div>
              <h3 className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-[#8C9AAC]">
                Healthcare
              </h3>

              <div className="mt-4 flex flex-col gap-3">

                <Link
                  to="/doctor"
                  className="text-[12px] text-[#65778B] hover:text-[#1769E0]"
                >
                  Find Doctors
                </Link>

                <Link
                  to="/appointment"
                  className="text-[12px] text-[#65778B] hover:text-[#1769E0]"
                >
                  Appointments
                </Link>

                <Link
                  to="/bloodRequest"
                  className="text-[12px] text-[#65778B] hover:text-[#1769E0]"
                >
                  Blood Request
                </Link>

                <Link
                  to="/blood-donor"
                  className="text-[12px] text-[#65778B] hover:text-[#1769E0]"
                >
                  Blood Donor
                </Link>
              </div>
            </div>

            <div>
              <h3 className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-[#8C9AAC]">
                SAHARA
              </h3>

              <div className="mt-4 flex flex-col gap-3">

                <Link
                  to="/ai-bot"
                  className="text-[12px] text-[#65778B] hover:text-[#1769E0]"
                >
                  AI Navigator
                </Link>

                <Link
                  to="/dashboard"
                  className="text-[12px] text-[#65778B] hover:text-[#1769E0]"
                >
                  Dashboard
                </Link>

                <Link
                  to="/signup"
                  className="text-[12px] text-[#65778B] hover:text-[#1769E0]"
                >
                  Create Account
                </Link>

                <Link
                  to="/login"
                  className="text-[12px] text-[#65778B] hover:text-[#1769E0]"
                >
                  Sign In
                </Link>
              </div>
            </div>

            <div>
              <h3 className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-[#8C9AAC]">
                Safety
              </h3>

              <p className="mt-4 text-[11.5px] leading-6 text-[#78899B]">
                SAHARA's AI provides healthcare
                navigation and general guidance.
                It does not replace licensed
                healthcare professionals.
              </p>
            </div>
          </div>

          <div className="mt-10 flex flex-col justify-between gap-4 border-t border-[#E9EFF5] pt-6 sm:flex-row sm:items-center">

            <span className="text-[10.5px] text-[#91A0B1]">
              © {new Date().getFullYear()} SAHARA.
              Healthcare coordination platform.
            </span>

            <div className="flex items-center gap-2 text-[10.5px] font-semibold text-[#7B8B9D]">
              <ShieldCheck
                size={14}
                className="text-[#1769E0]"
              />

              Designed for safer healthcare navigation
            </div>
          </div>
        </div>
      </footer>

      {/* =====================================================
          FLOATING EMERGENCY
      ===================================================== */}

      <Link
        to="/ai-bot"
        className="group fixed bottom-5 right-5 z-[90] flex h-[58px] items-center gap-3 rounded-full bg-[#E43C4F] px-[18px] text-white shadow-[0_16px_38px_rgba(218,49,69,0.32)] transition hover:-translate-y-1 hover:bg-[#D43043]"
      >
        <motion.span
          animate={{
            scale: [
              1,
              1.5,
            ],
            opacity: [
              0.6,
              0,
            ],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
          }}
          className="absolute inset-0 rounded-full border border-[#E43C4F]"
        />

        <PhoneCall
          size={20}
          className="relative"
        />

        <span className="relative hidden text-[12px] font-bold sm:inline">
          Emergency Help
        </span>
      </Link>
    </div>
  );
};

export default Home;