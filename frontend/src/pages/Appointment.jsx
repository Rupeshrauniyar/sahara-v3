
import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useOutletContext,
  useSearchParams,
} from "react-router-dom";

// =====================================================
// API
// =====================================================

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:3000/api";

const APPOINTMENT_API =
  `${API_BASE_URL}/appointments`;

const DOCTOR_API =
  `${API_BASE_URL}/doctors`;

// =====================================================
// EMPTY FORM
// =====================================================

const EMPTY_FORM = {
  doctor: "",
  appointmentDate: "",
  appointmentType: "Physical",
  reason: "",
  notes: "",
};

// =====================================================
// STATUS STYLES
// =====================================================

const STATUS_STYLES = {
  Pending:
    "bg-amber-50 text-amber-700",

  Confirmed:
    "bg-emerald-50 text-emerald-700",

  Completed:
    "bg-blue-50 text-blue-700",

  Cancelled:
    "bg-slate-100 text-slate-600",

  Rejected:
    "bg-rose-50 text-rose-700",
};

// =====================================================
// APPOINTMENT
// =====================================================

const Appointment = () => {
  const { user } = useOutletContext();

  // ===================================================
  // URL QUERY PARAMETER
  // ===================================================

  const [searchParams] =
    useSearchParams();

  const doctorIdFromQuery =
    searchParams.get("doctor");

  // ===================================================
  // ROLE
  // ===================================================

  const isPatient =
    user?.role === "Patient";

  const isDoctor =
    user?.role === "Doctor";

  // ===================================================
  // STATE
  // ===================================================

  const [activeTab, setActiveTab] =
    useState(
      isPatient
        ? "book"
        : "list"
    );

  const [doctors, setDoctors] =
    useState([]);

  const [appointments, setAppointments] =
    useState([]);

  const [form, setForm] =
    useState(EMPTY_FORM);

  const [search, setSearch] =
    useState("");

  const [loadingDoctors, setLoadingDoctors] =
    useState(false);

  const [loadingAppointments, setLoadingAppointments] =
    useState(false);

  const [submitting, setSubmitting] =
    useState(false);

  const [actionId, setActionId] =
    useState(null);

  const [successMessage, setSuccessMessage] =
    useState("");

  const [errorMessage, setErrorMessage] =
    useState("");

  const [fieldErrors, setFieldErrors] =
    useState({});

  // ===================================================
  // TOKEN
  // ===================================================

  const getToken = () =>
    localStorage.getItem("token") ||
    sessionStorage.getItem("token");

  // ===================================================
  // API REQUEST
  // ===================================================

  const apiRequest = async (
    url,
    options = {}
  ) => {
    const token = getToken();

    const response = await fetch(
      url,
      {
        ...options,

        headers: {
          "Content-Type":
            "application/json",

          ...(token
            ? {
                Authorization:
                  `Bearer ${token}`,
              }
            : {}),

          ...(options.headers || {}),
        },
      }
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
          "Something went wrong. Please try again."
      );
    }

    return data;
  };

  // ===================================================
  // SELECTED DOCTOR
  // ===================================================

  const selectedDoctor =
    useMemo(
      () =>
        doctors.find(
          (doctor) =>
            String(
              doctor._id
            ) ===
            String(
              form.doctor
            )
        ),
      [
        doctors,
        form.doctor,
      ]
    );

  // ===================================================
  // SELECTED FEE
  //
  // IMPORTANT:
  // Doctor backend uses:
  // consultationFee
  // virtualConsultationFee
  // ===================================================

  const selectedFee =
    useMemo(() => {
      if (!selectedDoctor) {
        return null;
      }

      return form.appointmentType ===
        "Virtual"
        ? selectedDoctor.virtualConsultationFee
        : selectedDoctor.consultationFee;
    }, [
      selectedDoctor,
      form.appointmentType,
    ]);

  // ===================================================
  // LOAD DOCTORS WHEN BOOKING TAB OPENS
  // ===================================================

  useEffect(() => {
    if (
      isPatient &&
      activeTab === "book"
    ) {
      loadDoctors();
    }
  }, [
    isPatient,
    activeTab,
    doctorIdFromQuery,
  ]);

  // ===================================================
  // LOAD APPOINTMENTS
  // ===================================================

  useEffect(() => {
    if (
      activeTab === "list"
    ) {
      loadAppointments();
    }
  }, [
    activeTab,
    isPatient,
    isDoctor,
  ]);

  // ===================================================
  // LOAD EXACT DOCTOR FROM QUERY
  // ===================================================

  const loadDoctorFromQuery =
    async (doctorId) => {
      if (!doctorId) {
        return null;
      }

      // Basic ObjectId validation.
      // Prevents unnecessary API requests for
      // obviously invalid query parameters.

      if (
        !/^[a-fA-F0-9]{24}$/.test(
          doctorId
        )
      ) {
        throw new Error(
          "The doctor ID in the URL is invalid."
        );
      }

      try {
        const data =
          await apiRequest(
            `${DOCTOR_API}/${encodeURIComponent(
              doctorId
            )}`
          );

        const doctor =
          data?.doctor;

        if (!doctor?._id) {
          throw new Error(
            "The requested doctor could not be found."
          );
        }

        return doctor;
      } catch (error) {
        throw new Error(
          error.message ||
            "Unable to load the selected doctor."
        );
      }
    };

  // ===================================================
  // LOAD DOCTORS
  // ===================================================

  const loadDoctors = async (
    query = search
  ) => {
    setLoadingDoctors(true);
    setErrorMessage("");

    try {
      // ===============================================
      // LOAD NORMAL DOCTOR LIST
      // ===============================================

      const params =
        new URLSearchParams();

      if (query?.trim()) {
        params.set(
          "search",
          query.trim()
        );
      }

      const url =
        params.toString()
          ? `${APPOINTMENT_API}/doctors?${params.toString()}`
          : `${APPOINTMENT_API}/doctors`;

      const data =
        await apiRequest(url);

      let doctorList =
        Array.isArray(
          data?.doctors
        )
          ? data.doctors
          : [];

      // ===============================================
      // EXACT DOCTOR FROM URL
      // ===============================================

      if (doctorIdFromQuery) {
        try {
          const requestedDoctor =
            await loadDoctorFromQuery(
              doctorIdFromQuery
            );

          if (requestedDoctor) {
            const alreadyExists =
              doctorList.some(
                (doctor) =>
                  String(
                    doctor._id
                  ) ===
                  String(
                    requestedDoctor._id
                  )
              );

            // =========================================
            // ADD EXACT DOCTOR IF NOT IN LIST
            // =========================================

            if (!alreadyExists) {
              doctorList = [
                requestedDoctor,
                ...doctorList,
              ];
            }

            // =========================================
            // AUTOMATICALLY SELECT DOCTOR
            // =========================================

            setForm(
              (previous) => ({
                ...previous,

                doctor:
                  String(
                    requestedDoctor._id
                  ),
              })
            );

            // =========================================
            // REMOVE OLD DOCTOR ERROR
            // =========================================

            setFieldErrors(
              (previous) => ({
                ...previous,
                doctor: "",
              })
            );
          }
        } catch (error) {
          // Do not destroy the normal doctor list
          // if the query doctor is invalid/not found.

          setErrorMessage(
            error.message
          );
        }
      }

      setDoctors(
        doctorList
      );
    } catch (error) {
      setErrorMessage(
        error.message
      );

      setDoctors([]);
    } finally {
      setLoadingDoctors(false);
    }
  };

  // ===================================================
  // LOAD APPOINTMENTS
  // ===================================================

  const loadAppointments =
    async () => {
      setLoadingAppointments(
        true
      );

      setErrorMessage("");

      try {
        const endpoint =
          isDoctor
            ? `${APPOINTMENT_API}/doctor`
            : `${APPOINTMENT_API}/my`;

        const data =
          await apiRequest(
            endpoint
          );

        setAppointments(
          Array.isArray(
            data?.appointments
          )
            ? data.appointments
            : []
        );
      } catch (error) {
        setErrorMessage(
          error.message
        );

        setAppointments([]);
      } finally {
        setLoadingAppointments(
          false
        );
      }
    };

  // ===================================================
  // HANDLE INPUT CHANGE
  // ===================================================

  const handleChange =
    (e) => {
      const {
        name,
        value,
      } = e.target;

      setForm(
        (previous) => ({
          ...previous,
          [name]: value,
        })
      );

      if (
        fieldErrors[name]
      ) {
        setFieldErrors(
          (previous) => ({
            ...previous,
            [name]: "",
          })
        );
      }

      setErrorMessage("");
    };

  // ===================================================
  // SELECT DOCTOR MANUALLY
  // ===================================================

  const handleDoctorChange =
    (e) => {
      const doctorId =
        e.target.value;

      setForm(
        (previous) => ({
          ...previous,
          doctor: doctorId,
        })
      );

      if (
        fieldErrors.doctor
      ) {
        setFieldErrors(
          (previous) => ({
            ...previous,
            doctor: "",
          })
        );
      }

      setErrorMessage("");
    };

  // ===================================================
  // VALIDATE FORM
  // ===================================================

  const validateForm =
    () => {
      const errors = {};

      // Doctor

      if (!form.doctor) {
        errors.doctor =
          "Please select a doctor.";
      }

      // Date

      if (!form.appointmentDate) {
        errors.appointmentDate =
          "Please choose date and time.";
      } else {
        const selectedDate =
          new Date(
            form.appointmentDate
          );

        if (
          Number.isNaN(
            selectedDate.getTime()
          )
        ) {
          errors.appointmentDate =
            "Please enter a valid date and time.";
        } else if (
          selectedDate <=
          new Date()
        ) {
          errors.appointmentDate =
            "Appointment must be in the future.";
        }
      }

      // Reason

      if (
        !form.reason.trim()
      ) {
        errors.reason =
          "Please describe the reason for visit.";
      }

      setFieldErrors(
        errors
      );

      return (
        Object.keys(
          errors
        ).length === 0
      );
    };

  // ===================================================
  // SUBMIT APPOINTMENT
  // ===================================================

  const handleSubmit =
    async (e) => {
      e.preventDefault();

      setSuccessMessage("");
      setErrorMessage("");

      if (!validateForm()) {
        return;
      }

      setSubmitting(true);

      try {
        const appointmentDate =
          new Date(
            form.appointmentDate
          );

        const payload = {
          doctor:
            form.doctor,

          appointmentDate:
            appointmentDate.toISOString(),

          appointmentType:
            form.appointmentType,

          reason:
            form.reason.trim(),

          notes:
            form.notes.trim() ||
            undefined,
        };

        const data =
          await apiRequest(
            APPOINTMENT_API,
            {
              method: "POST",

              body:
                JSON.stringify(
                  payload
                ),
            }
          );

        setSuccessMessage(
          data?.message ||
            "Appointment booked successfully."
        );

        // Reset form
        setForm(
          EMPTY_FORM
        );

        setFieldErrors({});

        // Refresh appointments
        await loadAppointments();

        // Switch to list
        setActiveTab(
          "list"
        );
      } catch (error) {
        setErrorMessage(
          error.message
        );
      } finally {
        setSubmitting(false);
      }
    };

  // ===================================================
  // CANCEL APPOINTMENT
  // ===================================================

  const handleCancel =
    async (id) => {
      const confirmed =
        window.confirm(
          "Cancel this appointment?"
        );

      if (!confirmed) {
        return;
      }

      setActionId(id);
      setErrorMessage("");
      setSuccessMessage("");

      try {
        const data =
          await apiRequest(
            `${APPOINTMENT_API}/${id}/cancel`,
            {
              method: "PATCH",
            }
          );

        setSuccessMessage(
          data?.message ||
            "Appointment cancelled."
        );

        await loadAppointments();
      } catch (error) {
        setErrorMessage(
          error.message
        );
      } finally {
        setActionId(null);
      }
    };

  // ===================================================
  // DOCTOR STATUS UPDATE
  // ===================================================

  const handleStatusUpdate =
    async (
      id,
      status
    ) => {
      setActionId(id);
      setErrorMessage("");
      setSuccessMessage("");

      try {
        const data =
          await apiRequest(
            `${APPOINTMENT_API}/${id}/status`,
            {
              method: "PATCH",

              body:
                JSON.stringify({
                  status,
                }),
            }
          );

        setSuccessMessage(
          data?.message ||
            "Appointment updated."
        );

        await loadAppointments();
      } catch (error) {
        setErrorMessage(
          error.message
        );
      } finally {
        setActionId(null);
      }
    };

  // ===================================================
  // CLEAR SELECTED QUERY
  // ===================================================

  const clearSelectedDoctor =
    () => {
      setForm(
        (previous) => ({
          ...previous,
          doctor: "",
        })
      );

      setFieldErrors(
        (previous) => ({
          ...previous,
          doctor: "",
        })
      );
    };

  // ===================================================
  // RENDER
  // ===================================================

  return (
    <div className="min-h-screen bg-[#f6f9fc]">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="mb-7">

        <p className="text-xs font-bold tracking-[0.18em] text-emerald-600 uppercase">
          Healthcare scheduling
        </p>

        <h2 className="text-3xl sm:text-4xl font-black tracking-[-0.045em] text-slate-950 mt-2">
          {isPatient
            ? "Book a doctor appointment"
            : "Manage appointments"}
        </h2>

        <p className="text-sm sm:text-base text-slate-500 max-w-2xl leading-7 mt-3">
          {isPatient
            ? "Choose a doctor, pick virtual or in-person consultation, and schedule your appointment."
            : "Review upcoming visits, confirm requests, and manage your schedule."}
        </p>

      </div>


      {/* =================================================
          ALERTS
      ================================================= */}

      {successMessage && (
        <Alert
          type="success"
          message={
            successMessage
          }
          onClose={() =>
            setSuccessMessage("")
          }
        />
      )}

      {errorMessage && (
        <Alert
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
          TABS
      ================================================= */}

      <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl w-fit mb-6">

        {isPatient && (
          <TabButton
            active={
              activeTab ===
              "book"
            }
            onClick={() =>
              setActiveTab(
                "book"
              )
            }
          >
            + Book Appointment
          </TabButton>
        )}

        <TabButton
          active={
            activeTab ===
            "list"
          }
          onClick={() =>
            setActiveTab(
              "list"
            )
          }
        >
          {isPatient
            ? "My Appointments"
            : "Appointments"}

          {appointments.length >
            0 && (
            <span className="ml-2 px-1.5 py-0.5 rounded-md bg-white text-slate-500 text-[10px]">
              {
                appointments.length
              }
            </span>
          )}
        </TabButton>

      </div>


      {/* =================================================
          PATIENT BOOKING
      ================================================= */}

      {isPatient &&
        activeTab ===
          "book" && (

          <form
            onSubmit={
              handleSubmit
            }
            className="grid lg:grid-cols-[1fr_320px] gap-6"
          >

            {/* =================================================
                MAIN FORM
            ================================================= */}

            <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden">

              <div className="px-5 sm:px-7 py-5 border-b border-slate-100">

                <h3 className="font-bold text-slate-900">
                  Appointment details
                </h3>

                <p className="text-xs text-slate-400 mt-1">
                  Select a doctor and consultation type to continue.
                </p>

              </div>


              <div className="p-5 sm:p-7 space-y-6">

                {/* =============================================
                    SEARCH
                ============================================= */}

                <div>

                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Search doctors
                  </label>

                  <div className="flex gap-2">

                    <div className="relative flex-1">

                      <SearchIcon />

                      <input
                        type="text"
                        value={search}
                        onChange={(
                          e
                        ) =>
                          setSearch(
                            e.target
                              .value
                          )
                        }
                        onKeyDown={(
                          e
                        ) => {
                          if (
                            e.key ===
                            "Enter"
                          ) {
                            e.preventDefault();

                            loadDoctors(
                              search
                            );
                          }
                        }}
                        placeholder="Search by name, specialty, or hospital"
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                      />

                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        loadDoctors(
                          search
                        )
                      }
                      disabled={
                        loadingDoctors
                      }
                      className="px-4 py-3 rounded-xl bg-slate-900 text-white text-sm font-semibold disabled:opacity-50"
                    >
                      {loadingDoctors
                        ? "..."
                        : "Search"}
                    </button>

                  </div>

                </div>


                {/* =============================================
                    DOCTOR SELECT
                ============================================= */}

                <Field
                  label="Doctor"
                  error={
                    fieldErrors.doctor
                  }
                  required
                >

                  <select
                    name="doctor"
                    value={
                      form.doctor
                    }
                    onChange={
                      handleDoctorChange
                    }
                    disabled={
                      loadingDoctors
                    }
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 disabled:bg-slate-50 disabled:text-slate-400"
                  >

                    <option value="">
                      {loadingDoctors
                        ? "Loading doctors..."
                        : "Select a doctor"}
                    </option>

                    {doctors.map(
                      (
                        doctor
                      ) => (

                        <option
                          key={
                            doctor._id
                          }
                          value={
                            doctor._id
                          }
                        >
                          Dr.{" "}
                          {doctor.user
                            ?.fullName ||
                            "Doctor"}{" "}
                          —{" "}
                          {doctor.specialization ||
                            "Specialist"}

                          {doctor.hospital
                            ?.name
                            ? ` (${doctor.hospital.name})`
                            : ""}
                        </option>

                      )
                    )}

                  </select>

                </Field>


                {/* =============================================
                    SELECTED DOCTOR CARD
                ============================================= */}

                {selectedDoctor && (

                  <SelectedDoctorCard
                    doctor={
                      selectedDoctor
                    }
                    onClear={
                      clearSelectedDoctor
                    }
                  />

                )}


                {/* =============================================
                    CONSULTATION TYPE
                ============================================= */}

                <div>

                  <label className="block text-sm font-semibold text-slate-700 mb-3">
                    Consultation type
                  </label>

                  <div className="grid sm:grid-cols-2 gap-3">

                    <TypeCard
                      active={
                        form.appointmentType ===
                        "Physical"
                      }
                      title="Physical visit"
                      description="Meet the doctor in person at the clinic or hospital."
                      price={
                        selectedDoctor?.consultationFee
                      }
                      onClick={() =>
                        setForm(
                          (
                            previous
                          ) => ({
                            ...previous,
                            appointmentType:
                              "Physical",
                          })
                        )
                      }
                    />

                    <TypeCard
                      active={
                        form.appointmentType ===
                        "Virtual"
                      }
                      title="Virtual consultation"
                      description="Online video or phone consultation from home."
                      price={
                        selectedDoctor?.virtualConsultationFee
                      }
                      onClick={() =>
                        setForm(
                          (
                            previous
                          ) => ({
                            ...previous,
                            appointmentType:
                              "Virtual",
                          })
                        )
                      }
                    />

                  </div>

                </div>


                {/* =============================================
                    DATE
                ============================================= */}

                <Field
                  label="Date & time"
                  error={
                    fieldErrors.appointmentDate
                  }
                  required
                >

                  <input
                    type="datetime-local"
                    name="appointmentDate"
                    value={
                      form.appointmentDate
                    }
                    min={
                      getMinimumDateTime()
                    }
                    onChange={
                      handleChange
                    }
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />

                </Field>


                {/* =============================================
                    REASON
                ============================================= */}

                <Field
                  label="Reason for visit"
                  error={
                    fieldErrors.reason
                  }
                  required
                >

                  <textarea
                    name="reason"
                    value={
                      form.reason
                    }
                    onChange={
                      handleChange
                    }
                    rows={4}
                    maxLength={1000}
                    placeholder="Describe your symptoms or reason for consultation"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 resize-none"
                  />

                  <p className="text-[10px] text-slate-400 text-right mt-1">
                    {
                      form.reason
                        .length
                    }
                    /1000
                  </p>

                </Field>


                {/* =============================================
                    NOTES
                ============================================= */}

                <Field label="Additional notes">

                  <textarea
                    name="notes"
                    value={
                      form.notes
                    }
                    onChange={
                      handleChange
                    }
                    rows={3}
                    maxLength={1000}
                    placeholder="Optional notes for the doctor"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 resize-none"
                  />

                  <p className="text-[10px] text-slate-400 text-right mt-1">
                    {
                      form.notes
                        .length
                    }
                    /1000
                  </p>

                </Field>

              </div>


              {/* ===============================================
                  FORM FOOTER
              =============================================== */}

              <div className="px-5 sm:px-7 py-5 bg-slate-50 border-t border-slate-100">

                <button
                  type="submit"
                  disabled={
                    submitting ||
                    loadingDoctors
                  }
                  className="w-full py-3.5 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {submitting
                    ? "Booking appointment..."
                    : "Confirm appointment"}
                </button>

              </div>

            </div>


            {/* =================================================
                SIDEBAR
            ================================================= */}

            <aside className="space-y-4">

              {/* Fee summary */}

              <div className="bg-white border border-slate-200 rounded-3xl p-5">

                <h4 className="font-bold text-slate-900">
                  Appointment summary
                </h4>

                <p className="text-xs text-slate-400 mt-1">
                  Your consultation details.
                </p>


                <div className="mt-5 space-y-4">

                  <SummaryRow
                    label="Consultation"
                    value={
                      form.appointmentType ===
                      "Virtual"
                        ? "Virtual"
                        : "Physical"
                    }
                  />

                  <SummaryRow
                    label="Doctor"
                    value={
                      selectedDoctor
                        ? `Dr. ${
                            selectedDoctor
                              .user
                              ?.fullName ||
                            "Doctor"
                          }`
                        : "Not selected"
                    }
                  />

                  <SummaryRow
                    label="Specialization"
                    value={
                      selectedDoctor
                        ?.specialization ||
                      "—"
                    }
                  />

                  <SummaryRow
                    label="Hospital"
                    value={
                      selectedDoctor
                        ?.hospital
                        ?.name ||
                      "Independent"
                    }
                  />

                  <SummaryRow
                    label="Date"
                    value={
                      form.appointmentDate
                        ? formatDateTime(
                            form.appointmentDate
                          )
                        : "Not selected"
                    }
                  />


                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">

                    <span className="font-semibold text-slate-700">
                      Total fee
                    </span>

                    <span className="text-2xl font-black text-emerald-600">
                      {selectedFee !=
                      null
                        ? `Rs. ${selectedFee}`
                        : "—"}
                    </span>

                  </div>

                </div>

              </div>


              {/* Selected doctor */}

              {selectedDoctor && (

                <div className="bg-[#071f3d] rounded-3xl p-5 text-white">

                  <p className="text-[10px] uppercase tracking-[0.15em] text-blue-300 font-bold">
                    Selected doctor
                  </p>

                  <h3 className="font-black text-lg mt-2">
                    Dr.{" "}
                    {selectedDoctor.user
                      ?.fullName ||
                      "Doctor"}
                  </h3>

                  <p className="text-sm text-blue-300 mt-1">
                    {
                      selectedDoctor.specialization
                    }
                  </p>

                  <div className="flex items-center gap-2 mt-4 text-xs text-slate-300">

                    <span className="w-2 h-2 rounded-full bg-emerald-400" />

                    {selectedDoctor.isAvailable
                      ? "Available for consultation"
                      : "Currently unavailable"}

                  </div>

                </div>

              )}


              {/* Information */}

              <div className="rounded-2xl bg-emerald-50 border border-emerald-100 p-4">

                <div className="flex gap-3">

                  <div className="w-8 h-8 rounded-lg bg-white text-emerald-600 flex items-center justify-center shrink-0">
                    ✓
                  </div>

                  <div>

                    <p className="text-sm font-bold text-emerald-900">
                      Before booking
                    </p>

                    <p className="text-xs text-emerald-700 leading-5 mt-1">
                      Make sure your appointment
                      time is correct and provide
                      an accurate reason for your visit.
                    </p>

                  </div>

                </div>

              </div>

            </aside>

          </form>
        )}


      {/* =================================================
          APPOINTMENT LIST
      ================================================= */}

      {activeTab ===
        "list" && (

        <AppointmentsList
          appointments={
            appointments
          }
          loading={
            loadingAppointments
          }
          isDoctor={
            isDoctor
          }
          isPatient={
            isPatient
          }
          actionId={
            actionId
          }
          onCancel={
            handleCancel
          }
          onStatusUpdate={
            handleStatusUpdate
          }
          onBook={() =>
            setActiveTab(
              "book"
            )
          }
        />

      )}


      {/* =================================================
          OTHER ROLE
      ================================================= */}

      {!isPatient &&
        !isDoctor &&
        activeTab ===
          "list" &&
        !loadingAppointments && (

          <div className="rounded-2xl bg-white border border-slate-200 p-8 text-center text-slate-500">
            Appointment management for
            your role will appear here.
          </div>

        )}

    </div>
  );
};


