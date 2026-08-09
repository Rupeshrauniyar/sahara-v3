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
  AlertCircle,
  ArrowLeft,
  BadgeCheck,
  Building2,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  Clock3,
  HeartPulse,
  Hospital,
  LoaderCircle,
  MapPin,
  RefreshCw,
  Search,
  Sparkles,
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

const formatMoney = (value) => {
  return `Rs. ${Number(
    value || 0,
  ).toLocaleString()}`;
};

const formatDate = (
  value,
  withTime = true,
) => {
  if (!value) {
    return "—";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return "—";
  }

  return new Intl.DateTimeFormat(
    "en-US",
    {
      month: "short",
      day: "numeric",
      year: "numeric",

      ...(withTime
        ? {
            hour: "numeric",
            minute: "2-digit",
          }
        : {}),
    },
  ).format(date);
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

const getDoctorName = (doctor) =>
  doctor?.user?.fullName ||
  doctor?.fullName ||
  "Doctor";

/* =========================================================
   APPOINTMENT PAGE
========================================================= */

const Appointment = () => {
  const navigate =
    useNavigate();

  const location =
    useLocation();

  const user =
    getStoredUser();

  /* =====================================================
     STATE
  ===================================================== */

  const [
    availableDoctors,
    setAvailableDoctors,
  ] = useState([]);

  const [
    selectedDoctor,
    setSelectedDoctor,
  ] = useState(
    location.state
      ?.selectedDoctor ||
      null,
  );

  const [
    appointments,
    setAppointments,
  ] = useState([]);

  const [
    loadingDoctors,
    setLoadingDoctors,
  ] = useState(true);

  const [
    loadingAppointments,
    setLoadingAppointments,
  ] = useState(true);

  const [
    submitting,
    setSubmitting,
  ] = useState(false);

  const [
    cancellingId,
    setCancellingId,
  ] = useState(null);

  const [
    searchTerm,
    setSearchTerm,
  ] = useState("");

  const [
    doctorPickerOpen,
    setDoctorPickerOpen,
  ] = useState(false);

  const [
    activeTab,
    setActiveTab,
  ] = useState("book");

  const [
    successMessage,
    setSuccessMessage,
  ] = useState("");

  const [
    errorMessage,
    setErrorMessage,
  ] = useState("");

  const [
    form,
    setForm,
  ] = useState({
    appointmentDate: "",
    appointmentType: "Physical",
    reason: "",
    notes: "",
  });

  /* =====================================================
     AUTH REQUEST
  ===================================================== */

  const apiRequest = async (
    path,
    options = {},
  ) => {
    const token =
      getToken();

    if (!token) {
      throw new Error(
        "Please sign in to continue.",
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
     LOAD AVAILABLE DOCTORS
  ===================================================== */

  const loadDoctors =
    async () => {
      setLoadingDoctors(true);

      try {
        const data =
          await apiRequest(
            "/appointments/doctors",
          );

        const list =
          Array.isArray(
            data?.doctors,
          )
            ? data.doctors
            : [];

        setAvailableDoctors(
          list,
        );

        /*
          If Doctor.jsx sent a selected doctor,
          try to replace it with the appointment
          endpoint version so we also get fees.
        */

        if (
          selectedDoctor?._id
        ) {
          const matching =
            list.find(
              (doctor) =>
                String(
                  doctor._id,
                ) ===
                String(
                  selectedDoctor._id,
                ),
            );

          if (matching) {
            setSelectedDoctor(
              matching,
            );
          }
        }
      } catch (error) {
        console.error(
          "Available doctors error:",
          error,
        );

        setErrorMessage(
          error.message,
        );
      } finally {
        setLoadingDoctors(
          false,
        );
      }
    };

  /* =====================================================
     LOAD MY APPOINTMENTS
  ===================================================== */

  const loadAppointments =
    async () => {
      setLoadingAppointments(
        true,
      );

      try {
        const data =
          await apiRequest(
            "/appointments/my",
          );

        setAppointments(
          Array.isArray(
            data?.appointments,
          )
            ? data.appointments
            : [],
        );
      } catch (error) {
        console.error(
          "Appointment loading error:",
          error,
        );

        /*
          Doctor / Hospital accounts may not use
          /appointments/my in the same way as patients.
          Keep page usable rather than crashing.
        */

        setAppointments([]);
      } finally {
        setLoadingAppointments(
          false,
        );
      }
    };

  useEffect(() => {
    loadDoctors();
    loadAppointments();
  }, []);

  /* =====================================================
     DOCTOR FROM NAVIGATION STATE
  ===================================================== */

  useEffect(() => {
    const doctor =
      location.state
        ?.selectedDoctor;

    if (doctor) {
      setSelectedDoctor(
        doctor,
      );

      setActiveTab("book");

      /*
        Clear router state so a browser refresh/back
        does not keep re-triggering selection.
      */

      navigate(
        location.pathname,
        {
          replace: true,
          state: {},
        },
      );
    }
  }, []);

  /* =====================================================
     FILTER DOCTORS
  ===================================================== */

  const filteredDoctors =
    useMemo(() => {
      const query =
        searchTerm
          .trim()
          .toLowerCase();

      if (!query) {
        return availableDoctors;
      }

      return availableDoctors.filter(
        (doctor) => {
          const name =
            getDoctorName(
              doctor,
            );

          const specialty =
            doctor.specialization ||
            "";

          const hospital =
            doctor.hospital
              ?.name ||
            "";

          const city =
            doctor.hospital
              ?.city ||
            "";

          return [
            name,
            specialty,
            hospital,
            city,
          ].some((value) =>
            String(value)
              .toLowerCase()
              .includes(query),
          );
        },
      );
    }, [
      availableDoctors,
      searchTerm,
    ]);

  /* =====================================================
     FORM
  ===================================================== */

  const handleChange = (
    event,
  ) => {
    const {
      name,
      value,
    } = event.target;

    setForm(
      (previous) => ({
        ...previous,
        [name]: value,
      }),
    );

    setErrorMessage("");
  };

  /* =====================================================
     SELECT DOCTOR
  ===================================================== */

  const chooseDoctor = (
    doctor,
  ) => {
    setSelectedDoctor(
      doctor,
    );

    setDoctorPickerOpen(
      false,
    );

    setSearchTerm("");

    setErrorMessage("");
  };

  /* =====================================================
     CREATE APPOINTMENT
  ===================================================== */

  const createAppointment =
    async (event) => {
      event.preventDefault();

      setErrorMessage("");
      setSuccessMessage("");

      if (!selectedDoctor?._id) {
        setErrorMessage(
          "Please select a doctor.",
        );

        return;
      }

      if (
        !form.appointmentDate
      ) {
        setErrorMessage(
          "Please select an appointment date and time.",
        );

        return;
      }

      const selectedDate =
        new Date(
          form.appointmentDate,
        );

      if (
        Number.isNaN(
          selectedDate.getTime(),
        ) ||
        selectedDate <=
          new Date()
      ) {
        setErrorMessage(
          "Appointment date must be in the future.",
        );

        return;
      }

      if (
        !form.reason.trim()
      ) {
        setErrorMessage(
          "Please provide a reason for the appointment.",
        );

        return;
      }

      setSubmitting(true);

      try {
        const payload = {
          doctor:
            selectedDoctor._id,

          appointmentDate:
            selectedDate.toISOString(),

          appointmentType:
            form.appointmentType,

          reason:
            form.reason.trim(),

          notes:
            form.notes.trim(),
        };

        const data =
          await apiRequest(
            "/appointments",
            {
              method: "POST",

              body:
                JSON.stringify(
                  payload,
                ),
            },
          );

        setSuccessMessage(
          data?.message ||
            "Appointment request submitted successfully.",
        );

        setForm({
          appointmentDate: "",
          appointmentType:
            "Physical",
          reason: "",
          notes: "",
        });

        await loadAppointments();

        setActiveTab(
          "appointments",
        );
      } catch (error) {
        setErrorMessage(
          error.message,
        );
      } finally {
        setSubmitting(false);
      }
    };

  /* =====================================================
     CANCEL APPOINTMENT
  ===================================================== */

  const cancelAppointment =
    async (appointment) => {
      if (
        !appointment?._id
      ) {
        return;
      }

      const confirmed =
        window.confirm(
          "Are you sure you want to cancel this appointment?",
        );

      if (!confirmed) {
        return;
      }

      setCancellingId(
        appointment._id,
      );

      setErrorMessage("");
      setSuccessMessage("");

      try {
        const data =
          await apiRequest(
            `/appointments/${appointment._id}/cancel`,
            {
              method: "PATCH",
            },
          );

        setSuccessMessage(
          data?.message ||
            "Appointment cancelled.",
        );

        await loadAppointments();
      } catch (error) {
        setErrorMessage(
          error.message,
        );
      } finally {
        setCancellingId(
          null,
        );
      }
    };

  /* =====================================================
     FEE
  ===================================================== */

  const selectedFee =
    useMemo(() => {
      if (!selectedDoctor) {
        return 0;
      }

      if (
        form.appointmentType ===
        "Virtual"
      ) {
        return (
          selectedDoctor
            .fees?.virtual ??
          selectedDoctor
            .virtualConsultationFee ??
          0
        );
      }

      return (
        selectedDoctor
          .fees?.physical ??
        selectedDoctor
          .consultationFee ??
        0
      );
    }, [
      selectedDoctor,
      form.appointmentType,
    ]);

  /* =====================================================
     NO TOKEN
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

            <div className="mx-auto grid h-16 w-16 place-items-center rounded-[19px] bg-[#EEF2FF] text-[#1717E8]">

              <CalendarDays
                size={27}
              />
            </div>

            <h1 className="mt-5 font-[Manrope] text-[25px] font-extrabold text-[#19324E]">
              Sign in to book appointments
            </h1>

            <p className="mx-auto mt-3 max-w-[450px] text-[11px] leading-6 text-[#7D8FA2]">
              Appointment booking is connected to your SAHARA account.
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

      <header className="sticky top-0 z-40 border-b border-[#E2E8F1] bg-white/95 backdrop-blur-xl">

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
              to="/doctor"
              className="hidden min-h-[40px] items-center gap-2 rounded-[11px] border border-[#DFE6EF] bg-white px-4 text-[9.5px] font-extrabold !text-[#536B83] transition hover:!text-[#1717E8] sm:inline-flex"
            >
              <Stethoscope
                size={14}
              />

              <span>
                Find Doctors
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

      <section className="border-b border-[#E4EAF2] bg-[radial-gradient(circle_at_82%_20%,rgba(23,23,232,0.07),transparent_27%),linear-gradient(135deg,#FFFFFF,#F1F5FF)]">

        <div className="mx-auto max-w-[1440px] px-5 py-10 sm:px-8 sm:py-14 lg:px-10">

          <Link
            to="/doctor"
            className="inline-flex items-center gap-2 text-[9.5px] font-extrabold !text-[#72869A] transition hover:!text-[#1717E8]"
          >
            <ArrowLeft
              size={14}
            />

            <span>
              Back to doctors
            </span>
          </Link>

          <div className="mt-5 flex flex-col justify-between gap-6 lg:flex-row lg:items-end">

            <div>

              <div className="inline-flex items-center gap-2 rounded-full border border-[#D8DFFF] bg-white px-3 py-2 shadow-sm">

                <CalendarDays
                  size={14}
                  className="text-[#1717E8]"
                />

                <span className="text-[9px] font-extrabold uppercase tracking-[0.14em] text-[#1717E8]">
                  Appointment Center
                </span>
              </div>

              <h1 className="mt-5 font-[Manrope] text-[36px] font-extrabold tracking-[-0.05em] text-[#102846] sm:text-[48px]">
                Book your consultation.
              </h1>

              <p className="mt-3 max-w-[660px] text-[12px] leading-6 text-[#718398]">
                Choose a registered doctor, consultation type and preferred time. Your request will be sent directly through SAHARA.
              </p>
            </div>

            <div className="flex items-center gap-3 rounded-[16px] border border-[#DDE5EF] bg-white px-4 py-3">

              <div className="grid h-9 w-9 place-items-center rounded-[11px] bg-[#EEF2FF] text-[#1717E8]">

                <UserRound
                  size={16}
                />
              </div>

              <div>

                <p className="text-[8px] font-bold uppercase tracking-[0.08em] text-[#96A3B1]">
                  Booking as
                </p>

                <p className="mt-0.5 text-[10px] font-extrabold text-[#344C65]">
                  {user?.fullName ||
                    "SAHARA User"}
                </p>
              </div>
            </div>
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

        {/* TABS */}

        <div className="mb-6 inline-flex rounded-[13px] bg-[#EDF1F6] p-1">

          <TabButton
            active={
              activeTab ===
              "book"
            }
            onClick={() =>
              setActiveTab(
                "book",
              )
            }
          >
            Book Appointment
          </TabButton>

          <TabButton
            active={
              activeTab ===
              "appointments"
            }
            onClick={() =>
              setActiveTab(
                "appointments",
              )
            }
          >
            My Appointments

            {appointments.length >
              0 && (
              <span className="ml-2 rounded-full bg-[#EEF2FF] px-2 py-0.5 text-[8px] font-extrabold text-[#1717E8]">
                {
                  appointments.length
                }
              </span>
            )}
          </TabButton>
        </div>

        {/* =================================================
            BOOK
        ================================================= */}

        {activeTab ===
          "book" && (
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1.3fr)_390px]">

            {/* FORM */}

            <form
              onSubmit={
                createAppointment
              }
              className="overflow-hidden rounded-[23px] border border-[#DFE7F0] bg-white shadow-[0_12px_34px_rgba(20,46,79,0.045)]"
            >

              <div className="border-b border-[#EDF2F7] px-5 py-5 sm:px-6">

                <p className="text-[9px] font-extrabold uppercase tracking-[0.13em] text-[#1717E8]">
                  New Consultation
                </p>

                <h2 className="mt-1 font-[Manrope] text-[17px] font-extrabold text-[#1C344F]">
                  Appointment Details
                </h2>

                <p className="mt-1 text-[9.5px] text-[#8998A8]">
                  Complete the information below to request your appointment.
                </p>
              </div>

              <div className="space-y-8 p-5 sm:p-6">

                {/* DOCTOR */}

                <FormSection
                  number="01"
                  title="Choose doctor"
                  description="Select who you would like to consult."
                >

                  {selectedDoctor ? (
                    <SelectedDoctorCard
                      doctor={
                        selectedDoctor
                      }
                      onChange={() =>
                        setDoctorPickerOpen(
                          true,
                        )
                      }
                    />
                  ) : (
                    <button
                      type="button"
                      onClick={() =>
                        setDoctorPickerOpen(
                          true,
                        )
                      }
                      className="flex w-full items-center justify-between rounded-[16px] border border-dashed border-[#BFCBDA] bg-[#FAFCFE] p-5 text-left transition hover:border-[#1717E8] hover:bg-[#F7F8FF]"
                    >

                      <div className="flex items-center gap-3">

                        <div className="grid h-11 w-11 place-items-center rounded-[13px] bg-[#EEF2FF] text-[#1717E8]">

                          <Stethoscope
                            size={19}
                          />
                        </div>

                        <div>

                          <p className="text-[11px] font-extrabold text-[#344C65]">
                            Select a doctor
                          </p>

                          <p className="mt-1 text-[9px] text-[#8C9AAA]">
                            Browse available SAHARA doctors
                          </p>
                        </div>
                      </div>

                      <ChevronDown
                        size={17}
                        className="text-[#8797A7]"
                      />
                    </button>
                  )}
                </FormSection>

                {/* TYPE */}

                <FormSection
                  number="02"
                  title="Consultation type"
                  description="Choose how you want to meet the doctor."
                >

                  <div className="grid gap-3 sm:grid-cols-2">

                    <AppointmentType
                      icon={Stethoscope}
                      title="Physical"
                      description="Visit the doctor or hospital in person"
                      active={
                        form.appointmentType ===
                        "Physical"
                      }
                      onClick={() =>
                        setForm(
                          (previous) => ({
                            ...previous,
                            appointmentType:
                              "Physical",
                          }),
                        )
                      }
                    />

                    <AppointmentType
                      icon={Video}
                      title="Virtual"
                      description="Online consultation"
                      active={
                        form.appointmentType ===
                        "Virtual"
                      }
                      onClick={() =>
                        setForm(
                          (previous) => ({
                            ...previous,
                            appointmentType:
                              "Virtual",
                          }),
                        )
                      }
                    />
                  </div>
                </FormSection>

                {/* DATE */}

                <FormSection
                  number="03"
                  title="Preferred date & time"
                  description="Choose a future date and time."
                >

                  <div className="max-w-[430px]">

                    <label className="mb-2 block text-[10px] font-extrabold text-[#536A82]">
                      Appointment date and time
                      <span className="ml-1 text-red-500">
                        *
                      </span>
                    </label>

                    <div className="relative">

                      <CalendarDays
                        size={17}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8C9CAC]"
                      />

                      <input
                        type="datetime-local"
                        name="appointmentDate"
                        value={
                          form.appointmentDate
                        }
                        onChange={
                          handleChange
                        }
                        min={new Date(
                          Date.now() +
                            60000,
                        )
                          .toISOString()
                          .slice(
                            0,
                            16,
                          )}
                        required
                        className="h-[50px] w-full rounded-[13px] border border-[#DCE6F0] bg-[#FAFCFE] pl-11 pr-4 text-[11px] font-semibold text-[#344B64] outline-none transition focus:border-[#1717E8] focus:bg-white focus:ring-4 focus:ring-[#1717E8]/10"
                      />
                    </div>

                    {selectedDoctor
                      ?.availableTime && (
                      <div className="mt-3 inline-flex items-center gap-2 rounded-[10px] bg-[#EEF2FF] px-3 py-2">

                        <Clock3
                          size={13}
                          className="text-[#1717E8]"
                        />

                        <span className="text-[8.5px] font-bold text-[#1717E8]">
                          Doctor availability:{" "}
                          {selectedDoctor
                            .availableTime
                            ?.start ||
                            "—"}{" "}
                          –{" "}
                          {selectedDoctor
                            .availableTime
                            ?.end ||
                            "—"}
                        </span>
                      </div>
                    )}
                  </div>
                </FormSection>

                {/* REASON */}

                <FormSection
                  number="04"
                  title="Reason for appointment"
                  description="Briefly explain what you need help with."
                >

                  <textarea
                    name="reason"
                    value={
                      form.reason
                    }
                    onChange={
                      handleChange
                    }
                    rows="4"
                    maxLength="500"
                    required
                    placeholder="For example: Follow-up consultation, general check-up, persistent headache..."
                    className="w-full resize-none rounded-[13px] border border-[#DCE6F0] bg-[#FAFCFE] px-4 py-3 text-[11px] leading-6 text-[#344B64] outline-none transition placeholder:text-[#9AA7B5] focus:border-[#1717E8] focus:bg-white focus:ring-4 focus:ring-[#1717E8]/10"
                  />

                  <p className="mt-1 text-right text-[8px] text-[#A0ACB8]">
                    {
                      form.reason
                        .length
                    }
                    /500
                  </p>
                </FormSection>

                {/* NOTES */}

                <FormSection
                  number="05"
                  title="Additional notes"
                  description="Optional information for the doctor."
                >

                  <textarea
                    name="notes"
                    value={
                      form.notes
                    }
                    onChange={
                      handleChange
                    }
                    rows="3"
                    maxLength="1000"
                    placeholder="Add any other details..."
                    className="w-full resize-none rounded-[13px] border border-[#DCE6F0] bg-[#FAFCFE] px-4 py-3 text-[11px] leading-6 text-[#344B64] outline-none transition placeholder:text-[#9AA7B5] focus:border-[#1717E8] focus:bg-white focus:ring-4 focus:ring-[#1717E8]/10"
                  />
                </FormSection>
              </div>

              {/* SUBMIT */}

              <div className="flex flex-col justify-between gap-4 border-t border-[#EDF2F7] bg-[#FAFCFE] px-5 py-5 sm:flex-row sm:items-center sm:px-6">

                <div>

                  <p className="text-[8px] font-bold uppercase tracking-[0.1em] text-[#8D9BAB]">
                    Estimated Consultation Fee
                  </p>

                  <p className="mt-1 font-[Manrope] text-[18px] font-extrabold text-[#1B3651]">
                    {selectedDoctor
                      ? formatMoney(
                          selectedFee,
                        )
                      : "Select doctor"}
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={
                    submitting ||
                    !selectedDoctor
                  }
                  className="inline-flex min-h-[50px] items-center justify-center gap-2 rounded-[13px] bg-[#1717E8] px-6 text-[10px] font-extrabold !text-white shadow-[0_12px_28px_rgba(23,23,232,0.18)] transition hover:bg-[#1010C9] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <LoaderCircle
                        size={16}
                        className="animate-spin text-white"
                      />

                      <span className="!text-white">
                        Sending Request...
                      </span>
                    </>
                  ) : (
                    <>
                      <CalendarDays
                        size={16}
                        className="text-white"
                      />

                      <span className="!text-white">
                        Request Appointment
                      </span>
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* SUMMARY */}

            <aside className="space-y-5">

              <div className="rounded-[23px] border border-[#DFE7F0] bg-white p-5 shadow-[0_12px_34px_rgba(20,46,79,0.045)]">

                <p className="text-[9px] font-extrabold uppercase tracking-[0.13em] text-[#1717E8]">
                  Booking Summary
                </p>

                <h3 className="mt-1 font-[Manrope] text-[16px] font-extrabold text-[#1C344F]">
                  Your Appointment
                </h3>

                <div className="mt-5 space-y-3">

                  <SummaryRow
                    icon={Stethoscope}
                    label="Doctor"
                    value={
                      selectedDoctor
                        ? `Dr. ${getDoctorName(
                            selectedDoctor,
                          )}`
                        : "Not selected"
                    }
                  />

                  <SummaryRow
                    icon={HeartPulse}
                    label="Specialization"
                    value={
                      selectedDoctor
                        ?.specialization ||
                      "—"
                    }
                  />

                  <SummaryRow
                    icon={CalendarDays}
                    label="Date"
                    value={
                      form.appointmentDate
                        ? formatDate(
                            form.appointmentDate,
                          )
                        : "Not selected"
                    }
                  />

                  <SummaryRow
                    icon={
                      form.appointmentType ===
                      "Virtual"
                        ? Video
                        : Hospital
                    }
                    label="Consultation"
                    value={
                      form.appointmentType
                    }
                  />
                </div>

                <div className="mt-5 rounded-[15px] bg-[#F2F4FF] p-4">

                  <p className="text-[8px] font-bold uppercase tracking-[0.08em] text-[#8997A7]">
                    Consultation fee
                  </p>

                  <p className="mt-1 font-[Manrope] text-[21px] font-extrabold text-[#1717E8]">
                    {selectedDoctor
                      ? formatMoney(
                          selectedFee,
                        )
                      : "—"}
                  </p>
                </div>
              </div>

              <div className="rounded-[23px] bg-[linear-gradient(145deg,#0C2B50,#164B87)] p-5 text-white">

                <Sparkles
                  size={20}
                  className="text-cyan-200"
                />

                <h3 className="mt-4 font-[Manrope] text-[16px] font-extrabold !text-white">
                  Need help choosing?
                </h3>

                <p className="mt-2 text-[9.5px] leading-5 !text-blue-100">
                  SAHARA AI can help you navigate toward the appropriate healthcare service.
                </p>

                <Link
                  to="/ai-bot"
                  className="mt-4 inline-flex min-h-[40px] items-center gap-2 rounded-[11px] bg-white px-4 text-[9px] font-extrabold"
                >
                  <span className="!text-[#10233F]">
                    Ask SAHARA AI
                  </span>

                  <Sparkles
                    size={13}
                    className="text-[#1717E8]"
                  />
                </Link>
              </div>
            </aside>
          </div>
        )}

        {/* =================================================
            MY APPOINTMENTS
        ================================================= */}

        {activeTab ===
          "appointments" && (
          <AppointmentsList
            appointments={
              appointments
            }
            loading={
              loadingAppointments
            }
            cancellingId={
              cancellingId
            }
            onCancel={
              cancelAppointment
            }
            onRefresh={
              loadAppointments
            }
            onBook={() =>
              setActiveTab(
                "book",
              )
            }
          />
        )}
      </main>

      {/* =================================================
          DOCTOR PICKER
      ================================================= */}

      {doctorPickerOpen && (
        <DoctorPicker
          doctors={
            filteredDoctors
          }
          loading={
            loadingDoctors
          }
          searchTerm={
            searchTerm
          }
          onSearch={
            setSearchTerm
          }
          selectedDoctor={
            selectedDoctor
          }
          onSelect={
            chooseDoctor
          }
          onClose={() =>
            setDoctorPickerOpen(
              false,
            )
          }
          onRefresh={
            loadDoctors
          }
        />
      )}
    </div>
  );
};

