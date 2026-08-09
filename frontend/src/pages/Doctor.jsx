import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";

import {
  Activity,
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Building2,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  CircleDollarSign,
  Clock3,
  Filter,
  GraduationCap,
  HeartPulse,
  Hospital,
  LoaderCircle,
  MapPin,
  RefreshCw,
  Search,
  Sparkles,
  Star,
  Stethoscope,
  UserRound,
  Video,
  X,
} from "lucide-react";

import saharaLogo from "../assets/sahara-logo.png";

/* =========================================================
   API
========================================================= */

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:3000/api";

/* =========================================================
   HELPERS
========================================================= */

const getToken = () =>
  localStorage.getItem("token") ||
  sessionStorage.getItem("token");

const getStoredUser = () => {
  try {
    const raw =
      localStorage.getItem("user") ||
      sessionStorage.getItem("user");

    return raw
      ? JSON.parse(raw)
      : null;
  } catch {
    return null;
  }
};

const getInitials = (name) => {
  if (!name) {
    return "DR";
  }

  return name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
};

const formatFee = (value) => {
  const number =
    Number(value || 0);

  return `Rs. ${number.toLocaleString()}`;
};

const normalizeDoctors = (data) => {
  if (
    Array.isArray(data?.doctors)
  ) {
    return data.doctors;
  }

  if (
    Array.isArray(data?.data)
  ) {
    return data.data;
  }

  return [];
};

/* =========================================================
   DOCTOR PAGE
========================================================= */