// =========================================================
// SELECTED DOCTOR CARD
// =========================================================

const SelectedDoctorCard = ({
  doctor,
  onClear,
}) => {
  const name =
    doctor.user?.fullName ||
    "Doctor";

  const initials =
    getInitials(name);

  return (
    <div className="rounded-2xl border border-blue-200 bg-blue-50/50 p-4">

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">

        <div className="flex items-center gap-3 min-w-0">

          {doctor.user
            ?.profileImage ? (

            <img
              src={
                doctor.user
                  .profileImage
              }
              alt={name}
              className="w-12 h-12 rounded-xl object-cover shrink-0"
            />

          ) : (

            <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-black shrink-0">
              {initials}
            </div>

          )}

          <div className="min-w-0">

            <div className="flex items-center gap-2">

              <p className="text-sm font-black text-slate-900 truncate">
                Dr. {name}
              </p>

              <span
                className={`w-2 h-2 rounded-full shrink-0 ${
                  doctor.isAvailable
                    ? "bg-emerald-500"
                    : "bg-slate-300"
                }`}
              />

            </div>

            <p className="text-xs text-blue-600 font-semibold mt-1">
              {
                doctor.specialization ||
                "Medical Specialist"
              }
            </p>

            <p className="text-xs text-slate-500 mt-1 truncate">
              {doctor.hospital?.name ||
                "Independent practice"}

              {doctor.hospital
                ?.city
                ? ` • ${doctor.hospital.city}`
                : ""}
            </p>

          </div>

        </div>


        <div className="flex items-center justify-between sm:block sm:text-right">

          <div>

            <p className="text-[9px] uppercase tracking-wide text-slate-400 font-bold">
              Consultation
            </p>

            <p className="text-base font-black text-blue-700">
              {doctor.consultationFee !=
              null
                ? `Rs. ${doctor.consultationFee}`
                : "—"}
            </p>

          </div>

          <button
            type="button"
            onClick={onClear}
            className="text-xs font-semibold text-slate-500 hover:text-blue-600 sm:mt-1"
          >
            Change doctor
          </button>

        </div>

      </div>


      {/* Doctor details */}

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4">

        <SmallInfo
          label="Experience"
          value={`${doctor.experience || 0} years`}
        />

        <SmallInfo
          label="Qualification"
          value={
            doctor.qualification ||
            "—"
          }
        />

        <SmallInfo
          label="Availability"
          value={
            doctor.isAvailable
              ? "Available"
              : "Unavailable"
          }
        />

        <SmallInfo
          label="Practice"
          value={
            doctor.practiceType ||
            "—"
          }
        />

      </div>

    </div>
  );
};


