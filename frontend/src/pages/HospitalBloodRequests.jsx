import React, {
    useEffect,
    useMemo,
    useState,
  } from "react";
  
  const API_BASE_URL =
    import.meta.env.VITE_API_URL ||
    "http://localhost:3000/api";
  
  const API =
    `${API_BASE_URL}/blood-requests`;
  
  const HospitalBloodRequests = () => {
    const [activeTab, setActiveTab] =
      useState("personal");
  
    const [personalRequests, setPersonalRequests] =
      useState([]);
  
    const [allRequests, setAllRequests] =
      useState([]);
  
    const [hospital, setHospital] =
      useState(null);
  
    const [loading, setLoading] =
      useState(false);
  
    const [error, setError] =
      useState("");
  
    const [selectedRequest, setSelectedRequest] =
      useState(null);
  
    const getToken = () => {
      return (
        localStorage.getItem("token") ||
        sessionStorage.getItem("token") ||
        localStorage.getItem("accessToken") ||
        sessionStorage.getItem("accessToken")
      );
    };
  
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
        data = await response.json();
      } catch {
        data = null;
      }
  
      if (!response.ok) {
        throw new Error(
          data?.message ||
            `Request failed with status ${response.status}`
        );
      }
  
      return data;
    };
  
    const loadPersonalRequests =
      async () => {
        try {
          setLoading(true);
          setError("");
  
          const data =
            await apiRequest(
              `${API}/hospital`
            );
  
          setPersonalRequests(
            Array.isArray(
              data?.requests
            )
              ? data.requests
              : []
          );
  
          setHospital(
            data?.hospital || null
          );
        } catch (err) {
          console.error(err);
          setError(
            err.message ||
              "Unable to load hospital requests."
          );
        } finally {
          setLoading(false);
        }
      };
  
    const loadAllRequests =
      async () => {
        try {
          setLoading(true);
          setError("");
  
          const data =
            await apiRequest(
              `${API}/hospital/all`
            );
  
          setAllRequests(
            Array.isArray(
              data?.requests
            )
              ? data.requests
              : []
          );
  
          setHospital(
            data?.hospital || null
          );
        } catch (err) {
          console.error(err);
          setError(
            err.message ||
              "Unable to load blood requests."
          );
        } finally {
          setLoading(false);
        }
      };
  
    useEffect(() => {
      if (
        activeTab === "personal"
      ) {
        loadPersonalRequests();
      }
  
      if (
        activeTab === "all"
      ) {
        loadAllRequests();
      }
    }, [activeTab]);
  
    const stats = useMemo(() => {
      const list =
        activeTab === "personal"
          ? personalRequests
          : allRequests;
  
      return {
        total: list.length,
  
        open: list.filter(
          (item) =>
            item.status === "Open"
        ).length,
  
        critical: list.filter(
          (item) =>
            item.urgency === "Critical"
        ).length,
  
        units: list.reduce(
          (sum, item) =>
            sum +
            Number(
              item.unitsRequired || 0
            ),
          0
        ),
      };
    }, [
      activeTab,
      personalRequests,
      allRequests,
    ]);
  
    return (
      <div className="w-full max-w-7xl mx-auto">
  
        <div className="mb-7">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5">
  
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-red-600">
                BLOOD OPERATIONS
              </p>
  
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-950 mt-2">
                Blood Requests
              </h1>
  
              <p className="text-sm text-slate-500 mt-2 max-w-2xl">
                Monitor blood requests directed to
                your hospital and view requests
                across the Sahara network.
              </p>
  
              {hospital?.name && (
                <div className="inline-flex items-center gap-2 mt-4 px-3 py-2 rounded-xl bg-blue-50 border border-blue-100 text-blue-700">
                  <span>🏥</span>
  
                  <span className="text-xs font-bold">
                    {hospital.name}
                  </span>
  
                  {hospital.city && (
                    <span className="text-xs text-blue-500">
                      • {hospital.city}
                    </span>
                  )}
                </div>
              )}
            </div>
  
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
  
              <StatCard
                label="Requests"
                value={stats.total}
              />
  
              <StatCard
                label="Open"
                value={stats.open}
                red
              />
  
              <StatCard
                label="Units"
                value={stats.units}
              />
  
            </div>
          </div>
        </div>
  
        {error && (
          <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-5 py-4">
            <p className="text-sm font-bold text-red-800">
              Unable to load requests
            </p>
  
            <p className="text-xs text-red-600 mt-1">
              {error}
            </p>
  
            <button
              type="button"
              onClick={() => {
                activeTab ===
                "personal"
                  ? loadPersonalRequests()
                  : loadAllRequests();
              }}
              className="mt-3 px-4 py-2 rounded-lg bg-red-600 text-white text-xs font-bold"
            >
              Try Again
            </button>
          </div>
        )}
  
        <div className="flex flex-wrap gap-1 p-1 bg-slate-100 rounded-2xl w-fit mb-6">
  
          <TabButton
            active={
              activeTab ===
              "personal"
            }
            onClick={() =>
              setActiveTab(
                "personal"
              )
            }
          >
            <span className="flex items-center gap-2">
              🏥
  
              <span>
                My Hospital Requests
              </span>
  
              {personalRequests.length >
                0 && (
                <span className="px-2 py-0.5 rounded-md bg-white text-slate-600 text-[10px] font-bold">
                  {personalRequests.length}
                </span>
              )}
            </span>
          </TabButton>
  
          <TabButton
            active={
              activeTab === "all"
            }
            onClick={() =>
              setActiveTab("all")
            }
          >
            <span className="flex items-center gap-2">
              🌐
  
              <span>
                All Requests
              </span>
  
              {allRequests.length >
                0 && (
                <span className="px-2 py-0.5 rounded-md bg-white text-slate-600 text-[10px] font-bold">
                  {allRequests.length}
                </span>
              )}
            </span>
          </TabButton>
  
        </div>
  
        {loading ? (
          <LoadingState />
        ) : activeTab ===
          "personal" ? (
          <RequestList
            requests={
              personalRequests
            }
            personal
            onOpen={(request) =>
              setSelectedRequest(
                request
              )
            }
          />
        ) : (
          <RequestList
            requests={allRequests}
            onOpen={(request) =>
              setSelectedRequest(
                request
              )
            }
          />
        )}
  
        {selectedRequest && (
          <RequestModal
            request={
              selectedRequest
            }
            onClose={() =>
              setSelectedRequest(
                null
              )
            }
          />
        )}
  
      </div>
    );
  };
  
  const RequestList = ({
    requests,
    personal,
    onOpen,
  }) => {
    if (!requests.length) {
      return (
        <div className="bg-white border border-slate-200 rounded-3xl py-16 px-6 text-center">
  
          <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto text-2xl">
            🩸
          </div>
  
          <h3 className="text-xl font-black text-slate-900 mt-5">
            {personal
              ? "No requests for your hospital"
              : "No blood requests"}
          </h3>
  
          <p className="text-sm text-slate-500 max-w-md mx-auto mt-2">
            {personal
              ? "There are currently no blood requests specifically directed to your hospital."
              : "There are currently no blood requests in Sahara."}
          </p>
  
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
              personal={
                personal
              }
              onOpen={
                onOpen
              }
            />
          )
        )}
  
      </div>
    );
  };
  
  const RequestCard = ({
    request,
    personal,
    onOpen,
  }) => {
    const urgency =
      getUrgency(
        request.urgency
      );
  
    const hospitalName =
      request.hospital?.name ||
      request.hospital
        ?.hospitalName ||
      request.hospitalName ||
      "Hospital not specified";
  
    const requester =
      request.requestedBy
        ?.fullName ||
      "Unknown requester";
  
    return (
      <div
        className={`bg-white border rounded-3xl p-5 sm:p-6 transition hover:shadow-xl hover:shadow-slate-900/5 ${
          request.urgency ===
          "Critical"
            ? "border-red-200"
            : "border-slate-200"
        }`}
      >
  
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
  
          <div className="flex items-center gap-4">
  
            <div
              className={`w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 ${
                request.urgency ===
                "Critical"
                  ? "bg-red-100 text-red-700"
                  : "bg-red-50 text-red-600"
              }`}
            >
              <span className="text-lg font-black">
                {
                  request.bloodGroup
                }
              </span>
            </div>
  
            <div>
              <div className="flex flex-wrap items-center gap-2">
  
                <h3 className="text-lg font-black text-slate-900">
                  {
                    request.patientName
                  }
                </h3>
  
                <span
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold ${getStatusClass(
                    request.status
                  )}`}
                >
                  {
                    request.status ||
                    "Open"
                  }
                </span>
  
              </div>
  
              <p className="text-sm text-slate-500 mt-1">
                {
                  request.unitsRequired
                }{" "}
                {request.unitsRequired ===
                1
                  ? "unit"
                  : "units"}{" "}
                of{" "}
                <strong className="text-red-600">
                  {
                    request.bloodGroup
                  }
                </strong>
              </p>
  
            </div>
  
          </div>
  
          <span
            className={`self-start lg:self-center px-3 py-2 rounded-xl text-xs font-bold ${urgency.className}`}
          >
            {request.urgency ||
              "Medium"}{" "}
            urgency
          </span>
  
        </div>
  
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-5">
  
          <Info
            label="Hospital"
            value={
              hospitalName
            }
            icon="🏥"
          />
  
          <Info
            label="Requester"
            value={
              requester
            }
            icon="👤"
          />
  
          <Info
            label="Location"
            value={
              request.city ||
              request.hospital
                ?.city ||
              "—"
            }
            icon="📍"
          />
  
          <Info
            label="Required by"
            value={
              formatDate(
                request.requiredBy
              )
            }
            icon="⏱️"
          />
  
        </div>
  
        {request.additionalNotes && (
          <div className="mt-4 rounded-xl bg-slate-50 border border-slate-100 px-4 py-3">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Notes
            </p>
  
            <p className="text-xs text-slate-600 mt-1 leading-5">
              {
                request.additionalNotes
              }
            </p>
          </div>
        )}
  
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-5 pt-5 border-t border-slate-100">
  
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Request created
            </p>
  
            <p className="text-xs font-semibold text-slate-600 mt-1">
              {
                formatDate(
                  request.createdAt
                )
              }
            </p>
          </div>
  
          <button
            type="button"
            onClick={() =>
              onOpen(request)
            }
            className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition"
          >
            View Request
          </button>
  
        </div>
  
      </div>
    );
  };
  
  const RequestModal = ({
    request,
    onClose,
  }) => {
    return (
      <div
        className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={onClose}
      >
        <div
          className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-3xl shadow-2xl"
          onClick={(event) =>
            event.stopPropagation()
          }
        >
  
          <div className="p-6 border-b border-slate-100 flex items-start justify-between gap-4">
  
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-red-600">
                Blood Request
              </p>
  
              <h2 className="text-2xl font-black text-slate-950 mt-1">
                {
                  request.patientName
                }
              </h2>
            </div>
  
            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600"
            >
              ×
            </button>
  
          </div>
  
          <div className="p-6 space-y-5">
  
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
  
              <Detail
                label="Blood"
                value={
                  request.bloodGroup
                }
              />
  
              <Detail
                label="Units"
                value={
                  request.unitsRequired
                }
              />
  
              <Detail
                label="Urgency"
                value={
                  request.urgency
                }
              />
  
              <Detail
                label="Status"
                value={
                  request.status
                }
              />
  
            </div>
  
            <div className="rounded-2xl bg-slate-50 border border-slate-100 p-5">
  
              <h3 className="font-bold text-slate-900">
                Patient & Contact
              </h3>
  
              <div className="grid sm:grid-cols-2 gap-4 mt-4">
  
                <Detail
                  label="Contact person"
                  value={
                    request.contactName
                  }
                />
  
                <Detail
                  label="Phone"
                  value={
                    request.contactPhone
                  }
                />
  
                <Detail
                  label="City"
                  value={
                    request.city
                  }
                />
  
                <Detail
                  label="Address"
                  value={
                    request.address
                  }
                />
  
              </div>
  
            </div>
  
            <div className="rounded-2xl bg-blue-50 border border-blue-100 p-5">
  
              <h3 className="font-bold text-blue-950">
                Hospital
              </h3>
  
              <p className="text-sm font-semibold text-blue-800 mt-2">
                {
                  request.hospital?.name ||
                  request.hospital
                    ?.hospitalName ||
                  request.hospitalName ||
                  "Not specified"
                }
              </p>
  
              <p className="text-xs text-blue-700 mt-1">
                {
                  request.hospital
                    ?.address ||
                  request.address
                }
              </p>
  
            </div>
  
            {request.additionalNotes && (
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Additional Notes
                </p>
  
                <p className="text-sm text-slate-600 mt-2 leading-6">
                  {
                    request.additionalNotes
                  }
                </p>
              </div>
            )}
  
          </div>
  
          <div className="p-6 border-t border-slate-100 flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-3 rounded-xl bg-slate-900 text-white text-sm font-bold"
            >
              Close
            </button>
          </div>
  
        </div>
      </div>
    );
  };
  
  const StatCard = ({
    label,
    value,
    red,
  }) => {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl px-4 py-3 min-w-[90px]">
        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
          {label}
        </p>
  
        <p
          className={`text-xl font-black mt-1 ${
            red
              ? "text-red-600"
              : "text-slate-900"
          }`}
        >
          {value}
        </p>
      </div>
    );
  };
  
  const TabButton = ({
    active,
    onClick,
    children,
  }) => {
    return (
      <button
        type="button"
        onClick={onClick}
        className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition ${
          active
            ? "bg-white text-slate-900 shadow-sm"
            : "text-slate-500 hover:text-slate-800"
        }`}
      >
        {children}
      </button>
    );
  };
  
  const Info = ({
    icon,
    label,
    value,
  }) => {
    return (
      <div className="rounded-xl bg-slate-50 border border-slate-100 px-4 py-3">
        <div className="flex items-center gap-2">
          <span>{icon}</span>
  
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            {label}
          </p>
        </div>
  
        <p className="text-xs font-semibold text-slate-700 mt-2 truncate">
          {value || "—"}
        </p>
      </div>
    );
  };
  
  const Detail = ({
    label,
    value,
  }) => {
    return (
      <div>
        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
          {label}
        </p>
  
        <p className="text-sm font-semibold text-slate-800 mt-1">
          {value || "—"}
        </p>
      </div>
    );
  };
  
  const LoadingState = () => {
    return (
      <div className="bg-white border border-slate-200 rounded-3xl py-16 flex flex-col items-center">
        <div className="w-10 h-10 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin" />
  
        <p className="text-sm font-semibold text-slate-600 mt-4">
          Loading blood requests...
        </p>
      </div>
    );
  };
  
  const getUrgency = (
    urgency
  ) => {
    switch (urgency) {
      case "Critical":
        return {
          className:
            "bg-red-100 text-red-700",
        };
  
      case "High":
        return {
          className:
            "bg-orange-100 text-orange-700",
        };
  
      case "Medium":
        return {
          className:
            "bg-amber-100 text-amber-700",
        };
  
      default:
        return {
          className:
            "bg-slate-100 text-slate-600",
        };
    }
  };
  
  const getStatusClass = (
    status
  ) => {
    switch (status) {
      case "Open":
        return "bg-emerald-50 text-emerald-700";
  
      case "Completed":
        return "bg-blue-50 text-blue-700";
  
      case "Cancelled":
        return "bg-slate-100 text-slate-600";
  
      default:
        return "bg-slate-100 text-slate-600";
    }
  };
  
  const formatDate = (
    value
  ) => {
    if (!value) return "—";
  
    const date = new Date(value);
  
    if (Number.isNaN(date.getTime())) {
      return "—";
    }
  
    return date.toLocaleString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  };
  
  export default HospitalBloodRequests;