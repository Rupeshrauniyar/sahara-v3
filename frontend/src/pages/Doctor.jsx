import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3000/api";

const DOCTOR_API = `${API_BASE_URL}/doctors`;

const SPECIALIZATIONS = [
  "Cardiologist",
  "Dermatologist",
  "General Physician",
  "Gynecologist",
  "Neurologist",
  "Orthopedic",
  "Pediatrician",
  "Psychiatrist",
  "Dentist",
  "ENT",
  "Ophthalmologist",
  "Surgeon",
];

const Doctor = () => {
  const navigate = useNavigate();

  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);

  const [loading, setLoading] = useState(true);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const [error, setError] = useState("");

  const [search, setSearch] = useState("");

  const [filters, setFilters] = useState({
    specialization: "",
    city: "",
    practiceType: "",
    available: "true",
  });

  const [showFilters, setShowFilters] = useState(false);

  // =====================================================
  // TOKEN
  // =====================================================

  const getToken = () =>
    localStorage.getItem("token") ||
    sessionStorage.getItem("token");

  // =====================================================
  // API
  // =====================================================

  const apiRequest = async (url, options = {}) => {
    const token = getToken();

    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(token
          ? {
              Authorization: `Bearer ${token}`,
            }
          : {}),
        ...(options.headers || {}),
      },
    });

    let data = null;

    try {
      data = await response.json();
    } catch {
      data = null;
    }

    if (!response.ok) {
      throw new Error(
        data?.message ||
          "Unable to load doctors."
      );
    }

    return data;
  };

  // =====================================================
  // LOAD DOCTORS
  // =====================================================

  const loadDoctors = async (overrideFilters = filters, overrideSearch = search) => {
    setLoading(true);
    setError("");

    try {
      const params = new URLSearchParams();

      // Search and filters are intentionally separate so the
      // search box cannot accidentally overwrite a selected filter.
      if (overrideSearch.trim()) {
        params.set("search", overrideSearch.trim());
      }

      if (overrideFilters.specialization) {
        params.set("specialization", overrideFilters.specialization);
      }

      if (overrideFilters.city.trim()) {
        params.set("city", overrideFilters.city.trim());
      }

      if (overrideFilters.practiceType) {
        params.set("practiceType", overrideFilters.practiceType);
      }

      if (overrideFilters.available) {
        params.set("available", overrideFilters.available);
      }

      params.set("limit", "50");

      const url = `${DOCTOR_API}?${params.toString()}`;
      const data = await apiRequest(url);

      // Support the common response shapes:
      // { doctors: [...] }, { data: [...] }, or [...]
      const doctorList = Array.isArray(data)
        ? data
        : Array.isArray(data?.doctors)
          ? data.doctors
          : Array.isArray(data?.data)
            ? data.data
            : [];

      setDoctors(doctorList);
    } catch (err) {
      setError(err.message || "Unable to load doctors.");
      setDoctors([]);
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    loadDoctors();
  }, []);

  // =====================================================
  // FILTER
  // =====================================================

  const handleFilterChange = (e) => {
    const { name, value } = e.target;

    setFilters((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const clearFilters = async () => {
    const resetFilters = {
      specialization: "",
      city: "",
      practiceType: "",
      available: "true",
    };

    setSearch("");
    setFilters(resetFilters);

    // Do not use setTimeout here. React state updates are async,
    // so the previous implementation could send stale filters.
    await loadDoctors(resetFilters, "");
  };

  // =====================================================
  // SEARCH
  // =====================================================

  const handleSearch = (e) => {
    e.preventDefault();
    loadDoctors();
  };

  // =====================================================
  // GET SINGLE DOCTOR
  // =====================================================

  const openDoctor = async (doctorId) => {
    setLoadingDetails(true);
    setError("");

    try {
      const data = await apiRequest(
        `${DOCTOR_API}/${doctorId}`
      );

      setSelectedDoctor(
        data?.doctor || null
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingDetails(false);
    }
  };

  // =====================================================
  // BOOK APPOINTMENT
  // =====================================================

  const bookAppointment = (doctorId) => {
    setSelectedDoctor(null);

    navigate(`/appointment?doctor=${encodeURIComponent(doctorId)}`);
  };

  // =====================================================
  // STATS
  // =====================================================

  const stats = useMemo(() => {
    const available = doctors.filter(
      (doctor) =>
        doctor.isAvailable === true
    ).length;

    const hospitalDoctors =
      doctors.filter(
        (doctor) =>
          doctor.practiceType ===
          "Hospital"
      ).length;

    const independentDoctors =
      doctors.filter(
        (doctor) =>
          doctor.practiceType ===
          "Independent"
      ).length;

    return {
      total: doctors.length,
      available,
      hospitalDoctors,
      independentDoctors,
    };
  }, [doctors]);

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div className="min-h-screen bg-[#F6F9FD] text-[#0A1F3D]">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="border-b border-[#DCE6F6] bg-white">

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">

            <div>

              <p className="text-xs font-black tracking-[0.18em] text-[#1657CC] uppercase">
                SAHARA HEALTHCARE
              </p>

              <h1 className="mt-2 font-serif text-3xl font-semibold tracking-[-0.04em] text-[#0A1F3D] sm:text-4xl lg:text-5xl">
                Find the right doctor.
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-7 text-[#7184A4] sm:text-base">
                Search trusted healthcare professionals,
                compare their expertise and availability,
                then book a consultation in a few clicks.
              </p>

            </div>

            {/* Stats */}

            <div className="grid grid-cols-3 gap-2 sm:gap-3">

              <MiniStat
                value={stats.total}
                label="Doctors"
              />

              <MiniStat
                value={stats.available}
                label="Available"
              />

              <MiniStat
                value={stats.hospitalDoctors}
                label="Hospital"
              />

            </div>

          </div>

        </div>

      </div>


      {/* =================================================
          CONTENT
      ================================================= */}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-7">

        {/* Search */}

        <form
          onSubmit={handleSearch}
          className="rounded-[26px] border border-[#DCE6F6] bg-white p-4 shadow-[0_20px_50px_-35px_rgba(10,31,61,.3)] sm:p-5"
        >

          <div className="flex flex-col lg:flex-row gap-3">

            <div className="relative flex-1">

              <SearchIcon />

              <input
                type="text"
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                placeholder="Search by specialization..."
                className="h-12 w-full rounded-xl border border-[#DCE6F6] bg-[#F8FAFD] pl-11 pr-4 text-sm font-medium text-[#0A1F3D] outline-none transition-all placeholder:text-[#A6B2C7] hover:border-[#BFCDE2] focus:border-[#1657CC] focus:bg-white focus:ring-4 focus:ring-[#1657CC]/10"
              />

            </div>

            <button
              type="submit"
              className="h-12 rounded-xl bg-[#1657CC] px-6 text-sm font-bold text-white shadow-[0_14px_30px_-16px_rgba(22,87,204,.8)] transition hover:bg-[#0C3B90] hover:-translate-y-0.5"
            >
              Search doctors
            </button>

            <button
              type="button"
              onClick={() =>
                setShowFilters(
                  !showFilters
                )
              }
              className="h-12 rounded-xl border border-[#DCE6F6] bg-white px-5 text-sm font-bold text-[#57678A] transition hover:border-[#1657CC] hover:bg-[#F8FAFD] hover:text-[#1657CC]"
            >
              Filters
              <span className="ml-2">
                {showFilters ? "−" : "+"}
              </span>
            </button>

          </div>


          {/* FILTERS */}

          {showFilters && (

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-4 pt-4 border-t border-slate-100">

              <FilterSelect
                name="specialization"
                value={
                  filters.specialization
                }
                onChange={
                  handleFilterChange
                }
                placeholder="All specializations"
                options={SPECIALIZATIONS}
              />

              <input
                name="city"
                value={filters.city}
                onChange={
                  handleFilterChange
                }
                placeholder="City e.g. Kathmandu"
                className="h-11 w-full rounded-xl border border-[#DCE6F6] bg-[#F8FAFD] px-3 text-sm font-medium text-[#0A1F3D] outline-none transition focus:border-[#1657CC] focus:bg-white focus:ring-4 focus:ring-[#1657CC]/10"
              />

              <FilterSelect
                name="practiceType"
                value={
                  filters.practiceType
                }
                onChange={
                  handleFilterChange
                }
                placeholder="All practice types"
                options={[
                  "Hospital",
                  "Independent",
                ]}
              />

              <div className="flex gap-2">

                <select
                  name="available"
                  value={filters.available}
                  onChange={
                    handleFilterChange
                  }
                  className="h-11 flex-1 rounded-xl border border-[#DCE6F6] bg-[#F8FAFD] px-3 text-sm font-medium text-[#0A1F3D] outline-none focus:border-[#1657CC] focus:bg-white"
                >
                  <option value="">
                    All doctors
                  </option>

                  <option value="true">
                    Available now
                  </option>

                  <option value="false">
                    Currently unavailable
                  </option>

                </select>

                <button
                  type="button"
                  onClick={clearFilters}
                  className="rounded-xl border border-[#DCE6F6] px-3 text-xs font-bold text-[#57678A] transition hover:border-[#1657CC] hover:bg-[#F8FAFD] hover:text-[#1657CC]"
                >
                  Clear
                </button>

              </div>

            </div>

          )}

        </form>


        {/* Error */}

        {error && (

          <div className="mt-5 bg-red-50 border border-red-100 rounded-2xl px-4 py-3 text-sm text-red-700 flex justify-between gap-3">

            <span>{error}</span>

            <button
              onClick={() =>
                setError("")
              }
              className="font-bold"
            >
              ×
            </button>

          </div>

        )}


        {/* Result header */}

        <div className="flex items-center justify-between mt-7 mb-4">

          <div>

            <h2 className="text-lg font-black text-slate-900">
              Doctors
            </h2>

            {!loading && (
              <p className="text-xs text-slate-400 mt-1">
                {doctors.length} professionals found
              </p>
            )}

          </div>

          <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400">
            <span className="w-2 h-2 bg-emerald-500 rounded-full" />
            Available doctors can be booked
          </div>

        </div>


        {/* =================================================
            LOADING
        ================================================= */}

        {loading && (

          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">

            {[1, 2, 3, 4, 5, 6].map(
              (item) => (
                <DoctorSkeleton
                  key={item}
                />
              )
            )}

          </div>

        )}


        {/* =================================================
            EMPTY
        ================================================= */}

        {!loading &&
          doctors.length === 0 && (

            <EmptyDoctors
              onReset={clearFilters}
            />

          )}


        {/* =================================================
            DOCTORS
        ================================================= */}

        {!loading &&
          doctors.length > 0 && (

            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">

              {doctors.map(
                (doctor) => (

                  <DoctorCard
                    key={doctor._id}
                    doctor={doctor}
                    onView={() =>
                      openDoctor(
                        doctor._id
                      )
                    }
                    onBook={() =>
                      bookAppointment(
                        doctor._id
                      )
                    }
                  />

                )
              )}

            </div>

          )}

      </main>


      {/* =================================================
          DOCTOR DETAIL MODAL
      ================================================= */}

      {(selectedDoctor ||
        loadingDetails) && (

        <DoctorDetails
          doctor={selectedDoctor}
          loading={loadingDetails}
          onClose={() =>
            setSelectedDoctor(null)
          }
          onBook={bookAppointment}
        />

      )}

    </div>
  );
};


// =========================================================
// DOCTOR CARD
// =========================================================

const DoctorCard = ({
  doctor,
  onView,
  onBook,
}) => {

  const name =
    doctor.user?.fullName ||
    "Doctor";

  const image =
    doctor.user?.profileImage;

  const hospital =
    doctor.hospital?.name;

  const available =
    doctor.isAvailable === true;

  return (
    <div
      onClick={onView}
      className="group cursor-pointer overflow-hidden rounded-[26px] border border-[#DCE6F6] bg-white transition duration-300 hover:-translate-y-1 hover:border-[#BFD3F4] hover:shadow-[0_25px_55px_-30px_rgba(10,31,61,.35)]"
    >

      <div className="p-5">

        <div className="flex items-start gap-4">

          {/* Avatar */}

          {image ? (

            <img
              src={image}
              alt={name}
              className="w-16 h-16 rounded-2xl object-cover border border-slate-100"
            />

          ) : (

            <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center text-xl font-black shrink-0">
              {getInitials(name)}
            </div>

          )}

          <div className="flex-1 min-w-0">

            <div className="flex items-start justify-between gap-2">

              <div>

                <h3 className="font-black text-slate-900 truncate">
                  Dr. {name}
                </h3>

                <p className="text-xs text-blue-600 font-bold mt-1">
                  {doctor.specialization ||
                    "Medical Specialist"}
                </p>

              </div>

              <span
                className={`w-2.5 h-2.5 rounded-full shrink-0 mt-2 ${
                  available
                    ? "bg-emerald-500"
                    : "bg-slate-300"
                }`}
              />

            </div>

          </div>

        </div>


        {/* Details */}

        <div className="mt-5 space-y-3">

          <DoctorInfo
            icon={<GraduationIcon />}
            text={
              doctor.qualification ||
              "Qualification not specified"
            }
          />

          <DoctorInfo
            icon={<BriefcaseIcon />}
            text={`${doctor.experience || 0} years experience`}
          />

          <DoctorInfo
            icon={<HospitalIcon />}
            text={
              hospital ||
              "Independent practice"
            }
          />

          {doctor.user?.city && (

            <DoctorInfo
              icon={<LocationIcon />}
              text={doctor.user.city}
            />

          )}

        </div>


        {/* Bottom */}

        <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">

          <div>

            <p className="text-[10px] uppercase tracking-wide text-slate-400 font-bold">
              Consultation
            </p>

            <p className="text-base font-black text-slate-900 mt-0.5">
              Rs. {doctor.consultationFee ?? "—"}
            </p>

          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onBook();
            }}
            disabled={!available}
            className="rounded-xl bg-[#1657CC] px-4 py-2.5 text-xs font-bold text-white transition hover:bg-[#0C3B90] disabled:bg-[#E8EEF7] disabled:text-[#9AA7BC]"
          >
            {available
              ? "Book appointment"
              : "Unavailable"}
          </button>

        </div>

      </div>


      {/* Availability */}

      <div
        className={`px-5 py-3 text-[10px] font-bold ${
          available
            ? "bg-emerald-50 text-emerald-700"
            : "bg-slate-50 text-slate-400"
        }`}
      >
        {available
          ? "● AVAILABLE FOR CONSULTATION"
          : "● CURRENTLY UNAVAILABLE"}
      </div>

    </div>
  );
};


// =========================================================
// DETAIL MODAL
// =========================================================

const DoctorDetails = ({
  doctor,
  loading,
  onClose,
  onBook,
}) => {

  if (loading) {
    return (
      <Modal onClose={onClose}>
        <div className="p-14 text-center">

          <div className="w-10 h-10 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin mx-auto" />

          <p className="text-sm text-slate-500 mt-4">
            Loading doctor profile...
          </p>

        </div>
      </Modal>
    );
  }

  if (!doctor) {
    return null;
  }

  const name =
    doctor.user?.fullName ||
    "Doctor";

  const available =
    doctor.isAvailable === true;

  return (
    <Modal onClose={onClose}>

      <div className="max-h-[90vh] overflow-y-auto">

        {/* Hero */}

        <div className="bg-[#071f3d] text-white p-6 sm:p-8">

          <div className="flex flex-col sm:flex-row gap-5">

            {doctor.user?.profileImage ? (

              <img
                src={
                  doctor.user.profileImage
                }
                alt={name}
                className="w-24 h-24 rounded-3xl object-cover border-4 border-white/10"
              />

            ) : (

              <div className="w-24 h-24 rounded-3xl bg-white/10 flex items-center justify-center text-3xl font-black">
                {getInitials(name)}
              </div>

            )}

            <div className="flex-1">

              <div className="flex items-center gap-2">

                <span
                  className={`w-2.5 h-2.5 rounded-full ${
                    available
                      ? "bg-emerald-400"
                      : "bg-slate-400"
                  }`}
                />

                <span className="text-xs font-bold text-slate-300">
                  {available
                    ? "Available"
                    : "Currently unavailable"}
                </span>

              </div>

              <h2 className="text-2xl sm:text-3xl font-black mt-2">
                Dr. {name}
              </h2>

              <p className="text-blue-300 font-semibold mt-1">
                {doctor.specialization}
              </p>

              <div className="flex flex-wrap gap-2 mt-4">

                <Pill>
                  {doctor.experience || 0} years experience
                </Pill>

                <Pill>
                  {doctor.practiceType ||
                    "Independent"}
                </Pill>

                {doctor.hospital?.name && (
                  <Pill>
                    {doctor.hospital.name}
                  </Pill>
                )}

              </div>

            </div>

          </div>

        </div>


        <div className="p-5 sm:p-7">

          {/* About */}

          <DetailBlock
            title="About the doctor"
          >

            <p className="text-sm text-slate-600 leading-7">
              {doctor.bio ||
                "This doctor has not added a biography yet."}
            </p>

          </DetailBlock>


          {/* Professional */}

          <DetailBlock
            title="Professional information"
          >

            <div className="grid sm:grid-cols-2 gap-3">

              <InfoBox
                label="Qualification"
                value={
                  doctor.qualification ||
                  "—"
                }
              />

              <InfoBox
                label="Experience"
                value={`${doctor.experience || 0} years`}
              />

              <InfoBox
                label="Consultation fee"
                value={`Rs. ${
                  doctor.consultationFee ??
                  "—"
                }`}
              />

              <InfoBox
                label="Virtual consultation"
                value={`Rs. ${
                  doctor.virtualConsultationFee ??
                  "—"
                }`}
              />

            </div>

          </DetailBlock>


          {/* Availability */}

          <DetailBlock
            title="Availability"
          >

            <div className="flex flex-wrap gap-2">

              {Array.isArray(
                doctor.availableDays
              ) &&
              doctor.availableDays.length > 0 ? (

                doctor.availableDays.map(
                  (day) => (

                    <span
                      key={day}
                      className="px-3 py-2 rounded-xl bg-blue-50 text-blue-700 text-xs font-bold"
                    >
                      {day}
                    </span>

                  )
                )

              ) : (

                <span className="text-sm text-slate-400">
                  Availability not specified
                </span>

              )}

            </div>

            {doctor.availableTime && (

              <div className="mt-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">

                <p className="text-[10px] uppercase tracking-wide font-bold text-slate-400">
                  Consultation hours
                </p>

                <p className="text-sm font-bold text-slate-800 mt-1">
                  {doctor.availableTime.start ||
                    "—"}{" "}
                  —{" "}
                  {doctor.availableTime.end ||
                    "—"}
                </p>

              </div>

            )}

          </DetailBlock>


          {/* Hospital */}

          {doctor.hospital && (

            <DetailBlock
              title="Hospital / Practice"
            >

              <div className="rounded-2xl bg-slate-50 border border-slate-100 p-4">

                <h3 className="font-bold text-slate-900">
                  {doctor.hospital.name}
                </h3>

                <p className="text-sm text-slate-500 mt-1">
                  {doctor.hospital.address ||
                    "Address not available"}
                </p>

                <p className="text-sm text-slate-500 mt-1">
                  {doctor.hospital.city ||
                    ""}
                </p>

              </div>

            </DetailBlock>

          )}


          {/* Actions */}

          <div className="flex flex-col sm:flex-row gap-3 mt-7 pt-5 border-t border-slate-100">

            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-xl border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50"
            >
              Close
            </button>

            <button
              type="button"
              disabled={!available}
              onClick={() =>
                onBook(doctor._id)
              }
              className="flex-1 rounded-xl bg-[#1657CC] py-3 text-sm font-bold text-white transition hover:bg-[#0C3B90] disabled:bg-[#E8EEF7] disabled:text-[#9AA7BC]"
            >
              {available
                ? "Book appointment"
                : "Doctor unavailable"}
            </button>

          </div>

        </div>

      </div>

    </Modal>
  );
};


// =========================================================
// MODAL
// =========================================================

const Modal = ({
  children,
  onClose,
}) => (

  <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">

    <div
      className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
      onClick={onClose}
    />

    <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl overflow-hidden">
      {children}
    </div>

  </div>
);


// =========================================================
// DETAIL BLOCK
// =========================================================

const DetailBlock = ({
  title,
  children,
}) => (

  <section className="mt-6 first:mt-0">

    <h3 className="text-xs uppercase tracking-[0.15em] font-black text-slate-400 mb-3">
      {title}
    </h3>

    {children}

  </section>
);


// =========================================================
// INFO BOX
// =========================================================

const InfoBox = ({
  label,
  value,
}) => (

  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">

    <p className="text-[10px] uppercase tracking-wide font-bold text-slate-400">
      {label}
    </p>

    <p className="text-sm font-bold text-slate-800 mt-1">
      {value}
    </p>

  </div>
);


// =========================================================
// PILL
// =========================================================

const Pill = ({
  children,
}) => (

  <span className="px-3 py-1.5 rounded-lg bg-white/10 text-white text-[10px] font-bold">
    {children}
  </span>
);


// =========================================================
// FILTER SELECT
// =========================================================

const FilterSelect = ({
  name,
  value,
  onChange,
  placeholder,
  options,
}) => (

  <select
    name={name}
    value={value}
    onChange={onChange}
    className="h-11 w-full rounded-xl border border-[#DCE6F6] bg-[#F8FAFD] px-3 text-sm font-medium text-[#0A1F3D] outline-none transition focus:border-[#1657CC] focus:bg-white focus:ring-4 focus:ring-[#1657CC]/10"
  >

    <option value="">
      {placeholder}
    </option>

    {options.map(
      (option) => (
        <option
          key={option}
          value={option}
        >
          {option}
        </option>
      )
    )}

  </select>
);


// =========================================================
// MINI STAT
// =========================================================

const MiniStat = ({
  value,
  label,
}) => (

  <div className="px-3 sm:px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-100 min-w-[75px]">

    <p className="text-lg font-black text-slate-900">
      {value}
    </p>

    <p className="text-[9px] uppercase tracking-wide font-bold text-slate-400">
      {label}
    </p>

  </div>
);


// =========================================================
// DOCTOR INFO
// =========================================================

const DoctorInfo = ({
  icon,
  text,
}) => (

  <div className="flex items-center gap-2.5 text-xs text-slate-500">

    <span className="w-5 text-slate-400 shrink-0">
      {icon}
    </span>

    <span className="truncate">
      {text}
    </span>

  </div>
);


// =========================================================
// EMPTY
// =========================================================

const EmptyDoctors = ({
  onReset,
}) => (

  <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center">

    <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">

      <DoctorIcon size={28} />

    </div>

    <h3 className="text-xl font-black text-slate-900 mt-5">
      No doctors found
    </h3>

    <p className="text-sm text-slate-500 mt-2 max-w-md mx-auto">
      Try another specialization, city or
      availability filter.
    </p>

    <button
      type="button"
      onClick={onReset}
      className="mt-5 px-5 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold"
    >
      Clear filters
    </button>

  </div>
);


// =========================================================
// SKELETON
// =========================================================

const DoctorSkeleton = () => (

  <div className="bg-white border border-slate-200 rounded-3xl p-5 animate-pulse">

    <div className="flex gap-4">

      <div className="w-16 h-16 rounded-2xl bg-slate-200" />

      <div className="flex-1">

        <div className="h-4 bg-slate-200 rounded w-2/3" />

        <div className="h-3 bg-slate-100 rounded w-1/2 mt-3" />

      </div>

    </div>

    <div className="space-y-3 mt-6">

      <div className="h-3 bg-slate-100 rounded" />
      <div className="h-3 bg-slate-100 rounded" />
      <div className="h-3 bg-slate-100 rounded" />

    </div>

    <div className="h-10 bg-slate-100 rounded-xl mt-6" />

  </div>
);


// =========================================================
// ICONS
// =========================================================

const SearchIcon = () => (

  <svg
    className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8C99B8]"
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-4-4" />
  </svg>

);


const GraduationIcon = () => (

  <svg
    width="15"
    height="15"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M3 10 12 5l9 5-9 5-9-5Z" />
    <path d="M7 12v5c3 2 7 2 10 0v-5" />
  </svg>

);


const BriefcaseIcon = () => (

  <svg
    width="15"
    height="15"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <rect x="3" y="7" width="18" height="13" rx="2" />
    <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </svg>

);


const HospitalIcon = () => (

  <svg
    width="15"
    height="15"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M4 21V5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v16" />
    <path d="M8 8h8M12 5v6M9 21v-4h6v4" />
  </svg>

);


const LocationIcon = () => (

  <svg
    width="15"
    height="15"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" />
    <circle cx="12" cy="10" r="2.5" />
  </svg>

);


const DoctorIcon = ({
  size = 22,
}) => (

  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
  >
    <circle cx="12" cy="7" r="4" />
    <path d="M4 21c.8-4.2 3.5-6 8-6s7.2 1.8 8 6" />
    <path d="M19 8v6M16 11h6" />
  </svg>

);


// =========================================================
// HELPERS
// =========================================================

const getInitials = (name) => {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map(
      (part) =>
        part[0]?.toUpperCase()
    )
    .join("");
};

export default Doctor;