/* =========================================================
   SELECTED DOCTOR
========================================================= */

const SelectedDoctorCard = ({
  doctor,
  onChange,
}) => {
  const name =
    getDoctorName(
      doctor,
    );

  return (
    <div className="rounded-[17px] border border-[#DCE4FF] bg-[#F7F8FF] p-4">

      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">

        <div className="flex items-center gap-4">

          {doctor.user
            ?.profileImage ? (
            <img
              src={
                doctor.user
                  .profileImage
              }
              alt={`Dr. ${name}`}
              className="h-14 w-14 rounded-[16px] object-cover"
            />
          ) : (
            <div className="grid h-14 w-14 place-items-center rounded-[16px] bg-white font-[Manrope] text-[13px] font-extrabold text-[#1717E8] shadow-sm">
              {getInitials(
                name,
              )}
            </div>
          )}

          <div className="min-w-0">

            <div className="flex items-center gap-1.5">

              <p className="truncate font-[Manrope] text-[14px] font-extrabold text-[#28425D]">
                Dr. {name}
              </p>

              {doctor.user
                ?.isVerified && (
                <BadgeCheck
                  size={14}
                  className="text-[#1717E8]"
                />
              )}
            </div>

            <p className="mt-1 text-[9.5px] font-extrabold text-[#1717E8]">
              {doctor.specialization ||
                "Medical Professional"}
            </p>

            <p className="mt-1 text-[8.5px] text-[#8494A5]">
              {doctor.hospital
                ?.name ||
                doctor.practiceType ||
                "Independent Practice"}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={
            onChange
          }
          className="self-start rounded-[10px] border border-[#D8E0EB] bg-white px-3 py-2 text-[8.5px] font-extrabold !text-[#1717E8] sm:self-auto"
        >
          Change Doctor
        </button>
      </div>
    </div>
  );
};

