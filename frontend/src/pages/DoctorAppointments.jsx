import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  Filter,
  Hospital,
  LoaderCircle,
  Mail,
  MapPin,
  Phone,
  RefreshCw,
  Search,
  Stethoscope,
  Video,
  XCircle,
} from "lucide-react";

/* =========================================================
   API
========================================================= */

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:3000/api";

/* =========================================================
   CONSTANTS
========================================================= */

const STATUS_FILTERS = [
  "All",
  "Pending",
  "Confirmed",
  "Completed",
  "Cancelled",
  "Rejected",
];

/* =========================================================
   HELPERS
========================================================= */

const getToken = () =>
  localStorage.getItem("token") ||
  sessionStorage.getItem("token");

const formatDate = (value) => {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

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
      hour: "numeric",
      minute: "2-digit",
    },
  ).format(date);
};

const formatMoney = (value) =>
  `Rs. ${Number(
    value || 0,
  ).toLocaleString()}`;

const getInitials = (name) => {
  if (!name) {
    return "PT";
  }

  return name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
};

/* =========================================================
   DOCTOR APPOINTMENTS
========================================================= */

const DoctorAppointments = () => {
  const [
    appointments,
    setAppointments,
  ] = useState([]);

  const [
    loading,
    setLoading,
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
    selectedStatus,
    setSelectedStatus,
  ] = useState("All");

  const [
    searchTerm,
    setSearchTerm,
  ] = useState("");

  /* =====================================================
     API REQUEST
  ===================================================== */

  const apiRequest = async (
    path,
    options = {},
  ) => {
    const token = getToken();

    if (!token) {
      throw new Error(
        "Authentication required.",
      );
    }

    const response = await fetch(
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
      throw new Error(
        data?.message ||
          "Something went wrong.",
      );
    }

    return data;
  };

  /* =====================================================
     LOAD APPOINTMENTS
  ===================================================== */

  const loadAppointments =
    async () => {
      setLoading(true);
      setErrorMessage("");

      try {
        const data =
          await apiRequest(
            "/appointments/doctor",
          );

        setAppointments(
          Array.isArray(
            data?.appointments,
          )
            ? data.appointments
            : [],
        );
      } catch (error) {
        setAppointments([]);

        setErrorMessage(
          error.message,
        );
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    loadAppointments();
  }, []);

  /* =====================================================
     FILTERED APPOINTMENTS
  ===================================================== */

  const filteredAppointments =
    useMemo(() => {
      const query =
        searchTerm
          .trim()
          .toLowerCase();

      return appointments.filter(
        (appointment) => {
          if (
            selectedStatus !==
              "All" &&
            appointment.status !==
              selectedStatus
          ) {
            return false;
          }

          if (!query) {
            return true;
          }

          const patientName =
            appointment.patient
              ?.fullName ||
            "";

          const email =
            appointment.patient
              ?.email ||
            "";

          const phone =
            appointment.patient
              ?.phone ||
            "";

          const reason =
            appointment.reason ||
            "";

          const type =
            appointment.appointmentType ||
            "";

          return [
            patientName,
            email,
            phone,
            reason,
            type,
          ].some((value) =>
            String(value)
              .toLowerCase()
              .includes(query),
          );
        },
      );
    }, [
      appointments,
      searchTerm,
      selectedStatus,
    ]);

  /* =====================================================
     COUNTS
  ===================================================== */

  const counts =
    useMemo(() => {
      return STATUS_FILTERS.reduce(
        (result, status) => {
          result[status] =
            status === "All"
              ? appointments.length
              : appointments.filter(
                  (item) =>
                    item.status ===
                    status,
                ).length;

          return result;
        },
        {},
      );
    }, [appointments]);

  /* =====================================================
     UPDATE STATUS
  ===================================================== */

  const updateStatus =
    async (
      appointment,
      status,
    ) => {
      if (!appointment?._id) {
        return;
      }

      let question =
        `Change this appointment to ${status}?`;

      if (
        status === "Rejected"
      ) {
        question =
          "Reject this appointment request?";
      }

      if (
        status === "Completed"
      ) {
        question =
          "Mark this appointment as completed?";
      }

      const confirmed =
        window.confirm(question);

      if (!confirmed) {
        return;
      }

      setActionLoading(
        `${appointment._id}-${status}`,
      );

      setErrorMessage("");
      setSuccessMessage("");

      try {
        const data =
          await apiRequest(
            `/appointments/${appointment._id}/status`,
            {
              method: "PATCH",

              body:
                JSON.stringify({
                  status,
                }),
            },
          );

        setSuccessMessage(
          data?.message ||
            `Appointment updated to ${status}.`,
        );

        setAppointments(
          (previous) =>
            previous.map(
              (item) =>
                String(
                  item._id,
                ) ===
                String(
                  appointment._id,
                )
                  ? data?.appointment ||
                    {
                      ...item,
                      status,
                    }
                  : item,
            ),
        );
      } catch (error) {
        setErrorMessage(
          error.message,
        );
      } finally {
        setActionLoading("");
      }
    };

  /* =====================================================
     CANCEL APPOINTMENT
  ===================================================== */

  const cancelAppointment =
    async (appointment) => {
      if (!appointment?._id) {
        return;
      }

      const confirmed =
        window.confirm(
          "Cancel this appointment?",
        );

      if (!confirmed) {
        return;
      }

      setActionLoading(
        `${appointment._id}-Cancelled`,
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

        setAppointments(
          (previous) =>
            previous.map(
              (item) =>
                String(
                  item._id,
                ) ===
                String(
                  appointment._id,
                )
                  ? data?.appointment ||
                    {
                      ...item,
                      status:
                        "Cancelled",
                    }
                  : item,
            ),
        );
      } catch (error) {
        setErrorMessage(
          error.message,
        );
      } finally {
        setActionLoading("");
      }
    };

  /* =====================================================
     LOADING
  ===================================================== */

  if (loading) {
    return (
      <div className="flex min-h-[430px] items-center justify-center">

        <div className="text-center">

          <LoaderCircle
            size={30}
            className="mx-auto animate-spin text-[#1717E8]"
          />

          <p className="mt-3 text-[11px] font-semibold text-[#74879B]">
            Loading doctor appointments...
          </p>
        </div>
      </div>
    );
  }

  /* =====================================================
     PAGE
  ===================================================== */

  return (
    <div className="w-full">

      {/* HERO */}

      <section className="overflow-hidden rounded-[25px] bg-[radial-gradient(circle_at_85%_20%,rgba(255,255,255,0.14),transparent_28%),linear-gradient(135deg,#102F55,#18528E)] p-6 text-white shadow-[0_18px_45px_rgba(18,57,97,0.14)] sm:p-8">

        <div className="flex flex-col justify-between gap-7 lg:flex-row lg:items-end">

          <div>

            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-2">

              <CalendarDays
                size={14}
                className="text-cyan-200"
              />

              <span className="text-[8.5px] font-extrabold uppercase tracking-[0.13em] !text-white">
                Doctor Appointments
              </span>
            </div>

            <h1 className="mt-5 font-[Manrope] text-[30px] font-extrabold tracking-[-0.045em] !text-white sm:text-[38px]">
              Manage patient appointments.
            </h1>

            <p className="mt-3 max-w-[650px] text-[10px] leading-6 !text-blue-100 sm:text-[11px]">
              Review patient requests, confirm consultations, reject unavailable requests and complete finished appointments.
            </p>
          </div>

          <button
            type="button"
            onClick={
              loadAppointments
            }
            className="inline-flex min-h-[44px] self-start items-center gap-2 rounded-[12px] bg-white px-4 text-[9px] font-extrabold shadow-sm lg:self-auto"
          >

            <RefreshCw
              size={14}
              className="text-[#1717E8]"
            />

            <span className="!text-[#18324E]">
              Refresh
            </span>
          </button>
        </div>
      </section>

      {/* SUCCESS */}

      {successMessage && (
        <div className="mt-5 flex items-start gap-3 rounded-[15px] border border-emerald-200 bg-emerald-50 p-4">

          <CheckCircle2
            size={17}
            className="mt-0.5 text-emerald-600"
          />

          <p className="text-[10px] font-semibold text-emerald-700">
            {successMessage}
          </p>
        </div>
      )}

      {/* ERROR */}

      {errorMessage && (
        <div className="mt-5 flex items-start gap-3 rounded-[15px] border border-red-200 bg-red-50 p-4">

          <XCircle
            size={17}
            className="mt-0.5 text-red-600"
          />

          <p className="text-[10px] font-semibold text-red-700">
            {errorMessage}
          </p>
        </div>
      )}

      {/* STATUS FILTERS */}

      <section className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">

        {STATUS_FILTERS.map(
          (status) => (
            <StatusStat
              key={status}
              status={status}
              value={
                counts[status] ||
                0
              }
              active={
                selectedStatus ===
                status
              }
              onClick={() =>
                setSelectedStatus(
                  status,
                )
              }
            />
          ),
        )}
      </section>

      {/* SEARCH */}

      <section className="mt-6 rounded-[20px] border border-[#DFE7F0] bg-white p-4 shadow-[0_10px_30px_rgba(20,46,79,0.04)]">

        <div className="flex flex-col gap-3 lg:flex-row">

          <div className="relative flex-1">

            <Search
              size={16}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8C9CAC]"
            />

            <input
              value={
                searchTerm
              }
              onChange={(event) =>
                setSearchTerm(
                  event.target.value,
                )
              }
              placeholder="Search patient, phone, email, appointment reason..."
              className="h-[48px] w-full rounded-[13px] border border-[#DCE5EF] bg-[#FAFCFE] pl-11 pr-4 text-[10.5px] text-[#344B64] outline-none focus:border-[#1717E8] focus:bg-white focus:ring-4 focus:ring-[#1717E8]/10"
            />
          </div>

          <div className="inline-flex items-center gap-2 rounded-[13px] border border-[#DFE6EF] bg-[#F8FAFD] px-4">

            <Filter
              size={14}
              className="text-[#788A9C]"
            />

            <span className="text-[9px] font-bold text-[#687D92]">
              {
                filteredAppointments.length
              }{" "}
              result
              {filteredAppointments.length ===
              1
                ? ""
                : "s"}
            </span>
          </div>
        </div>
      </section>

      {/* EMPTY */}

      {filteredAppointments.length ===
        0 && (
        <div className="mt-6 rounded-[22px] border border-[#E0E7EF] bg-white px-6 py-16 text-center">

          <div className="mx-auto grid h-16 w-16 place-items-center rounded-[18px] bg-[#EEF2FF] text-[#1717E8]">

            <CalendarDays
              size={27}
            />
          </div>

          <h3 className="mt-5 font-[Manrope] text-[17px] font-extrabold text-[#29425D]">
            No appointments found
          </h3>

          <p className="mx-auto mt-2 max-w-[450px] text-[9.5px] leading-5 text-[#8595A5]">
            There are no appointments matching the current filter.
          </p>
        </div>
      )}

      {/* APPOINTMENT LIST */}

      {filteredAppointments.length >
        0 && (
        <section className="mt-6 space-y-4">

          {filteredAppointments.map(
            (appointment) => (
              <AppointmentCard
                key={
                  appointment._id
                }
                appointment={
                  appointment
                }
                actionLoading={
                  actionLoading
                }
                onConfirm={() =>
                  updateStatus(
                    appointment,
                    "Confirmed",
                  )
                }
                onReject={() =>
                  updateStatus(
                    appointment,
                    "Rejected",
                  )
                }
                onComplete={() =>
                  updateStatus(
                    appointment,
                    "Completed",
                  )
                }
                onCancel={() =>
                  cancelAppointment(
                    appointment,
                  )
                }
              />
            ),
          )}
        </section>
      )}
    </div>
  );
};

