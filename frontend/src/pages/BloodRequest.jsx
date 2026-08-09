import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

/* =========================================================
   API
========================================================= */

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:3000/api";

const BLOOD_REQUEST_API =
  `${API_BASE_URL}/blood-requests`;

const HOSPITAL_API =
  `${API_BASE_URL}/hospitals`;

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

const URGENCIES = [
  {
    value: "Low",
    label: "Low",
    description: "Can wait",
    color: "emerald",
  },
  {
    value: "Medium",
    label: "Medium",
    description: "Needed soon",
    color: "amber",
  },
  {
    value: "High",
    label: "High",
    description: "Needs attention",
    color: "orange",
  },
  {
    value: "Critical",
    label: "Critical",
    description: "Immediate need",
    color: "red",
  },
];

const EMPTY_FORM = {
  patientName: "",
  bloodGroup: "",
  unitsRequired: 1,

  hospital: "",
  hospitalName: "",

  city: "",
  address: "",

  urgency: "Medium",
  requiredBy: "",

  contactName: "",
  contactPhone: "",

  additionalNotes: "",
};

/* =========================================================
   STORAGE USER
========================================================= */

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

/* =========================================================
   BLOOD REQUEST PAGE
========================================================= */

const BloodRequest = () => {
  const [activeTab, setActiveTab] =
    useState("create");

  const [form, setForm] =
    useState(EMPTY_FORM);

  const [requests, setRequests] =
    useState([]);

  const [hospitals, setHospitals] =
    useState([]);

  const [
    loadingRequests,
    setLoadingRequests,
  ] = useState(false);

  const [
    loadingHospitals,
    setLoadingHospitals,
  ] = useState(false);

  const [
    submitting,
    setSubmitting,
  ] = useState(false);

  const [
    selectedRequest,
    setSelectedRequest,
  ] = useState(null);

  const [
    loadingDetails,
    setLoadingDetails,
  ] = useState(false);

  const [
    cancellingId,
    setCancellingId,
  ] = useState(null);

  const [
    successMessage,
    setSuccessMessage,
  ] = useState("");

  const [
    errorMessage,
    setErrorMessage,
  ] = useState("");

  const [
    fieldErrors,
    setFieldErrors,
  ] = useState({});

  const [
    hospitalInputMode,
    setHospitalInputMode,
  ] = useState("select");

  /* =====================================================
     CURRENT USER
  ===================================================== */

  const currentUser =
    getStoredUser();

  const currentUserId =
    currentUser?._id ||
    currentUser?.id ||
    null;

  /* =====================================================
     AUTH
  ===================================================== */

  const getToken = () => {
    return (
      localStorage.getItem("token") ||
      sessionStorage.getItem("token")
    );
  };

  /* =====================================================
     REQUEST OWNERSHIP
  ===================================================== */

  const ownsRequest = (
    request,
  ) => {
    if (
      !request ||
      !currentUserId
    ) {
      return false;
    }

    /*
      Backend may populate requestedBy:
      {
        _id,
        fullName,
        email,
        phone
      }

      or it may return only the Mongo ID.
    */

    const ownerId =
      request.requestedBy?._id ||
      request.requestedBy?.id ||
      request.requestedBy;

    if (!ownerId) {
      /*
        Requests loaded from /my are already guaranteed to
        belong to the current authenticated user.

        This fallback is useful when the create response
        has not populated requestedBy.
      */

      return requests.some(
        (item) =>
          String(item._id) ===
          String(request._id),
      );
    }

    return (
      String(ownerId) ===
      String(currentUserId)
    );
  };

  /* =====================================================
     API HELPER
  ===================================================== */

  const apiRequest = async (
    url,
    options = {},
  ) => {
    const token =
      getToken();

    const response =
      await fetch(url, {
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

          ...(options.headers ||
            {}),
        },
      });

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
          "Something went wrong. Please try again.",
      );
    }

    return data;
  };

  /* =====================================================
     LOAD HOSPITALS
  ===================================================== */

  useEffect(() => {
    loadHospitals();
  }, []);

  const loadHospitals =
    async () => {
      setLoadingHospitals(
        true,
      );

      try {
        const data =
          await apiRequest(
            HOSPITAL_API,
          );

        const list =
          data?.hospitals ||
          data?.data ||
          [];

        setHospitals(
          Array.isArray(list)
            ? list
            : [],
        );
      } catch (error) {
        console.error(
          "Hospital loading error:",
          error,
        );

        setHospitals([]);
      } finally {
        setLoadingHospitals(
          false,
        );
      }
    };

  /* =====================================================
     LOAD MY REQUESTS
  ===================================================== */

  useEffect(() => {
    if (
      activeTab === "requests"
    ) {
      loadMyRequests();
    }
  }, [activeTab]);

  const loadMyRequests =
    async () => {
      setLoadingRequests(
        true,
      );

      setErrorMessage("");

      try {
        const data =
          await apiRequest(
            `${BLOOD_REQUEST_API}/my`,
          );

        setRequests(
          Array.isArray(
            data?.requests,
          )
            ? data.requests
            : [],
        );
      } catch (error) {
        setErrorMessage(
          error.message,
        );
      } finally {
        setLoadingRequests(
          false,
        );
      }
    };

  /* =====================================================
     FORM HANDLER
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

    if (
      fieldErrors[name]
    ) {
      setFieldErrors(
        (previous) => ({
          ...previous,
          [name]: "",
        }),
      );
    }

    setErrorMessage("");
  };

  /* =====================================================
     HOSPITAL
  ===================================================== */

  const handleHospitalChange = (
    event,
  ) => {
    const hospitalId =
      event.target.value;

    const hospital =
      hospitals.find(
        (item) =>
          String(item._id) ===
          String(hospitalId),
      );

    setForm(
      (previous) => ({
        ...previous,

        hospital:
          hospitalId,

        hospitalName: "",

        city:
          hospital?.city ||
          previous.city,

        address:
          hospital?.address ||
          previous.address,
      }),
    );

    setFieldErrors(
      (previous) => ({
        ...previous,
        hospital: "",
        hospitalName: "",
      }),
    );
  };

  const handleHospitalInputModeChange =
    (mode) => {
      setHospitalInputMode(
        mode,
      );

      setForm(
        (previous) => ({
          ...previous,

          hospital:
            mode === "select"
              ? previous.hospital
              : "",

          hospitalName:
            mode === "manual"
              ? previous.hospitalName
              : "",
        }),
      );

      setFieldErrors(
        (previous) => ({
          ...previous,
          hospital: "",
          hospitalName: "",
        }),
      );
    };

  /* =====================================================
     VALIDATION
  ===================================================== */

  const validateForm = () => {
    const errors = {};

    if (
      !form.patientName.trim()
    ) {
      errors.patientName =
        "Patient name is required.";
    }

    if (!form.bloodGroup) {
      errors.bloodGroup =
        "Select a blood group.";
    }

    if (
      !form.unitsRequired ||
      Number(
        form.unitsRequired,
      ) < 1
    ) {
      errors.unitsRequired =
        "At least 1 unit is required.";
    }

    if (
      !Number.isInteger(
        Number(
          form.unitsRequired,
        ),
      )
    ) {
      errors.unitsRequired =
        "Units must be a whole number.";
    }

    if (
      hospitalInputMode ===
        "select" &&
      !form.hospital
    ) {
      errors.hospital =
        "Please select a hospital.";
    }

    if (
      hospitalInputMode ===
        "manual" &&
      !form.hospitalName.trim()
    ) {
      errors.hospitalName =
        "Please enter a hospital name.";
    }

    if (!form.city.trim()) {
      errors.city =
        "City is required.";
    }

    if (
      !form.address.trim()
    ) {
      errors.address =
        "Address is required.";
    }

    if (!form.requiredBy) {
      errors.requiredBy =
        "Required-by date is required.";
    }

    if (
      !form.contactName.trim()
    ) {
      errors.contactName =
        "Contact name is required.";
    }

    if (
      !form.contactPhone.trim()
    ) {
      errors.contactPhone =
        "Contact phone is required.";
    }

    if (
      form.contactPhone &&
      !/^[0-9+\-\s()]{7,20}$/.test(
        form.contactPhone,
      )
    ) {
      errors.contactPhone =
        "Enter a valid phone number.";
    }

    setFieldErrors(
      errors,
    );

    return (
      Object.keys(
        errors,
      ).length === 0
    );
  };

  /* =====================================================
     CREATE REQUEST
  ===================================================== */

  const handleSubmit =
    async (event) => {
      event.preventDefault();

      setSuccessMessage("");
      setErrorMessage("");

      if (!validateForm()) {
        return;
      }

      setSubmitting(true);

      try {
        const payload = {
          patientName:
            form.patientName.trim(),

          bloodGroup:
            form.bloodGroup,

          unitsRequired:
            Number(
              form.unitsRequired,
            ),

          ...(hospitalInputMode ===
              "select" &&
          form.hospital
            ? {
                hospital:
                  form.hospital,
              }
            : {}),

          ...(hospitalInputMode ===
              "manual" &&
          form.hospitalName.trim()
            ? {
                hospitalName:
                  form.hospitalName.trim(),
              }
            : {}),

          city:
            form.city.trim(),

          address:
            form.address.trim(),

          urgency:
            form.urgency,

          requiredBy:
            new Date(
              form.requiredBy,
            ).toISOString(),

          contactName:
            form.contactName.trim(),

          contactPhone:
            form.contactPhone.trim(),

          additionalNotes:
            form.additionalNotes.trim() ||
            undefined,
        };

        const data =
          await apiRequest(
            BLOOD_REQUEST_API,
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
            "Blood request created successfully.",
        );

        setForm(
          EMPTY_FORM,
        );

        setHospitalInputMode(
          "select",
        );

        setFieldErrors({});

        await loadMyRequests();

        if (data?.request) {
          /*
            Add requestedBy locally when the create response
            does not populate it.

            This is ONLY for frontend ownership display.
            Backend remains the security authority.
          */

          setSelectedRequest({
            ...data.request,

            requestedBy:
              data.request
                .requestedBy ||
              currentUserId,
          });
        }

        setActiveTab(
          "requests",
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
     OPEN REQUEST
  ===================================================== */

  const openRequest =
    async (id) => {
      setLoadingDetails(
        true,
      );

      setSelectedRequest(
        null,
      );

      setErrorMessage("");

      try {
        const data =
          await apiRequest(
            `${BLOOD_REQUEST_API}/${id}`,
          );

        setSelectedRequest(
          data?.request ||
            null,
        );
      } catch (error) {
        setErrorMessage(
          error.message,
        );

        setSelectedRequest(
          null,
        );
      } finally {
        setLoadingDetails(
          false,
        );
      }
    };

  /* =====================================================
     CANCEL REQUEST
  ===================================================== */

  const cancelRequest =
    async (
      requestOrId,
    ) => {
      const request =
        typeof requestOrId ===
        "object"
          ? requestOrId
          : requests.find(
              (item) =>
                String(
                  item._id,
                ) ===
                String(
                  requestOrId,
                ),
            ) ||
            selectedRequest;

      const id =
        typeof requestOrId ===
        "object"
          ? requestOrId?._id
          : requestOrId;

      if (!id) {
        return;
      }

      /* =================================================
         FRONTEND OWNERSHIP CHECK
      ================================================= */

      if (
        request &&
        !ownsRequest(
          request,
        )
      ) {
        setErrorMessage(
          "You cannot cancel another user's blood request.",
        );

        return;
      }

      const confirmed =
        window.confirm(
          "Are you sure you want to cancel this blood request?",
        );

      if (!confirmed) {
        return;
      }

      setCancellingId(id);

      setErrorMessage("");
      setSuccessMessage("");

      try {
        const data =
          await apiRequest(
            `${BLOOD_REQUEST_API}/${id}/cancel`,
            {
              method: "PATCH",
            },
          );

        setSuccessMessage(
          data?.message ||
            "Blood request cancelled successfully.",
        );

        await loadMyRequests();

        if (
          String(
            selectedRequest?._id,
          ) ===
          String(id)
        ) {
          setSelectedRequest(
            data?.request
              ? {
                  ...data.request,

                  requestedBy:
                    data.request
                      .requestedBy ||
                    currentUserId,
                }
              : {
                  ...selectedRequest,
                  status:
                    "Cancelled",
                },
          );
        }
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
     STATISTICS
  ===================================================== */

  const stats =
    useMemo(() => {
      const open =
        requests.filter(
          (item) =>
            item.status ===
            "Open",
        ).length;

      const completed =
        requests.filter(
          (item) =>
            item.status ===
            "Completed",
        ).length;

      const cancelled =
        requests.filter(
          (item) =>
            item.status ===
            "Cancelled",
        ).length;

      const totalUnits =
        requests.reduce(
          (
            sum,
            item,
          ) =>
            sum +
            Number(
              item.unitsRequired ||
                0,
            ),
          0,
        );

      return {
        open,
        completed,
        cancelled,
        totalUnits,
      };
    }, [requests]);

  /* =====================================================
     RENDER
  ===================================================== */

  return (
    <div className="min-h-screen bg-[#F6F9FC]">

      {/* =================================================
          HEADER
      ================================================= */}

      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white">

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

          <div className="flex h-20 items-center justify-between">

            <div className="flex items-center gap-3">

              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-red-50 text-red-600">

                <BloodDropIcon />
              </div>

              <div>

                <h1 className="text-lg font-black tracking-tight text-slate-900 sm:text-xl">
                  Blood Support
                </h1>

                <p className="text-xs text-slate-400">
                  Request blood when you need it
                </p>
              </div>
            </div>

            <div className="hidden items-center gap-2 rounded-xl bg-emerald-50 px-3 py-2 text-emerald-700 sm:flex">

              <span className="h-2 w-2 rounded-full bg-emerald-500" />

              <span className="text-xs font-semibold">
                SAHARA Blood Network
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* =================================================
          MAIN
      ================================================= */}

      <main className="mx-auto max-w-7xl px-4 py-7 sm:px-6 sm:py-10 lg:px-8">

        {/* INTRO */}

        <div className="mb-7">

          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">

            <div>

              <p className="text-xs font-bold uppercase tracking-[0.18em] text-red-600">
                Blood Assistance
              </p>

              <h2 className="mt-2 text-3xl font-black tracking-[-0.045em] text-slate-950 sm:text-4xl">
                Help starts with a request.
              </h2>

              <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-500 sm:text-base">
                Create a blood request and keep track of its status through your SAHARA account.
              </p>
            </div>

            {requests.length >
              0 && (
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">

                <StatCard
                  label="Open"
                  value={
                    stats.open
                  }
                  color="red"
                />

                <StatCard
                  label="Completed"
                  value={
                    stats.completed
                  }
                  color="emerald"
                />

                <StatCard
                  label="Cancelled"
                  value={
                    stats.cancelled
                  }
                  color="slate"
                />

                <StatCard
                  label="Units"
                  value={
                    stats.totalUnits
                  }
                  color="blue"
                  className="hidden sm:block"
                />
              </div>
            )}
          </div>
        </div>

        {/* ALERTS */}

        {successMessage && (
          <Alert
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

        {/* TABS */}

        <div className="mb-6 flex w-fit items-center gap-1 rounded-xl bg-slate-100 p-1">

          <TabButton
            active={
              activeTab ===
              "create"
            }
            onClick={() =>
              setActiveTab(
                "create",
              )
            }
          >
            + New Request
          </TabButton>

          <TabButton
            active={
              activeTab ===
              "requests"
            }
            onClick={() =>
              setActiveTab(
                "requests",
              )
            }
          >
            My Requests

            {requests.length >
              0 && (
              <span className="ml-2 rounded-md bg-white px-1.5 py-0.5 text-[10px] text-slate-500">
                {
                  requests.length
                }
              </span>
            )}
          </TabButton>
        </div>

        {/* CREATE */}

        {activeTab ===
          "create" && (
          <CreateRequestForm
            form={form}
            fieldErrors={
              fieldErrors
            }
            hospitals={
              hospitals
            }
            loadingHospitals={
              loadingHospitals
            }
            hospitalInputMode={
              hospitalInputMode
            }
            submitting={
              submitting
            }
            onChange={
              handleChange
            }
            onHospitalChange={
              handleHospitalChange
            }
            onHospitalInputModeChange={
              handleHospitalInputModeChange
            }
            onSubmit={
              handleSubmit
            }
            onCancel={() => {
              setForm(
                EMPTY_FORM,
              );

              setHospitalInputMode(
                "select",
              );

              setFieldErrors(
                {},
              );

              setErrorMessage(
                "",
              );
            }}
          />
        )}

        {/* REQUESTS */}

        {activeTab ===
          "requests" && (
          <RequestsList
            requests={
              requests
            }
            loading={
              loadingRequests
            }
            cancellingId={
              cancellingId
            }
            onOpen={
              openRequest
            }
            onCancel={
              cancelRequest
            }
            onCreate={() =>
              setActiveTab(
                "create",
              )
            }
          />
        )}
      </main>

      {/* DETAIL MODAL */}

      {(selectedRequest ||
        loadingDetails) && (
        <RequestModal
          request={
            selectedRequest
          }
          loading={
            loadingDetails
          }
          cancellingId={
            cancellingId
          }
          onClose={() =>
            setSelectedRequest(
              null,
            )
          }
          onCancel={
            cancelRequest
          }
          canCancel={
            selectedRequest
              ? ownsRequest(
                  selectedRequest,
                )
              : false
          }
        />
      )}
    </div>
  );
};

/* =========================================================
   CREATE REQUEST FORM
========================================================= */

const CreateRequestForm = ({
  form,
  fieldErrors,
  hospitals,
  loadingHospitals,
  hospitalInputMode,
  submitting,
  onChange,
  onHospitalChange,
  onHospitalInputModeChange,
  onSubmit,
  onCancel,
}) => (
  <form
    onSubmit={onSubmit}
    className="grid gap-6 lg:grid-cols-[1fr_340px]"
  >

    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white">

      <div className="border-b border-slate-100 px-5 py-5 sm:px-7">

        <h3 className="font-bold text-slate-900">
          Blood request details
        </h3>

        <p className="mt-1 text-xs text-slate-400">
          Provide accurate information so the request can be processed correctly.
        </p>
      </div>

      <div className="space-y-8 p-5 sm:p-7">

        <FormSection
          number="01"
          title="Patient information"
          description="Who needs the blood?"
        >

          <div className="grid gap-5 sm:grid-cols-2">

            <InputField
              label="Patient name"
              name="patientName"
              value={
                form.patientName
              }
              onChange={
                onChange
              }
              placeholder="Enter patient's full name"
              required
              error={
                fieldErrors.patientName
              }
            />

            <SelectField
              label="Blood group"
              name="bloodGroup"
              value={
                form.bloodGroup
              }
              onChange={
                onChange
              }
              options={BLOOD_GROUPS.map(
                (group) => ({
                  value: group,
                  label: group,
                }),
              )}
              placeholder="Select blood group"
              required
              error={
                fieldErrors.bloodGroup
              }
            />
          </div>

          <div className="mt-5 max-w-xs">

            <InputField
              label="Units required"
              name="unitsRequired"
              type="number"
              min="1"
              step="1"
              value={
                form.unitsRequired
              }
              onChange={
                onChange
              }
              required
              error={
                fieldErrors.unitsRequired
              }
            />
          </div>
        </FormSection>

        {/* HOSPITAL */}

        <FormSection
          number="02"
          title="Hospital information"
          description="Where should the blood be delivered?"
        >

          <div className="mb-5 flex flex-wrap gap-2">

            <button
              type="button"
              onClick={() =>
                onHospitalInputModeChange(
                  "select",
                )
              }
              className={`rounded-xl px-3 py-2 text-xs font-semibold transition ${
                hospitalInputMode ===
                "select"
                  ? "bg-red-600 !text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              <span
                className={
                  hospitalInputMode ===
                  "select"
                    ? "!text-white"
                    : ""
                }
              >
                Select from list
              </span>
            </button>

            <button
              type="button"
              onClick={() =>
                onHospitalInputModeChange(
                  "manual",
                )
              }
              className={`rounded-xl px-3 py-2 text-xs font-semibold transition ${
                hospitalInputMode ===
                "manual"
                  ? "bg-red-600 !text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              <span
                className={
                  hospitalInputMode ===
                  "manual"
                    ? "!text-white"
                    : ""
                }
              >
                Type hospital name
              </span>
            </button>
          </div>

          {hospitalInputMode ===
          "select" ? (
            <>
              <SelectField
                label="Hospital"
                name="hospital"
                value={
                  form.hospital
                }
                onChange={
                  onHospitalChange
                }
                options={hospitals.map(
                  (hospital) => ({
                    value:
                      hospital._id,

                    label:
                      hospital.name ||
                      hospital.hospitalName ||
                      "Hospital",
                  }),
                )}
                placeholder={
                  loadingHospitals
                    ? "Loading hospitals..."
                    : hospitals.length
                      ? "Select hospital"
                      : "No hospitals available"
                }
                required
                disabled={
                  loadingHospitals
                }
                error={
                  fieldErrors.hospital
                }
              />

              {!loadingHospitals &&
                hospitals.length ===
                  0 && (
                  <div className="mt-3 rounded-xl border border-amber-100 bg-amber-50 p-3">

                    <p className="text-xs leading-5 text-amber-700">
                      No hospitals are currently available from the API. Choose
                      <strong>
                        {" "}
                        Type hospital name
                      </strong>{" "}
                      to enter one manually.
                    </p>
                  </div>
                )}
            </>
          ) : (
            <InputField
              label="Hospital name"
              name="hospitalName"
              value={
                form.hospitalName
              }
              onChange={
                onChange
              }
              placeholder="Enter hospital name"
              required
              error={
                fieldErrors.hospitalName
              }
            />
          )}

          <div className="mt-5 grid gap-5 sm:grid-cols-2">

            <InputField
              label="City"
              name="city"
              value={
                form.city
              }
              onChange={
                onChange
              }
              placeholder="Hospital city"
              required
              error={
                fieldErrors.city
              }
            />

            <InputField
              label="Address"
              name="address"
              value={
                form.address
              }
              onChange={
                onChange
              }
              placeholder="Hospital address"
              required
              error={
                fieldErrors.address
              }
            />
          </div>
        </FormSection>

        {/* URGENCY */}

        <FormSection
          number="03"
          title="Urgency"
          description="How urgently is blood required?"
        >

          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">

            {URGENCIES.map(
              (urgency) => (
                <UrgencyOption
                  key={
                    urgency.value
                  }
                  urgency={
                    urgency
                  }
                  selected={
                    form.urgency ===
                    urgency.value
                  }
                  onClick={() =>
                    onChange({
                      target: {
                        name:
                          "urgency",

                        value:
                          urgency.value,
                      },
                    })
                  }
                />
              ),
            )}
          </div>
        </FormSection>

        {/* DATE */}

        <FormSection
          number="04"
          title="Required by"
          description="When is the blood needed?"
        >

          <div className="max-w-sm">

            <InputField
              label="Required-by date and time"
              name="requiredBy"
              type="datetime-local"
              value={
                form.requiredBy
              }
              onChange={
                onChange
              }
              required
              error={
                fieldErrors.requiredBy
              }
            />
          </div>
        </FormSection>

        {/* CONTACT */}

        <FormSection
          number="05"
          title="Emergency contact"
          description="Who should donors or healthcare staff contact?"
        >

          <div className="grid gap-5 sm:grid-cols-2">

            <InputField
              label="Contact name"
              name="contactName"
              value={
                form.contactName
              }
              onChange={
                onChange
              }
              placeholder="Full name"
              required
              error={
                fieldErrors.contactName
              }
            />

            <InputField
              label="Contact phone"
              name="contactPhone"
              type="tel"
              value={
                form.contactPhone
              }
              onChange={
                onChange
              }
              placeholder="+977 98XXXXXXXX"
              required
              error={
                fieldErrors.contactPhone
              }
            />
          </div>
        </FormSection>

        {/* NOTES */}

        <FormSection
          number="06"
          title="Additional information"
          description="Anything else donors or healthcare staff should know?"
        >

          <textarea
            name="additionalNotes"
            value={
              form.additionalNotes
            }
            onChange={
              onChange
            }
            rows="4"
            maxLength="1000"
            placeholder="Add any relevant information..."
            className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-red-400 focus:bg-white focus:ring-4 focus:ring-red-500/10"
          />

          <p className="mt-1 text-right text-[10px] text-slate-400">
            {
              form
                .additionalNotes
                .length
            }
            /1000
          </p>
        </FormSection>
      </div>

      {/* FOOTER */}

      <div className="flex flex-col-reverse gap-3 border-t border-slate-100 bg-slate-50 px-5 py-5 sm:flex-row sm:justify-end sm:px-7">

        <button
          type="button"
          onClick={
            onCancel
          }
          disabled={
            submitting
          }
          className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
        >
          Clear form
        </button>

        <button
          type="submit"
          disabled={
            submitting
          }
          className="flex items-center justify-center gap-2 rounded-xl bg-red-600 px-6 py-3 text-sm font-bold !text-white shadow-lg shadow-red-600/15 transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? (
            <>
              <Spinner />

              <span className="!text-white">
                Creating request...
              </span>
            </>
          ) : (
            <>
              <BloodDropIcon />

              <span className="!text-white">
                Create blood request
              </span>
            </>
          )}
        </button>
      </div>
    </div>

    {/* SIDEBAR */}

    <aside className="space-y-5">

      <div className="rounded-3xl bg-[#0C2B50] p-6 text-white">

        <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-white/10">

          <HeartPulseIcon />
        </div>

        <h3 className="text-lg font-bold !text-white">
          You're helping someone get closer to care.
        </h3>

        <p className="mt-3 text-xs leading-5 !text-blue-100">
          Accurate request information helps SAHARA connect patients with the right healthcare resources.
        </p>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-5">

        <h3 className="text-sm font-bold text-slate-900">
          Before submitting
        </h3>

        <div className="mt-4 space-y-3">

          <ChecklistItem text="Verify the patient's blood group" />

          <ChecklistItem text="Use a reachable contact number" />

          <ChecklistItem text="Select a hospital or enter its name" />

          <ChecklistItem text="Choose the correct urgency" />

          <ChecklistItem text="Check the required-by date" />
        </div>
      </div>

      <div className="rounded-3xl border border-red-100 bg-red-50 p-5">

        <div className="flex gap-3">

          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-red-600">

            <AlertIcon />
          </div>

          <div>

            <h3 className="text-sm font-bold text-red-900">
              Emergency?
            </h3>

            <p className="mt-1 text-xs leading-5 text-red-700">
              If this is life-threatening, seek immediate emergency medical care rather than waiting for a blood request response.
            </p>
          </div>
        </div>
      </div>
    </aside>
  </form>
);

/* =========================================================
   REQUEST LIST
========================================================= */

const RequestsList = ({
  requests,
  loading,
  cancellingId,
  onOpen,
  onCancel,
  onCreate,
}) => {
  if (loading) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-10">

        <div className="flex flex-col items-center justify-center">

          <Spinner dark />

          <p className="mt-4 text-sm font-medium text-slate-600">
            Loading your blood requests...
          </p>
        </div>
      </div>
    );
  }

  if (
    requests.length ===
    0
  ) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white px-6 py-16 text-center">

        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-500">

          <BloodDropIcon
            size={28}
          />
        </div>

        <h3 className="mt-5 text-xl font-bold text-slate-900">
          No blood requests yet
        </h3>

        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
          When you create a blood request, you can track and manage it here.
        </p>

        <button
          type="button"
          onClick={
            onCreate
          }
          className="mt-6 rounded-xl bg-red-600 px-5 py-3 text-sm font-bold !text-white transition hover:bg-red-700"
        >
          <span className="!text-white">
            Create your first request
          </span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">

      {requests.map(
        (request) => (
          <RequestCard
            key={
              request._id
            }
            request={
              request
            }
            cancellingId={
              cancellingId
            }
            onOpen={
              onOpen
            }
            onCancel={
              onCancel
            }
          />
        ),
      )}
    </div>
  );
};

/* =========================================================
   REQUEST CARD

   IMPORTANT:
   This component is only used for /my requests.
   Therefore every request here belongs to the logged user.
========================================================= */

const RequestCard = ({
  request,
  cancellingId,
  onOpen,
  onCancel,
}) => {
  const urgency =
    getUrgencyConfig(
      request.urgency,
    );

  const status =
    getStatusConfig(
      request.status,
    );

  const hospital =
    request.hospital?.name ||
    request.hospital
      ?.hospitalName ||
    request.hospitalName ||
    "—";

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 transition hover:border-slate-300 hover:shadow-lg hover:shadow-slate-900/5 sm:p-6">

      <div className="flex flex-col gap-5 lg:flex-row lg:items-center">

        <div className="flex flex-1 items-center gap-4">

          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-red-50 text-red-600">

            <span className="text-xl font-black">
              {
                request.bloodGroup
              }
            </span>
          </div>

          <div className="min-w-0">

            <div className="flex flex-wrap items-center gap-2">

              <h3 className="font-bold text-slate-900">
                {
                  request.patientName
                }
              </h3>

              <StatusBadge
                config={
                  status
                }
              />
            </div>

            <p className="mt-1 text-xs text-slate-500">
              {
                request.unitsRequired
              }{" "}
              {request.unitsRequired ===
              1
                ? "unit"
                : "units"}{" "}
              •{" "}
              {
                request.bloodGroup
              }
            </p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3 lg:w-[500px]">

          <InfoItem
            label="Hospital"
            value={hospital}
          />

          <InfoItem
            label="City"
            value={
              request.city ||
              request.hospital
                ?.city ||
              "—"
            }
          />

          <InfoItem
            label="Required by"
            value={formatDate(
              request.requiredBy,
            )}
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">

          <span
            className={`rounded-lg px-2.5 py-1.5 text-[10px] font-bold ${urgency.badge}`}
          >
            {
              request.urgency
            }
          </span>

          <button
            type="button"
            onClick={() =>
              onOpen(
                request._id,
              )
            }
            className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
          >
            View
          </button>

          {/* ONLY MY REQUESTS ARE RENDERED HERE */}

          {request.status ===
            "Open" && (
            <button
              type="button"
              disabled={
                cancellingId ===
                request._id
              }
              onClick={() =>
                onCancel(
                  request,
                )
              }
              className="rounded-xl border border-red-100 bg-red-50 px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-100 disabled:opacity-50"
            >
              {cancellingId ===
              request._id
                ? "Cancelling..."
                : "Cancel"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

/* =========================================================
   REQUEST MODAL
========================================================= */

const RequestModal = ({
  request,
  loading,
  cancellingId,
  onClose,
  onCancel,
  canCancel,
}) => (
  <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">

    <button
      type="button"
      aria-label="Close request details"
      className="absolute inset-0 cursor-default bg-slate-950/50 backdrop-blur-sm"
      onClick={
        onClose
      }
    />

    <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white shadow-2xl">

      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white px-5 py-5 sm:px-7">

        <div>

          <p className="text-xs font-bold uppercase tracking-wider text-red-600">
            Blood request
          </p>

          <h2 className="mt-1 text-xl font-black text-slate-900">
            Request details
          </h2>
        </div>

        <button
          type="button"
          onClick={
            onClose
          }
          className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-lg text-slate-500 transition hover:bg-slate-200"
        >
          ×
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center p-14">

          <Spinner dark />

          <p className="mt-4 text-sm text-slate-500">
            Loading request...
          </p>
        </div>
      ) : request ? (
        <div className="p-5 sm:p-7">

          {/* SUMMARY */}

          <div className="rounded-2xl border border-red-100 bg-red-50 p-5">

            <div className="flex items-center gap-4">

              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-red-600 shadow-sm">

                <span className="text-xl font-black">
                  {
                    request.bloodGroup
                  }
                </span>
              </div>

              <div>

                <h3 className="text-lg font-black text-slate-900">
                  {
                    request.patientName
                  }
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  {
                    request.unitsRequired
                  }{" "}
                  {request.unitsRequired ===
                  1
                    ? "unit"
                    : "units"}{" "}
                  required
                </p>
              </div>
            </div>
          </div>

          {/* STATUS */}

          <div className="mt-5 grid gap-3 sm:grid-cols-2">

            <DetailBox
              label="Request status"
              value={
                request.status ||
                "Open"
              }
            />

            <DetailBox
              label="Urgency"
              value={
                request.urgency ||
                "Medium"
              }
            />

            <DetailBox
              label="Required by"
              value={formatDate(
                request.requiredBy,
                true,
              )}
            />

            <DetailBox
              label="Created"
              value={formatDate(
                request.createdAt,
                true,
              )}
            />
          </div>

          {/* HOSPITAL */}

          <DetailSection title="Hospital">

            <div className="grid gap-4 sm:grid-cols-2">

              <DetailBox
                label="Hospital"
                value={
                  request.hospital
                    ?.name ||
                  request.hospital
                    ?.hospitalName ||
                  request.hospitalName ||
                  "—"
                }
              />

              <DetailBox
                label="City"
                value={
                  request.city ||
                  request.hospital
                    ?.city ||
                  "—"
                }
              />

              <div className="sm:col-span-2">

                <DetailBox
                  label="Address"
                  value={
                    request.address ||
                    request.hospital
                      ?.address ||
                    "—"
                  }
                />
              </div>
            </div>
          </DetailSection>

          {/* CONTACT */}

          <DetailSection title="Emergency contact">

            <div className="grid gap-4 sm:grid-cols-2">

              <DetailBox
                label="Contact name"
                value={
                  request.contactName ||
                  "—"
                }
              />

              <DetailBox
                label="Contact phone"
                value={
                  request.contactPhone ||
                  "—"
                }
              />
            </div>
          </DetailSection>

          {/* CREATOR */}

          {request.requestedBy && (
            <DetailSection title="Requested by">

              <div className="grid gap-4 sm:grid-cols-2">

                <DetailBox
                  label="Account"
                  value={
                    request
                      .requestedBy
                      ?.fullName ||
                    "SAHARA user"
                  }
                />

                {request
                  .requestedBy
                  ?.phone && (
                  <DetailBox
                    label="Account phone"
                    value={
                      request
                        .requestedBy
                        .phone
                    }
                  />
                )}
              </div>
            </DetailSection>
          )}

          {/* NOTES */}

          {request.additionalNotes && (
            <DetailSection title="Additional notes">

              <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">

                <p className="whitespace-pre-wrap text-sm leading-6 text-slate-700">
                  {
                    request.additionalNotes
                  }
                </p>
              </div>
            </DetailSection>
          )}

          {/* OWNERSHIP NOTICE */}

          {!canCancel &&
            request.status ===
              "Open" && (
              <div className="mt-6 rounded-xl border border-blue-100 bg-blue-50 p-4">

                <p className="text-xs font-semibold text-blue-800">
                  Only the account that created this blood request can cancel it.
                </p>
              </div>
            )}

          {/* ACTIONS */}

          <div className="mt-7 flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">

            <button
              type="button"
              onClick={
                onClose
              }
              className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
            >
              Close
            </button>

            {/* IMPORTANT OWNERSHIP CHECK */}

            {request.status ===
              "Open" &&
              canCancel && (
                <button
                  type="button"
                  disabled={
                    cancellingId ===
                    request._id
                  }
                  onClick={() =>
                    onCancel(
                      request,
                    )
                  }
                  className="rounded-xl bg-red-600 px-5 py-3 text-sm font-bold !text-white transition hover:bg-red-700 disabled:opacity-50"
                >
                  <span className="!text-white">
                    {cancellingId ===
                    request._id
                      ? "Cancelling..."
                      : "Cancel Request"}
                  </span>
                </button>
              )}
          </div>
        </div>
      ) : (
        <div className="p-12 text-center">

          <p className="text-sm font-semibold text-slate-600">
            Request could not be loaded.
          </p>
        </div>
      )}
    </div>
  </div>
);

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

      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-red-50 text-[10px] font-black text-red-600">
        {number}
      </div>

      <div>

        <h4 className="text-sm font-bold text-slate-900">
          {title}
        </h4>

        <p className="mt-0.5 text-xs text-slate-400">
          {description}
        </p>
      </div>
    </div>

    {children}
  </section>
);

/* =========================================================
   INPUT
========================================================= */

const InputField = ({
  label,
  name,
  value,
  onChange,
  type = "text",
  placeholder,
  required = false,
  error,
  min,
  step,
}) => (
  <div>

    <label className="mb-2 block text-xs font-bold text-slate-600">
      {label}

      {required && (
        <span className="ml-1 text-red-500">
          *
        </span>
      )}
    </label>

    <input
      name={name}
      type={type}
      value={value}
      onChange={
        onChange
      }
      placeholder={
        placeholder
      }
      required={
        required
      }
      min={min}
      step={step}
      className={`h-12 w-full rounded-xl border bg-slate-50 px-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:bg-white focus:ring-4 ${
        error
          ? "border-red-300 focus:border-red-400 focus:ring-red-500/10"
          : "border-slate-200 focus:border-[#1717E8] focus:ring-[#1717E8]/10"
      }`}
    />

    {error && (
      <p className="mt-1.5 text-[10px] font-semibold text-red-600">
        {error}
      </p>
    )}
  </div>
);

/* =========================================================
   SELECT
========================================================= */

const SelectField = ({
  label,
  name,
  value,
  onChange,
  options,
  placeholder,
  required = false,
  disabled = false,
  error,
}) => (
  <div>

    <label className="mb-2 block text-xs font-bold text-slate-600">
      {label}

      {required && (
        <span className="ml-1 text-red-500">
          *
        </span>
      )}
    </label>

    <select
      name={name}
      value={value}
      onChange={
        onChange
      }
      required={
        required
      }
      disabled={
        disabled
      }
      className={`h-12 w-full rounded-xl border bg-slate-50 px-4 text-sm text-slate-800 outline-none transition focus:bg-white focus:ring-4 disabled:cursor-not-allowed disabled:opacity-60 ${
        error
          ? "border-red-300 focus:border-red-400 focus:ring-red-500/10"
          : "border-slate-200 focus:border-[#1717E8] focus:ring-[#1717E8]/10"
      }`}
    >

      <option value="">
        {placeholder}
      </option>

      {options.map(
        (option) => (
          <option
            key={
              option.value
            }
            value={
              option.value
            }
          >
            {
              option.label
            }
          </option>
        ),
      )}
    </select>

    {error && (
      <p className="mt-1.5 text-[10px] font-semibold text-red-600">
        {error}
      </p>
    )}
  </div>
);

/* =========================================================
   URGENCY
========================================================= */

const UrgencyOption = ({
  urgency,
  selected,
  onClick,
}) => {
  const styles = {
    emerald: {
      selected:
        "border-emerald-400 bg-emerald-50",
      text:
        "text-emerald-700",
      dot:
        "bg-emerald-500",
    },

    amber: {
      selected:
        "border-amber-400 bg-amber-50",
      text:
        "text-amber-700",
      dot:
        "bg-amber-500",
    },

    orange: {
      selected:
        "border-orange-400 bg-orange-50",
      text:
        "text-orange-700",
      dot:
        "bg-orange-500",
    },

    red: {
      selected:
        "border-red-400 bg-red-50",
      text:
        "text-red-700",
      dot:
        "bg-red-500",
    },
  };

  const style =
    styles[
      urgency.color
    ];

  return (
    <button
      type="button"
      onClick={
        onClick
      }
      className={`rounded-xl border p-3.5 text-left transition ${
        selected
          ? style.selected
          : "border-slate-200 bg-white hover:border-slate-300"
      }`}
    >

      <div className="flex items-center gap-2">

        <span
          className={`h-2.5 w-2.5 rounded-full ${style.dot}`}
        />

        <span
          className={`text-xs font-bold ${
            selected
              ? style.text
              : "text-slate-700"
          }`}
        >
          {
            urgency.label
          }
        </span>
      </div>

      <p className="ml-[18px] mt-1 text-[10px] text-slate-400">
        {
          urgency.description
        }
      </p>
    </button>
  );
};

/* =========================================================
   STATUS
========================================================= */

const getStatusConfig = (
  status,
) => {
  switch (status) {
    case "Completed":
      return {
        label:
          "Completed",
        badge:
          "bg-emerald-50 text-emerald-700",
      };

    case "Cancelled":
      return {
        label:
          "Cancelled",
        badge:
          "bg-slate-100 text-slate-500",
      };

    default:
      return {
        label: "Open",
        badge:
          "bg-blue-50 text-blue-700",
      };
  }
};

/* =========================================================
   URGENCY CONFIG
========================================================= */

const getUrgencyConfig = (
  urgency,
) => {
  switch (urgency) {
    case "Critical":
      return {
        badge:
          "bg-red-50 text-red-700",
      };

    case "High":
      return {
        badge:
          "bg-orange-50 text-orange-700",
      };

    case "Low":
      return {
        badge:
          "bg-emerald-50 text-emerald-700",
      };

    default:
      return {
        badge:
          "bg-amber-50 text-amber-700",
      };
  }
};

/* =========================================================
   STATUS BADGE
========================================================= */

const StatusBadge = ({
  config,
}) => (
  <span
    className={`rounded-lg px-2 py-1 text-[10px] font-bold ${config.badge}`}
  >
    {config.label}
  </span>
);

/* =========================================================
   INFO
========================================================= */

const InfoItem = ({
  label,
  value,
}) => (
  <div className="min-w-0">

    <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
      {label}
    </p>

    <p className="mt-1 truncate text-xs font-semibold text-slate-700">
      {value}
    </p>
  </div>
);

/* =========================================================
   DETAIL BOX
========================================================= */

const DetailBox = ({
  label,
  value,
}) => (
  <div className="rounded-xl border border-slate-100 bg-slate-50 p-3.5">

    <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
      {label}
    </p>

    <p className="mt-1 break-words text-sm font-semibold text-slate-700">
      {value || "—"}
    </p>
  </div>
);

/* =========================================================
   DETAIL SECTION
========================================================= */

const DetailSection = ({
  title,
  children,
}) => (
  <section className="mt-6">

    <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-400">
      {title}
    </h3>

    {children}
  </section>
);

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
    onClick={
      onClick
    }
    className={`rounded-lg px-4 py-2.5 text-xs font-bold transition ${
      active
        ? "bg-white text-slate-900 shadow-sm"
        : "text-slate-500 hover:text-slate-800"
    }`}
  >
    {children}
  </button>
);

/* =========================================================
   ALERT
========================================================= */

const Alert = ({
  type,
  message,
  onClose,
}) => {
  const success =
    type === "success";

  return (
    <div
      className={`mb-5 flex items-start justify-between gap-4 rounded-xl border p-4 ${
        success
          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
          : "border-red-200 bg-red-50 text-red-700"
      }`}
    >

      <div className="flex items-start gap-3">

        <span
          className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-black ${
            success
              ? "bg-emerald-100"
              : "bg-red-100"
          }`}
        >
          {success
            ? "✓"
            : "!"}
        </span>

        <p className="text-xs font-semibold leading-5">
          {message}
        </p>
      </div>

      <button
        type="button"
        onClick={
          onClose
        }
        className="text-lg leading-none opacity-60 transition hover:opacity-100"
      >
        ×
      </button>
    </div>
  );
};

/* =========================================================
   STAT
========================================================= */

const StatCard = ({
  label,
  value,
  color,
  className = "",
}) => {
  const styles = {
    red:
      "bg-red-50 text-red-700",

    emerald:
      "bg-emerald-50 text-emerald-700",

    slate:
      "bg-slate-100 text-slate-700",

    blue:
      "bg-blue-50 text-blue-700",
  };

  return (
    <div
      className={`min-w-[72px] rounded-xl px-3 py-2.5 ${styles[color]} ${className}`}
    >

      <p className="text-lg font-black">
        {value}
      </p>

      <p className="text-[9px] font-bold">
        {label}
      </p>
    </div>
  );
};

/* =========================================================
   CHECKLIST
========================================================= */

const ChecklistItem = ({
  text,
}) => (
  <div className="flex items-start gap-2.5">

    <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-[10px] font-black text-emerald-600">
      ✓
    </div>

    <p className="text-xs leading-5 text-slate-600">
      {text}
    </p>
  </div>
);

/* =========================================================
   FORMAT DATE
========================================================= */

const formatDate = (
  value,
  withTime = false,
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
      year: "numeric",
      month: "short",
      day: "numeric",

      ...(withTime
        ? {
            hour:
              "numeric",

            minute:
              "2-digit",
          }
        : {}),
    },
  ).format(date);
};

/* =========================================================
   SPINNER
========================================================= */

const Spinner = ({
  dark = false,
}) => (
  <span
    className={`inline-block h-5 w-5 animate-spin rounded-full border-2 border-t-transparent ${
      dark
        ? "border-slate-700"
        : "border-white"
    }`}
  />
);

/* =========================================================
   ICONS
========================================================= */

const BloodDropIcon = ({
  size = 20,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M12 2.5S5.5 9.3 5.5 14.4a6.5 6.5 0 0 0 13 0C18.5 9.3 12 2.5 12 2.5Z" />

    <path d="M9.4 15.2a2.8 2.8 0 0 0 2.8 2.8" />
  </svg>
);

const HeartPulseIcon = () => (
  <svg
    width="21"
    height="21"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M19 14c1.5-1.5 3-3.3 3-5.5A5.5 5.5 0 0 0 12 5a5.5 5.5 0 0 0-10 3.5C2 11 4 13 6 15l6 6 3-3" />

    <path d="M3 12h4l2-3 3 6 2-3h6" />
  </svg>
);

const AlertIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M10.3 2.9 1.8 17a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 2.9a2 2 0 0 0-3.4 0Z" />

    <path d="M12 9v4" />

    <path d="M12 17h.01" />
  </svg>
);

export default BloodRequest;