// =========================================================
// APPOINTMENTS LIST
// =========================================================

const AppointmentsList = ({
  appointments,
  loading,
  isDoctor,
  isPatient,
  actionId,
  onCancel,
  onStatusUpdate,
  onBook,
}) => {

  if (loading) {
    return (
      <div className="rounded-2xl bg-white border border-slate-200 p-10 text-center">

        <Spinner dark />

        <p className="text-sm text-slate-500 mt-4">
          Loading appointments...
        </p>

      </div>
    );
  }


  if (
    appointments.length ===
    0
  ) {
    return (
      <div className="rounded-3xl bg-white border border-slate-200 p-10 text-center">

        <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
          <CalendarIcon />
        </div>

        <p className="font-semibold text-slate-900 mt-5">
          No appointments yet
        </p>

        <p className="text-sm text-slate-500 mt-2">

          {isPatient
            ? "Book your first appointment to get started."
            : "Appointments assigned to you will appear here."}

        </p>

        {isPatient && (

          <button
            type="button"
            onClick={
              onBook
            }
            className="mt-5 px-4 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-semibold"
          >
            Book appointment
          </button>

        )}

      </div>
    );
  }


  return (
    <div className="space-y-4">

      {appointments.map(
        (
          appointment
        ) => {

          const doctorName =
            appointment.doctor
              ?.user
              ?.fullName ||
            "Doctor";

          const patientName =
            appointment.patient
              ?.fullName ||
            "Patient";

          return (
            <div
              key={
                appointment._id
              }
              className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 hover:shadow-lg hover:shadow-slate-900/5 transition"
            >

              <div className="flex flex-col lg:flex-row lg:items-center gap-5">

                {/* Main */}

                <div className="flex-1 min-w-0">

                  <div className="flex flex-wrap items-center gap-2">

                    <h3 className="font-bold text-slate-900">

                      {isDoctor
                        ? patientName
                        : `Dr. ${doctorName}`}

                    </h3>

                    <StatusBadge
                      status={
                        appointment.status
                      }
                    />

                    <TypeBadge
                      type={
                        appointment.appointmentType
                      }
                    />

                  </div>


                  <p className="text-sm text-slate-500 mt-2">
                    {
                      appointment.reason
                    }
                  </p>


                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-400 mt-3">

                    <span>
                      📅{" "}
                      {formatDateTime(
                        appointment.appointmentDate
                      )}
                    </span>

                    <span>
                      💰 Rs.{" "}
                      {
                        appointment.consultationFee
                      }
                    </span>

                  </div>


                  {!isDoctor &&
                    appointment.doctor
                      ?.specialization && (

                      <p className="text-xs text-slate-400 mt-2">

                        {
                          appointment
                            .doctor
                            .specialization
                        }

                        {appointment
                          .doctor
                          .hospital
                          ?.name
                          ? ` • ${appointment.doctor.hospital.name}`
                          : ""}

                      </p>

                    )}

                </div>


                {/* Actions */}

                <div className="flex flex-wrap gap-2">

                  {/* Doctor: Pending */}

                  {isDoctor &&
                    appointment.status ===
                      "Pending" && (

                      <>

                        <ActionButton
                          label="Confirm"
                          loading={
                            actionId ===
                            appointment._id
                          }
                          onClick={() =>
                            onStatusUpdate(
                              appointment._id,
                              "Confirmed"
                            )
                          }
                          variant="primary"
                        />

                        <ActionButton
                          label="Reject"
                          loading={
                            actionId ===
                            appointment._id
                          }
                          onClick={() =>
                            onStatusUpdate(
                              appointment._id,
                              "Rejected"
                            )
                          }
                          variant="danger"
                        />

                      </>

                    )}


                  {/* Doctor: Confirmed */}

                  {isDoctor &&
                    appointment.status ===
                      "Confirmed" && (

                      <ActionButton
                        label="Mark completed"
                        loading={
                          actionId ===
                          appointment._id
                        }
                        onClick={() =>
                          onStatusUpdate(
                            appointment._id,
                            "Completed"
                          )
                        }
                        variant="primary"
                      />

                    )}


                  {/* Cancel */}

                  {![
                    "Cancelled",
                    "Completed",
                    "Rejected",
                  ].includes(
                    appointment.status
                  ) && (

                    <ActionButton
                      label="Cancel"
                      loading={
                        actionId ===
                        appointment._id
                      }
                      onClick={() =>
                        onCancel(
                          appointment._id
                        )
                      }
                      variant="ghost"
                    />

                  )}

                </div>

              </div>

            </div>
          );
        }
      )}

    </div>
  );
};