/* =========================================================
   APPOINTMENT TYPE
========================================================= */

const AppointmentType = ({
  icon: Icon,
  title,
  description,
  active,
  onClick,
}) => (
  <button
    type="button"
    onClick={onClick}
    className={`rounded-[16px] border p-4 text-left transition ${
      active
        ? "border-[#9AAEFF] bg-[#F1F3FF]"
        : "border-[#E0E8F0] bg-[#FAFCFE] hover:border-[#C8D4E1]"
    }`}
  >

    <div className="flex items-start gap-3">

      <div
        className={`grid h-10 w-10 shrink-0 place-items-center rounded-[12px] ${
          active
            ? "bg-[#1717E8] text-white"
            : "bg-[#EEF2F6] text-[#71859A]"
        }`}
      >
        <Icon size={18} />
      </div>

      <div>

        <p
          className={`text-[10.5px] font-extrabold ${
            active
              ? "!text-[#1717E8]"
              : "!text-[#344C65]"
          }`}
        >
          {title}
        </p>

        <p className="mt-1 text-[8.5px] leading-4 text-[#8A99A8]">
          {description}
        </p>
      </div>
    </div>
  </button>
);

/* =========================================================
   DOCTOR PICKER
========================================================= */

const DoctorPicker = ({
  doctors,
  loading,
  searchTerm,
  onSearch,
  selectedDoctor,
  onSelect,
  onClose,
  onRefresh,
}) => (
  <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">

    <button
      type="button"
      onClick={onClose}
      className="absolute inset-0 bg-[#10233F]/55 backdrop-blur-sm"
      aria-label="Close doctor picker"
    />

    <div className="relative flex max-h-[88vh] w-full max-w-[780px] flex-col overflow-hidden rounded-[27px] bg-white shadow-[0_35px_100px_rgba(9,31,61,0.28)]">

      <div className="flex items-center justify-between border-b border-[#EDF2F7] px-5 py-5 sm:px-6">

        <div>

          <p className="text-[8.5px] font-extrabold uppercase tracking-[0.14em] text-[#1717E8]">
            Doctor Directory
          </p>

          <h2 className="mt-1 font-[Manrope] text-[19px] font-extrabold text-[#1C344F]">
            Choose a Doctor
          </h2>
        </div>

        <div className="flex gap-2">

          <button
            type="button"
            onClick={
              onRefresh
            }
            className="grid h-9 w-9 place-items-center rounded-[11px] bg-[#F2F5F8] text-[#687C91]"
          >
            <RefreshCw
              size={15}
            />
          </button>

          <button
            type="button"
            onClick={onClose}
            className="grid h-9 w-9 place-items-center rounded-[11px] bg-[#F2F5F8] text-[#687C91]"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      <div className="border-b border-[#EDF2F7] p-4 sm:px-6">

        <div className="relative">

          <Search
            size={16}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8D9CAC]"
          />

          <input
            value={
              searchTerm
            }
            onChange={(event) =>
              onSearch(
                event.target
                  .value,
              )
            }
            placeholder="Search doctor, specialization, hospital..."
            className="h-[48px] w-full rounded-[13px] border border-[#DCE6F0] bg-[#FAFCFE] pl-11 pr-4 text-[11px] text-[#344B64] outline-none focus:border-[#1717E8]"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 sm:p-6">

        {loading ? (
          <div className="flex min-h-[300px] items-center justify-center">

            <div className="text-center">

              <LoaderCircle
                size={25}
                className="mx-auto animate-spin text-[#1717E8]"
              />

              <p className="mt-3 text-[10px] text-[#8796A6]">
                Loading available doctors...
              </p>
            </div>
          </div>
        ) : doctors.length ===
          0 ? (
          <div className="py-16 text-center">

            <Stethoscope
              size={27}
              className="mx-auto text-[#A7B3BF]"
            />

            <p className="mt-4 text-[11px] font-extrabold text-[#526980]">
              No doctors found
            </p>
          </div>
        ) : (
          <div className="space-y-3">

            {doctors.map(
              (doctor) => (
                <DoctorPickerCard
                  key={
                    doctor._id
                  }
                  doctor={
                    doctor
                  }
                  selected={
                    String(
                      selectedDoctor?._id,
                    ) ===
                    String(
                      doctor._id,
                    )
                  }
                  onSelect={() =>
                    onSelect(
                      doctor,
                    )
                  }
                />
              ),
            )}
          </div>
        )}
      </div>
    </div>
  </div>
);

