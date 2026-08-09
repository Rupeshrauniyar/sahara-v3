import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import {
  AnimatePresence,
  motion,
} from "framer-motion";

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
  ChevronDown,
  ChevronRight,
  Clock3,
  Droplets,
  Eye,
  EyeOff,
  Globe2,
  HeartPulse,
  Hospital,
  LoaderCircle,
  LockKeyhole,
  Mail,
  Phone,
  ShieldCheck,
  Stethoscope,
  UserRound,
} from "lucide-react";

import saharaLogo from "../assets/sahara-logo.png";

/* =========================================================
   API
========================================================= */

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:3000/api";

/* =========================================================
   CONSTANTS
========================================================= */

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
    description:
      "Appointments, blood support and healthcare services",
    icon: UserRound,
  },

  {
    key: "Doctor",
    title: "Doctor",
    description:
      "Professional healthcare profile and consultations",
    icon: Stethoscope,
  },

  {
    key: "Hospital",
    title: "Hospital",
    description:
      "Register and manage your healthcare facility",
    icon: Hospital,
  },
];

/* =========================================================
   SIGNUP
========================================================= */

const Signup = () => {
  const navigate = useNavigate();

  const [role, setRole] =
    useState("Patient");

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const [
    showPassword,
    setShowPassword,
  ] = useState(false);

  const [
    showConfirmPassword,
    setShowConfirmPassword,
  ] = useState(false);

  /* =====================================================
     HOSPITAL LIST FOR DOCTOR SIGNUP
  ===================================================== */

  const [hospitals, setHospitals] =
    useState([]);

  const [
    hospitalsLoading,
    setHospitalsLoading,
  ] = useState(false);

  const [
    hospitalsError,
    setHospitalsError,
  ] = useState("");

  /* =====================================================
     COMMON ACCOUNT DATA
  ===================================================== */

  const [formData, setFormData] =
    useState({
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

  /* =====================================================
     DOCTOR DATA
  ===================================================== */

  const [doctorData, setDoctorData] =
    useState({
      practiceType: "Independent",
      hospital: "",
      specialization: "",
      qualification: "",
      experience: "",
      consultationFee: "",
      virtualConsultationFee: "",
      availableDays: [],
      startTime: "",
      endTime: "",
      isAvailable: true,
      bio: "",
    });

  /* =====================================================
     HOSPITAL DATA
  ===================================================== */

  const [
    hospitalData,
    setHospitalData,
  ] = useState({
    name: "",
    description: "",
    phone: "",
    email: "",
    website: "",
    address: "",
    city: "",
    departments: "",

    totalBeds: 0,
    availableBeds: 0,
    icuBeds: 0,
    emergencyBeds: 0,

    emergencyAvailable: true,
    ambulanceAvailable: false,
    isOpen: true,
  });

  /* =====================================================
     CURRENT ROLE
  ===================================================== */

  const currentRole = useMemo(
    () =>
      roles.find(
        (item) =>
          item.key === role,
      ) || roles[0],
    [role],
  );

  const CurrentRoleIcon =
    currentRole.icon;

  const isHospital =
    role === "Hospital";

  /* =====================================================
     LOAD REGISTERED HOSPITALS
  ===================================================== */

  const loadHospitals =
    async () => {
      setHospitalsLoading(true);
      setHospitalsError("");

      try {
        const response =
          await fetch(
            `${API_URL}/hospitals`,
          );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Unable to load hospitals.",
          );
        }

        setHospitals(
          Array.isArray(
            data.hospitals,
          )
            ? data.hospitals
            : [],
        );
      } catch (loadError) {
        console.error(
          "Hospital loading error:",
          loadError,
        );

        setHospitals([]);

        setHospitalsError(
          loadError.message ||
            "Unable to load hospitals.",
        );
      } finally {
        setHospitalsLoading(false);
      }
    };

  useEffect(() => {
    loadHospitals();
  }, []);

  /* =====================================================
     COMMON CHANGE
  ===================================================== */

  const handleChange = (e) => {
    const {
      name,
      value,
    } = e.target;

    setFormData(
      (previous) => ({
        ...previous,
        [name]: value,
      }),
    );

    if (error) {
      setError("");
    }
  };

  /* =====================================================
     DOCTOR CHANGE
  ===================================================== */

  const handleDoctorChange = (
    e,
  ) => {
    const {
      name,
      value,
    } = e.target;

    setDoctorData(
      (previous) => ({
        ...previous,
        [name]: value,
      }),
    );

    if (error) {
      setError("");
    }
  };

  /* =====================================================
     HOSPITAL CHANGE
  ===================================================== */

  const handleHospitalChange = (
    e,
  ) => {
    const {
      name,
      value,
    } = e.target;

    setHospitalData(
      (previous) => ({
        ...previous,
        [name]: value,
      }),
    );

    if (error) {
      setError("");
    }
  };

  /* =====================================================
     PRACTICE TYPE
  ===================================================== */

  const handlePracticeTypeChange = (
    practiceType,
  ) => {
    setDoctorData(
      (previous) => ({
        ...previous,

        practiceType,

        hospital:
          practiceType ===
          "Independent"
            ? ""
            : previous.hospital,
      }),
    );

    setError("");
  };

  /* =====================================================
     AVAILABLE DAYS
  ===================================================== */

  const toggleDay = (day) => {
    setDoctorData(
      (previous) => ({
        ...previous,

        availableDays:
          previous.availableDays.includes(
            day,
          )
            ? previous.availableDays.filter(
                (item) =>
                  item !== day,
              )
            : [
                ...previous.availableDays,
                day,
              ],
      }),
    );
  };

  /* =====================================================
     ROLE CHANGE
  ===================================================== */

  const handleRoleChange = (
    nextRole,
  ) => {
    setRole(nextRole);
    setError("");
    setSuccess("");
  };

  /* =====================================================
     VALIDATION
  ===================================================== */

  const validateForm = () => {
    if (
      !formData.fullName.trim() ||
      !formData.email.trim() ||
      !formData.phone.trim() ||
      !formData.password
    ) {
      setError(
        isHospital
          ? "Administrator name, email, phone and password are required."
          : "Full name, email, phone and password are required.",
      );

      return false;
    }

    if (
      formData.password !==
      formData.confirmPassword
    ) {
      setError(
        "Passwords do not match.",
      );

      return false;
    }

    if (
      formData.password.length < 8
    ) {
      setError(
        "Password must be at least 8 characters long.",
      );

      return false;
    }

    if (
      role === "Doctor"
    ) {
      if (
        !doctorData.specialization.trim() ||
        !doctorData.qualification.trim() ||
        doctorData.experience === "" ||
        doctorData.consultationFee === ""
      ) {
        setError(
          "Doctor specialization, qualification, experience and consultation fee are required.",
        );

        return false;
      }

      if (
        doctorData.practiceType ===
          "Hospital" &&
        !doctorData.hospital
      ) {
        setError(
          "Please select the hospital where you practice.",
        );

        return false;
      }
    }

    if (
      role === "Hospital"
    ) {
      if (
        !hospitalData.name.trim() ||
        !hospitalData.phone.trim() ||
        !hospitalData.email.trim() ||
        !hospitalData.address.trim() ||
        !hospitalData.city.trim()
      ) {
        setError(
          "Hospital name, phone, email, address and city are required.",
        );

        return false;
      }
    }

    return true;
  };

  /* =====================================================
     SUBMIT
  ===================================================== */

  const handleSubmit = async (
    e,
  ) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      /* =================================================
         BASE USER PAYLOAD
      ================================================= */

      const payload = {
        fullName:
          formData.fullName.trim(),

        email:
          formData.email
            .trim()
            .toLowerCase(),

        phone:
          formData.phone.trim(),

        password:
          formData.password,

        role:
          role === "Hospital"
            ? "HospitalAdmin"
            : role,
      };

      /* =================================================
         PATIENT / DOCTOR PERSONAL INFORMATION ONLY

         Hospital accounts intentionally do NOT send
         patient-style fields such as bloodGroup,
         DOB, gender or personal address.
      ================================================= */

      if (
        role === "Patient" ||
        role === "Doctor"
      ) {
        payload.gender =
          formData.gender ||
          undefined;

        payload.dateOfBirth =
          formData.dateOfBirth ||
          undefined;

        payload.address =
          formData.address.trim() ||
          undefined;

        payload.city =
          formData.city.trim() ||
          undefined;

        payload.bloodGroup =
          formData.bloodGroup ||
          undefined;
      }

      /* =================================================
         DOCTOR
      ================================================= */

      if (
        role === "Doctor"
      ) {
        payload.doctorData = {
          practiceType:
            doctorData.practiceType,

          specialization:
            doctorData.specialization.trim(),

          qualification:
            doctorData.qualification.trim(),

          experience:
            Number(
              doctorData.experience,
            ),

          consultationFee:
            Number(
              doctorData.consultationFee,
            ),

          availableDays:
            doctorData.availableDays,

          availableTime: {
            start:
              doctorData.startTime,

            end:
              doctorData.endTime,
          },

          isAvailable:
            doctorData.isAvailable,

          bio:
            doctorData.bio.trim(),
        };

        if (
          doctorData.practiceType ===
            "Hospital" &&
          doctorData.hospital
        ) {
          payload.doctorData.hospital =
            doctorData.hospital;
        }

        if (
          doctorData.virtualConsultationFee !==
          ""
        ) {
          payload.doctorData.virtualConsultationFee =
            Number(
              doctorData.virtualConsultationFee,
            );
        }
      }

      /* =================================================
         HOSPITAL
      ================================================= */

      if (
        role === "Hospital"
      ) {
        payload.hospitalData = {
          name:
            hospitalData.name.trim(),

          description:
            hospitalData.description.trim(),

          phone:
            hospitalData.phone.trim(),

          email:
            hospitalData.email
              .trim()
              .toLowerCase(),

          website:
            hospitalData.website.trim(),

          address:
            hospitalData.address.trim(),

          city:
            hospitalData.city.trim(),

          departments:
            hospitalData.departments
              .split(",")
              .map((item) =>
                item.trim(),
              )
              .filter(Boolean),

          beds: {
            total:
              Number(
                hospitalData.totalBeds,
              ),

            available:
              Number(
                hospitalData.availableBeds,
              ),

            icu:
              Number(
                hospitalData.icuBeds,
              ),

            emergency:
              Number(
                hospitalData.emergencyBeds,
              ),
          },

          emergencyAvailable:
            hospitalData.emergencyAvailable,

          ambulanceAvailable:
            hospitalData.ambulanceAvailable,

          isOpen:
            hospitalData.isOpen,
        };
      }

      /* =================================================
         REQUEST
      ================================================= */

      const response =
        await fetch(
          `${API_URL}/auth/register`,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify(
                payload,
              ),
          },
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Registration failed.",
        );
      }

      localStorage.setItem(
        "token",
        data.token,
      );

      localStorage.setItem(
        "user",
        JSON.stringify(
          data.user,
        ),
      );

      if (data.profile) {
        localStorage.setItem(
          "profile",
          JSON.stringify(
            data.profile,
          ),
        );
      } else {
        localStorage.removeItem(
          "profile",
        );
      }

      setSuccess(
        "Registration successful. Preparing your SAHARA dashboard...",
      );

      setTimeout(() => {
        navigate(
          "/dashboard",
          {
            replace: true,
          },
        );
      }, 900);
    } catch (
      registrationError
    ) {
      setError(
        registrationError.message ||
          "Something went wrong during registration.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F6F9FE] text-[#11233E]">

      {/* =================================================
          NAVBAR
      ================================================= */}

      <header className="border-b border-[#E2E9F2] bg-white/95 backdrop-blur-xl">

        <div className="mx-auto flex min-h-[76px] max-w-[1380px] items-center justify-between gap-4 px-5 sm:px-8 lg:px-10">

          <Link
            to="/"
            aria-label="Return to SAHARA home"
            className="flex items-center"
          >
            <img
              src={saharaLogo}
              alt="SAHARA"
              className="h-[47px] w-auto max-w-[180px] object-contain"
            />
          </Link>

          <div className="flex items-center gap-3">

            <span className="hidden text-[11px] font-medium text-[#78899A] sm:inline">
              Already registered?
            </span>

            <Link
              to="/login"
              className="inline-flex min-h-[40px] items-center justify-center rounded-[11px] border border-[#D9E5F0] bg-white px-4 text-[11px] font-extrabold !text-[#1717E8] transition hover:bg-[#F3F6FF]"
            >
              <span className="!text-[#1717E8]">
                Sign in
              </span>
            </Link>
          </div>
        </div>
      </header>

      {/* =================================================
          PAGE
      ================================================= */}

      <main className="mx-auto grid max-w-[1380px] gap-7 px-5 py-7 sm:px-8 sm:py-10 lg:grid-cols-[350px_1fr] lg:px-10">

        {/* =================================================
            SIDEBAR
        ================================================= */}

        <aside className="lg:sticky lg:top-8 lg:self-start">

          <div className="relative overflow-hidden rounded-[28px] bg-[radial-gradient(circle_at_15%_15%,rgba(65,149,255,0.25),transparent_28%),linear-gradient(145deg,#0C2B50,#164B87)] p-6 text-white shadow-[0_28px_65px_rgba(13,48,85,0.15)] sm:p-7">

            <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full border-[38px] border-white/5" />

            <div className="relative">

              <div className="grid h-12 w-12 place-items-center rounded-[15px] bg-white/10 text-cyan-200 ring-1 ring-white/10">

                <CurrentRoleIcon
                  size={24}
                />
              </div>

              <p className="mt-6 text-[9px] font-extrabold uppercase tracking-[0.15em] !text-cyan-200">
                Join SAHARA
              </p>

              <h1 className="mt-2 font-[Manrope] text-[29px] font-extrabold leading-[1.08] tracking-[-0.045em] !text-white">
                {role === "Hospital"
                  ? "Connect your healthcare facility."
                  : "Create your healthcare account."}
              </h1>

              <p className="mt-4 text-[12px] leading-6 !text-blue-100">
                {role === "Hospital"
                  ? "Create an administrator account and register your hospital with SAHARA's healthcare network."
                  : "Patients and doctors receive dedicated tools while remaining connected through the SAHARA healthcare platform."}
              </p>

              <div className="mt-7 space-y-3">

                <SidebarBenefit
                  icon={ShieldCheck}
                  text="Role-based healthcare access"
                />

                <SidebarBenefit
                  icon={HeartPulse}
                  text="Connected medical services"
                />

                <SidebarBenefit
                  icon={Droplets}
                  text="Blood support network"
                />

                <SidebarBenefit
                  icon={Activity}
                  text="SAHARA AI navigation"
                />
              </div>

              <div className="mt-7 rounded-[18px] border border-white/10 bg-white/[0.08] p-4">

                <p className="text-[8px] font-extrabold uppercase tracking-[0.12em] !text-blue-200">
                  Registering as
                </p>

                <div className="mt-3 flex items-center gap-3">

                  <div className="grid h-10 w-10 place-items-center rounded-[12px] bg-white/10 text-cyan-200">

                    <CurrentRoleIcon
                      size={19}
                    />
                  </div>

                  <div>
                    <p className="text-[12px] font-extrabold !text-white">
                      {currentRole.title}
                    </p>

                    <p className="mt-0.5 text-[9px] leading-4 !text-blue-100">
                      {
                        currentRole.description
                      }
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 flex items-start gap-3 rounded-[18px] border border-[#DDE8F2] bg-white p-4">

            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-[11px] bg-[#EAF8F1] text-[#159760]">
              <LockKeyhole
                size={17}
              />
            </div>

            <div>
              <p className="text-[10.5px] font-extrabold text-[#304861]">
                Protected registration
              </p>

              <p className="mt-1 text-[9px] leading-5 text-[#8190A1]">
                Your account is securely registered using SAHARA's authenticated backend.
              </p>
            </div>
          </div>
        </aside>

        {/* =================================================
            FORM AREA
        ================================================= */}

        <section className="min-w-0">

          <div className="mb-6">

            <Link
              to="/"
              className="mb-4 inline-flex items-center gap-2 text-[10px] font-extrabold !text-[#6C7F93] transition hover:!text-[#1717E8]"
            >
              <ArrowLeft
                size={15}
              />

              <span>
                Back to homepage
              </span>
            </Link>

            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">

              <div>
                <p className="text-[9px] font-extrabold uppercase tracking-[0.14em] text-[#1717E8]">
                  Account setup
                </p>

                <h2 className="mt-2 font-[Manrope] text-[33px] font-extrabold tracking-[-0.045em] text-[#0B213F] sm:text-[39px]">
                  {role === "Hospital"
                    ? "Register your hospital."
                    : "Get started with SAHARA."}
                </h2>

                <p className="mt-2 max-w-[650px] text-[12px] leading-6 text-[#708297]">
                  {role === "Hospital"
                    ? "Create the hospital administrator account first, then provide your healthcare facility information."
                    : "Select your healthcare role and complete the information required for your account."}
                </p>
              </div>

              <div className="inline-flex items-center gap-2 self-start rounded-full bg-[#EAF8F1] px-3 py-2 text-[9px] font-extrabold text-[#13895A] sm:self-auto">

                <CheckCircle2
                  size={14}
                />

                Backend connected
              </div>
            </div>
          </div>

          {/* =================================================
              ROLE SELECTOR
          ================================================= */}

          <div className="mb-6 grid gap-3 sm:grid-cols-3">

            {roles.map(
              (item) => {
                const Icon =
                  item.icon;

                const active =
                  role ===
                  item.key;

                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() =>
                      handleRoleChange(
                        item.key,
                      )
                    }
                    className={`group relative overflow-hidden rounded-[19px] border p-4 text-left transition-all ${
                      active
                        ? "border-[#819BFF] bg-[#F0F3FF] shadow-[0_12px_30px_rgba(23,23,232,0.07)]"
                        : "border-[#E0E9F2] bg-white hover:border-[#BFD0E5]"
                    }`}
                  >

                    <div className="flex items-start gap-3">

                      <div
                        className={`grid h-11 w-11 shrink-0 place-items-center rounded-[13px] transition ${
                          active
                            ? "bg-[#1717E8] text-white"
                            : "bg-[#EFF4F8] text-[#657A91] group-hover:bg-[#EEF2FF] group-hover:text-[#1717E8]"
                        }`}
                      >
                        <Icon
                          size={21}
                        />
                      </div>

                      <div className="min-w-0">

                        <div className="flex items-center gap-2">

                          <p
                            className={`text-[12px] font-extrabold ${
                              active
                                ? "!text-[#1717E8]"
                                : "!text-[#29425D]"
                            }`}
                          >
                            {
                              item.title
                            }
                          </p>

                          {active && (
                            <Check
                              size={14}
                              className="text-[#1717E8]"
                            />
                          )}
                        </div>

                        <p className="mt-1 text-[9px] leading-4 text-[#8796A7]">
                          {
                            item.description
                          }
                        </p>
                      </div>
                    </div>
                  </button>
                );
              },
            )}
          </div>

          {/* =================================================
              ALERTS
          ================================================= */}

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
                }}
                className="mb-5 rounded-[15px] border border-red-200 bg-red-50 p-4"
              >
                <p className="text-[11px] leading-5 text-red-700">
                  {error}
                </p>
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
                className="mb-5 flex items-center gap-3 rounded-[15px] border border-emerald-200 bg-emerald-50 p-4"
              >

                <CheckCircle2
                  size={18}
                  className="text-emerald-600"
                />

                <p className="text-[11px] text-emerald-700">
                  {success}
                </p>
              </motion.div>
            )}

          </AnimatePresence>

          <form
            onSubmit={handleSubmit}
            className="space-y-6"
          >

            {/* =================================================
                ACCOUNT / PERSONAL INFORMATION
            ================================================= */}

            <FormCard
              icon={
                role === "Hospital"
                  ? ShieldCheck
                  : UserRound
              }
              number="01"
              title={
                role === "Hospital"
                  ? "Hospital administrator account"
                  : "Personal information"
              }
              description={
                role === "Hospital"
                  ? "Contact details for the person who will manage this hospital on SAHARA."
                  : "Basic information for your SAHARA account."
              }
            >

              <div className="grid gap-5 sm:grid-cols-2">

                <Input
                  icon={UserRound}
                  label={
                    role === "Hospital"
                      ? "Administrator name"
                      : "Full name"
                  }
                  name="fullName"
                  value={
                    formData.fullName
                  }
                  onChange={
                    handleChange
                  }
                  placeholder={
                    role === "Hospital"
                      ? "Enter administrator name"
                      : "Enter your full name"
                  }
                  required
                />

                <Input
                  icon={Mail}
                  label={
                    role === "Hospital"
                      ? "Administrator email"
                      : "Email address"
                  }
                  name="email"
                  type="email"
                  value={
                    formData.email
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="you@example.com"
                  required
                />

                <Input
                  icon={Phone}
                  label={
                    role === "Hospital"
                      ? "Administrator phone"
                      : "Phone number"
                  }
                  name="phone"
                  value={
                    formData.phone
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="+977 98XXXXXXXX"
                  required
                />

                {/* =========================================
                    THESE FIELDS ARE NOT SHOWN FOR HOSPITAL
                ========================================= */}

                {!isHospital && (
                  <>
                    <Input
                      icon={CalendarDays}
                      label="Date of birth"
                      name="dateOfBirth"
                      type="date"
                      value={
                        formData.dateOfBirth
                      }
                      onChange={
                        handleChange
                      }
                    />

                    <Select
                      label="Gender"
                      name="gender"
                      value={
                        formData.gender
                      }
                      onChange={
                        handleChange
                      }
                      options={[
                        {
                          value: "",
                          label:
                            "Select gender",
                        },

                        {
                          value:
                            "Male",
                          label:
                            "Male",
                        },

                        {
                          value:
                            "Female",
                          label:
                            "Female",
                        },

                        {
                          value:
                            "Other",
                          label:
                            "Other",
                        },
                      ]}
                    />

                    <Select
                      label="Blood group"
                      name="bloodGroup"
                      value={
                        formData.bloodGroup
                      }
                      onChange={
                        handleChange
                      }
                      options={[
                        {
                          value: "",
                          label:
                            "Select blood group",
                        },

                        ...bloodGroups.map(
                          (
                            group,
                          ) => ({
                            value:
                              group,

                            label:
                              group,
                          }),
                        ),
                      ]}
                    />

                    <Input
                      icon={Building2}
                      label="Address"
                      name="address"
                      value={
                        formData.address
                      }
                      onChange={
                        handleChange
                      }
                      placeholder="Enter your address"
                    />

                    <Input
                      icon={Building2}
                      label="City"
                      name="city"
                      value={
                        formData.city
                      }
                      onChange={
                        handleChange
                      }
                      placeholder="e.g. Kathmandu"
                    />
                  </>
                )}
              </div>

              {isHospital && (
                <div className="mt-5 flex items-start gap-3 rounded-[15px] border border-[#DDE4FF] bg-[#F4F6FF] p-4">

                  <ShieldCheck
                    size={18}
                    className="mt-0.5 shrink-0 text-[#1717E8]"
                  />

                  <div>
                    <p className="text-[10px] font-extrabold text-[#304861]">
                      This is only the administrator account
                    </p>

                    <p className="mt-1 text-[9px] leading-5 text-[#7C8FA3]">
                      Hospital location, city, departments, beds and services are entered separately below. We do not ask the administrator for blood group, gender or date of birth.
                    </p>
                  </div>
                </div>
              )}
            </FormCard>

            {/* =================================================
                PASSWORD
            ================================================= */}

            <FormCard
              icon={LockKeyhole}
              number="02"
              title="Account security"
              description={
                role === "Hospital"
                  ? "Create the password used by the hospital administrator."
                  : "Create a secure password for your account."
              }
            >

              <div className="grid gap-5 sm:grid-cols-2">

                <PasswordInput
                  label="Password"
                  name="password"
                  value={
                    formData.password
                  }
                  onChange={
                    handleChange
                  }
                  visible={
                    showPassword
                  }
                  onToggle={() =>
                    setShowPassword(
                      (value) =>
                        !value,
                    )
                  }
                  placeholder="Minimum 8 characters"
                />

                <PasswordInput
                  label="Confirm password"
                  name="confirmPassword"
                  value={
                    formData.confirmPassword
                  }
                  onChange={
                    handleChange
                  }
                  visible={
                    showConfirmPassword
                  }
                  onToggle={() =>
                    setShowConfirmPassword(
                      (value) =>
                        !value,
                    )
                  }
                  placeholder="Repeat password"
                />
              </div>

              <div className="mt-4 flex flex-wrap gap-3">

                <SecurityChip
                  valid={
                    formData.password
                      .length >= 8
                  }
                  text="8+ characters"
                />

                <SecurityChip
                  valid={
                    formData.password
                      .length > 0 &&
                    formData.password ===
                      formData.confirmPassword
                  }
                  text="Passwords match"
                />
              </div>
            </FormCard>

            {/* =================================================
                DOCTOR / HOSPITAL
            ================================================= */}

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
                >
                  <DoctorForm
                    data={
                      doctorData
                    }
                    hospitals={
                      hospitals
                    }
                    hospitalsLoading={
                      hospitalsLoading
                    }
                    hospitalsError={
                      hospitalsError
                    }
                    onChange={
                      handleDoctorChange
                    }
                    onPracticeTypeChange={
                      handlePracticeTypeChange
                    }
                    onRetryHospitals={
                      loadHospitals
                    }
                    toggleDay={
                      toggleDay
                    }
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
                >
                  <HospitalForm
                    data={
                      hospitalData
                    }
                    onChange={
                      handleHospitalChange
                    }
                  />
                </motion.div>
              )}

            </AnimatePresence>

            {/* =================================================
                SUBMIT
            ================================================= */}

            <div className="rounded-[22px] border border-[#DCE7F1] bg-white p-5 shadow-[0_14px_36px_rgba(16,47,81,0.04)]">

              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

                <div className="flex items-start gap-3">

                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-[12px] bg-[#EAF8F1] text-[#14965F]">
                    <ShieldCheck
                      size={19}
                    />
                  </div>

                  <div>
                    <p className="text-[11px] font-extrabold text-[#304861]">
                      Ready to join SAHARA?
                    </p>

                    <p className="mt-1 text-[9px] leading-5 text-[#8493A3]">
                      Your account will be registered as{" "}
                      <strong>
                        {role === "Hospital"
                          ? "Hospital Administrator"
                          : role}
                      </strong>
                      .
                    </p>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex min-h-[52px] items-center justify-center gap-2.5 rounded-[14px] bg-[#1717E8] px-7 text-[11px] font-extrabold !text-white shadow-[0_14px_32px_rgba(23,23,232,0.20)] transition hover:-translate-y-0.5 hover:bg-[#1010C9] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <LoaderCircle
                        size={18}
                        className="animate-spin text-white"
                      />

                      <span className="!text-white">
                        Creating account...
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="!text-white">
                        {role === "Hospital"
                          ? "Register Hospital"
                          : "Create Account"}
                      </span>

                      <ArrowRight
                        size={17}
                        className="text-white"
                      />
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
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

    <span className="text-[10px] font-semibold !text-blue-50">
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
}) => (
  <section className="overflow-hidden rounded-[22px] border border-[#DDE8F2] bg-white shadow-[0_14px_36px_rgba(16,47,81,0.045)]">

    <div className="flex items-start gap-4 border-b border-[#EDF2F7] px-5 py-5 sm:px-6">

      <div className="grid h-11 w-11 shrink-0 place-items-center rounded-[13px] bg-[#EEF2FF] text-[#1717E8]">
        <Icon size={20} />
      </div>

      <div>
        <div className="flex items-center gap-2">

          <span className="text-[8px] font-extrabold uppercase tracking-[0.12em] text-[#1717E8]">
            {number}
          </span>

          <ChevronRight
            size={12}
            className="text-[#B0BFCD]"
          />

          <span className="text-[8px] font-bold uppercase tracking-[0.1em] text-[#A1AFBD]">
            Registration
          </span>
        </div>

        <h3 className="mt-1 font-[Manrope] text-[15px] font-extrabold text-[#17304D]">
          {title}
        </h3>

        <p className="mt-1 text-[9.5px] leading-5 text-[#8695A5]">
          {description}
        </p>
      </div>
    </div>

    <div className="p-5 sm:p-6">
      {children}
    </div>
  </section>
);

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
}) => (
  <div>

    <label className="mb-2 block text-[10px] font-extrabold text-[#50657A]">
      {label}

      {required && (
        <span className="ml-1 text-red-500">
          *
        </span>
      )}
    </label>

    <div className="group relative">

      {Icon && (
        <Icon
          size={17}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-[#96A5B5] group-focus-within:text-[#1717E8]"
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
        className={`h-[50px] w-full rounded-[13px] border border-[#DCE7F1] bg-[#FAFCFE] ${
          Icon
            ? "pl-11"
            : "pl-4"
        } pr-4 text-[12px] text-[#263E59] outline-none transition placeholder:text-[#A1ADBA] focus:border-[#1717E8] focus:bg-white focus:ring-4 focus:ring-[#1717E8]/10`}
      />
    </div>
  </div>
);

/* =========================================================
   PASSWORD
========================================================= */

const PasswordInput = ({
  label,
  name,
  value,
  onChange,
  placeholder,
  visible,
  onToggle,
}) => (
  <div>

    <label className="mb-2 block text-[10px] font-extrabold text-[#50657A]">
      {label}

      <span className="ml-1 text-red-500">
        *
      </span>
    </label>

    <div className="relative">

      <LockKeyhole
        size={17}
        className="absolute left-4 top-1/2 -translate-y-1/2 text-[#96A5B5]"
      />

      <input
        type={
          visible
            ? "text"
            : "password"
        }
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required
        className="h-[50px] w-full rounded-[13px] border border-[#DCE7F1] bg-[#FAFCFE] pl-11 pr-12 text-[12px] text-[#263E59] outline-none transition focus:border-[#1717E8] focus:bg-white focus:ring-4 focus:ring-[#1717E8]/10"
      />

      <button
        type="button"
        onClick={onToggle}
        className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8D9CAC] hover:text-[#1717E8]"
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

/* =========================================================
   SELECT
========================================================= */

const Select = ({
  label,
  name,
  value,
  onChange,
  options,
  required = false,
  disabled = false,
}) => (
  <div>

    <label className="mb-2 block text-[10px] font-extrabold text-[#50657A]">
      {label}

      {required && (
        <span className="ml-1 text-red-500">
          *
        </span>
      )}
    </label>

    <div className="relative">

      <select
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        disabled={disabled}
        className="h-[50px] w-full appearance-none rounded-[13px] border border-[#DCE7F1] bg-[#FAFCFE] px-4 pr-11 text-[12px] text-[#263E59] outline-none transition focus:border-[#1717E8] focus:bg-white focus:ring-4 focus:ring-[#1717E8]/10 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {options.map(
          (option) => (
            <option
              key={option.value}
              value={option.value}
            >
              {option.label}
            </option>
          ),
        )}
      </select>

      <ChevronDown
        size={16}
        className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#8D9CAC]"
      />
    </div>
  </div>
);

/* =========================================================
   SECURITY CHIP
========================================================= */

const SecurityChip = ({
  valid,
  text,
}) => (
  <span
    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[9px] font-extrabold ${
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
  hospitals,
  hospitalsLoading,
  hospitalsError,
  onChange,
  onPracticeTypeChange,
  onRetryHospitals,
  toggleDay,
}) => (
  <FormCard
    icon={Stethoscope}
    number="03"
    title="Doctor information"
    description="Create your professional healthcare profile."
  >

    <div className="mb-6">

      <label className="mb-3 block text-[10px] font-extrabold text-[#50657A]">
        Practice type
      </label>

      <div className="grid gap-3 sm:grid-cols-2">

        {[
          {
            value:
              "Independent",

            label:
              "Independent Doctor",

            description:
              "Practice independently without linking a hospital.",
          },

          {
            value:
              "Hospital",

            label:
              "Hospital Doctor",

            description:
              "Link your profile with a registered hospital.",
          },
        ].map((item) => {
          const active =
            data.practiceType ===
            item.value;

          return (
            <button
              key={item.value}
              type="button"
              onClick={() =>
                onPracticeTypeChange(
                  item.value,
                )
              }
              className={`rounded-[14px] border p-4 text-left transition ${
                active
                  ? "border-[#819BFF] bg-[#F0F3FF]"
                  : "border-[#DFE8F1] bg-[#FAFCFE]"
              }`}
            >

              <div className="flex items-start justify-between gap-3">

                <div>
                  <p
                    className={`text-[10.5px] font-extrabold ${
                      active
                        ? "!text-[#1717E8]"
                        : "!text-[#50657A]"
                    }`}
                  >
                    {item.label}
                  </p>

                  <p className="mt-1 text-[8.5px] leading-4 text-[#91A0AE]">
                    {
                      item.description
                    }
                  </p>
                </div>

                {active && (
                  <div className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-[#1717E8] text-white">

                    <Check
                      size={11}
                      strokeWidth={3}
                    />
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>

    <AnimatePresence>

      {data.practiceType ===
        "Hospital" && (
        <motion.div
          initial={{
            opacity: 0,
            height: 0,
          }}
          animate={{
            opacity: 1,
            height: "auto",
          }}
          exit={{
            opacity: 0,
            height: 0,
          }}
          className="mb-6 overflow-hidden"
        >

          <div className="rounded-[17px] border border-[#DCE7F1] bg-[#F7FBFF] p-4">

            <div className="mb-4 flex items-start gap-3">

              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-[12px] bg-[#EEF2FF] text-[#1717E8]">
                <Hospital size={18} />
              </div>

              <div>
                <p className="text-[10.5px] font-extrabold text-[#304861]">
                  Select your hospital
                </p>

                <p className="mt-1 text-[9px] leading-5 text-[#8191A1]">
                  Choose the registered hospital where you currently practice.
                </p>
              </div>
            </div>

            {hospitalsLoading ? (
              <div className="flex min-h-[50px] items-center gap-3 rounded-[13px] border border-[#DCE7F1] bg-white px-4">

                <LoaderCircle
                  size={17}
                  className="animate-spin text-[#1717E8]"
                />

                <span className="text-[10px] font-semibold text-[#718398]">
                  Loading registered hospitals...
                </span>
              </div>
            ) : hospitalsError ? (
              <div className="rounded-[13px] border border-red-200 bg-red-50 p-4">

                <p className="text-[9px] leading-5 text-red-700">
                  {hospitalsError}
                </p>

                <button
                  type="button"
                  onClick={
                    onRetryHospitals
                  }
                  className="mt-3 rounded-[9px] bg-white px-3 py-2 text-[9px] font-extrabold text-red-600 shadow-sm"
                >
                  Try Again
                </button>
              </div>
            ) : hospitals.length ===
              0 ? (
              <div className="rounded-[13px] border border-amber-200 bg-amber-50 p-4">

                <p className="text-[9.5px] font-semibold text-amber-800">
                  No registered hospitals found.
                </p>

                <p className="mt-1 text-[8.5px] leading-5 text-amber-700">
                  A hospital must register before a doctor can link their profile to it.
                </p>
              </div>
            ) : (
              <>
                <Select
                  label="Hospital"
                  name="hospital"
                  value={
                    data.hospital
                  }
                  onChange={
                    onChange
                  }
                  required
                  options={[
                    {
                      value: "",
                      label:
                        "Select your hospital",
                    },

                    ...hospitals.map(
                      (
                        hospital,
                      ) => ({
                        value:
                          hospital._id,

                        label: `${
                          hospital.name ||
                          "Hospital"
                        }${
                          hospital.city
                            ? ` — ${hospital.city}`
                            : ""
                        }`,
                      }),
                    ),
                  ]}
                />

                {data.hospital && (
                  <SelectedHospital
                    hospital={hospitals.find(
                      (
                        hospital,
                      ) =>
                        String(
                          hospital._id,
                        ) ===
                        String(
                          data.hospital,
                        ),
                    )}
                  />
                )}
              </>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>

    <div className="grid gap-5 sm:grid-cols-2">

      <Input
        icon={BriefcaseMedical}
        label="Specialization"
        name="specialization"
        value={
          data.specialization
        }
        onChange={onChange}
        placeholder="e.g. Cardiology"
        required
      />

      <Input
        label="Qualification"
        name="qualification"
        value={
          data.qualification
        }
        onChange={onChange}
        placeholder="e.g. MBBS, MD"
        required
      />

      <Input
        label="Experience (years)"
        name="experience"
        type="number"
        min="0"
        value={
          data.experience
        }
        onChange={onChange}
        placeholder="5"
        required
      />

      <Input
        label="Physical consultation fee"
        name="consultationFee"
        type="number"
        min="0"
        value={
          data.consultationFee
        }
        onChange={onChange}
        placeholder="500"
        required
      />

      <Input
        label="Virtual consultation fee"
        name="virtualConsultationFee"
        type="number"
        min="0"
        value={
          data.virtualConsultationFee
        }
        onChange={onChange}
        placeholder="Optional"
      />
    </div>

    <div className="mt-7">

      <label className="mb-3 flex items-center gap-2 text-[10px] font-extrabold text-[#50657A]">

        <CalendarDays
          size={16}
          className="text-[#1717E8]"
        />

        Available days
      </label>

      <div className="flex flex-wrap gap-2">

        {days.map((day) => {
          const active =
            data.availableDays.includes(
              day,
            );

          return (
            <button
              key={day}
              type="button"
              onClick={() =>
                toggleDay(day)
              }
              className={`rounded-[10px] border px-3.5 py-2 text-[9px] font-extrabold transition ${
                active
                  ? "border-[#1717E8] bg-[#1717E8] !text-white"
                  : "border-[#DCE7F1] bg-[#FAFCFE] text-[#65798F]"
              }`}
            >
              <span
                className={
                  active
                    ? "!text-white"
                    : ""
                }
              >
                {day.slice(0, 3)}
              </span>
            </button>
          );
        })}
      </div>
    </div>

    <div className="mt-6 grid gap-5 sm:grid-cols-2">

      <Input
        icon={Clock3}
        label="Available from"
        name="startTime"
        type="time"
        value={
          data.startTime
        }
        onChange={onChange}
      />

      <Input
        icon={Clock3}
        label="Available until"
        name="endTime"
        type="time"
        value={
          data.endTime
        }
        onChange={onChange}
      />
    </div>

    <div className="mt-6">

      <ToggleCard
        icon={Activity}
        title="Accepting appointments"
        description="Show your doctor profile as available."
        checked={
          data.isAvailable
        }
        onChange={(value) =>
          onChange({
            target: {
              name:
                "isAvailable",

              value,
            },
          })
        }
      />
    </div>

    <div className="mt-6">

      <label className="mb-2 block text-[10px] font-extrabold text-[#50657A]">
        Professional bio
      </label>

      <textarea
        name="bio"
        value={data.bio}
        onChange={onChange}
        rows="4"
        maxLength="1000"
        placeholder="Tell patients about your experience..."
        className="w-full resize-none rounded-[13px] border border-[#DCE7F1] bg-[#FAFCFE] px-4 py-3 text-[12px] leading-6 text-[#263E59] outline-none transition focus:border-[#1717E8] focus:bg-white focus:ring-4 focus:ring-[#1717E8]/10"
      />
    </div>
  </FormCard>
);

/* =========================================================
   SELECTED HOSPITAL
========================================================= */

const SelectedHospital = ({
  hospital,
}) => {
  if (!hospital) {
    return null;
  }

  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 5,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      className="mt-3 flex items-start gap-3 rounded-[13px] border border-[#D8E7F5] bg-white p-3"
    >

      <div className="grid h-9 w-9 shrink-0 place-items-center rounded-[10px] bg-[#EEF2FF] text-[#1717E8]">
        <Hospital size={16} />
      </div>

      <div className="min-w-0 flex-1">

        <div className="flex items-center gap-2">

          <p className="truncate text-[10px] font-extrabold text-[#304861]">
            {hospital.name}
          </p>

          <CheckCircle2
            size={13}
            className="shrink-0 text-[#15955F]"
          />
        </div>

        <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-[8.5px] text-[#8191A1]">

          {hospital.city && (
            <span>
              {hospital.city}
            </span>
          )}

          {hospital.address && (
            <span>
              {hospital.address}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
};

/* =========================================================
   HOSPITAL FORM
========================================================= */

const HospitalForm = ({
  data,
  onChange,
}) => (
  <div className="space-y-6">

    <FormCard
      icon={Hospital}
      number="03"
      title="Hospital information"
      description="Information about the healthcare facility itself."
    >

      <Input
        icon={Hospital}
        label="Hospital name"
        name="name"
        value={data.name}
        onChange={onChange}
        placeholder="Enter hospital name"
        required
      />

      <div className="mt-5 grid gap-5 sm:grid-cols-2">

        <Input
          icon={Phone}
          label="Hospital phone"
          name="phone"
          value={
            data.phone
          }
          onChange={
            onChange
          }
          placeholder="+977 01-XXXXXXX"
          required
        />

        <Input
          icon={Mail}
          label="Hospital email"
          name="email"
          type="email"
          value={
            data.email
          }
          onChange={
            onChange
          }
          placeholder="hospital@example.com"
          required
        />

        <Input
          icon={Globe2}
          label="Website"
          name="website"
          value={
            data.website
          }
          onChange={
            onChange
          }
          placeholder="https://example.com"
        />

        <Input
          icon={Building2}
          label="City"
          name="city"
          value={
            data.city
          }
          onChange={
            onChange
          }
          placeholder="e.g. Kathmandu"
          required
        />

        <Input
          icon={Building2}
          label="Hospital address"
          name="address"
          value={
            data.address
          }
          onChange={
            onChange
          }
          placeholder="Enter hospital location"
          required
        />
      </div>

      <div className="mt-5">

        <label className="mb-2 block text-[10px] font-extrabold text-[#50657A]">
          Hospital description
        </label>

        <textarea
          name="description"
          value={
            data.description
          }
          onChange={
            onChange
          }
          rows="4"
          maxLength="1000"
          placeholder="Briefly describe the hospital and its services..."
          className="w-full resize-none rounded-[13px] border border-[#DCE7F1] bg-[#FAFCFE] px-4 py-3 text-[12px] leading-6 text-[#263E59] outline-none transition focus:border-[#1717E8] focus:bg-white focus:ring-4 focus:ring-[#1717E8]/10"
        />
      </div>
    </FormCard>

    <FormCard
      icon={BedDouble}
      number="04"
      title="Departments and capacity"
      description="Hospital departments and current bed capacity."
    >

      <Input
        icon={BriefcaseMedical}
        label="Departments"
        name="departments"
        value={
          data.departments
        }
        onChange={
          onChange
        }
        placeholder="Emergency, Cardiology, Orthopedics"
      />

      <p className="mt-2 text-[8.5px] text-[#99A6B4]">
        Separate department names with commas.
      </p>

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">

        <MiniNumberInput
          label="Total beds"
          name="totalBeds"
          value={
            data.totalBeds
          }
          onChange={
            onChange
          }
        />

        <MiniNumberInput
          label="Available"
          name="availableBeds"
          value={
            data.availableBeds
          }
          onChange={
            onChange
          }
        />

        <MiniNumberInput
          label="ICU"
          name="icuBeds"
          value={
            data.icuBeds
          }
          onChange={
            onChange
          }
        />

        <MiniNumberInput
          label="Emergency"
          name="emergencyBeds"
          value={
            data.emergencyBeds
          }
          onChange={
            onChange
          }
        />
      </div>
    </FormCard>

    <FormCard
      icon={Activity}
      number="05"
      title="Hospital services"
      description="Choose which services your facility currently provides."
    >

      <div className="grid gap-4 md:grid-cols-3">

        <ToggleCard
          icon={Activity}
          title="Emergency"
          description="Emergency care is available"
          checked={
            data.emergencyAvailable
          }
          onChange={(value) =>
            onChange({
              target: {
                name:
                  "emergencyAvailable",

                value,
              },
            })
          }
        />

        <ToggleCard
          icon={Ambulance}
          title="Ambulance"
          description="Ambulance service is available"
          checked={
            data.ambulanceAvailable
          }
          onChange={(value) =>
            onChange({
              target: {
                name:
                  "ambulanceAvailable",

                value,
              },
            })
          }
        />

        <ToggleCard
          icon={Hospital}
          title="Hospital open"
          description="Facility is currently operating"
          checked={
            data.isOpen
          }
          onChange={(value) =>
            onChange({
              target: {
                name:
                  "isOpen",

                value,
              },
            })
          }
        />
      </div>
    </FormCard>
  </div>
);

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

    <label className="block text-[8px] font-extrabold uppercase tracking-[0.08em] text-[#8D9BAB]">
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
   TOGGLE
========================================================= */

const ToggleCard = ({
  icon: Icon,
  title,
  description,
  checked,
  onChange,
}) => (
  <button
    type="button"
    onClick={() =>
      onChange(!checked)
    }
    className={`flex w-full items-center gap-3 rounded-[15px] border p-4 text-left transition ${
      checked
        ? "border-[#A9B9FF] bg-[#F0F3FF]"
        : "border-[#E1EAF3] bg-[#FAFCFE]"
    }`}
  >

    <div
      className={`grid h-10 w-10 shrink-0 place-items-center rounded-[11px] ${
        checked
          ? "bg-[#1717E8] text-white"
          : "bg-[#EDF3F8] text-[#72869B]"
      }`}
    >
      <Icon size={18} />
    </div>

    <div className="min-w-0 flex-1">

      <p className="text-[10px] font-extrabold text-[#304861]">
        {title}
      </p>

      <p className="mt-1 text-[8.5px] leading-4 text-[#8C9AAA]">
        {description}
      </p>
    </div>

    <span
      className={`relative h-6 w-11 shrink-0 rounded-full transition ${
        checked
          ? "bg-[#1717E8]"
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

export default Signup;