// =========================================================
// TYPE CARD
// =========================================================

const TypeCard = ({
  active,
  title,
  description,
  price,
  onClick,
}) => (

  <button
    type="button"
    onClick={
      onClick
    }
    className={`text-left p-4 rounded-2xl border transition ${
      active
        ? "border-emerald-500 bg-emerald-50 shadow-sm"
        : "border-slate-200 bg-white hover:border-slate-300"
    }`}
  >

    <div className="flex items-center justify-between gap-3">

      <p className="font-bold text-slate-900">
        {title}
      </p>

      {active && (
        <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px]">
          ✓
        </span>
      )}

    </div>

    <p className="text-xs text-slate-500 mt-1 leading-5">
      {description}
    </p>

    <p className="text-sm font-bold text-emerald-600 mt-3">

      {price != null
        ? `Rs. ${price}`
        : "Select a doctor"}

    </p>

  </button>
);


// =========================================================
// FIELD
// =========================================================

const Field = ({
  label,
  error,
  required,
  children,
}) => (

  <div>

    <label className="block text-sm font-semibold text-slate-700 mb-2">

      {label}

      {required && (
        <span className="text-red-500 ml-1">
          *
        </span>
      )}

    </label>

    {children}

    {error && (
      <p className="text-xs text-red-500 mt-1.5">
        {error}
      </p>
    )}

  </div>
);


