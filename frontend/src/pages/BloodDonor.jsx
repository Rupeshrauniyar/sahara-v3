import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import {
  Activity,
  AlertCircle,
  ArrowLeft,
  BadgeCheck,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  Droplets,
  HeartPulse,
  Hospital,
  LoaderCircle,
  MapPin,
  Phone,
  RefreshCw,
  Search,
  ShieldCheck,
  Sparkles,
  ToggleLeft,
  ToggleRight,
  UserPlus,
  UserRound,
  UsersRound,
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
   CONSTANTS
========================================================= */

const BLOOD_GROUPS = [
  "A+",
  "A-",
  "B+",
  "B-",
  "AB+",
  "AB-",
  "O+",
  "O-",
];

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
    return "DN";
  }

  return name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
};

const formatDate = (value) => {
  if (!value) {
    return "Not provided";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return "Not provided";
  }

  return new Intl.DateTimeFormat(
    "en-US",
    {
      year: "numeric",
      month: "short",
      day: "numeric",
    },
  ).format(date);
};

/* =========================================================
   BLOOD DONOR PAGE
========================================================= */

const BloodDonor = () => {
  const navigate =
    useNavigate();

  const user =
    getStoredUser();

  const [donors, setDonors] =
    useState([]);

  const [myDonor, setMyDonor] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [
    loadingProfile,
    setLoadingProfile,
  ] = useState(true);

  const [
    actionLoading,
    setActionLoading,
  ] = useState("");

  const [
    errorMessage,
    setErrorMessage,
  ] = useState("");

  const [
    successMessage,
    setSuccessMessage,
  ] = useState("");

  const [
    bloodGroupFilter,
    setBloodGroupFilter,
  ] = useState("");

  const [
    cityFilter,
    setCityFilter,
  ] = useState("");

  const [
    emergencyOnly,
    setEmergencyOnly,
  ] = useState(false);

  const [
    searchTerm,
    setSearchTerm,
  ] = useState("");

  const [
    profileEditorOpen,
    setProfileEditorOpen,
  ] = useState(false);

  const [
    donorForm,
    setDonorForm,
  ] = useState({
    lastDonationDate: "",
    totalDonations: 0,
    remarks: "",
  });

  /* =====================================================
     API HELPER
  ===================================================== */

  const apiRequest = async (
    path,
    options = {},
  ) => {
    const token =
      getToken();

    if (!token) {
      throw new Error(
        "Please sign in to access the blood donor network.",
      );
    }

    const response =
      await fetch(
        `${API_URL}${path}`,
        {
          ...options,

          headers: {
            "Content-Type":
              "application/json",

            Authorization:
              `Bearer ${token}`,

            ...(options.headers ||
              {}),
          },
        },
      );

    let data = null;

    try {
      data =
        await response.json();
    } catch {
      data = null;
    }

    if (!response.ok) {
      if (
        response.status === 401
      ) {
        throw new Error(
          "Your session has expired. Please sign in again.",
        );
      }

      throw new Error(
        data?.message ||
          "Something went wrong.",
      );
    }

    return data;
  };

  /* =====================================================
     LOAD DONORS
  ===================================================== */

  const loadDonors =
    async () => {
      if (!getToken()) {
        setDonors([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      setErrorMessage("");

      try {
        const params =
          new URLSearchParams();

        if (
          bloodGroupFilter
        ) {
          params.set(
            "bloodGroup",
            bloodGroupFilter,
          );
        }

        if (
          cityFilter.trim()
        ) {
          params.set(
            "city",
            cityFilter.trim(),
          );
        }

        if (emergencyOnly) {
          params.set(
            "emergency",
            "true",
          );
        }

        const query =
          params.toString();

        const data =
          await apiRequest(
            `/blood-donors/active${
              query
                ? `?${query}`
                : ""
            }`,
          );

        setDonors(
          Array.isArray(
            data?.donors,
          )
            ? data.donors
            : [],
        );
      } catch (error) {
        console.error(
          "Donor loading error:",
          error,
        );

        setDonors([]);

        setErrorMessage(
          error.message,
        );
      } finally {
        setLoading(false);
      }
    };

  /* =====================================================
     LOAD MY DONOR PROFILE
  ===================================================== */

  const loadMyDonorProfile =
    async () => {
      if (!getToken()) {
        setMyDonor(null);
        setLoadingProfile(false);
        return;
      }

      setLoadingProfile(true);

      try {
        const data =
          await apiRequest(
            "/blood-donors/me",
          );

        const donor =
          data?.donor ||
          data?.profile ||
          null;

        setMyDonor(donor);

        if (donor) {
          setDonorForm({
            lastDonationDate:
              donor.lastDonationDate
                ? new Date(
                    donor.lastDonationDate,
                  )
                    .toISOString()
                    .slice(0, 10)
                : "",

            totalDonations:
              donor.totalDonations ||
              0,

            remarks:
              donor.remarks ||
              "",
          });
        }
      } catch (error) {
        /*
          If backend returns not found for a
          non-donor, treat it as normal.
        */

        setMyDonor(null);
      } finally {
        setLoadingProfile(false);
      }
    };

  useEffect(() => {
    loadDonors();
    loadMyDonorProfile();
  }, []);

  useEffect(() => {
    loadDonors();
  }, [
    bloodGroupFilter,
    emergencyOnly,
  ]);

  /* =====================================================
     FILTER LOCALLY
  ===================================================== */

  const filteredDonors =
    useMemo(() => {
      const query =
        searchTerm
          .trim()
          .toLowerCase();

      if (!query) {
        return donors;
      }

      return donors.filter(
        (donor) => {
          const name =
            donor.user?.fullName ||
            donor.fullName ||
            "";

          const bloodGroup =
            donor.user?.bloodGroup ||
            donor.bloodGroup ||
            "";

          const city =
            donor.user?.city ||
            donor.city ||
            "";

          const phone =
            donor.user?.phone ||
            "";

          return [
            name,
            bloodGroup,
            city,
            phone,
          ].some((value) =>
            String(value)
              .toLowerCase()
              .includes(query),
          );
        },
      );
    }, [
      donors,
      searchTerm,
    ]);

  /* =====================================================
     BECOME DONOR
  ===================================================== */

  const becomeDonor =
    async () => {
      setErrorMessage("");
      setSuccessMessage("");

      if (!user?.bloodGroup) {
        setErrorMessage(
          "Please add your blood group to your SAHARA account before becoming a donor.",
        );

        return;
      }

      setActionLoading(
        "become",
      );

      try {
        const data =
          await apiRequest(
            "/blood-donors/become",
            {
              method: "POST",
            },
          );

        setSuccessMessage(
          data?.message ||
            "You are now part of the SAHARA blood donor network.",
        );

        await Promise.all([
          loadMyDonorProfile(),
          loadDonors(),
        ]);
      } catch (error) {
        setErrorMessage(
          error.message,
        );
      } finally {
        setActionLoading("");
      }
    };

  /* =====================================================
     AVAILABILITY
  ===================================================== */

  const updateAvailability =
    async (value) => {
      setActionLoading(
        "availability",
      );

      setErrorMessage("");
      setSuccessMessage("");

      try {
        const data =
          await apiRequest(
            "/blood-donors/availability",
            {
              method: "PATCH",

              body:
                JSON.stringify({
                  availability:
                    value,
                }),
            },
          );

        setSuccessMessage(
          data?.message ||
            "Availability updated.",
        );

        await Promise.all([
          loadMyDonorProfile(),
          loadDonors(),
        ]);
      } catch (error) {
        setErrorMessage(
          error.message,
        );
      } finally {
        setActionLoading("");
      }
    };

  /* =====================================================
     EMERGENCY AVAILABILITY
  ===================================================== */

  const updateEmergencyAvailability =
    async (value) => {
      setActionLoading(
        "emergency",
      );

      setErrorMessage("");
      setSuccessMessage("");

      try {
        const data =
          await apiRequest(
            "/blood-donors/emergency-availability",
            {
              method: "PATCH",

              body:
                JSON.stringify({
                  emergencyAvailable:
                    value,
                }),
            },
          );

        setSuccessMessage(
          data?.message ||
            "Emergency availability updated.",
        );

        await Promise.all([
          loadMyDonorProfile(),
          loadDonors(),
        ]);
      } catch (error) {
        setErrorMessage(
          error.message,
        );
      } finally {
        setActionLoading("");
      }
    };

  /* =====================================================
     UPDATE DONOR INFORMATION
  ===================================================== */

  const saveDonorInformation =
    async (event) => {
      event.preventDefault();

      setActionLoading(
        "information",
      );

      setErrorMessage("");
      setSuccessMessage("");

      try {
        const payload = {
          lastDonationDate:
            donorForm.lastDonationDate ||
            null,

          totalDonations:
            Number(
              donorForm.totalDonations ||
                0,
            ),

          remarks:
            donorForm.remarks.trim(),
        };

        const data =
          await apiRequest(
            "/blood-donors/information",
            {
              method: "PATCH",

              body:
                JSON.stringify(
                  payload,
                ),
            },
          );

        setSuccessMessage(
          data?.message ||
            "Donor information updated.",
        );

        setProfileEditorOpen(
          false,
        );

        await loadMyDonorProfile();
      } catch (error) {
        setErrorMessage(
          error.message,
        );
      } finally {
        setActionLoading("");
      }
    };

  /* =====================================================
     LEAVE DONOR NETWORK
  ===================================================== */

  const leaveNetwork =
    async () => {
      const confirmed =
        window.confirm(
          "Are you sure you want to leave the SAHARA donor network?",
        );

      if (!confirmed) {
        return;
      }

      setActionLoading(
        "leave",
      );

      setErrorMessage("");
      setSuccessMessage("");

      try {
        const data =
          await apiRequest(
            "/blood-donors/leave",
            {
              method: "DELETE",
            },
          );

        setSuccessMessage(
          data?.message ||
            "You have left the blood donor network.",
        );

        setMyDonor(null);

        await loadDonors();
      } catch (error) {
        setErrorMessage(
          error.message,
        );
      } finally {
        setActionLoading("");
      }
    };

  /* =====================================================
     NO LOGIN
  ===================================================== */

  if (!getToken()) {
    return (
      <div className="min-h-screen bg-[#F7F9FD]">

        <header className="border-b border-[#E2E8F0] bg-white">

          <div className="mx-auto flex min-h-[76px] max-w-[1300px] items-center px-5 sm:px-8">

            <Link to="/">
              <img
                src={saharaLogo}
                alt="SAHARA"
                className="h-[47px] w-auto"
              />
            </Link>
          </div>
        </header>

        <div className="mx-auto flex min-h-[calc(100vh-76px)] max-w-[700px] items-center justify-center px-5">

          <div className="w-full rounded-[26px] border border-[#E0E7F0] bg-white p-8 text-center shadow-[0_20px_50px_rgba(20,46,79,0.07)]">

            <div className="mx-auto grid h-16 w-16 place-items-center rounded-[19px] bg-red-50 text-red-600">

              <Droplets
                size={28}
              />
            </div>

            <h1 className="mt-5 font-[Manrope] text-[25px] font-extrabold text-[#19324E]">
              Sign in to access blood donors
            </h1>

            <p className="mx-auto mt-3 max-w-[460px] text-[11px] leading-6 text-[#7D8FA2]">
              The donor network is connected to authenticated SAHARA accounts.
            </p>

            <Link
              to="/login"
              className="mt-6 inline-flex min-h-[46px] items-center justify-center rounded-[12px] bg-[#1717E8] px-6 text-[10px] font-extrabold !text-white"
            >
              <span className="!text-white">
                Sign in
              </span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  /* =====================================================
     PAGE
  ===================================================== */

  return (
    <div className="min-h-screen bg-[#F7F9FD] text-[#10233F]">

      {/* =================================================
          HEADER
      ================================================= */}

      <header className="sticky top-0 z-40 border-b border-[#E1E8F1] bg-white/95 backdrop-blur-xl">

        <div className="mx-auto flex min-h-[76px] max-w-[1440px] items-center justify-between gap-4 px-5 sm:px-8 lg:px-10">

          <Link
            to="/"
            className="flex items-center"
          >
            <img
              src={saharaLogo}
              alt="SAHARA"
              className="h-[47px] w-auto max-w-[180px] object-contain"
            />
          </Link>

          <div className="flex items-center gap-2">

            <Link
              to="/bloodRequest"
              className="hidden min-h-[40px] items-center gap-2 rounded-[11px] border border-red-100 bg-red-50 px-4 text-[9.5px] font-extrabold !text-red-600 sm:inline-flex"
            >
              <HeartPulse
                size={14}
              />

              <span className="!text-red-600">
                Blood Request
              </span>
            </Link>

            <Link
              to="/dashboard"
              className="inline-flex min-h-[40px] items-center rounded-[11px] bg-[#1717E8] px-4 text-[9.5px] font-extrabold !text-white"
            >
              <span className="!text-white">
                Dashboard
              </span>
            </Link>
          </div>
        </div>
      </header>

      {/* =================================================
          HERO
      ================================================= */}

      <section className="relative overflow-hidden border-b border-[#E4EAF2] bg-[radial-gradient(circle_at_80%_20%,rgba(224,50,69,0.07),transparent_28%),linear-gradient(135deg,#FFFFFF,#FFF7F8)]">

        <div className="mx-auto grid max-w-[1440px] gap-9 px-5 py-11 sm:px-8 sm:py-15 lg:grid-cols-[1fr_0.55fr] lg:items-center lg:px-10">

          <div>

            <Link
              to="/"
              className="inline-flex items-center gap-2 text-[9.5px] font-extrabold !text-[#72869A] transition hover:!text-[#1717E8]"
            >
              <ArrowLeft
                size={14}
              />

              <span>
                Back to home
              </span>
            </Link>

            <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-red-100 bg-white px-3 py-2 shadow-sm">

              <Droplets
                size={14}
                className="text-red-600"
              />

              <span className="text-[9px] font-extrabold uppercase tracking-[0.14em] text-red-600">
                SAHARA Blood Network
              </span>
            </div>

            <h1 className="mt-5 max-w-[700px] font-[Manrope] text-[38px] font-extrabold leading-[1.04] tracking-[-0.05em] text-[#102846] sm:text-[51px]">

              Give blood.
              <span className="block text-red-600">
                Help save time when it matters.
              </span>
            </h1>

            <p className="mt-5 max-w-[650px] text-[12px] leading-6 text-[#6E8195] sm:text-[13px]">

              Join the SAHARA donor network, manage your availability and help patients discover active blood donors.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">

            <HeroMetric
              icon={UsersRound}
              label="Active Donors"
              value={
                donors.length
              }
            />

            <HeroMetric
              icon={Activity}
              label="Emergency Ready"
              value={
                donors.filter(
                  (donor) =>
                    donor.emergencyAvailable,
                ).length
              }
              emergency
            />

            <HeroMetric
              icon={Droplets}
              label="Blood Groups"
              value={
                new Set(
                  donors
                    .map(
                      (donor) =>
                        donor.user
                          ?.bloodGroup ||
                        donor.bloodGroup,
                    )
                    .filter(Boolean),
                ).size
              }
            />

            <HeroMetric
              icon={MapPin}
              label="Cities"
              value={
                new Set(
                  donors
                    .map(
                      (donor) =>
                        donor.user
                          ?.city ||
                        donor.city,
                    )
                    .filter(Boolean),
                ).size
              }
            />
          </div>
        </div>
      </section>

      {/* =================================================
          CONTENT
      ================================================= */}

      <main className="mx-auto max-w-[1440px] px-5 py-8 sm:px-8 lg:px-10">

        {/* ALERTS */}

        {successMessage && (
          <AlertBox
            type="success"
            message={
              successMessage
            }
            onClose={() =>
              setSuccessMessage(
                "",
              )
            }
          />
        )}

        {errorMessage && (
          <AlertBox
            type="error"
            message={
              errorMessage
            }
            onClose={() =>
              setErrorMessage("")
            }
          />
        )}

        {/* =================================================
            MY DONOR PROFILE
        ================================================= */}

        <section className="mb-8">

          {loadingProfile ? (
            <div className="rounded-[22px] border border-[#E1E8F0] bg-white p-6">

              <div className="flex items-center gap-3">

                <LoaderCircle
                  size={18}
                  className="animate-spin text-[#1717E8]"
                />

                <span className="text-[10px] font-semibold text-[#7C8EA1]">
                  Checking your donor status...
                </span>
              </div>
            </div>
          ) : myDonor ? (
            <MyDonorPanel
              donor={
                myDonor
              }
              user={user}
              actionLoading={
                actionLoading
              }
              onAvailability={
                updateAvailability
              }
              onEmergency={
                updateEmergencyAvailability
              }
              onEdit={() =>
                setProfileEditorOpen(
                  true,
                )
              }
              onLeave={
                leaveNetwork
              }
            />
          ) : (
            <BecomeDonorPanel
              user={user}
              loading={
                actionLoading ===
                "become"
              }
              onBecome={
                becomeDonor
              }
            />
          )}
        </section>

        {/* =================================================
            SEARCH
        ================================================= */}

        <section className="rounded-[22px] border border-[#DFE7F0] bg-white p-4 shadow-[0_12px_32px_rgba(20,46,79,0.045)] sm:p-5">

          <div className="grid gap-3 lg:grid-cols-[1fr_180px_190px_auto]">

            <div className="relative">

              <Search
                size={17}
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
                placeholder="Search donor, blood group, city..."
                className="h-[50px] w-full rounded-[13px] border border-[#DBE5EF] bg-[#F9FBFD] pl-11 pr-4 text-[11px] text-[#344B64] outline-none focus:border-[#1717E8] focus:bg-white focus:ring-4 focus:ring-[#1717E8]/10"
              />
            </div>

            <SelectFilter
              value={
                bloodGroupFilter
              }
              onChange={
                setBloodGroupFilter
              }
              placeholder="All blood groups"
              options={
                BLOOD_GROUPS
              }
            />

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
                    loadDonors();
                  }
                }}
                placeholder="City"
                className="h-[50px] min-w-0 flex-1 rounded-[13px] border border-[#DBE5EF] bg-[#F9FBFD] px-4 text-[11px] text-[#344B64] outline-none focus:border-[#1717E8]"
              />

              <button
                type="button"
                onClick={
                  loadDonors
                }
                className="grid h-[50px] w-[50px] shrink-0 place-items-center rounded-[13px] bg-[#1717E8] text-white"
              >
                <Search size={15} />
              </button>
            </div>

            <button
              type="button"
              onClick={() =>
                setEmergencyOnly(
                  (value) =>
                    !value,
                )
              }
              className={`inline-flex h-[50px] items-center justify-center gap-2 rounded-[13px] border px-4 text-[9.5px] font-extrabold transition ${
                emergencyOnly
                  ? "border-red-200 bg-red-50 !text-red-600"
                  : "border-[#DBE5EF] bg-white !text-[#667B91]"
              }`}
            >
              <HeartPulse
                size={15}
              />

              <span
                className={
                  emergencyOnly
                    ? "!text-red-600"
                    : ""
                }
              >
                Emergency Ready
              </span>
            </button>
          </div>
        </section>

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="mt-8 flex items-end justify-between gap-4">

          <div>

            <p className="text-[9px] font-extrabold uppercase tracking-[0.13em] text-red-600">
              Active Network
            </p>

            <h2 className="mt-1 font-[Manrope] text-[22px] font-extrabold text-[#18324E]">
              Available Blood Donors
            </h2>

            <p className="mt-1 text-[9.5px] text-[#8998A8]">
              Donors who are currently active in SAHARA.
            </p>
          </div>

          <button
            type="button"
            onClick={
              loadDonors
            }
            className="grid h-10 w-10 place-items-center rounded-[11px] border border-[#DEE6EF] bg-white text-[#687C91]"
          >
            <RefreshCw
              size={15}
            />
          </button>
        </div>

        {/* =================================================
            LOADING
        ================================================= */}

        {loading && (
          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">

            {Array.from({
              length: 6,
            }).map(
              (_, index) => (
                <DonorSkeleton
                  key={index}
                />
              ),
            )}
          </div>
        )}

        {/* =================================================
            EMPTY
        ================================================= */}

        {!loading &&
          filteredDonors.length ===
            0 && (
            <div className="mt-6 rounded-[23px] border border-[#E0E7EF] bg-white px-6 py-16 text-center">

              <div className="mx-auto grid h-16 w-16 place-items-center rounded-[19px] bg-red-50 text-red-600">

                <Droplets
                  size={27}
                />
              </div>

              <h3 className="mt-5 font-[Manrope] text-[18px] font-extrabold text-[#29425D]">
                No matching donors found
              </h3>

              <p className="mx-auto mt-2 max-w-[470px] text-[10px] leading-6 text-[#8393A4]">
                Try another blood group, city or disable the emergency-only filter.
              </p>
            </div>
          )}

        {/* =================================================
            DONOR GRID
        ================================================= */}

        {!loading &&
          filteredDonors.length >
            0 && (
            <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">

              {filteredDonors.map(
                (donor) => (
                  <DonorCard
                    key={
                      donor._id
                    }
                    donor={
                      donor
                    }
                  />
                ),
              )}
            </div>
          )}

        {/* =================================================
            REQUEST CTA
        ================================================= */}

        <section className="mt-12 rounded-[25px] border border-red-100 bg-[linear-gradient(135deg,#FFF7F8,#FFF0F2)] p-6 sm:p-8">

          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-center">

            <div>

              <div className="flex items-center gap-2">

                <HeartPulse
                  size={16}
                  className="text-red-600"
                />

                <p className="text-[9px] font-extrabold uppercase tracking-[0.13em] text-red-600">
                  Need Blood?
                </p>
              </div>

              <h3 className="mt-2 font-[Manrope] text-[22px] font-extrabold text-[#18324E]">
                Create a blood request instead.
              </h3>

              <p className="mt-2 max-w-[650px] text-[10px] leading-5 text-[#73869A]">
                Create an urgent request with patient, hospital, blood group and contact information.
              </p>
            </div>

            <Link
              to="/bloodRequest"
              className="inline-flex min-h-[47px] items-center justify-center gap-2 rounded-[12px] bg-red-600 px-5 text-[10px] font-extrabold !text-white shadow-[0_12px_28px_rgba(220,38,38,0.14)]"
            >
              <Droplets
                size={15}
                className="text-white"
              />

              <span className="!text-white">
                Create Blood Request
              </span>
            </Link>
          </div>
        </section>
      </main>

      {/* =================================================
          EDIT MODAL
      ================================================= */}

      {profileEditorOpen && (
        <DonorInformationModal
          form={
            donorForm
          }
          setForm={
            setDonorForm
          }
          loading={
            actionLoading ===
            "information"
          }
          onSubmit={
            saveDonorInformation
          }
          onClose={() =>
            setProfileEditorOpen(
              false,
            )
          }
        />
      )}
    </div>
  );
};

/* =========================================================
   BECOME DONOR
========================================================= */

const BecomeDonorPanel = ({
  user,
  loading,
  onBecome,
}) => (
  <div className="relative overflow-hidden rounded-[24px] bg-[radial-gradient(circle_at_85%_20%,rgba(255,255,255,0.12),transparent_25%),linear-gradient(135deg,#9F1239,#DC2626)] p-6 text-white shadow-[0_20px_48px_rgba(185,28,28,0.16)] sm:p-7">

    <div className="relative flex flex-col justify-between gap-6 lg:flex-row lg:items-center">

      <div className="max-w-[700px]">

        <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-2">

          <UserPlus
            size={14}
            className="text-white"
          />

          <span className="text-[9px] font-extrabold uppercase tracking-[0.13em] !text-white">
            Join the Network
          </span>
        </div>

        <h2 className="mt-4 font-[Manrope] text-[27px] font-extrabold tracking-[-0.04em] !text-white">
          Become a SAHARA blood donor.
        </h2>

        <p className="mt-3 max-w-[620px] text-[10.5px] leading-6 !text-red-100">
          Your profile can appear to authenticated users looking for active blood donors.
        </p>

        <div className="mt-4 flex flex-wrap gap-3">

          <SmallHeroInfo
            label="Blood Group"
            value={
              user?.bloodGroup ||
              "Not added"
            }
          />

          <SmallHeroInfo
            label="City"
            value={
              user?.city ||
              "Not added"
            }
          />
        </div>
      </div>

      <button
        type="button"
        onClick={
          onBecome
        }
        disabled={
          loading
        }
        className="inline-flex min-h-[49px] shrink-0 items-center justify-center gap-2 rounded-[13px] bg-white px-6 text-[10px] font-extrabold shadow-sm transition hover:bg-red-50 disabled:opacity-60"
      >
        {loading ? (
          <LoaderCircle
            size={16}
            className="animate-spin text-red-600"
          />
        ) : (
          <Droplets
            size={16}
            className="text-red-600"
          />
        )}

        <span className="!text-red-600">
          {loading
            ? "Joining..."
            : "Become a Donor"}
        </span>
      </button>
    </div>
  </div>
);

/* =========================================================
   MY DONOR PANEL
========================================================= */

const MyDonorPanel = ({
  donor,
  user,
  actionLoading,
  onAvailability,
  onEmergency,
  onEdit,
  onLeave,
}) => {
  const name =
    donor.user?.fullName ||
    user?.fullName ||
    "Donor";

  const bloodGroup =
    donor.user?.bloodGroup ||
    user?.bloodGroup ||
    "—";

  return (
    <div className="overflow-hidden rounded-[24px] border border-[#DFE7F0] bg-white shadow-[0_14px_36px_rgba(20,46,79,0.05)]">

      <div className="bg-[linear-gradient(135deg,#0C2B50,#164B87)] p-6 text-white sm:p-7">

        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-center">

          <div className="flex items-center gap-4">

            <div className="grid h-16 w-16 shrink-0 place-items-center rounded-[18px] bg-white/10 font-[Manrope] text-[15px] font-extrabold !text-white ring-1 ring-white/10">

              {getInitials(
                name,
              )}
            </div>

            <div>

              <div className="flex items-center gap-2">

                <h2 className="font-[Manrope] text-[21px] font-extrabold !text-white">
                  {name}
                </h2>

                <BadgeCheck
                  size={16}
                  className="text-cyan-200"
                />
              </div>

              <p className="mt-1 text-[9.5px] font-semibold !text-blue-100">
                SAHARA Blood Donor
              </p>

              <div className="mt-3 flex gap-2">

                <span className="rounded-full bg-red-500/20 px-3 py-1.5 text-[9px] font-extrabold !text-red-100">
                  {bloodGroup}
                </span>

                {donor.availability && (
                  <span className="rounded-full bg-emerald-400/15 px-3 py-1.5 text-[9px] font-extrabold !text-emerald-200">
                    Available
                  </span>
                )}

                {donor.emergencyAvailable && (
                  <span className="rounded-full bg-white/10 px-3 py-1.5 text-[9px] font-extrabold !text-white">
                    Emergency Ready
                  </span>
                )}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={
              onEdit
            }
            className="self-start rounded-[11px] bg-white px-4 py-2.5 text-[9px] font-extrabold shadow-sm lg:self-auto"
          >
            <span className="!text-[#10233F]">
              Edit Donor Information
            </span>
          </button>
        </div>
      </div>

      <div className="grid gap-4 p-5 sm:grid-cols-2 sm:p-6 xl:grid-cols-4">

        <DonorSetting
          icon={Activity}
          title="Donor Availability"
          description="Appear in normal donor searches"
          enabled={
            donor.availability
          }
          loading={
            actionLoading ===
            "availability"
          }
          onToggle={() =>
            onAvailability(
              !donor.availability,
            )
          }
        />

        <DonorSetting
          icon={HeartPulse}
          title="Emergency Availability"
          description="Show as emergency-ready donor"
          enabled={
            donor.emergencyAvailable
          }
          emergency
          loading={
            actionLoading ===
            "emergency"
          }
          onToggle={() =>
            onEmergency(
              !donor.emergencyAvailable,
            )
          }
        />

        <DonorData
          icon={CalendarDays}
          label="Last Donation"
          value={formatDate(
            donor.lastDonationDate,
          )}
        />

        <DonorData
          icon={Droplets}
          label="Total Donations"
          value={
            donor.totalDonations ||
            0
          }
        />
      </div>

      <div className="flex flex-col justify-between gap-3 border-t border-[#EDF2F7] bg-[#FAFCFE] px-5 py-4 sm:flex-row sm:items-center sm:px-6">

        <p className="text-[9px] text-[#8998A8]">
          You can temporarily turn off availability without leaving the network.
        </p>

        <button
          type="button"
          onClick={
            onLeave
          }
          disabled={
            actionLoading ===
            "leave"
          }
          className="self-start text-[9px] font-extrabold text-red-600 disabled:opacity-50 sm:self-auto"
        >
          {actionLoading ===
          "leave"
            ? "Leaving..."
            : "Leave Donor Network"}
        </button>
      </div>
    </div>
  );
};

/* =========================================================
   DONOR SETTING
========================================================= */

const DonorSetting = ({
  icon: Icon,
  title,
  description,
  enabled,
  loading,
  emergency = false,
  onToggle,
}) => (
  <button
    type="button"
    onClick={
      onToggle
    }
    disabled={
      loading
    }
    className={`flex items-center gap-3 rounded-[17px] border p-4 text-left transition disabled:opacity-60 ${
      enabled
        ? emergency
          ? "border-red-200 bg-red-50"
          : "border-emerald-200 bg-emerald-50"
        : "border-[#E1E8F0] bg-[#FAFCFE]"
    }`}
  >

    <div
      className={`grid h-10 w-10 shrink-0 place-items-center rounded-[12px] ${
        enabled
          ? emergency
            ? "bg-red-100 text-red-600"
            : "bg-emerald-100 text-emerald-600"
          : "bg-[#EEF2F6] text-[#778A9E]"
      }`}
    >
      <Icon size={17} />
    </div>

    <div className="min-w-0 flex-1">

      <p className="text-[10px] font-extrabold text-[#344C65]">
        {title}
      </p>

      <p className="mt-1 text-[8px] leading-4 text-[#8797A7]">
        {description}
      </p>
    </div>

    {loading ? (
      <LoaderCircle
        size={18}
        className="animate-spin text-[#1717E8]"
      />
    ) : enabled ? (
      <ToggleRight
        size={25}
        className={
          emergency
            ? "text-red-600"
            : "text-emerald-600"
        }
      />
    ) : (
      <ToggleLeft
        size={25}
        className="text-[#A4AFBA]"
      />
    )}
  </button>
);

/* =========================================================
   DONOR DATA
========================================================= */

const DonorData = ({
  icon: Icon,
  label,
  value,
}) => (
  <div className="rounded-[17px] border border-[#E1E8F0] bg-[#FAFCFE] p-4">

    <div className="grid h-10 w-10 place-items-center rounded-[12px] bg-[#EEF2FF] text-[#1717E8]">
      <Icon size={17} />
    </div>

    <p className="mt-4 text-[8px] font-bold uppercase tracking-[0.08em] text-[#929FAD]">
      {label}
    </p>

    <p className="mt-1 text-[11px] font-extrabold text-[#344C65]">
      {value}
    </p>
  </div>
);

/* =========================================================
   DONOR CARD
========================================================= */

const DonorCard = ({
  donor,
}) => {
  const name =
    donor.user?.fullName ||
    donor.fullName ||
    "Blood Donor";

  const bloodGroup =
    donor.user?.bloodGroup ||
    donor.bloodGroup ||
    "—";

  const city =
    donor.user?.city ||
    donor.city ||
    "Not provided";

  const phone =
    donor.user?.phone ||
    donor.phone ||
    "";

  return (
    <article className="rounded-[21px] border border-[#DFE7F0] bg-white p-5 shadow-[0_10px_30px_rgba(20,46,79,0.04)] transition hover:-translate-y-0.5 hover:border-[#C9D5E2] hover:shadow-[0_16px_36px_rgba(20,46,79,0.07)]">

      <div className="flex items-start gap-4">

        <div className="relative">

          <div className="grid h-14 w-14 place-items-center rounded-[16px] bg-red-50 font-[Manrope] text-[13px] font-extrabold text-red-600">

            {getInitials(
              name,
            )}
          </div>

          {donor.availability && (
            <span className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-[3px] border-white bg-emerald-500" />
          )}
        </div>

        <div className="min-w-0 flex-1">

          <div className="flex items-center gap-2">

            <h3 className="truncate font-[Manrope] text-[14px] font-extrabold text-[#2A435E]">
              {name}
            </h3>

            <BadgeCheck
              size={14}
              className="text-[#1717E8]"
            />
          </div>

          <div className="mt-2 flex flex-wrap gap-2">

            <span className="rounded-full bg-red-50 px-2.5 py-1 text-[8.5px] font-extrabold text-red-600">
              {bloodGroup}
            </span>

            {donor.emergencyAvailable && (
              <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[8px] font-extrabold text-amber-700">
                Emergency Ready
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="mt-5 space-y-2.5">

        <DonorInfoRow
          icon={MapPin}
          value={city}
        />

        <DonorInfoRow
          icon={Activity}
          value={
            donor.availability
              ? "Currently available to donate"
              : "Unavailable"
          }
          green={
            donor.availability
          }
        />

        <DonorInfoRow
          icon={Droplets}
          value={`${donor.totalDonations || 0} recorded donation${
            Number(
              donor.totalDonations ||
                0,
            ) === 1
              ? ""
              : "s"
          }`}
        />
      </div>

      {donor.lastDonationDate && (
        <div className="mt-4 rounded-[12px] bg-[#F8FAFD] px-3 py-2.5">

          <p className="text-[8px] font-bold uppercase tracking-[0.08em] text-[#96A3B1]">
            Last Donation
          </p>

          <p className="mt-1 text-[9.5px] font-extrabold text-[#536A82]">
            {formatDate(
              donor.lastDonationDate,
            )}
          </p>
        </div>
      )}

      {phone && (
        <a
          href={`tel:${phone}`}
          className="mt-4 flex min-h-[43px] items-center justify-center gap-2 rounded-[11px] border border-red-100 bg-red-50 text-[9.5px] font-extrabold !text-red-600 transition hover:bg-red-100"
        >
          <Phone size={14} />

          <span className="!text-red-600">
            Contact Donor
          </span>
        </a>
      )}
    </article>
  );
};

/* =========================================================
   DONOR INFO ROW
========================================================= */

const DonorInfoRow = ({
  icon: Icon,
  value,
  green = false,
}) => (
  <div className="flex items-center gap-2.5">

    <Icon
      size={14}
      className={
        green
          ? "text-emerald-600"
          : "text-[#8494A5]"
      }
    />

    <p
      className={`text-[9px] font-semibold ${
        green
          ? "text-emerald-700"
          : "text-[#64798F]"
      }`}
    >
      {value}
    </p>
  </div>
);

/* =========================================================
   HERO METRIC
========================================================= */

const HeroMetric = ({
  icon: Icon,
  label,
  value,
  emergency = false,
}) => (
  <div className="rounded-[17px] border border-[#E2E8F0] bg-white/85 p-4 shadow-[0_10px_26px_rgba(24,48,78,0.045)] backdrop-blur">

    <div
      className={`grid h-9 w-9 place-items-center rounded-[11px] ${
        emergency
          ? "bg-red-50 text-red-600"
          : "bg-[#EEF2FF] text-[#1717E8]"
      }`}
    >
      <Icon size={17} />
    </div>

    <p className="mt-4 font-[Manrope] text-[22px] font-extrabold text-[#19324E]">
      {value}
    </p>

    <p className="mt-1 text-[8px] font-bold text-[#8A99A8]">
      {label}
    </p>
  </div>
);

/* =========================================================
   SMALL HERO INFO
========================================================= */

const SmallHeroInfo = ({
  label,
  value,
}) => (
  <div className="rounded-[11px] bg-white/10 px-3 py-2">

    <p className="text-[7.5px] font-bold uppercase tracking-[0.09em] !text-red-200">
      {label}
    </p>

    <p className="mt-1 text-[9.5px] font-extrabold !text-white">
      {value}
    </p>
  </div>
);

/* =========================================================
   SELECT FILTER
========================================================= */

const SelectFilter = ({
  value,
  onChange,
  options,
  placeholder,
}) => (
  <div className="relative">

    <select
      value={value}
      onChange={(event) =>
        onChange(
          event.target.value,
        )
      }
      className="h-[50px] w-full appearance-none rounded-[13px] border border-[#DBE5EF] bg-[#F9FBFD] px-4 pr-10 text-[11px] text-[#344B64] outline-none focus:border-[#1717E8]"
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
        ),
      )}
    </select>

    <ChevronDown
      size={14}
      className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#8C9BAB]"
    />
  </div>
);

/* =========================================================
   DONOR INFORMATION MODAL
========================================================= */

const DonorInformationModal = ({
  form,
  setForm,
  loading,
  onSubmit,
  onClose,
}) => (
  <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">

    <button
      type="button"
      onClick={
        onClose
      }
      className="absolute inset-0 bg-[#10233F]/55 backdrop-blur-sm"
      aria-label="Close donor information editor"
    />

    <form
      onSubmit={
        onSubmit
      }
      className="relative w-full max-w-[580px] overflow-hidden rounded-[25px] bg-white shadow-[0_35px_100px_rgba(9,31,61,0.28)]"
    >

      <div className="flex items-center justify-between border-b border-[#EDF2F7] px-5 py-5 sm:px-6">

        <div>

          <p className="text-[8.5px] font-extrabold uppercase tracking-[0.13em] text-red-600">
            Donor Profile
          </p>

          <h2 className="mt-1 font-[Manrope] text-[18px] font-extrabold text-[#1C344F]">
            Donation Information
          </h2>
        </div>

        <button
          type="button"
          onClick={
            onClose
          }
          className="grid h-9 w-9 place-items-center rounded-[11px] bg-[#F1F4F8] text-[#687C91]"
        >
          <X size={16} />
        </button>
      </div>

      <div className="space-y-5 p-5 sm:p-6">

        <InputField
          label="Last donation date"
          type="date"
          value={
            form.lastDonationDate
          }
          onChange={(value) =>
            setForm(
              (previous) => ({
                ...previous,
                lastDonationDate:
                  value,
              }),
            )
          }
        />

        <InputField
          label="Total donations"
          type="number"
          min="0"
          value={
            form.totalDonations
          }
          onChange={(value) =>
            setForm(
              (previous) => ({
                ...previous,
                totalDonations:
                  value,
              }),
            )
          }
        />

        <div>

          <label className="mb-2 block text-[10px] font-extrabold text-[#526A82]">
            Remarks
          </label>

          <textarea
            rows="4"
            value={
              form.remarks
            }
            onChange={(event) =>
              setForm(
                (previous) => ({
                  ...previous,
                  remarks:
                    event.target
                      .value,
                }),
              )
            }
            placeholder="Optional donor notes..."
            className="w-full resize-none rounded-[13px] border border-[#DCE6F0] bg-[#FAFCFE] px-4 py-3 text-[11px] leading-6 text-[#344B64] outline-none focus:border-[#1717E8] focus:bg-white focus:ring-4 focus:ring-[#1717E8]/10"
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 border-t border-[#EDF2F7] bg-[#FAFCFE] px-5 py-4 sm:px-6">

        <button
          type="button"
          onClick={
            onClose
          }
          className="min-h-[43px] rounded-[11px] border border-[#DCE5EE] bg-white px-4 text-[9px] font-extrabold text-[#62768C]"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={
            loading
          }
          className="inline-flex min-h-[43px] items-center justify-center gap-2 rounded-[11px] bg-[#1717E8] px-5 text-[9px] font-extrabold !text-white disabled:opacity-50"
        >
          {loading && (
            <LoaderCircle
              size={14}
              className="animate-spin text-white"
            />
          )}

          <span className="!text-white">
            Save Information
          </span>
        </button>
      </div>
    </form>
  </div>
);

/* =========================================================
   INPUT
========================================================= */

const InputField = ({
  label,
  type = "text",
  value,
  onChange,
  min,
}) => (
  <div>

    <label className="mb-2 block text-[10px] font-extrabold text-[#526A82]">
      {label}
    </label>

    <input
      type={type}
      min={min}
      value={value}
      onChange={(event) =>
        onChange(
          event.target.value,
        )
      }
      className="h-[48px] w-full rounded-[13px] border border-[#DCE6F0] bg-[#FAFCFE] px-4 text-[11px] text-[#344B64] outline-none focus:border-[#1717E8] focus:bg-white focus:ring-4 focus:ring-[#1717E8]/10"
    />
  </div>
);

/* =========================================================
   ALERT
========================================================= */

const AlertBox = ({
  type,
  message,
  onClose,
}) => {
  const success =
    type === "success";

  const Icon =
    success
      ? CheckCircle2
      : AlertCircle;

  return (
    <div
      className={`mb-5 flex items-start justify-between gap-3 rounded-[15px] border p-4 ${
        success
          ? "border-emerald-200 bg-emerald-50"
          : "border-red-200 bg-red-50"
      }`}
    >

      <div className="flex items-start gap-3">

        <Icon
          size={17}
          className={
            success
              ? "mt-0.5 text-emerald-600"
              : "mt-0.5 text-red-600"
          }
        />

        <p
          className={`text-[10px] font-semibold leading-5 ${
            success
              ? "text-emerald-700"
              : "text-red-700"
          }`}
        >
          {message}
        </p>
      </div>

      <button
        type="button"
        onClick={
          onClose
        }
      >
        <X
          size={15}
          className={
            success
              ? "text-emerald-600"
              : "text-red-600"
          }
        />
      </button>
    </div>
  );
};

/* =========================================================
   SKELETON
========================================================= */

const DonorSkeleton = () => (
  <div className="animate-pulse rounded-[21px] border border-[#E2E8EF] bg-white p-5">

    <div className="flex gap-4">

      <div className="h-14 w-14 rounded-[16px] bg-[#F0F2F5]" />

      <div className="flex-1">

        <div className="h-4 w-3/4 rounded bg-[#EEF1F4]" />

        <div className="mt-3 h-3 w-1/2 rounded bg-[#F1F3F6]" />
      </div>
    </div>

    <div className="mt-6 space-y-3">

      <div className="h-3 w-4/5 rounded bg-[#F1F3F6]" />

      <div className="h-3 w-3/5 rounded bg-[#F1F3F6]" />

      <div className="h-3 w-2/3 rounded bg-[#F1F3F6]" />
    </div>
  </div>
);

export default BloodDonor;