/* =========================================================
   STATUS STAT
========================================================= */

const StatusStat = ({
  status,
  value,
  active,
  onClick,
}) => {
  const styles = {
    All:
      "text-[#1717E8] bg-[#EEF2FF]",

    Pending:
      "text-amber-700 bg-amber-50",

    Confirmed:
      "text-emerald-700 bg-emerald-50",

    Completed:
      "text-blue-700 bg-blue-50",

    Cancelled:
      "text-slate-600 bg-slate-100",

    Rejected:
      "text-red-700 bg-red-50",
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-[17px] border p-4 text-left transition ${
        active
          ? "border-[#A9B7FF] bg-white shadow-[0_10px_25px_rgba(23,23,232,0.08)]"
          : "border-[#E0E7EF] bg-white hover:border-[#CAD5E1]"
      }`}
    >

      <div
        className={`inline-flex rounded-[9px] px-2.5 py-1.5 text-[8px] font-extrabold ${styles[status]}`}
      >
        {status}
      </div>

      <p className="mt-3 font-[Manrope] text-[22px] font-extrabold text-[#203A55]">
        {value}
      </p>
    </button>
  );
};

/* =========================================================
   APPOINTMENT CARD
========================================================= */

const AppointmentCard = ({
  appointment,
  actionLoading,
  onConfirm,
  onReject,
  onComplete,
  onCancel,
}) => {
  const patient =
    appointment.patient || {};

  const patientName =
    patient.fullName ||
    "Patient";

  const isPending =
    appointment.status ===
    "Pending";

  const isConfirmed =
    appointment.status ===
    "Confirmed";

  const isTerminal = [
    "Cancelled",
    "Completed",
    "Rejected",
  ].includes(
    appointment.status,
  );

  return (
    <article className="overflow-hidden rounded-[22px] border border-[#DFE7F0] bg-white shadow-[0_10px_30px_rgba(20,46,79,0.04)]">

      <div className="p-5 sm:p-6">

        <div className="flex flex-col gap-5 xl:flex-row xl:items-start">

          {/* PATIENT */}

          <div className="flex min-w-0 flex-1 items-start gap-4">

            <div className="grid h-14 w-14 shrink-0 place-items-center rounded-[16px] bg-[#EEF2FF] font-[Manrope] text-[12px] font-extrabold text-[#1717E8]">

              {getInitials(
                patientName,
              )}
            </div>

            <div className="min-w-0">

              <div className="flex flex-wrap items-center gap-2">

                <h3 className="font-[Manrope] text-[15px] font-extrabold text-[#29425D]">
                  {patientName}
                </h3>

                <StatusBadge
                  status={
                    appointment.status
                  }
                />
              </div>

              <p className="mt-2 text-[9px] font-semibold text-[#778A9E]">
                {appointment.reason ||
                  "Medical consultation"}
              </p>

              <div className="mt-3 flex flex-wrap gap-3">

                {patient.phone && (
                  <PatientInfo
                    icon={Phone}
                    text={
                      patient.phone
                    }
                  />
                )}

                {patient.email && (
                  <PatientInfo
                    icon={Mail}
                    text={
                      patient.email
                    }
                  />
                )}

                {patient.city && (
                  <PatientInfo
                    icon={MapPin}
                    text={
                      patient.city
                    }
                  />
                )}
              </div>
            </div>
          </div>

          {/* APPOINTMENT INFORMATION */}

          <div className="grid gap-3 sm:grid-cols-2 xl:w-[460px]">

            <InfoBox
              icon={CalendarDays}
              label="Appointment"
              value={formatDate(
                appointment.appointmentDate,
              )}
            />

            <InfoBox
              icon={
                appointment.appointmentType ===
                "Virtual"
                  ? Video
                  : Stethoscope
              }
              label="Type"
              value={
                appointment.appointmentType ||
                "—"
              }
            />

            <InfoBox
              icon={Hospital}
              label="Hospital"
              value={
                appointment.hospital
                  ?.name ||
                appointment.doctor
                  ?.hospital
                  ?.name ||
                "Independent Practice"
              }
            />

            <InfoBox
              icon={Clock3}
              label="Consultation Fee"
              value={formatMoney(
                appointment.consultationFee,
              )}
            />
          </div>
        </div>

        {/* NOTES */}

        {appointment.notes && (
          <div className="mt-5 rounded-[14px] border border-[#E6EBF1] bg-[#FAFCFE] p-4">

            <p className="text-[8px] font-extrabold uppercase tracking-[0.09em] text-[#95A2AF]">
              Patient Notes
            </p>

            <p className="mt-2 whitespace-pre-wrap text-[9px] leading-5 text-[#62778D]">
              {
                appointment.notes
              }
            </p>
          </div>
        )}
      </div>

      {/* ACTIONS */}

      {!isTerminal && (
        <div className="flex flex-wrap gap-2 border-t border-[#EDF2F7] bg-[#FAFCFE] px-5 py-4 sm:px-6">

          {isPending && (
            <>
              <ActionButton
                label="Confirm"
                loading={
                  actionLoading ===
                  `${appointment._id}-Confirmed`
                }
                onClick={
                  onConfirm
                }
                type="primary"
              />

              <ActionButton
                label="Reject"
                loading={
                  actionLoading ===
                  `${appointment._id}-Rejected`
                }
                onClick={
                  onReject
                }
                type="danger-light"
              />
            </>
          )}

          {isConfirmed && (
            <ActionButton
              label="Mark Completed"
              loading={
                actionLoading ===
                `${appointment._id}-Completed`
              }
              onClick={
                onComplete
              }
              type="success"
            />
          )}

          <ActionButton
            label="Cancel Appointment"
            loading={
              actionLoading ===
              `${appointment._id}-Cancelled`
            }
            onClick={
              onCancel
            }
            type="neutral"
          />
        </div>
      )}
    </article>
  );
};

/* =========================================================
   ACTION BUTTON
========================================================= */

const ActionButton = ({
  label,
  loading,
  onClick,
  type,
}) => {
  const styles = {
    primary:
      "bg-[#1717E8] !text-white hover:bg-[#1010C9]",

    success:
      "bg-emerald-600 !text-white hover:bg-emerald-700",

    "danger-light":
      "border border-red-200 bg-red-50 !text-red-600 hover:bg-red-100",

    neutral:
      "border border-[#DCE5EE] bg-white !text-[#64798F] hover:bg-[#F5F7FA]",
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      className={`inline-flex min-h-[40px] items-center justify-center gap-2 rounded-[11px] px-4 text-[8.5px] font-extrabold transition disabled:opacity-50 ${styles[type]}`}
    >

      {loading && (
        <LoaderCircle
          size={13}
          className="animate-spin"
        />
      )}

      <span
        className={
          type === "primary" ||
          type === "success"
            ? "!text-white"
            : type ===
                "danger-light"
              ? "!text-red-600"
              : ""
        }
      >
        {loading
          ? "Updating..."
          : label}
      </span>
    </button>
  );
};

/* =========================================================
   INFO BOX
========================================================= */

const InfoBox = ({
  icon: Icon,
  label,
  value,
}) => (
  <div className="flex items-start gap-3 rounded-[14px] border border-[#E4EAF1] bg-[#FAFCFE] p-3">

    <div className="grid h-8 w-8 shrink-0 place-items-center rounded-[9px] bg-[#EEF2FF] text-[#1717E8]">

      <Icon size={14} />
    </div>

    <div className="min-w-0">

      <p className="text-[7.5px] font-bold uppercase tracking-[0.08em] text-[#98A5B3]">
        {label}
      </p>

      <p className="mt-1 break-words text-[9px] font-extrabold text-[#526A82]">
        {value}
      </p>
    </div>
  </div>
);

/* =========================================================
   PATIENT INFO
========================================================= */

const PatientInfo = ({
  icon: Icon,
  text,
}) => (
  <span className="inline-flex items-center gap-1.5 text-[8px] font-semibold text-[#8494A5]">

    <Icon size={11} />

    {text}
  </span>
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
      className={`rounded-full px-2.5 py-1 text-[7.5px] font-extrabold ${
        styles[status] ||
        "bg-slate-100 text-slate-600"
      }`}
    >
      {status}
    </span>
  );
};

export default DoctorAppointments;