// =========================================================
// SUMMARY ROW
// =========================================================

const SummaryRow = ({
  label,
  value,
}) => (

  <div className="flex items-center justify-between gap-3">

    <span className="text-slate-500 text-sm">
      {label}
    </span>

    <span className="font-medium text-slate-900 text-sm text-right max-w-[60%] truncate">
      {value}
    </span>

  </div>
);


// =========================================================
// SMALL INFO
// =========================================================

const SmallInfo = ({
  label,
  value,
}) => (

  <div className="rounded-xl bg-white/70 border border-blue-100 p-2.5">

    <p className="text-[9px] uppercase tracking-wide font-bold text-slate-400">
      {label}
    </p>

    <p className="text-xs font-semibold text-slate-700 truncate mt-1">
      {value}
    </p>

  </div>
);


// =========================================================
// TAB BUTTON
// =========================================================

const TabButton = ({
  active,
  onClick,
  children,
}) => (

  <button
    type="button"
    onClick={
      onClick
    }
    className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
      active
        ? "bg-white text-slate-900 shadow-sm"
        : "text-slate-500 hover:text-slate-700"
    }`}
  >
    {children}
  </button>
);


// =========================================================
// STATUS BADGE
// =========================================================

const StatusBadge = ({
  status,
}) => (

  <span
    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold ${
      STATUS_STYLES[
        status
      ] ||
      "bg-slate-100 text-slate-600"
    }`}
  >
    {status || "Pending"}
  </span>
);