const Doctor = () => {
  const navigate =
    useNavigate();

  const location =
    useLocation();

  const [doctors, setDoctors] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [
    searchTerm,
    setSearchTerm,
  ] = useState("");

  const [
    specializationFilter,
    setSpecializationFilter,
  ] = useState("");

  const [
    practiceTypeFilter,
    setPracticeTypeFilter,
  ] = useState("");

  const [
    availabilityFilter,
    setAvailabilityFilter,
  ] = useState("");

  const [
    cityFilter,
    setCityFilter,
  ] = useState("");

  const [
    filtersOpen,
    setFiltersOpen,
  ] = useState(false);

  const [
    selectedDoctor,
    setSelectedDoctor,
  ] = useState(null);

  const [
    doctorDetailsLoading,
    setDoctorDetailsLoading,
  ] = useState(false);

  const user =
    getStoredUser();

  /* =====================================================
     LOAD DOCTORS
  ===================================================== */

  const loadDoctors =
    async () => {
      const token =
        getToken();

      setLoading(true);
      setError("");

      if (!token) {
        setDoctors([]);
        setLoading(false);

        setError(
          "Please sign in to view available doctors.",
        );

        return;
      }

      try {
        const params =
          new URLSearchParams();

        if (
          specializationFilter
        ) {
          params.set(
            "specialization",
            specializationFilter,
          );
        }

        if (practiceTypeFilter) {
          params.set(
            "practiceType",
            practiceTypeFilter,
          );
        }

        if (availabilityFilter) {
          params.set(
            "available",
            availabilityFilter,
          );
        }

        if (cityFilter.trim()) {
          params.set(
            "city",
            cityFilter.trim(),
          );
        }

        params.set(
          "limit",
          "100",
        );

        const query =
          params.toString();

        const response =
          await fetch(
            `${API_URL}/doctors${
              query
                ? `?${query}`
                : ""
            }`,
            {
              headers: {
                Authorization:
                  `Bearer ${token}`,
              },
            },
          );

        const data =
          await response.json();

        if (!response.ok) {
          if (
            response.status ===
            401
          ) {
            throw new Error(
              "Your session has expired. Please sign in again.",
            );
          }

          throw new Error(
            data?.message ||
              "Unable to load doctors.",
          );
        }

        setDoctors(
          normalizeDoctors(data),
        );
      } catch (loadError) {
        console.error(
          "Doctor loading error:",
          loadError,
        );

        setDoctors([]);

        setError(
          loadError.message ||
            "Unable to load doctors.",
        );
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    loadDoctors();
  }, [
    specializationFilter,
    practiceTypeFilter,
    availabilityFilter,
  ]);

  /* =====================================================
     LOAD ONE DOCTOR
  ===================================================== */

  const openDoctor =
    async (doctor) => {
      if (!doctor?._id) {
        setSelectedDoctor(
          doctor,
        );

        return;
      }

      setSelectedDoctor(
        doctor,
      );

      setDoctorDetailsLoading(
        true,
      );

      try {
        const token =
          getToken();

        const response =
          await fetch(
            `${API_URL}/doctors/${doctor._id}`,
            {
              headers: {
                Authorization:
                  `Bearer ${token}`,
              },
            },
          );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data?.message ||
              "Unable to load doctor details.",
          );
        }

        setSelectedDoctor(
          data?.doctor ||
            doctor,
        );
      } catch (detailsError) {
        console.error(
          "Doctor detail error:",
          detailsError,
        );

        /*
          Keep the doctor card data in the
          modal even if the detailed request fails.
        */
      } finally {
        setDoctorDetailsLoading(
          false,
        );
      }
    };

  /* =====================================================
     BOOK DOCTOR
  ===================================================== */

  const bookDoctor = (
    doctor,
  ) => {
    if (!doctor?._id) {
      return;
    }

    navigate(
      "/appointment",
      {
        state: {
          selectedDoctor:
            doctor,
        },
      },
    );
  };

  /* =====================================================
     SPECIALIZATIONS
  ===================================================== */

  const specializations =
    useMemo(() => {
      const values =
        doctors
          .map(
            (doctor) =>
              doctor.specialization,
          )
          .filter(Boolean);

      return [
        ...new Set(values),
      ].sort();
    }, [doctors]);

  /* =====================================================
     CLIENT SEARCH
  ===================================================== */

  const filteredDoctors =
    useMemo(() => {
      const query =
        searchTerm
          .trim()
          .toLowerCase();

      return doctors.filter(
        (doctor) => {
          const doctorName =
            doctor.user
              ?.fullName ||
            doctor.fullName ||
            "";

          const specialization =
            doctor.specialization ||
            "";

          const qualification =
            doctor.qualification ||
            "";

          const hospitalName =
            doctor.hospital
              ?.name ||
            "";

          const hospitalCity =
            doctor.hospital
              ?.city ||
            "";

          const practiceType =
            doctor.practiceType ||
            "";

          if (!query) {
            return true;
          }

          return [
            doctorName,
            specialization,
            qualification,
            hospitalName,
            hospitalCity,
            practiceType,
          ].some((value) =>
            String(value)
              .toLowerCase()
              .includes(query),
          );
        },
      );
    }, [
      doctors,
      searchTerm,
    ]);

  /* =====================================================
     RESET FILTERS
  ===================================================== */

  const resetFilters = () => {
    setSearchTerm("");
    setSpecializationFilter("");
    setPracticeTypeFilter("");
    setAvailabilityFilter("");
    setCityFilter("");
  };

  const hasFilters =
    searchTerm ||
    specializationFilter ||
    practiceTypeFilter ||
    availabilityFilter ||
    cityFilter;

  /* =====================================================
     RENDER
  ===================================================== */

  return (
    <div className="min-h-screen bg-[#F7F9FD] text-[#10233F]">

      {/* =================================================
          NAVBAR
      ================================================= */}

      <header className="sticky top-0 z-40 border-b border-[#E1E8F1] bg-white/95 backdrop-blur-xl">

        <div className="mx-auto flex min-h-[76px] max-w-[1440px] items-center justify-between gap-4 px-5 sm:px-8 lg:px-10">

          <Link
            to="/"
            aria-label="Return to SAHARA home"
            className="flex shrink-0 items-center"
          >
            <img
              src={saharaLogo}
              alt="SAHARA"
              className="h-[47px] w-auto max-w-[180px] object-contain"
            />
          </Link>

          <div className="flex items-center gap-2 sm:gap-3">

            {user && (
              <Link
                to="/dashboard"
                className="hidden min-h-[40px] items-center gap-2 rounded-[11px] border border-[#DFE6EF] bg-white px-4 text-[10px] font-extrabold !text-[#536B83] transition hover:border-[#C8D4E1] hover:bg-[#F8FAFD] hover:!text-[#1717E8] sm:inline-flex"
              >
                <span>
                  Dashboard
                </span>
              </Link>
            )}

            <Link
              to="/ai-bot"
              className="inline-flex min-h-[40px] items-center gap-2 rounded-[11px] bg-[#EEF2FF] px-4 text-[10px] font-extrabold !text-[#1717E8] transition hover:bg-[#E5E9FF]"
            >
              <Sparkles
                size={15}
              />

              <span className="hidden !text-[#1717E8] sm:inline">
                SAHARA AI
              </span>
            </Link>
          </div>
        </div>
      </header>

      {/* =================================================
          HERO
      ================================================= */}

      <section className="relative overflow-hidden border-b border-[#E4EAF2] bg-[radial-gradient(circle_at_78%_22%,rgba(23,23,232,0.07),transparent_27%),linear-gradient(135deg,#FFFFFF,#F1F5FF)]">

        <div className="mx-auto grid max-w-[1440px] gap-10 px-5 py-12 sm:px-8 sm:py-16 lg:grid-cols-[1fr_0.55fr] lg:items-center lg:px-10">

          <div>

            <Link
              to="/"
              className="inline-flex items-center gap-2 text-[10px] font-extrabold !text-[#72859A] transition hover:!text-[#1717E8]"
            >
              <ArrowLeft
                size={14}
              />

              <span>
                Back to home
              </span>
            </Link>

            <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-[#D8DFFF] bg-white px-3 py-2 shadow-sm">

              <Stethoscope
                size={14}
                className="text-[#1717E8]"
              />

              <span className="text-[9px] font-extrabold uppercase tracking-[0.14em] text-[#1717E8]">
                Doctor Network
              </span>
            </div>

            <h1 className="mt-5 max-w-[760px] font-[Manrope] text-[38px] font-extrabold leading-[1.05] tracking-[-0.05em] text-[#102846] sm:text-[51px]">

              Find the right doctor
              <span className="block text-[#1717E8]">
                for your healthcare needs.
              </span>
            </h1>

            <p className="mt-5 max-w-[650px] text-[12px] leading-6 text-[#6E8195] sm:text-[13px]">

              Browse registered doctors by specialization,
              practice type, hospital and availability.
              Review their professional information before
              booking an appointment.
            </p>
          </div>

          {/* HERO SUMMARY */}

          <div className="grid grid-cols-2 gap-3">

            <HeroMetric
              value={
                doctors.length
              }
              label="Doctors"
              icon={Stethoscope}
            />

            <HeroMetric
              value={
                specializations.length
              }
              label="Specialties"
              icon={HeartPulse}
            />

            <HeroMetric
              value={
                doctors.filter(
                  (doctor) =>
                    doctor.isAvailable,
                ).length
              }
              label="Available"
              icon={Activity}
              green
            />

            <HeroMetric
              value={
                doctors.filter(
                  (doctor) =>
                    doctor.practiceType ===
                    "Hospital",
                ).length
              }
              label="Hospital Doctors"
              icon={Hospital}
            />
          </div>
        </div>
      </section>

      {/* =================================================
          MAIN
      ================================================= */}

      <main className="mx-auto max-w-[1440px] px-5 py-8 sm:px-8 lg:px-10 lg:py-10">

        {/* =================================================
            SEARCH
        ================================================= */}

        <section className="rounded-[22px] border border-[#DFE7F0] bg-white p-4 shadow-[0_12px_32px_rgba(24,48,78,0.045)] sm:p-5">

          <div className="flex flex-col gap-3 lg:flex-row">

            <div className="relative flex-1">

              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-[#91A1B1]"
              />

              <input
                value={
                  searchTerm
                }
                onChange={(event) =>
                  setSearchTerm(
                    event.target
                      .value,
                  )
                }
                placeholder="Search doctor, specialty, qualification, hospital..."
                className="h-[52px] w-full rounded-[14px] border border-[#DBE5EF] bg-[#F9FBFD] pl-12 pr-4 text-[12px] font-medium text-[#2C435D] outline-none transition placeholder:text-[#9BA8B6] focus:border-[#1717E8] focus:bg-white focus:ring-4 focus:ring-[#1717E8]/10"
              />
            </div>

            <div className="flex gap-2">

              <button
                type="button"
                onClick={() =>
                  setFiltersOpen(
                    (value) =>
                      !value,
                  )
                }
                className={`inline-flex min-h-[52px] items-center gap-2 rounded-[14px] border px-4 text-[10px] font-extrabold transition ${
                  filtersOpen ||
                  hasFilters
                    ? "border-[#BBC7FF] bg-[#F1F3FF] !text-[#1717E8]"
                    : "border-[#DBE5EF] bg-white !text-[#526A82]"
                }`}
              >
                <Filter
                  size={15}
                />

                <span
                  className={
                    filtersOpen ||
                    hasFilters
                      ? "!text-[#1717E8]"
                      : "!text-[#526A82]"
                  }
                >
                  Filters
                </span>

                <ChevronDown
                  size={14}
                  className={`transition ${
                    filtersOpen
                      ? "rotate-180"
                      : ""
                  }`}
                />
              </button>

              <button
                type="button"
                onClick={
                  loadDoctors
                }
                className="grid h-[52px] w-[52px] place-items-center rounded-[14px] border border-[#DBE5EF] bg-white text-[#657A91] transition hover:bg-[#F6F8FC] hover:text-[#1717E8]"
                title="Refresh doctors"
              >
                <RefreshCw
                  size={16}
                />
              </button>
            </div>
          </div>

          {/* FILTER PANEL */}

          {filtersOpen && (
            <div className="mt-4 grid gap-4 border-t border-[#EDF2F7] pt-4 sm:grid-cols-2 lg:grid-cols-4">

              <FilterSelect
                label="Specialization"
                value={
                  specializationFilter
                }
                onChange={
                  setSpecializationFilter
                }
                options={
                  specializations
                }
                placeholder="All specialties"
              />

              <FilterSelect
                label="Practice type"
                value={
                  practiceTypeFilter
                }
                onChange={
                  setPracticeTypeFilter
                }
                options={[
                  "Independent",
                  "Hospital",
                ]}
                placeholder="All practice types"
              />

              <FilterSelect
                label="Availability"
                value={
                  availabilityFilter
                }
                onChange={
                  setAvailabilityFilter
                }
                options={[
                  {
                    value:
                      "true",
                    label:
                      "Available",
                  },
                  {
                    value:
                      "false",
                    label:
                      "Unavailable",
                  },
                ]}
                placeholder="Any availability"
              />

              <div>

                <label className="mb-2 block text-[9px] font-extrabold uppercase tracking-[0.08em] text-[#74869A]">
                  City
                </label>

                <div className="flex gap-2">

                  <input
                    value={
                      cityFilter
                    }
                    onChange={(event) =>
                      setCityFilter(
                        event.target
                          .value,
                      )
                    }
                    onKeyDown={(event) => {
                      if (
                        event.key ===
                        "Enter"
                      ) {
                        loadDoctors();
                      }
                    }}
                    placeholder="e.g. Kathmandu"
                    className="h-[44px] min-w-0 flex-1 rounded-[12px] border border-[#DBE5EF] bg-[#FAFCFE] px-3 text-[11px] text-[#334B65] outline-none focus:border-[#1717E8]"
                  />

                  <button
                    type="button"
                    onClick={
                      loadDoctors
                    }
                    className="grid h-[44px] w-[44px] shrink-0 place-items-center rounded-[12px] bg-[#1717E8] text-white"
                  >
                    <Search
                      size={15}
                    />
                  </button>
                </div>
              </div>

              {hasFilters && (
                <div className="sm:col-span-2 lg:col-span-4">

                  <button
                    type="button"
                    onClick={
                      resetFilters
                    }
                    className="text-[9.5px] font-extrabold !text-red-600"
                  >
                    Clear all filters
                  </button>
                </div>
              )}
            </div>
          )}
        </section>

        {/* =================================================
            RESULT HEADER
        ================================================= */}

        <div className="mt-8 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">

          <div>

            <p className="text-[9px] font-extrabold uppercase tracking-[0.14em] text-[#1717E8]">
              Doctor Directory
            </p>

            <h2 className="mt-1 font-[Manrope] text-[22px] font-extrabold tracking-[-0.03em] text-[#17304D]">
              Available Healthcare Professionals
            </h2>
          </div>

          {!loading && (
            <p className="text-[10px] font-semibold text-[#8292A3]">
              Showing{" "}
              <strong className="text-[#314961]">
                {
                  filteredDoctors.length
                }
              </strong>{" "}
              doctor
              {filteredDoctors.length ===
              1
                ? ""
                : "s"}
            </p>
          )}
        </div>

        {/* =================================================
            ERROR
        ================================================= */}

        {error && (
          <div className="mt-6 rounded-[18px] border border-red-200 bg-red-50 p-5">

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

              <div>

                <p className="text-[11px] font-extrabold text-red-800">
                  Unable to show doctors
                </p>

                <p className="mt-1 text-[10px] leading-5 text-red-600">
                  {error}
                </p>
              </div>

              {!getToken() ? (
                <Link
                  to="/login"
                  state={{
                    from:
                      location.pathname,
                  }}
                  className="inline-flex min-h-[40px] items-center justify-center gap-2 rounded-[11px] bg-red-600 px-4 text-[9.5px] font-extrabold !text-white"
                >
                  <span className="!text-white">
                    Sign in
                  </span>

                  <ArrowRight
                    size={13}
                  />
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={
                    loadDoctors
                  }
                  className="inline-flex min-h-[40px] items-center justify-center gap-2 rounded-[11px] bg-white px-4 text-[9.5px] font-extrabold text-red-600 shadow-sm"
                >
                  <RefreshCw
                    size={13}
                  />

                  Try Again
                </button>
              )}
            </div>
          </div>
        )}

        {/* =================================================
            LOADING
        ================================================= */}

        {loading && (
          <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">

            {Array.from({
              length: 6,
            }).map((_, index) => (
              <DoctorSkeleton
                key={index}
              />
            ))}
          </div>
        )}

        {/* =================================================
            EMPTY
        ================================================= */}

        {!loading &&
          !error &&
          filteredDoctors.length ===
            0 && (
            <div className="mt-6 rounded-[24px] border border-[#E0E7EF] bg-white px-6 py-16 text-center">

              <div className="mx-auto grid h-16 w-16 place-items-center rounded-[19px] bg-[#EEF2FF] text-[#1717E8]">

                <Stethoscope
                  size={27}
                />
              </div>

              <h3 className="mt-5 font-[Manrope] text-[18px] font-extrabold text-[#29425D]">
                No doctors found
              </h3>

              <p className="mx-auto mt-2 max-w-[500px] text-[10.5px] leading-6 text-[#8393A4]">
                Try changing your search term or removing some filters.
              </p>

              <button
                type="button"
                onClick={
                  resetFilters
                }
                className="mt-5 rounded-[11px] bg-[#1717E8] px-5 py-3 text-[9.5px] font-extrabold !text-white"
              >
                <span className="!text-white">
                  Reset filters
                </span>
              </button>
            </div>
          )}

        {/* =================================================
            DOCTOR GRID
        ================================================= */}

        {!loading &&
          !error &&
          filteredDoctors.length >
            0 && (
            <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">

              {filteredDoctors.map(
                (doctor) => (
                  <DoctorCard
                    key={
                      doctor._id
                    }
                    doctor={
                      doctor
                    }
                    onView={() =>
                      openDoctor(
                        doctor,
                      )
                    }
                    onBook={() =>
                      bookDoctor(
                        doctor,
                      )
                    }
                  />
                ),
              )}
            </div>
          )}

        {/* =================================================
            BOTTOM CTA
        ================================================= */}

        <section className="mt-12 overflow-hidden rounded-[25px] border border-[#DCE4F1] bg-[linear-gradient(135deg,#F0F3FF,#E8EDFF)] p-6 sm:p-8">

          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-center">

            <div>

              <div className="flex items-center gap-2">

                <Sparkles
                  size={16}
                  className="text-[#1717E8]"
                />

                <p className="text-[9px] font-extrabold uppercase tracking-[0.13em] text-[#1717E8]">
                  Not sure who to see?
                </p>
              </div>

              <h3 className="mt-2 font-[Manrope] text-[22px] font-extrabold tracking-[-0.035em] text-[#18324E]">
                Ask SAHARA AI for healthcare navigation.
              </h3>

              <p className="mt-2 max-w-[650px] text-[10px] leading-5 text-[#73869A]">
                Describe what kind of healthcare support you are looking for and SAHARA can help guide you toward an appropriate service.
              </p>
            </div>

            <Link
              to="/ai-bot"
              className="inline-flex min-h-[47px] shrink-0 items-center justify-center gap-2 rounded-[12px] bg-[#1717E8] px-5 text-[10px] font-extrabold !text-white shadow-[0_12px_28px_rgba(23,23,232,0.17)]"
            >
              <Sparkles
                size={15}
                className="text-white"
              />

              <span className="!text-white">
                Ask SAHARA AI
              </span>
            </Link>
          </div>
        </section>
      </main>

      {/* =================================================
          DOCTOR MODAL
      ================================================= */}

      {selectedDoctor && (
        <DoctorModal
          doctor={
            selectedDoctor
          }
          loading={
            doctorDetailsLoading
          }
          onClose={() =>
            setSelectedDoctor(
              null,
            )
          }
          onBook={() =>
            bookDoctor(
              selectedDoctor,
            )
          }
        />
      )}
    </div>
  );
};

/* =========================================================
   DOCTOR CARD
========================================================= */

const DoctorCard = ({
  doctor,
  onView,
  onBook,
}) => {
  const name =
    doctor.user?.fullName ||
    doctor.fullName ||
    "Doctor";

  const hospitalName =
    doctor.hospital?.name;

  const city =
    doctor.hospital?.city;

  const available =
    Boolean(
      doctor.isAvailable,
    );

  return (
    <article className="group overflow-hidden rounded-[22px] border border-[#DFE7F0] bg-white shadow-[0_12px_32px_rgba(20,46,79,0.045)] transition-all duration-300 hover:-translate-y-1 hover:border-[#C9D7E6] hover:shadow-[0_20px_45px_rgba(20,46,79,0.08)]">

      <div className="p-5 sm:p-6">

        {/* TOP */}

        <div className="flex items-start gap-4">

          <div className="relative shrink-0">

            {doctor.user
              ?.profileImage ? (
              <img
                src={
                  doctor.user
                    .profileImage
                }
                alt={`Dr. ${name}`}
                className="h-16 w-16 rounded-[18px] object-cover"
              />
            ) : (
              <div className="grid h-16 w-16 place-items-center rounded-[18px] bg-[#EEF2FF] font-[Manrope] text-[15px] font-extrabold text-[#1717E8]">
                {getInitials(
                  name,
                )}
              </div>
            )}

            <span
              className={`absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-[3px] border-white ${
                available
                  ? "bg-emerald-500"
                  : "bg-slate-300"
              }`}
            />
          </div>

          <div className="min-w-0 flex-1">

            <div className="flex items-center gap-1.5">

              <h3 className="truncate font-[Manrope] text-[15px] font-extrabold text-[#253E59]">
                Dr. {name}
              </h3>

              {doctor.user
                ?.isVerified && (
                <BadgeCheck
                  size={15}
                  className="shrink-0 text-[#1717E8]"
                />
              )}
            </div>

            <p className="mt-1 text-[10px] font-extrabold text-[#1717E8]">
              {doctor.specialization ||
                "Medical Professional"}
            </p>

            <p className="mt-1 text-[9px] font-medium text-[#8998A8]">
              {doctor.qualification ||
                "Qualification not provided"}
            </p>
          </div>
        </div>

        {/* DETAILS */}

        <div className="mt-5 space-y-2.5">

          <DoctorInfoRow
            icon={Building2}
            value={
              hospitalName ||
              (doctor.practiceType ===
              "Independent"
                ? "Independent Practice"
                : "Hospital Practice")
            }
          />

          {(city ||
            doctor.practiceType) && (
            <DoctorInfoRow
              icon={MapPin}
              value={
                city ||
                doctor.practiceType
              }
            />
          )}

          <DoctorInfoRow
            icon={Activity}
            value={`${
              doctor.experience ||
              0
            } years experience`}
          />
        </div>

        {/* FEES */}

        <div className="mt-5 grid grid-cols-2 gap-3">

          <FeeBlock
            icon={Stethoscope}
            label="Physical"
            value={formatFee(
              doctor.consultationFee,
            )}
          />

          <FeeBlock
            icon={Video}
            label="Virtual"
            value={
              doctor.virtualConsultationFee !==
                undefined &&
              doctor.virtualConsultationFee !==
                null
                ? formatFee(
                    doctor.virtualConsultationFee,
                  )
                : "—"
            }
          />
        </div>

        {/* AVAILABILITY */}

        <div
          className={`mt-5 flex items-center justify-between rounded-[13px] px-3.5 py-3 ${
            available
              ? "bg-emerald-50"
              : "bg-slate-50"
          }`}
        >

          <div className="flex items-center gap-2">

            {available ? (
              <CheckCircle2
                size={14}
                className="text-emerald-600"
              />
            ) : (
              <Clock3
                size={14}
                className="text-slate-500"
              />
            )}

            <span
              className={`text-[9px] font-extrabold ${
                available
                  ? "text-emerald-700"
                  : "text-slate-600"
              }`}
            >
              {available
                ? "Available for appointments"
                : "Currently unavailable"}
            </span>
          </div>

          {doctor.availableDays
            ?.length > 0 && (
            <span className="text-[8px] font-bold text-[#8A98A8]">
              {
                doctor
                  .availableDays
                  .length
              }{" "}
              days/week
            </span>
          )}
        </div>
      </div>

      {/* ACTIONS */}

      <div className="grid grid-cols-2 border-t border-[#EDF2F7]">

        <button
          type="button"
          onClick={
            onView
          }
          className="min-h-[48px] border-r border-[#EDF2F7] text-[9.5px] font-extrabold !text-[#536B83] transition hover:bg-[#F8FAFD] hover:!text-[#1717E8]"
        >
          View Details
        </button>

        <button
          type="button"
          onClick={
            onBook
          }
          disabled={
            !available
          }
          className={`min-h-[48px] text-[9.5px] font-extrabold transition ${
            available
              ? "bg-[#1717E8] !text-white hover:bg-[#1010C9]"
              : "cursor-not-allowed bg-[#F1F3F6] text-[#A5AFBA]"
          }`}
        >
          <span
            className={
              available
                ? "!text-white"
                : ""
            }
          >
            {available
              ? "Book Appointment"
              : "Unavailable"}
          </span>
        </button>
      </div>
    </article>
  );
};

/* =========================================================
   DOCTOR MODAL
========================================================= */

const DoctorModal = ({
  doctor,
  loading,
  onClose,
  onBook,
}) => {
  const name =
    doctor.user?.fullName ||
    doctor.fullName ||
    "Doctor";

  const available =
    Boolean(
      doctor.isAvailable,
    );

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">

      <button
        type="button"
        aria-label="Close doctor details"
        onClick={onClose}
        className="absolute inset-0 bg-[#10233F]/55 backdrop-blur-sm"
      />

      <div className="relative max-h-[90vh] w-full max-w-[760px] overflow-y-auto rounded-[28px] bg-white shadow-[0_35px_100px_rgba(11,34,64,0.25)]">

        {/* HEADER */}

        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[#E9EEF4] bg-white px-5 py-5 sm:px-7">

          <div>

            <p className="text-[8.5px] font-extrabold uppercase tracking-[0.14em] text-[#1717E8]">
              Doctor Profile
            </p>

            <h2 className="mt-1 font-[Manrope] text-[20px] font-extrabold text-[#19324E]">
              Healthcare Professional
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="grid h-9 w-9 place-items-center rounded-[11px] bg-[#F1F4F8] text-[#667B91] transition hover:bg-[#E8EDF3]"
          >
            <X size={17} />
          </button>
        </div>

        {loading && (
          <div className="flex items-center gap-2 border-b border-[#EDF2F7] bg-[#F8FAFD] px-7 py-3">

            <LoaderCircle
              size={13}
              className="animate-spin text-[#1717E8]"
            />

            <span className="text-[9px] font-semibold text-[#74869A]">
              Loading latest doctor information...
            </span>
          </div>
        )}

        <div className="p-5 sm:p-7">

          {/* PROFILE */}

          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">

            {doctor.user
              ?.profileImage ? (
              <img
                src={
                  doctor.user
                    .profileImage
                }
                alt={`Dr. ${name}`}
                className="h-24 w-24 rounded-[24px] object-cover"
              />
            ) : (
              <div className="grid h-24 w-24 shrink-0 place-items-center rounded-[24px] bg-[#EEF2FF] font-[Manrope] text-[22px] font-extrabold text-[#1717E8]">
                {getInitials(
                  name,
                )}
              </div>
            )}

            <div className="min-w-0">

              <div className="flex flex-wrap items-center gap-2">

                <h3 className="font-[Manrope] text-[24px] font-extrabold tracking-[-0.035em] text-[#1D3652]">
                  Dr. {name}
                </h3>

                {doctor.user
                  ?.isVerified && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#EEF2FF] px-2.5 py-1 text-[8px] font-extrabold text-[#1717E8]">

                    <BadgeCheck
                      size={11}
                    />

                    Verified
                  </span>
                )}
              </div>

              <p className="mt-1 text-[11px] font-extrabold text-[#1717E8]">
                {doctor.specialization ||
                  "Medical Professional"}
              </p>

              <p className="mt-1 text-[9.5px] text-[#7E8FA1]">
                {doctor.qualification ||
                  "Qualification not provided"}
              </p>

              <div className="mt-3 flex flex-wrap gap-2">

                <Pill
                  icon={Activity}
                  text={`${doctor.experience || 0} years experience`}
                />

                <Pill
                  icon={
                    available
                      ? CheckCircle2
                      : Clock3
                  }
                  text={
                    available
                      ? "Available"
                      : "Unavailable"
                  }
                  green={
                    available
                  }
                />
              </div>
            </div>
          </div>

          {/* DETAILS */}

          <section className="mt-7">

            <SectionTitle>
              Practice Information
            </SectionTitle>

            <div className="mt-3 grid gap-3 sm:grid-cols-2">

              <DetailCard
                icon={Hospital}
                label="Practice"
                value={
                  doctor.hospital
                    ?.name ||
                  doctor.practiceType ||
                  "Independent"
                }
              />

              <DetailCard
                icon={MapPin}
                label="Location"
                value={
                  doctor.hospital
                    ?.city ||
                  doctor.hospital
                    ?.address ||
                  "Not provided"
                }
              />

              <DetailCard
                icon={CircleDollarSign}
                label="Physical consultation"
                value={formatFee(
                  doctor.consultationFee,
                )}
              />

              <DetailCard
                icon={Video}
                label="Virtual consultation"
                value={
                  doctor.virtualConsultationFee !==
                    undefined &&
                  doctor.virtualConsultationFee !==
                    null
                    ? formatFee(
                        doctor.virtualConsultationFee,
                      )
                    : "Not available"
                }
              />
            </div>
          </section>

          {/* DAYS */}

          <section className="mt-7">

            <SectionTitle>
              Availability
            </SectionTitle>

            {doctor.availableDays
              ?.length > 0 ? (
              <div className="mt-3 flex flex-wrap gap-2">

                {doctor.availableDays.map(
                  (day) => (
                    <span
                      key={day}
                      className="rounded-[9px] border border-[#DDE5EF] bg-[#F8FAFD] px-3 py-2 text-[8.5px] font-extrabold text-[#526A82]"
                    >
                      {day}
                    </span>
                  ),
                )}
              </div>
            ) : (
              <p className="mt-3 text-[9.5px] text-[#8A98A8]">
                Available days have not been specified.
              </p>
            )}

            {(doctor.availableTime
              ?.start ||
              doctor.availableTime
                ?.end) && (
              <div className="mt-3 inline-flex items-center gap-2 rounded-[10px] bg-[#EEF2FF] px-3 py-2 text-[9px] font-bold text-[#1717E8]">

                <Clock3
                  size={13}
                />

                {doctor
                  .availableTime
                  ?.start ||
                  "—"}{" "}
                –{" "}
                {doctor
                  .availableTime
                  ?.end ||
                  "—"}
              </div>
            )}
          </section>

          {/* BIO */}

          {doctor.bio && (
            <section className="mt-7">

              <SectionTitle>
                About Doctor
              </SectionTitle>

              <p className="mt-3 whitespace-pre-wrap text-[10px] leading-6 text-[#657A90]">
                {doctor.bio}
              </p>
            </section>
          )}

          {/* ACTION */}

          <div className="mt-8 flex flex-col-reverse gap-3 border-t border-[#EDF2F7] pt-5 sm:flex-row sm:justify-end">

            <button
              type="button"
              onClick={onClose}
              className="min-h-[45px] rounded-[12px] border border-[#DDE5EE] bg-white px-5 text-[9.5px] font-extrabold text-[#61758B] transition hover:bg-[#F8FAFD]"
            >
              Close
            </button>

            <button
              type="button"
              onClick={
                onBook
              }
              disabled={
                !available
              }
              className={`inline-flex min-h-[45px] items-center justify-center gap-2 rounded-[12px] px-5 text-[9.5px] font-extrabold transition ${
                available
                  ? "bg-[#1717E8] !text-white shadow-[0_10px_25px_rgba(23,23,232,0.17)] hover:bg-[#1010C9]"
                  : "cursor-not-allowed bg-[#EFF2F5] text-[#9CA8B4]"
              }`}
            >

              <CalendarDays
                size={14}
                className={
                  available
                    ? "text-white"
                    : ""
                }
              />

              <span
                className={
                  available
                    ? "!text-white"
                    : ""
                }
              >
                {available
                  ? "Book Appointment"
                  : "Doctor Unavailable"}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/* =========================================================
   FILTER SELECT
========================================================= */

const FilterSelect = ({
  label,
  value,
  onChange,
  options,
  placeholder,
}) => (
  <div>

    <label className="mb-2 block text-[9px] font-extrabold uppercase tracking-[0.08em] text-[#74869A]">
      {label}
    </label>

    <div className="relative">

      <select
        value={value}
        onChange={(event) =>
          onChange(
            event.target.value,
          )
        }
        className="h-[44px] w-full appearance-none rounded-[12px] border border-[#DBE5EF] bg-[#FAFCFE] px-3 pr-9 text-[11px] text-[#334B65] outline-none focus:border-[#1717E8]"
      >

        <option value="">
          {placeholder}
        </option>

        {options.map(
          (option) => {
            const item =
              typeof option ===
              "string"
                ? {
                    value:
                      option,
                    label:
                      option,
                  }
                : option;

            return (
              <option
                key={
                  item.value
                }
                value={
                  item.value
                }
              >
                {
                  item.label
                }
              </option>
            );
          },
        )}
      </select>

      <ChevronDown
        size={14}
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#8595A5]"
      />
    </div>
  </div>
);

/* =========================================================
   HERO METRIC
========================================================= */

const HeroMetric = ({
  value,
  label,
  icon: Icon,
  green = false,
}) => (
  <div className="rounded-[18px] border border-[#E0E6F2] bg-white/80 p-4 shadow-[0_10px_28px_rgba(25,49,78,0.05)] backdrop-blur">

    <div
      className={`grid h-9 w-9 place-items-center rounded-[11px] ${
        green
          ? "bg-emerald-50 text-emerald-600"
          : "bg-[#EEF2FF] text-[#1717E8]"
      }`}
    >
      <Icon size={17} />
    </div>

    <p className="mt-4 font-[Manrope] text-[23px] font-extrabold text-[#19324E]">
      {value}
    </p>

    <p className="mt-1 text-[8.5px] font-bold text-[#8795A5]">
      {label}
    </p>
  </div>
);

/* =========================================================
   DOCTOR INFO ROW
========================================================= */

const DoctorInfoRow = ({
  icon: Icon,
  value,
}) => (
  <div className="flex items-center gap-2.5">

    <Icon
      size={14}
      className="shrink-0 text-[#8191A3]"
    />

    <p className="truncate text-[9.5px] font-semibold text-[#60758B]">
      {value}
    </p>
  </div>
);

/* =========================================================
   FEE BLOCK
========================================================= */

const FeeBlock = ({
  icon: Icon,
  label,
  value,
}) => (
  <div className="rounded-[13px] border border-[#E4EAF1] bg-[#FAFCFE] p-3">

    <div className="flex items-center gap-2">

      <Icon
        size={13}
        className="text-[#1717E8]"
      />

      <span className="text-[8px] font-bold uppercase tracking-[0.07em] text-[#8C9AAA]">
        {label}
      </span>
    </div>

    <p className="mt-2 text-[10.5px] font-extrabold text-[#324A63]">
      {value}
    </p>
  </div>
);

/* =========================================================
   PILL
========================================================= */

const Pill = ({
  icon: Icon,
  text,
  green = false,
}) => (
  <span
    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-[8px] font-extrabold ${
      green
        ? "bg-emerald-50 text-emerald-700"
        : "bg-[#F1F4F8] text-[#65798F]"
    }`}
  >
    <Icon size={11} />

    {text}
  </span>
);

/* =========================================================
   SECTION TITLE
========================================================= */

const SectionTitle = ({
  children,
}) => (
  <h4 className="text-[9px] font-extrabold uppercase tracking-[0.12em] text-[#8997A7]">
    {children}
  </h4>
);

/* =========================================================
   DETAIL CARD
========================================================= */

const DetailCard = ({
  icon: Icon,
  label,
  value,
}) => (
  <div className="flex items-start gap-3 rounded-[14px] border border-[#E3E9F0] bg-[#FAFCFE] p-4">

    <div className="grid h-9 w-9 shrink-0 place-items-center rounded-[10px] bg-[#EEF2FF] text-[#1717E8]">
      <Icon size={16} />
    </div>

    <div className="min-w-0">

      <p className="text-[8px] font-bold uppercase tracking-[0.08em] text-[#929FAD]">
        {label}
      </p>

      <p className="mt-1 break-words text-[9.5px] font-extrabold text-[#3D546D]">
        {value}
      </p>
    </div>
  </div>
);

/* =========================================================
   SKELETON
========================================================= */

const DoctorSkeleton = () => (
  <div className="animate-pulse rounded-[22px] border border-[#E2E8EF] bg-white p-6">

    <div className="flex gap-4">

      <div className="h-16 w-16 rounded-[18px] bg-[#EEF1F5]" />

      <div className="flex-1">

        <div className="h-4 w-3/4 rounded bg-[#EEF1F5]" />

        <div className="mt-3 h-3 w-1/2 rounded bg-[#F1F3F6]" />

        <div className="mt-2 h-3 w-2/3 rounded bg-[#F1F3F6]" />
      </div>
    </div>

    <div className="mt-6 space-y-3">

      <div className="h-3 w-full rounded bg-[#F1F3F6]" />

      <div className="h-3 w-4/5 rounded bg-[#F1F3F6]" />

      <div className="h-3 w-3/5 rounded bg-[#F1F3F6]" />
    </div>

    <div className="mt-6 grid grid-cols-2 gap-3">

      <div className="h-16 rounded-[13px] bg-[#F3F5F8]" />

      <div className="h-16 rounded-[13px] bg-[#F3F5F8]" />
    </div>
  </div>
);

export default Doctor;