/* =========================================================
   DOCTOR PICKER CARD
========================================================= */

const DoctorPickerCard = ({
  doctor,
  selected,
  onSelect,
}) => {
  const name =
    getDoctorName(
      doctor,
    );

  const physicalFee =
    doctor.fees?.physical ??
    doctor.consultationFee ??
    0;

  const virtualFee =
    doctor.fees?.virtual ??
    doctor.virtualConsultationFee ??
    0;

  return (
    <button
      type="button"
      onClick={
        onSelect
      }
      className={`w-full rounded-[17px] border p-4 text-left transition ${
        selected
          ? "border-[#9EAFFF] bg-[#F2F4FF]"
          : "border-[#E1E8F0] bg-white hover:border-[#C8D5E3] hover:bg-[#FAFCFE]"
      }`}
    >

      <div className="flex items-start gap-4">

        <div
          className={`grid h-13 w-13 h-[52px] w-[52px] shrink-0 place-items-center rounded-[15px] font-[Manrope] text-[11px] font-extrabold ${
            selected
              ? "bg-[#1717E8] text-white"
              : "bg-[#EEF2FF] text-[#1717E8]"
          }`}
        >
          {getInitials(
            name,
          )}
        </div>

        <div className="min-w-0 flex-1">

          <div className="flex items-center gap-1.5">

            <p
              className={`truncate text-[11.5px] font-extrabold ${
                selected
                  ? "!text-[#1717E8]"
                  : "!text-[#304861]"
              }`}
            >
              Dr. {name}
            </p>

            {doctor.user
              ?.isVerified && (
              <BadgeCheck
                size={13}
                className="text-[#1717E8]"
              />
            )}
          </div>

          <p className="mt-1 text-[9px] font-bold text-[#687D92]">
            {doctor.specialization ||
              "Medical Professional"}
          </p>

          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[8px] font-semibold text-[#8A99A9]">

            {doctor.hospital
              ?.name && (
              <span className="inline-flex items-center gap-1">

                <Hospital
                  size={10}
                />

                {
                  doctor
                    .hospital
                    .name
                }
              </span>
            )}

            {doctor.hospital
              ?.city && (
              <span className="inline-flex items-center gap-1">

                <MapPin
                  size={10}
                />

                {
                  doctor
                    .hospital
                    .city
                }
              </span>
            )}
          </div>
        </div>

        <div className="hidden shrink-0 text-right sm:block">

          <p className="text-[8px] font-bold uppercase tracking-[0.08em] text-[#9AA7B4]">
            Physical
          </p>

          <p className="mt-1 text-[10px] font-extrabold text-[#344C65]">
            {formatMoney(
              physicalFee,
            )}
          </p>

          <p className="mt-2 text-[8px] font-bold uppercase tracking-[0.08em] text-[#9AA7B4]">
            Virtual
          </p>

          <p className="mt-1 text-[10px] font-extrabold text-[#344C65]">
            {formatMoney(
              virtualFee,
            )}
          </p>
        </div>
      </div>
    </button>
  );
};

/* =========================================================
   APPOINTMENT LIST
========================================================= */

const AppointmentsList = ({
  appointments,
  loading,
  cancellingId,
  onCancel,
  onRefresh,
  onBook,
}) => {
  if (loading) {
    return (
      <div className="flex min-h-[420px] items-center justify-center rounded-[23px] border border-[#E0E7EF] bg-white">

        <div className="text-center">

          <LoaderCircle
            size={26}
            className="mx-auto animate-spin text-[#1717E8]"
          />

          <p className="mt-3 text-[10px] font-semibold text-[#7D8EA0]">
            Loading your appointments...
          </p>
        </div>
      </div>
    );
  }

  if (
    appointments.length ===
    0
  ) {
    return (
      <div className="rounded-[23px] border border-[#E0E7EF] bg-white px-6 py-16 text-center">

        <div className="mx-auto grid h-16 w-16 place-items-center rounded-[19px] bg-[#EEF2FF] text-[#1717E8]">

          <CalendarDays
            size={27}
          />
        </div>

        <h3 className="mt-5 font-[Manrope] text-[18px] font-extrabold text-[#29425D]">
          No appointments yet
        </h3>

        <p className="mx-auto mt-2 max-w-[480px] text-[10px] leading-6 text-[#8595A5]">
          Book a consultation with a SAHARA doctor and it will appear here.
        </p>

        <button
          type="button"
          onClick={
            onBook
          }
          className="mt-5 rounded-[11px] bg-[#1717E8] px-5 py-3 text-[9.5px] font-extrabold !text-white"
        >
          <span className="!text-white">
            Book Appointment
          </span>
        </button>
      </div>
    );
  }

  return (
    <section className="overflow-hidden rounded-[23px] border border-[#DFE7F0] bg-white shadow-[0_12px_34px_rgba(20,46,79,0.045)]">

      <div className="flex items-center justify-between border-b border-[#EDF2F7] px-5 py-5 sm:px-6">

        <div>

          <p className="text-[9px] font-extrabold uppercase tracking-[0.13em] text-[#1717E8]">
            Appointment History
          </p>

          <h2 className="mt-1 font-[Manrope] text-[17px] font-extrabold text-[#1C344F]">
            My Appointments
          </h2>
        </div>

        <button
          type="button"
          onClick={
            onRefresh
          }
          className="grid h-9 w-9 place-items-center rounded-[11px] bg-[#F1F4F8] text-[#65798F]"
        >
          <RefreshCw
            size={15}
          />
        </button>
      </div>

      <div className="divide-y divide-[#EDF2F7]">

        {appointments.map(
          (appointment) => (
            <AppointmentRow
              key={
                appointment._id
              }
              appointment={
                appointment
              }
              cancelling={
                cancellingId ===
                appointment._id
              }
              onCancel={() =>
                onCancel(
                  appointment,
                )
              }
            />
          ),
        )}
      </div>
    </section>
  );
};

/* =========================================================
   APPOINTMENT ROW
========================================================= */

const AppointmentRow = ({
  appointment,
  cancelling,
  onCancel,
}) => {
  const doctor =
    appointment.doctor;

  const doctorName =
    getDoctorName(
      doctor,
    );

  const canCancel =
    appointment.status ===
      "Pending" ||
    appointment.status ===
      "Confirmed";

  return (
    <div className="p-5 transition hover:bg-[#FAFCFE] sm:p-6">

      <div className="flex flex-col gap-5 xl:flex-row xl:items-center">

        <div className="flex min-w-0 flex-1 items-center gap-4">

          <div className="grid h-13 w-13 h-[52px] w-[52px] shrink-0 place-items-center rounded-[15px] bg-[#EEF2FF] font-[Manrope] text-[11px] font-extrabold text-[#1717E8]">

            {getInitials(
              doctorName,
            )}
          </div>

          <div className="min-w-0">

            <p className="truncate text-[11.5px] font-extrabold text-[#304861]">
              Dr. {doctorName}
            </p>

            <p className="mt-1 text-[9px] font-bold text-[#1717E8]">
              {doctor
                ?.specialization ||
                "Medical Consultation"}
            </p>

            <p className="mt-1 text-[8.5px] text-[#8998A8]">
              {appointment.reason ||
                "Appointment"}
            </p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3 xl:w-[500px]">

          <AppointmentInfo
            label="Date"
            value={formatDate(
              appointment.appointmentDate,
            )}
          />

          <AppointmentInfo
            label="Type"
            value={
              appointment.appointmentType
            }
          />

          <AppointmentInfo
            label="Status"
            value={
              appointment.status
            }
            status
          />
        </div>

        {canCancel && (
          <button
            type="button"
            onClick={
              onCancel
            }
            disabled={
              cancelling
            }
            className="self-start rounded-[10px] border border-red-200 bg-red-50 px-3.5 py-2.5 text-[9px] font-extrabold text-red-600 transition hover:bg-red-100 disabled:opacity-50 xl:self-auto"
          >
            {cancelling
              ? "Cancelling..."
              : "Cancel"}
          </button>
        )}
      </div>
    </div>
  );
};

/* =========================================================
   FORM SECTION
========================================================= */

const FormSection = ({
  number,
  title,
  description,
  children,
}) => (
  <section>

    <div className="mb-4 flex items-start gap-3">

      <div className="grid h-8 w-8 shrink-0 place-items-center rounded-[9px] bg-[#EEF2FF] text-[9px] font-extrabold text-[#1717E8]">
        {number}
      </div>

      <div>

        <h3 className="text-[11px] font-extrabold text-[#344C65]">
          {title}
        </h3>

        <p className="mt-1 text-[8.5px] text-[#8A99A9]">
          {description}
        </p>
      </div>
    </div>

    {children}
  </section>
);

/* =========================================================
   SUMMARY ROW
========================================================= */

const SummaryRow = ({
  icon: Icon,
  label,
  value,
}) => (
  <div className="flex items-center gap-3 rounded-[13px] bg-[#F8FAFD] p-3">

    <div className="grid h-9 w-9 shrink-0 place-items-center rounded-[10px] bg-white text-[#1717E8] shadow-sm">

      <Icon size={15} />
    </div>

    <div className="min-w-0">

      <p className="text-[8px] font-bold uppercase tracking-[0.08em] text-[#98A5B3]">
        {label}
      </p>

      <p className="mt-0.5 truncate text-[9.5px] font-extrabold text-[#435B74]">
        {value}
      </p>
    </div>
  </div>
);

/* =========================================================
   APPOINTMENT INFO
========================================================= */

const AppointmentInfo = ({
  label,
  value,
  status = false,
}) => (
  <div>

    <p className="text-[8px] font-bold uppercase tracking-[0.08em] text-[#9BA7B4]">
      {label}
    </p>

    {status ? (
      <StatusBadge
        status={value}
      />
    ) : (
      <p className="mt-1 text-[9.5px] font-extrabold text-[#526A82]">
        {value || "—"}
      </p>
    )}
  </div>
);

/* =========================================================
   STATUS BADGE
========================================================= */

const StatusBadge = ({
  status,
}) => {
  const styles = {
    Pending:
      "bg-amber-50 text-amber-700",

    Confirmed:
      "bg-emerald-50 text-emerald-700",

    Completed:
      "bg-blue-50 text-blue-700",

    Cancelled:
      "bg-slate-100 text-slate-600",

    Rejected:
      "bg-red-50 text-red-700",
  };

  return (
    <span
      className={`mt-1 inline-flex rounded-full px-2.5 py-1 text-[8px] font-extrabold ${
        styles[status] ||
        "bg-slate-100 text-slate-600"
      }`}
    >
      {status || "Pending"}
    </span>
  );
};

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
        onClick={onClose}
        className={
          success
            ? "text-emerald-600"
            : "text-red-600"
        }
      >
        <X size={15} />
      </button>
    </div>
  );
};

/* =========================================================
   TAB
========================================================= */

const TabButton = ({
  active,
  onClick,
  children,
}) => (
  <button
    type="button"
    onClick={onClick}
    className={`rounded-[10px] px-4 py-2.5 text-[9.5px] font-extrabold transition ${
      active
        ? "bg-white !text-[#1717E8] shadow-sm"
        : "text-[#708297]"
    }`}
  >
    {children}
  </button>
);

export default Appointment;