// =========================================================
// TYPE BADGE
// =========================================================

const TypeBadge = ({
  type,
}) => (

  <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-blue-50 text-blue-700">
    {type || "Physical"}
  </span>
);


// =========================================================
// ACTION BUTTON
// =========================================================

const ActionButton = ({
  label,
  onClick,
  loading,
  variant = "ghost",
}) => {

  const styles = {
    primary:
      "bg-emerald-600 text-white hover:bg-emerald-700",

    danger:
      "bg-rose-50 text-rose-700 hover:bg-rose-100",

    ghost:
      "border border-slate-200 text-slate-600 hover:bg-slate-50",
  };

  return (
    <button
      type="button"
      onClick={
        onClick
      }
      disabled={
        loading
      }
      className={`px-3 py-2 rounded-xl text-xs font-semibold transition disabled:opacity-60 disabled:cursor-not-allowed ${styles[variant]}`}
    >

      {loading
        ? "..."
        : label}

    </button>
  );
};


// =========================================================
// ALERT
// =========================================================

const Alert = ({
  type,
  message,
  onClose,
}) => (

  <div
    className={`mb-6 rounded-2xl px-4 py-3 flex items-start justify-between gap-3 ${
      type === "success"
        ? "bg-emerald-50 border border-emerald-100 text-emerald-800"
        : "bg-rose-50 border border-rose-100 text-rose-800"
    }`}
  >

    <div className="flex items-start gap-3">

      <span className="font-black">
        {type ===
        "success"
          ? "✓"
          : "!"}
      </span>

      <p className="text-sm">
        {message}
      </p>

    </div>

    <button
      type="button"
      onClick={
        onClose
      }
      className="text-sm font-bold opacity-60 hover:opacity-100"
    >
      ×
    </button>

  </div>
);


