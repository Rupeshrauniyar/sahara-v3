import React, { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Activity,
  Ambulance,
  ArrowLeft,
  ArrowRight,
  BedDouble,
  BriefcaseMedical,
  Building2,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Droplets,
  Eye,
  EyeOff,
  Globe2,
  HeartPulse,
  Hospital,
  LockKeyhole,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  Stethoscope,
  UserRound,
  UsersRound,
} from "lucide-react";

const days = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const bloodGroups = [
  "A+",
  "A-",
  "B+",
  "B-",
  "AB+",
  "AB-",
  "O+",
  "O-",
];

const roles = [
  {
    key: "Patient",
    title: "Patient",
    description: "Access healthcare, doctors and blood support",
    icon: UserRound,
  },
  {
    key: "Doctor",
    title: "Doctor",
    description: "Manage your professional healthcare profile",
    icon: Stethoscope,
  },
  {
    key: "Hospital",
    title: "Hospital",
    description: "Register your healthcare facility",
    icon: Hospital,
  },
];

const Signup = () => {
  const navigate = useNavigate();

  const [role, setRole] = useState("Patient");

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  const [success, setSuccess] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  // =====================================================
  // COMMON USER FIELDS
  // =====================================================

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    gender: "",
    dateOfBirth: "",
    address: "",
    city: "",
    bloodGroup: "",
  });

  // =====================================================
  // DOCTOR FIELDS
  // =====================================================

  const [doctorData, setDoctorData] = useState({
    hospital: "",
    specialization: "",
    qualification: "",
    experience: "",
    consultationFee: "",
    availableDays: [],
    startTime: "",
    endTime: "",
    isAvailable: true,
    bio: "",
  });

  // =====================================================
  // HOSPITAL FIELDS
  // =====================================================

  const [hospitalData, setHospitalData] = useState({
    name: "",
    description: "",
    phone: "",
    email: "",
    website: "",
    address: "",
    city: "",
    longitude: "",
    latitude: "",
    departments: "",
    totalBeds: 0,
    availableBeds: 0,
    icuBeds: 0,
    emergencyBeds: 0,
    emergencyAvailable: true,
    ambulanceAvailable: false,
    isOpen: true,
  });

  // =====================================================
  // CURRENT ROLE INFORMATION
  // =====================================================

  const currentRole = useMemo(
    () => roles.find((item) => item.key === role) || roles[0],
    [role],
  );

  const CurrentRoleIcon = currentRole.icon;

  // =====================================================
  // COMMON INPUT
  // =====================================================

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

  // =====================================================
  // DOCTOR INPUT
  // =====================================================

  const handleDoctorChange = (e) => {
    const { name, value } = e.target;

    setDoctorData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (error) {
      setError("");
    }
  };

  // =====================================================
  // HOSPITAL INPUT
  // =====================================================

  const handleHospitalChange = (e) => {
    const { name, value } = e.target;

    setHospitalData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (error) {
      setError("");
    }
  };

  // =====================================================
  // AVAILABLE DAYS
  // =====================================================

  const toggleDay = (day) => {
    setDoctorData((prev) => ({
      ...prev,

      availableDays: prev.availableDays.includes(day)
        ? prev.availableDays.filter((item) => item !== day)
        : [...prev.availableDays, day],
    }));
  };

  // =====================================================
  // ROLE CHANGE
  // =====================================================

  const handleRoleChange = (newRole) => {
    setRole(newRole);

    setError("");

    setSuccess("");
  };

  // =====================================================
  // SUBMIT
  // =====================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    setSuccess("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        role,

        gender: formData.gender,
        dateOfBirth: formData.dateOfBirth,
        address: formData.address,
        city: formData.city,
        bloodGroup: formData.bloodGroup,
      };

      // =================================================
      // DOCTOR PAYLOAD
      // =================================================

      if (role === "Doctor") {
        payload.doctorData = {
          specialization: doctorData.specialization,
          qualification: doctorData.qualification,
          experience: Number(doctorData.experience),
          consultationFee: Number(doctorData.consultationFee),

          availableDays: doctorData.availableDays,

          availableTime: {
            start: doctorData.startTime,
            end: doctorData.endTime,
          },

          isAvailable: doctorData.isAvailable,

          bio: doctorData.bio,
        };

        if (doctorData.hospital?.trim()) {
          payload.doctorData.hospital =
            doctorData.hospital.trim();
        }
      }

      // =================================================
      // HOSPITAL PAYLOAD
      // =================================================

      if (role === "Hospital") {
        payload.role = "HospitalAdmin";

        payload.hospitalData = {
          name: hospitalData.name,
          description: hospitalData.description,
          phone: hospitalData.phone,
          email: hospitalData.email,
          website: hospitalData.website,
          address: hospitalData.address,
          city: hospitalData.city,

          location: {
            type: "Point",

            coordinates: [
              Number(hospitalData.longitude),
              Number(hospitalData.latitude),
            ],
          },

          departments: hospitalData.departments
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean),

          beds: {
            total: Number(hospitalData.totalBeds),

            available: Number(hospitalData.availableBeds),

            icu: Number(hospitalData.icuBeds),

            emergency: Number(hospitalData.emergencyBeds),
          },

          emergencyAvailable:
            hospitalData.emergencyAvailable,

          ambulanceAvailable:
            hospitalData.ambulanceAvailable,

          isOpen: hospitalData.isOpen,
        };
      }

      const response = await fetch(
        "http://localhost:3000/api/auth/register",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify(payload),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Registration failed.",
        );
      }

      localStorage.setItem("token", data.token);

      localStorage.setItem(
        "user",
        JSON.stringify(data.user),
      );

      setSuccess(
        "Registration successful. Preparing your dashboard...",
      );

      setTimeout(() => {
        navigate("/dashboard");
      }, 1100);
    } catch (err) {
      setError(
        err.message || "Something went wrong.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5FAFF] text-[#11233E]">

      {/* ================================================= */}
      {/* TOP NAV */}
      {/* ================================================= */}

      <header className="border-b border-[#E2EBF4] bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex min-h-[72px] max-w-[1380px] items-center justify-between gap-4 px-5 sm:px-8 lg:px-10">

          <Link
            to="/"
            className="flex items-center gap-3"
          >
            <div className="grid h-10 w-10 place-items-center rounded-[13px] bg-gradient-to-br from-[#1977EA] to-[#0752B9] text-white shadow-lg shadow-blue-600/20">
              <HeartPulse size={22} />
            </div>

            <div>
              <p className="font-[Manrope] text-[17px] font-extrabold tracking-[0.05em] text-[#0B213F]">
                SAHARA
              </p>

              <p className="mt-0.5 text-[9px] text-[#91A0B1]">
                Healthcare coordination
              </p>
            </div>
          </Link>

          <div className="flex items-center gap-3">

            <span className="hidden text-[12px] text-[#78899A] sm:inline">
              Already have an account?
            </span>

            <Link
              to="/login"
              className="inline-flex min-h-[40px] items-center justify-center rounded-[11px] border border-[#D9E5F0] bg-white px-4 text-[12px] font-bold text-[#1769E0] transition hover:bg-[#F3F8FE]"
            >
              Sign in
            </Link>
          </div>
        </div>
      </header>

      {/* ================================================= */}
      {/* PAGE */}
      {/* ================================================= */}

      <main className="mx-auto grid max-w-[1380px] gap-7 px-5 py-7 sm:px-8 sm:py-10 lg:grid-cols-[360px_1fr] lg:px-10">

        {/* ================================================= */}
        {/* LEFT SIDEBAR */}
        {/* ================================================= */}

        <aside className="lg:sticky lg:top-8 lg:self-start">

          <div className="relative overflow-hidden rounded-[28px] bg-[radial-gradient(circle_at_15%_15%,rgba(65,149,255,0.35),transparent_28%),linear-gradient(145deg,#0A2548,#0E4D9D)] p-6 text-white shadow-[0_28px_65px_rgba(13,48,85,0.18)] sm:p-7">

            <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full border-[38px] border-white/5" />

            <div className="relative">

              <div className="grid h-12 w-12 place-items-center rounded-[15px] bg-white/10 text-cyan-200 ring-1 ring-white/10">
                <CurrentRoleIcon size={24} />
              </div>

              <p className="mt-6 text-[10px] font-bold uppercase tracking-[0.15em] text-cyan-200">
                Join SAHARA
              </p>

              <h1 className="mt-2 font-[Manrope] text-[30px] font-extrabold leading-[1.08] tracking-[-0.045em]">
                Create your healthcare account.
              </h1>

              <p className="mt-4 text-[13px] leading-6 text-blue-100/75">
                SAHARA gives patients, doctors and hospitals
                a dedicated healthcare experience through one
                connected platform.
              </p>

              {/* Benefits */}

              <div className="mt-7 space-y-3">

                <SidebarBenefit
                  icon={ShieldCheck}
                  text="Role-based healthcare dashboard"
                />

                <SidebarBenefit
                  icon={HeartPulse}
                  text="Healthcare services in one account"
                />

                <SidebarBenefit
                  icon={Droplets}
                  text="Blood support and coordination"
                />

                <SidebarBenefit
                  icon={Activity}
                  text="AI-assisted healthcare navigation"
                />
              </div>

              {/* Current account type */}

              <div className="mt-7 rounded-[18px] border border-white/10 bg-white/[0.08] p-4 backdrop-blur-sm">

                <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-blue-200/70">
                  Creating account for
                </p>

                <div className="mt-3 flex items-center gap-3">

                  <div className="grid h-10 w-10 place-items-center rounded-[12px] bg-white/10 text-cyan-200">
                    <CurrentRoleIcon size={19} />
                  </div>

                  <div>
                    <p className="text-[13px] font-bold">
                      {currentRole.title}
                    </p>

                    <p className="mt-0.5 text-[10px] text-blue-100/60">
                      {currentRole.description}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Security */}

          <div className="mt-4 flex items-start gap-3 rounded-[18px] border border-[#DDE8F2] bg-white p-4">

            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-[11px] bg-[#EAF8F1] text-[#159760]">
              <LockKeyhole size={17} />
            </div>

            <div>
              <p className="text-[11px] font-bold text-[#304861]">
                Protected registration
              </p>

              <p className="mt-1 text-[10px] leading-5 text-[#8190A1]">
                Account information is used to provide your
                role-specific SAHARA experience.
              </p>
            </div>
          </div>
        </aside>

        {/* ================================================= */}
        {/* FORM AREA */}
        {/* ================================================= */}

        <section className="min-w-0">

          {/* Intro */}

          <div className="mb-6">

            <Link
              to="/"
              className="mb-4 inline-flex items-center gap-2 text-[11px] font-bold text-[#6C7F93] transition hover:text-[#1769E0]"
            >
              <ArrowLeft size={15} />

              Back to homepage
            </Link>

            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">

              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-[#1769E0]">
                  Account setup
                </p>

                <h2 className="mt-2 font-[Manrope] text-[34px] font-extrabold tracking-[-0.045em] text-[#0B213F] sm:text-[40px]">
                  Get started with SAHARA.
                </h2>

                <p className="mt-2 max-w-[620px] text-[13px] leading-6 text-[#708297]">
                  Choose your account type first. The form will
                  automatically adapt to the healthcare role you
                  select.
                </p>
              </div>

              <div className="inline-flex items-center gap-2 rounded-full bg-[#EAF8F1] px-3 py-2 text-[10px] font-bold text-[#13895A]">
                <CheckCircle2 size={14} />

                Secure registration
              </div>
            </div>
          </div>

          {/* ================================================= */}
          {/* ROLE SELECTOR */}
          {/* ================================================= */}

          <div className="mb-6 grid gap-3 sm:grid-cols-3">

            {roles.map((item) => {
              const Icon = item.icon;

              const active = role === item.key;

              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() =>
                    handleRoleChange(item.key)
                  }
                  className={`group relative overflow-hidden rounded-[19px] border p-4 text-left transition-all ${
                    active
                      ? "border-[#7EB3EC] bg-[#F0F7FF] shadow-[0_12px_30px_rgba(23,105,224,0.08)]"
                      : "border-[#E0E9F2] bg-white hover:border-[#BFD5EA]"
                  }`}
                >
                  <div className="flex items-start gap-3">

                    <div
                      className={`grid h-11 w-11 shrink-0 place-items-center rounded-[13px] transition ${
                        active
                          ? "bg-[#1769E0] text-white"
                          : "bg-[#EFF5FA] text-[#657A91] group-hover:bg-[#EAF4FF] group-hover:text-[#1769E0]"
                      }`}
                    >
                      <Icon size={21} />
                    </div>

                    <div className="min-w-0">

                      <div className="flex items-center gap-2">

                        <p
                          className={`text-[13px] font-extrabold ${
                            active
                              ? "text-[#1769E0]"
                              : "text-[#29425D]"
                          }`}
                        >
                          {item.title}
                        </p>

                        {active && (
                          <Check
                            size={14}
                            className="text-[#1769E0]"
                          />
                        )}
                      </div>

                      <p className="mt-1 text-[10px] leading-4 text-[#8796A7]">
                        {item.description}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* ================================================= */}
          {/* ALERTS */}
          {/* ================================================= */}

          <AnimatePresence mode="wait">

            {error && (
              <motion.div
                key="error"
                initial={{
                  opacity: 0,
                  y: -8,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                exit={{
                  opacity: 0,
                  y: -8,
                }}
                className="mb-5 rounded-[15px] border border-red-200 bg-red-50 p-4"
              >
                <div className="flex items-start gap-3">

                  <div className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-red-100 text-[11px] font-extrabold text-red-600">
                    !
                  </div>

                  <p className="pt-1 text-[12px] leading-5 text-red-700">
                    {error}
                  </p>
                </div>
              </motion.div>
            )}

            {success && (
              <motion.div
                key="success"
                initial={{
                  opacity: 0,
                  y: -8,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                exit={{
                  opacity: 0,
                  y: -8,
                }}
                className="mb-5 rounded-[15px] border border-emerald-200 bg-emerald-50 p-4"
              >
                <div className="flex items-start gap-3">

                  <CheckCircle2
                    size={20}
                    className="mt-0.5 shrink-0 text-emerald-600"
                  />

                  <p className="text-[12px] leading-5 text-emerald-700">
                    {success}
                  </p>
                </div>
              </motion.div>
            )}

          </AnimatePresence>

          {/* ================================================= */}
          {/* FORM */}
          {/* ================================================= */}

          <form
            onSubmit={handleSubmit}
            className="space-y-6"
          >

            {/* ================================================= */}
            {/* PERSONAL INFORMATION */}
            {/* ================================================= */}

            <FormCard
              icon={UserRound}
              number="01"
              title="Personal information"
              description="Basic information for your SAHARA account."
            >

              <div className="grid gap-5 sm:grid-cols-2">

                <Input
                  icon={UserRound}
                  label="Full name"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  required
                />

                <Input
                  icon={Mail}
                  label="Email address"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  required
                />

                <Input
                  icon={Phone}
                  label="Phone number"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+977 98XXXXXXXX"
                  required
                />

                <Input
                  icon={CalendarDays}
                  label="Date of birth"
                  name="dateOfBirth"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                />

                <Select
                  label="Gender"
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  options={[
                    ["", "Select gender"],
                    ["Male", "Male"],
                    ["Female", "Female"],
                    ["Other", "Other"],
                  ]}
                />

                <Select
                  label="Blood group"
                  name="bloodGroup"
                  value={formData.bloodGroup}
                  onChange={handleChange}
                  options={[
                    ["", "Select blood group"],
                    ...bloodGroups.map((group) => [
                      group,
                      group,
                    ]),
                  ]}
                />
              </div>

              <div className="mt-5 grid gap-5 sm:grid-cols-2">

                <Input
                  icon={MapPin}
                  label="Address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Enter your address"
                />

                <Input
                  icon={Building2}
                  label="City"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="e.g. Kathmandu"
                />
              </div>
            </FormCard>

            {/* ================================================= */}
            {/* SECURITY */}
            {/* ================================================= */}

            <FormCard
              icon={LockKeyhole}
              number="02"
              title="Account security"
              description="Create a secure password for your account."
            >

              <div className="grid gap-5 sm:grid-cols-2">

                <PasswordInput
                  label="Password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Minimum 8 characters"
                  visible={showPassword}
                  onToggle={() =>
                    setShowPassword((current) => !current)
                  }
                />

                <PasswordInput
                  label="Confirm password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Repeat your password"
                  visible={showConfirmPassword}
                  onToggle={() =>
                    setShowConfirmPassword(
                      (current) => !current,
                    )
                  }
                />
              </div>

              <div className="mt-4 flex flex-wrap gap-3">

                <SecurityChip
                  valid={formData.password.length >= 8}
                  text="8+ characters"
                />

                <SecurityChip
                  valid={
                    formData.password.length > 0 &&
                    formData.password ===
                      formData.confirmPassword
                  }
                  text="Passwords match"
                />
              </div>
            </FormCard>

            {/* ================================================= */}
            {/* DOCTOR INFORMATION */}
            {/* ================================================= */}

            <AnimatePresence mode="wait">

              {role === "Doctor" && (
                <motion.div
                  key="doctor"
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
                    duration: 0.25,
                  }}
                >
                  <DoctorForm
                    data={doctorData}
                    onChange={handleDoctorChange}
                    toggleDay={toggleDay}
                  />
                </motion.div>
              )}

              {role === "Hospital" && (
                <motion.div
                  key="hospital"
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
                    duration: 0.25,
                  }}
                >
                  <HospitalForm
                    data={hospitalData}
                    onChange={handleHospitalChange}
                  />
                </motion.div>
              )}

            </AnimatePresence>

            {/* ================================================= */}
            {/* SUBMIT */}
            {/* ================================================= */}

            <div className="rounded-[22px] border border-[#DCE7F1] bg-white p-5 shadow-[0_14px_36px_rgba(16,47,81,0.04)]">

              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

                <div className="flex items-start gap-3">

                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-[12px] bg-[#EAF8F1] text-[#14965F]">
                    <ShieldCheck size={19} />
                  </div>

                  <div>
                    <p className="text-[12px] font-bold text-[#304861]">
                      Ready to join SAHARA?
                    </p>

                    <p className="mt-1 max-w-[520px] text-[10.5px] leading-5 text-[#8493A3]">
                      By creating an account, your healthcare
                      profile will be configured for the{" "}
                      <strong>
                        {role === "Hospital"
                          ? "Hospital Administrator"
                          : role}
                      </strong>{" "}
                      experience.
                    </p>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex min-h-[52px] items-center justify-center gap-2.5 rounded-[14px] bg-gradient-to-r from-[#1977EA] to-[#0D5FC7] px-7 text-[13px] font-bold text-white shadow-[0_14px_32px_rgba(23,105,224,0.22)] transition hover:-translate-y-0.5 hover:shadow-[0_18px_38px_rgba(23,105,224,0.28)] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
                >
                  {loading ? (
                    <>
                      <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/35 border-t-white" />

                      Creating account...
                    </>
                  ) : (
                    <>
                      Create{" "}
                      {role === "Hospital"
                        ? "Hospital"
                        : role}{" "}
                      Account

                      <ArrowRight size={17} />
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>

          {/* Sign in */}

          <div className="mt-7 text-center">

            <p className="text-[11px] text-[#8A99AA]">
              Already registered with SAHARA?{" "}

              <Link
                to="/login"
                className="font-bold text-[#1769E0]"
              >
                Sign in to your account
              </Link>
            </p>
          </div>
        </section>
      </main>
    </div>
  );
};

/* =========================================================
   SIDEBAR BENEFIT
========================================================= */

const SidebarBenefit = ({
  icon: Icon,
  text,
}) => (
  <div className="flex items-center gap-3">

    <div className="grid h-8 w-8 shrink-0 place-items-center rounded-[9px] bg-white/10 text-cyan-200">
      <Icon size={16} />
    </div>

    <span className="text-[11px] font-medium text-blue-50/80">
      {text}
    </span>
  </div>
);

/* =========================================================
   FORM CARD
========================================================= */

const FormCard = ({
  icon: Icon,
  number,
  title,
  description,
  children,
}) => {
  return (
    <section className="overflow-hidden rounded-[22px] border border-[#DDE8F2] bg-white shadow-[0_14px_36px_rgba(16,47,81,0.045)]">

      <div className="flex items-start gap-4 border-b border-[#EDF2F7] px-5 py-5 sm:px-6">

        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-[13px] bg-[#EAF4FF] text-[#1769E0]">
          <Icon size={20} />
        </div>

        <div className="flex-1">

          <div className="flex items-center gap-2">

            <span className="text-[9px] font-extrabold uppercase tracking-[0.12em] text-[#1769E0]">
              {number}
            </span>

            <ChevronRight
              size={12}
              className="text-[#B0BFCD]"
            />

            <span className="text-[9px] font-bold uppercase tracking-[0.1em] text-[#A1AFBD]">
              Registration
            </span>
          </div>

          <h3 className="mt-1 font-[Manrope] text-[16px] font-extrabold text-[#17304D]">
            {title}
          </h3>

          <p className="mt-1 text-[10.5px] text-[#8695A5]">
            {description}
          </p>
        </div>
      </div>

      <div className="p-5 sm:p-6">
        {children}
      </div>
    </section>
  );
};

/* =========================================================
   INPUT
========================================================= */

const Input = ({
  icon: Icon,
  label,
  name,
  value,
  onChange,
  type = "text",
  placeholder,
  required = false,
  min,
  step,
}) => {
  return (
    <div>

      <label className="mb-2 block text-[11px] font-bold text-[#50657A]">
        {label}

        {required && (
          <span className="ml-1 text-[#E43C4F]">
            *
          </span>
        )}
      </label>

      <div className="group relative">

        {Icon && (
          <Icon
            size={17}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-[#96A5B5] transition group-focus-within:text-[#1769E0]"
          />
        )}

        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          min={min}
          step={step}
          className={`h-[50px] w-full rounded-[13px] border border-[#DCE7F1] bg-[#FAFCFE] ${
            Icon
              ? "pl-11"
              : "pl-4"
          } pr-4 text-[12.5px] text-[#263E59] outline-none transition placeholder:text-[#A1ADBA] focus:border-[#1769E0] focus:bg-white focus:ring-4 focus:ring-blue-500/10`}
        />
      </div>
    </div>
  );
};

/* =========================================================
   PASSWORD INPUT
========================================================= */

const PasswordInput = ({
  label,
  name,
  value,
  onChange,
  placeholder,
  visible,
  onToggle,
}) => {
  return (
    <div>

      <label className="mb-2 block text-[11px] font-bold text-[#50657A]">
        {label}

        <span className="ml-1 text-[#E43C4F]">
          *
        </span>
      </label>

      <div className="group relative">

        <LockKeyhole
          size={17}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-[#96A5B5] transition group-focus-within:text-[#1769E0]"
        />

        <input
          type={visible ? "text" : "password"}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required
          className="h-[50px] w-full rounded-[13px] border border-[#DCE7F1] bg-[#FAFCFE] pl-11 pr-12 text-[12.5px] text-[#263E59] outline-none transition placeholder:text-[#A1ADBA] focus:border-[#1769E0] focus:bg-white focus:ring-4 focus:ring-blue-500/10"
        />

        <button
          type="button"
          onClick={onToggle}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8D9CAC] transition hover:text-[#1769E0]"
          aria-label={
            visible
              ? "Hide password"
              : "Show password"
          }
        >
          {visible ? (
            <EyeOff size={17} />
          ) : (
            <Eye size={17} />
          )}
        </button>
      </div>
    </div>
  );
};

/* =========================================================
   SELECT
========================================================= */

const Select = ({
  label,
  name,
  value,
  onChange,
  options,
}) => {
  return (
    <div>

      <label className="mb-2 block text-[11px] font-bold text-[#50657A]">
        {label}
      </label>

      <select
        name={name}
        value={value}
        onChange={onChange}
        className="h-[50px] w-full rounded-[13px] border border-[#DCE7F1] bg-[#FAFCFE] px-4 text-[12.5px] text-[#263E59] outline-none transition focus:border-[#1769E0] focus:bg-white focus:ring-4 focus:ring-blue-500/10"
      >
        {options.map(([optionValue, optionLabel]) => (
          <option
            key={optionValue}
            value={optionValue}
          >
            {optionLabel}
          </option>
        ))}
      </select>
    </div>
  );
};

/* =========================================================
   SECURITY CHIP
========================================================= */

const SecurityChip = ({
  valid,
  text,
}) => (
  <span
    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[9.5px] font-bold ${
      valid
        ? "bg-[#EAF8F1] text-[#15915E]"
        : "bg-[#F2F5F8] text-[#8C9AAA]"
    }`}
  >
    <Check size={12} />

    {text}
  </span>
);

/* =========================================================
   DOCTOR FORM
========================================================= */

const DoctorForm = ({
  data,
  onChange,
  toggleDay,
}) => {
  return (
    <FormCard
      icon={Stethoscope}
      number="03"
      title="Doctor information"
      description="Set up your professional healthcare profile."
    >

      <div className="grid gap-5 sm:grid-cols-2">

        <Input
          icon={Hospital}
          label="Hospital ID (optional)"
          name="hospital"
          value={data.hospital}
          onChange={onChange}
          placeholder="Enter hospital ID if available"
        />

        <Input
          icon={BriefcaseMedical}
          label="Specialization"
          name="specialization"
          value={data.specialization}
          onChange={onChange}
          placeholder="e.g. Cardiologist"
          required
        />

        <Input
          label="Qualification"
          name="qualification"
          value={data.qualification}
          onChange={onChange}
          placeholder="e.g. MBBS, MD"
          required
        />

        <Input
          label="Experience (years)"
          name="experience"
          type="number"
          min="0"
          value={data.experience}
          onChange={onChange}
          placeholder="5"
          required
        />

        <Input
          label="Consultation fee"
          name="consultationFee"
          type="number"
          min="0"
          value={data.consultationFee}
          onChange={onChange}
          placeholder="500"
          required
        />
      </div>

      {/* Days */}

      <div className="mt-7">

        <label className="mb-3 flex items-center gap-2 text-[11px] font-bold text-[#50657A]">

          <CalendarDays
            size={16}
            className="text-[#1769E0]"
          />

          Available days
        </label>

        <div className="flex flex-wrap gap-2">

          {days.map((day) => {
            const active =
              data.availableDays.includes(day);

            return (
              <button
                key={day}
                type="button"
                onClick={() =>
                  toggleDay(day)
                }
                className={`rounded-[10px] border px-3.5 py-2 text-[10px] font-bold transition ${
                  active
                    ? "border-[#1769E0] bg-[#1769E0] text-white"
                    : "border-[#DCE7F1] bg-[#FAFCFE] text-[#65798F] hover:border-[#A8C8E8]"
                }`}
              >
                {day.slice(0, 3)}
              </button>
            );
          })}
        </div>
      </div>

      {/* Time */}

      <div className="mt-6 grid gap-5 sm:grid-cols-2">

        <Input
          icon={Clock3}
          label="Available from"
          name="startTime"
          type="time"
          value={data.startTime}
          onChange={onChange}
        />

        <Input
          icon={Clock3}
          label="Available until"
          name="endTime"
          type="time"
          value={data.endTime}
          onChange={onChange}
        />
      </div>

      {/* Availability */}

      <div className="mt-6">

        <ToggleCard
          icon={Activity}
          title="Currently accepting patients"
          description="Show your profile as available for consultations."
          checked={data.isAvailable}
          onChange={(value) =>
            onChange({
              target: {
                name: "isAvailable",
                value,
              },
            })
          }
        />
      </div>

      {/* Bio */}

      <div className="mt-6">

        <label className="mb-2 block text-[11px] font-bold text-[#50657A]">
          Professional bio
        </label>

        <textarea
          name="bio"
          value={data.bio}
          onChange={onChange}
          rows="4"
          maxLength="1000"
          placeholder="Tell patients about your professional experience..."
          className="w-full resize-none rounded-[13px] border border-[#DCE7F1] bg-[#FAFCFE] px-4 py-3 text-[12.5px] leading-6 text-[#263E59] outline-none transition placeholder:text-[#A1ADBA] focus:border-[#1769E0] focus:bg-white focus:ring-4 focus:ring-blue-500/10"
        />

        <p className="mt-1 text-right text-[9px] text-[#A0ACB8]">
          {data.bio.length}/1000
        </p>
      </div>
    </FormCard>
  );
};

/* =========================================================
   HOSPITAL FORM
========================================================= */

const HospitalForm = ({
  data,
  onChange,
}) => {
  return (
    <div className="space-y-6">

      <FormCard
        icon={Hospital}
        number="03"
        title="Hospital information"
        description="Tell SAHARA about your healthcare facility."
      >

        <Input
          icon={Hospital}
          label="Hospital name"
          name="name"
          value={data.name}
          onChange={onChange}
          placeholder="e.g. Sahara City Hospital"
          required
        />

        <div className="mt-5 grid gap-5 sm:grid-cols-2">

          <Input
            icon={Phone}
            label="Hospital phone"
            name="phone"
            value={data.phone}
            onChange={onChange}
            placeholder="+977 98XXXXXXXX"
            required
          />

          <Input
            icon={Mail}
            label="Hospital email"
            name="email"
            type="email"
            value={data.email}
            onChange={onChange}
            placeholder="hospital@example.com"
            required
          />

          <Input
            icon={Globe2}
            label="Website"
            name="website"
            value={data.website}
            onChange={onChange}
            placeholder="https://example.com"
          />

          <Input
            icon={Building2}
            label="City"
            name="city"
            value={data.city}
            onChange={onChange}
            placeholder="e.g. Kathmandu"
            required
          />
        </div>

        <div className="mt-5">

          <Input
            icon={MapPin}
            label="Hospital address"
            name="address"
            value={data.address}
            onChange={onChange}
            placeholder="Full hospital address"
            required
          />
        </div>

        {/* Description */}

        <div className="mt-5">

          <label className="mb-2 block text-[11px] font-bold text-[#50657A]">
            Hospital description
          </label>

          <textarea
            name="description"
            value={data.description}
            onChange={onChange}
            rows="4"
            maxLength="1000"
            placeholder="Describe your hospital and services..."
            className="w-full resize-none rounded-[13px] border border-[#DCE7F1] bg-[#FAFCFE] px-4 py-3 text-[12.5px] leading-6 text-[#263E59] outline-none transition placeholder:text-[#A1ADBA] focus:border-[#1769E0] focus:bg-white focus:ring-4 focus:ring-blue-500/10"
          />
        </div>
      </FormCard>

      {/* ================================================= */}
      {/* LOCATION */}
      {/* ================================================= */}

      <FormCard
        icon={MapPin}
        number="04"
        title="Hospital location"
        description="Coordinates are stored as longitude followed by latitude."
      >

        <div className="grid gap-5 sm:grid-cols-2">

          <Input
            label="Longitude"
            name="longitude"
            type="number"
            step="any"
            value={data.longitude}
            onChange={onChange}
            placeholder="e.g. 85.3240"
            required
          />

          <Input
            label="Latitude"
            name="latitude"
            type="number"
            step="any"
            value={data.latitude}
            onChange={onChange}
            placeholder="e.g. 27.7172"
            required
          />
        </div>

        <div className="mt-4 rounded-[13px] border border-[#DDE8F2] bg-[#F6FAFE] p-3">

          <div className="flex gap-2">

            <MapPin
              size={15}
              className="mt-0.5 shrink-0 text-[#1769E0]"
            />

            <p className="text-[10px] leading-5 text-[#78899B]">
              SAHARA stores hospital location using GeoJSON
              coordinates in the format{" "}
              <strong>[longitude, latitude]</strong>.
            </p>
          </div>
        </div>
      </FormCard>

      {/* ================================================= */}
      {/* DEPARTMENTS AND BEDS */}
      {/* ================================================= */}

      <FormCard
        icon={BedDouble}
        number="05"
        title="Departments and capacity"
        description="Add operational information for the hospital."
      >

        <Input
          icon={BriefcaseMedical}
          label="Departments"
          name="departments"
          value={data.departments}
          onChange={onChange}
          placeholder="Cardiology, Emergency, Orthopedics"
        />

        <p className="mt-2 text-[9.5px] text-[#99A6B4]">
          Separate each department using a comma.
        </p>

        <div className="mt-6">

          <label className="mb-3 flex items-center gap-2 text-[11px] font-bold text-[#50657A]">

            <BedDouble
              size={16}
              className="text-[#1769E0]"
            />

            Bed information
          </label>

          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">

            <MiniNumberInput
              label="Total"
              name="totalBeds"
              value={data.totalBeds}
              onChange={onChange}
            />

            <MiniNumberInput
              label="Available"
              name="availableBeds"
              value={data.availableBeds}
              onChange={onChange}
            />

            <MiniNumberInput
              label="ICU"
              name="icuBeds"
              value={data.icuBeds}
              onChange={onChange}
            />

            <MiniNumberInput
              label="Emergency"
              name="emergencyBeds"
              value={data.emergencyBeds}
              onChange={onChange}
            />
          </div>
        </div>
      </FormCard>

      {/* ================================================= */}
      {/* SERVICES */}
      {/* ================================================= */}

      <FormCard
        icon={Activity}
        number="06"
        title="Hospital services"
        description="Select which operational services are currently available."
      >

        <div className="grid gap-4 md:grid-cols-3">

          <ToggleCard
            icon={Activity}
            title="Emergency"
            description="Emergency department available"
            checked={data.emergencyAvailable}
            onChange={(value) =>
              onChange({
                target: {
                  name: "emergencyAvailable",
                  value,
                },
              })
            }
          />

          <ToggleCard
            icon={Ambulance}
            title="Ambulance"
            description="Ambulance service available"
            checked={data.ambulanceAvailable}
            onChange={(value) =>
              onChange({
                target: {
                  name: "ambulanceAvailable",
                  value,
                },
              })
            }
          />

          <ToggleCard
            icon={Hospital}
            title="Currently open"
            description="Hospital is currently operating"
            checked={data.isOpen}
            onChange={(value) =>
              onChange({
                target: {
                  name: "isOpen",
                  value,
                },
              })
            }
          />
        </div>
      </FormCard>
    </div>
  );
};

/* =========================================================
   MINI NUMBER INPUT
========================================================= */

const MiniNumberInput = ({
  label,
  name,
  value,
  onChange,
}) => (
  <div className="rounded-[14px] border border-[#E1EAF3] bg-[#F9FCFE] p-3">

    <label className="block text-[9px] font-bold uppercase tracking-[0.08em] text-[#8D9BAB]">
      {label}
    </label>

    <input
      type="number"
      min="0"
      name={name}
      value={value}
      onChange={onChange}
      className="mt-2 w-full border-none bg-transparent p-0 text-[18px] font-extrabold text-[#243C57] outline-none"
    />
  </div>
);

/* =========================================================
   TOGGLE CARD
========================================================= */

const ToggleCard = ({
  icon: Icon,
  title,
  description,
  checked,
  onChange,
}) => {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`flex w-full items-center gap-3 rounded-[15px] border p-4 text-left transition ${
        checked
          ? "border-[#A9CCE9] bg-[#F0F7FF]"
          : "border-[#E1EAF3] bg-[#FAFCFE]"
      }`}
    >

      <div
        className={`grid h-10 w-10 shrink-0 place-items-center rounded-[11px] ${
          checked
            ? "bg-[#1769E0] text-white"
            : "bg-[#EDF3F8] text-[#72869B]"
        }`}
      >
        <Icon size={18} />
      </div>

      <div className="min-w-0 flex-1">

        <p className="text-[11px] font-bold text-[#304861]">
          {title}
        </p>

        <p className="mt-1 text-[9px] leading-4 text-[#8C9AAA]">
          {description}
        </p>
      </div>

      <span
        className={`relative h-6 w-11 shrink-0 rounded-full transition ${
          checked
            ? "bg-[#1769E0]"
            : "bg-[#CCD6E0]"
        }`}
      >
        <span
          className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition-all ${
            checked
              ? "left-6"
              : "left-1"
          }`}
        />
      </span>
    </button>
  );
};

export default Signup;