// =========================================================
// SEARCH ICON
// =========================================================

const SearchIcon = () => (

  <svg
    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <circle
      cx="11"
      cy="11"
      r="7"
    />

    <path d="m20 20-4-4" />

  </svg>
);


// =========================================================
// CALENDAR ICON
// =========================================================

const CalendarIcon = () => (

  <svg
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >

    <rect
      x="3"
      y="4"
      width="18"
      height="17"
      rx="2"
    />

    <path d="M16 2v4M8 2v4M3 10h18" />

  </svg>
);


// =========================================================
// SPINNER
// =========================================================

const Spinner = ({
  dark = false,
}) => (

  <span
    className={`inline-block w-5 h-5 border-2 rounded-full animate-spin ${
      dark
        ? "border-slate-300 border-t-slate-700"
        : "border-white/40 border-t-white"
    }`}
  />

);


// =========================================================
// INITIALS
// =========================================================

const getInitials = (
  name
) => {

  if (!name) {
    return "DR";
  }

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


// =========================================================
// MINIMUM DATETIME
// =========================================================

const getMinimumDateTime =
  () => {

    const now =
      new Date();

    // Round to next 5 minutes.
    const minutes =
      now.getMinutes();

    const roundedMinutes =
      Math.ceil(
        (minutes + 1) / 5
      ) * 5;

    now.setMinutes(
      roundedMinutes
    );

    now.setSeconds(0);
    now.setMilliseconds(0);

    const year =
      now.getFullYear();

    const month =
      String(
        now.getMonth() + 1
      ).padStart(2, "0");

    const day =
      String(
        now.getDate()
      ).padStart(2, "0");

    const hours =
      String(
        now.getHours()
      ).padStart(2, "0");

    const mins =
      String(
        now.getMinutes()
      ).padStart(2, "0");

    return `${year}-${month}-${day}T${hours}:${mins}`;
  };


// =========================================================
// DATE FORMAT
// =========================================================

const formatDateTime =
  (value) => {

    if (!value) {
      return "—";
    }

    const date =
      new Date(value);

    if (
      Number.isNaN(
        date.getTime()
      )
    ) {
      return "—";
    }

    return new Intl.DateTimeFormat(
      "en-NP",
      {
        dateStyle:
          "medium",

        timeStyle:
          "short",
      }
    ).format(date);
  };


export default Appointment;
