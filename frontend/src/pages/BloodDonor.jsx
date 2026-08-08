import React, { useEffect, useMemo, useState } from "react";

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:3000/api";

const DONOR_API = `${API_BASE_URL}/blood-donors`;

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

const BloodDonor = () => {
  const [activeTab, setActiveTab] =
    useState("donors");

  const [donors, setDonors] = useState([]);
  const [myDonor, setMyDonor] =
    useState(null);

  const [bloodGroup, setBloodGroup] =
    useState("");
  const [city, setCity] = useState("");
  const [emergencyOnly, setEmergencyOnly] =
    useState(false);

  const [loadingDonors, setLoadingDonors] =
    useState(true);
  const [loadingProfile, setLoadingProfile] =
    useState(true);

  const [becomingDonor, setBecomingDonor] =
    useState(false);
  const [updatingAvailability, setUpdatingAvailability] =
    useState(false);
  const [updatingEmergency, setUpdatingEmergency] =
    useState(false);
  const [leavingProgram, setLeavingProgram] =
    useState(false);

  const [lastDonationDate, setLastDonationDate] =
    useState("");
  const [totalDonations, setTotalDonations] =
    useState(0);
  const [remarks, setRemarks] =
    useState("");

  const [savingInfo, setSavingInfo] =
    useState(false);

  const [selectedDonor, setSelectedDonor] =
    useState(null);

  const [errorMessage, setErrorMessage] =
    useState("");
  const [successMessage, setSuccessMessage] =
    useState("");

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
          data?.error ||
          "Something went wrong."
      );
    }

    return data;
  };

  const loadActiveDonors = async () => {
    setLoadingDonors(true);

    try {
      const params =
        new URLSearchParams();

      if (bloodGroup) {
        params.set(
          "bloodGroup",
          bloodGroup
        );
      }

      if (city.trim()) {
        params.set(
          "city",
          city.trim()
        );
      }

      if (emergencyOnly) {
        params.set(
          "emergency",
          "true"
        );
      }

      const query =
        params.toString();

      const data =
        await apiRequest(
          `${DONOR_API}/active${
            query
              ? `?${query}`
              : ""
          }`
        );

      setDonors(
        Array.isArray(data?.donors)
          ? data.donors
          : []
      );
    } catch (error) {
      console.error(
        "Load donors error:",
        error
      );

      setErrorMessage(
        error.message
      );

      setDonors([]);
    } finally {
      setLoadingDonors(false);
    }
  };

  const loadMyDonor = async () => {
    setLoadingProfile(true);

    try {
      const data =
        await apiRequest(
          `${DONOR_API}/me`
        );

      const donor =
        data?.donor || null;

      setMyDonor(donor);

      if (donor) {
        setLastDonationDate(
          donor.lastDonationDate
            ? donor.lastDonationDate.slice(
                0,
                10
              )
            : ""
        );

        setTotalDonations(
          donor.totalDonations || 0
        );

        setRemarks(
          donor.remarks || ""
        );
      }
    } catch (error) {
      if (
        !error.message
          .toLowerCase()
          .includes("not registered")
      ) {
        console.error(
          "Load donor profile error:",
          error
        );

        setErrorMessage(
          error.message
        );
      }

      setMyDonor(null);
    } finally {
      setLoadingProfile(false);
    }
  };

  useEffect(() => {
    loadActiveDonors();
    loadMyDonor();
  }, []);

  const handleSearch = async () => {
    setErrorMessage("");
    await loadActiveDonors();
  };

  const becomeDonor = async () => {
    setBecomingDonor(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const data =
        await apiRequest(
          `${DONOR_API}/become`,
          {
            method: "POST",
            body: JSON.stringify({}),
          }
        );

      setMyDonor(
        data?.donor || null
      );

      setSuccessMessage(
        data?.message ||
          "You are now registered as a donor."
      );

      await loadActiveDonors();
    } catch (error) {
      console.error(
        "Become donor error:",
        error
      );

      if (
        error.message
          .toLowerCase()
          .includes("already registered")
      ) {
        await loadMyDonor();
      }

      setErrorMessage(
        error.message
      );
    } finally {
      setBecomingDonor(false);
    }
  };

  const updateAvailability = async (
    availability
  ) => {
    setUpdatingAvailability(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const data =
        await apiRequest(
          `${DONOR_API}/availability`,
          {
            method: "PATCH",
            body: JSON.stringify({
              availability,
            }),
          }
        );

      setMyDonor(
        (previous) => ({
          ...previous,
          ...data.donor,
        })
      );

      setSuccessMessage(
        data?.message ||
          "Availability updated."
      );

      await loadActiveDonors();
    } catch (error) {
      setErrorMessage(
        error.message
      );
    } finally {
      setUpdatingAvailability(
        false
      );
    }
  };

  const updateEmergency = async (
    emergencyAvailable
  ) => {
    setUpdatingEmergency(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const data =
        await apiRequest(
          `${DONOR_API}/emergency-availability`,
          {
            method: "PATCH",
            body: JSON.stringify({
              emergencyAvailable,
            }),
          }
        );

      setMyDonor(
        (previous) => ({
          ...previous,
          ...data.donor,
        })
      );

      setSuccessMessage(
        data?.message ||
          "Emergency availability updated."
      );

      await loadActiveDonors();
    } catch (error) {
      setErrorMessage(
        error.message
      );
    } finally {
      setUpdatingEmergency(
        false
      );
    }
  };

  const saveInformation = async () => {
    setSavingInfo(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const data =
        await apiRequest(
          `${DONOR_API}/information`,
          {
            method: "PATCH",
            body: JSON.stringify({
              lastDonationDate,
              totalDonations:
                Number(
                  totalDonations
                ),
              remarks,
            }),
          }
        );

      setMyDonor(
        (previous) => ({
          ...previous,
          ...data.donor,
        })
      );

      setSuccessMessage(
        data?.message ||
          "Donor information updated."
      );

      await loadActiveDonors();
    } catch (error) {
      setErrorMessage(
        error.message
      );
    } finally {
      setSavingInfo(false);
    }
  };

  const leaveProgram = async () => {
    const confirmed =
      window.confirm(
        "Are you sure you want to leave the blood donor program?"
      );

    if (!confirmed) {
      return;
    }

    setLeavingProgram(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const data =
        await apiRequest(
          `${DONOR_API}/leave`,
          {
            method: "DELETE",
          }
        );

      setMyDonor(null);

      setSuccessMessage(
        data?.message ||
          "You have left the donor program."
      );

      await loadActiveDonors();
    } catch (error) {
      setErrorMessage(
        error.message
      );
    } finally {
      setLeavingProgram(false);
    }
  };

  const availableCount =
    donors.length;

  const emergencyCount =
    useMemo(
      () =>
        donors.filter(
          (donor) =>
            donor.emergencyAvailable
        ).length,
      [donors]
    );

  return (
    <div className="w-full">
      <div className="mb-7">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500" />

              <p className="text-xs font-bold tracking-[0.18em] uppercase text-red-600">
                BLOOD DONOR NETWORK
              </p>
            </div>

            <h1 className="text-3xl sm:text-4xl font-black tracking-[-0.045em] text-slate-950 mt-2">
              Be there when someone needs you.
            </h1>

            <p className="text-sm sm:text-base text-slate-500 max-w-2xl leading-7 mt-3">
              Find available blood donors or join
              Sahara's donor network and help save
              lives across your community.
            </p>
          </div>

          <div className="flex gap-2">
            <Stat
              value={availableCount}
              label="Available"
            />

            <Stat
              value={emergencyCount}
              label="Emergency"
            />
          </div>
        </div>
      </div>

      {successMessage && (
        <Alert
          type="success"
          message={successMessage}
          onClose={() =>
            setSuccessMessage("")
          }
        />
      )}

      {errorMessage && (
        <Alert
          type="error"
          message={errorMessage}
          onClose={() =>
            setErrorMessage("")
          }
        />
      )}

      <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-100 rounded-2xl w-fit mb-6">
        <TabButton
          active={
            activeTab === "donors"
          }
          onClick={() =>
            setActiveTab("donors")
          }
        >
          Active Donors
        </TabButton>

        <TabButton
          active={
            activeTab === "become"
          }
          onClick={() =>
            setActiveTab("become")
          }
        >
          {myDonor
            ? "My Donor Profile"
            : "Become a Donor"}
        </TabButton>
      </div>

      {activeTab === "donors" && (
        <div>
          <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 mb-5">
            <div className="grid md:grid-cols-[1fr_1fr_auto_auto] gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-2">
                  Blood group
                </label>

                <select
                  value={bloodGroup}
                  onChange={(event) =>
                    setBloodGroup(
                      event.target.value
                    )
                  }
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm outline-none focus:bg-white focus:border-red-400"
                >
                  <option value="">
                    All blood groups
                  </option>

                  {BLOOD_GROUPS.map(
                    (group) => (
                      <option
                        key={group}
                        value={group}
                      >
                        {group}
                      </option>
                    )
                  )}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-2">
                  City
                </label>

                <input
                  value={city}
                  onChange={(event) =>
                    setCity(
                      event.target.value
                    )
                  }
                  placeholder="Search by city"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm outline-none focus:bg-white focus:border-red-400"
                />
              </div>

              <label className="flex items-center gap-2 px-4 py-3 rounded-xl border border-slate-200 cursor-pointer self-end h-[46px]">
                <input
                  type="checkbox"
                  checked={emergencyOnly}
                  onChange={(event) =>
                    setEmergencyOnly(
                      event.target.checked
                    )
                  }
                  className="accent-red-600"
                />

                <span className="text-xs font-semibold text-slate-600 whitespace-nowrap">
                  Emergency
                </span>
              </label>

              <button
                type="button"
                onClick={handleSearch}
                className="self-end h-[46px] px-5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition"
              >
                Search donors
              </button>
            </div>
          </div>

          {loadingDonors ? (
            <LoadingState text="Finding available donors..." />
          ) : donors.length === 0 ? (
            <EmptyDonors
              onBecomeDonor={() =>
                setActiveTab("become")
              }
            />
          ) : (
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
              {donors.map((donor) => (
                <DonorCard
                  key={donor._id}
                  donor={donor}
                  onClick={() =>
                    setSelectedDonor(
                      donor
                    )
                  }
                />
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "become" && (
        <div>
          {!loadingProfile &&
          !myDonor ? (
            <BecomeDonorCard
              loading={becomingDonor}
              onBecome={
                becomeDonor
              }
            />
          ) : loadingProfile ? (
            <LoadingState text="Checking your donor profile..." />
          ) : (
            <DonorDashboard
              donor={myDonor}
              lastDonationDate={
                lastDonationDate
              }
              totalDonations={
                totalDonations
              }
              remarks={remarks}
              savingInfo={savingInfo}
              updatingAvailability={
                updatingAvailability
              }
              updatingEmergency={
                updatingEmergency
              }
              leavingProgram={
                leavingProgram
              }
              setLastDonationDate={
                setLastDonationDate
              }
              setTotalDonations={
                setTotalDonations
              }
              setRemarks={
                setRemarks
              }
              onAvailability={
                updateAvailability
              }
              onEmergency={
                updateEmergency
              }
              onSaveInformation={
                saveInformation
              }
              onLeave={
                leaveProgram
              }
            />
          )}
        </div>
      )}

      {selectedDonor && (
        <DonorModal
          donor={selectedDonor}
          onClose={() =>
            setSelectedDonor(null)
          }
        />
      )}
    </div>
  );
};

const BecomeDonorCard = ({
  loading,
  onBecome,
}) => (
  <div className="grid lg:grid-cols-[1.2fr_0.8fr] gap-6">
    <div className="rounded-3xl bg-[#071f3d] p-7 sm:p-10 text-white overflow-hidden relative">
      <div className="absolute -right-16 -top-16 w-56 h-56 rounded-full bg-red-500/10" />

      <div className="relative">
        <div className="w-14 h-14 rounded-2xl bg-red-500/15 text-red-400 flex items-center justify-center mb-7">
          <BloodIcon size={28} />
        </div>

        <p className="text-xs uppercase tracking-[0.18em] font-bold text-blue-300">
          SAHARA DONOR NETWORK
        </p>

        <h2 className="text-3xl sm:text-4xl font-black tracking-tight mt-3 max-w-xl">
          Your blood could be someone's second chance.
        </h2>

        <p className="text-sm text-slate-300 leading-7 max-w-xl mt-5">
          Join the Sahara donor network. You can
          control when you're available and whether
          you're willing to respond to emergency
          requests.
        </p>

        <button
          type="button"
          onClick={onBecome}
          disabled={loading}
          className="mt-8 px-6 py-3.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-bold transition disabled:opacity-50 flex items-center gap-2"
        >
          {loading ? (
            <>
              <Spinner />
              Registering...
            </>
          ) : (
            <>
              Become a donor
              <span>→</span>
            </>
          )}
        </button>
      </div>
    </div>

    <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7">
      <h3 className="text-lg font-bold text-slate-900">
        How it works
      </h3>

      <div className="mt-6 space-y-5">
        <Step
          number="01"
          title="Join"
          text="Register yourself as a Sahara blood donor."
        />

        <Step
          number="02"
          title="Choose availability"
          text="Decide when you're available to donate."
        />

        <Step
          number="03"
          title="Help"
          text="Other people can find you when they need your blood group."
        />

        <Step
          number="04"
          title="Stay in control"
          text="Turn your availability off whenever you don't want requests."
        />
      </div>
    </div>
  </div>
);

const DonorDashboard = ({
  donor,
  lastDonationDate,
  totalDonations,
  remarks,
  savingInfo,
  updatingAvailability,
  updatingEmergency,
  leavingProgram,
  setLastDonationDate,
  setTotalDonations,
  setRemarks,
  onAvailability,
  onEmergency,
  onSaveInformation,
  onLeave,
}) => {
  const user = donor?.user;

  return (
    <div className="grid lg:grid-cols-[1fr_360px] gap-6">
      <div className="space-y-5">
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7">
          <div className="flex flex-col sm:flex-row sm:items-center gap-5">
            <div className="w-20 h-20 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center text-2xl font-black">
              {user?.bloodGroup ||
                "🩸"}
            </div>

            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-2xl font-black text-slate-900">
                  {user?.fullName ||
                    "Blood Donor"}
                </h2>

                <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-[10px] font-bold">
                  REGISTERED DONOR
                </span>
              </div>

              <p className="text-sm text-slate-500 mt-1">
                {user?.city ||
                  "Location not provided"}
                {" • "}
                {user?.bloodGroup ||
                  "Blood group not provided"}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7">
          <h3 className="text-lg font-bold text-slate-900">
            Donation preferences
          </h3>

          <div className="mt-5 space-y-3">
            <ToggleRow
              title="Available to donate"
              description="Show me as an available donor."
              checked={
                donor.availability
              }
              disabled={
                updatingAvailability
              }
              onChange={
                onAvailability
              }
            />

            <ToggleRow
              title="Emergency donation"
              description="Allow me to be shown for urgent blood needs."
              checked={
                donor.emergencyAvailable
              }
              disabled={
                updatingEmergency
              }
              onChange={
                onEmergency
              }
            />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7">
          <h3 className="text-lg font-bold text-slate-900">
            Donation history
          </h3>

          <p className="text-xs text-slate-400 mt-1">
            Keep this information updated to help
            Sahara provide better donor information.
          </p>

          <div className="grid sm:grid-cols-2 gap-5 mt-6">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-2">
                Last donation date
              </label>

              <input
                type="date"
                value={
                  lastDonationDate
                }
                onChange={(event) =>
                  setLastDonationDate(
                    event.target.value
                  )
                }
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm outline-none focus:bg-white focus:border-red-400"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 mb-2">
                Total donations
              </label>

              <input
                type="number"
                min="0"
                value={
                  totalDonations
                }
                onChange={(event) =>
                  setTotalDonations(
                    event.target.value
                  )
                }
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm outline-none focus:bg-white focus:border-red-400"
              />
            </div>
          </div>

          <div className="mt-5">
            <label className="block text-xs font-bold text-slate-600 mb-2">
              Remarks
            </label>

            <textarea
              value={remarks}
              onChange={(event) =>
                setRemarks(
                  event.target.value
                )
              }
              maxLength="500"
              rows="4"
              placeholder="Optional information about your donor availability..."
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm outline-none resize-none focus:bg-white focus:border-red-400"
            />
          </div>

          <button
            type="button"
            onClick={
              onSaveInformation
            }
            disabled={savingInfo}
            className="mt-5 px-5 py-3 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 disabled:opacity-50"
          >
            {savingInfo
              ? "Saving..."
              : "Save information"}
          </button>
        </div>
      </div>

      <aside className="space-y-5">
        <div className="bg-white border border-slate-200 rounded-3xl p-6">
          <p className="text-xs uppercase tracking-wider font-bold text-slate-400">
            Your donor status
          </p>

          <div className="flex items-center gap-3 mt-5">
            <span
              className={`w-3 h-3 rounded-full ${
                donor.availability
                  ? "bg-emerald-500 animate-pulse"
                  : "bg-slate-400"
              }`}
            />

            <span className="text-lg font-black text-slate-900">
              {donor.availability
                ? "Available"
                : "Unavailable"}
            </span>
          </div>

          <p className="text-xs text-slate-500 leading-5 mt-3">
            {donor.availability
              ? "Your profile can currently appear in active donor searches."
              : "You are temporarily hidden from active donor searches."}
          </p>
        </div>

        <div className="bg-red-50 border border-red-100 rounded-3xl p-6">
          <p className="text-xs uppercase tracking-wider font-bold text-red-500">
            Emergency status
          </p>

          <h3 className="text-lg font-black text-red-900 mt-2">
            {donor.emergencyAvailable
              ? "Emergency enabled"
              : "Emergency disabled"}
          </h3>

          <p className="text-xs text-red-700 leading-5 mt-2">
            {donor.emergencyAvailable
              ? "You may appear when urgent blood support is required."
              : "You won't be prioritized for emergency donor searches."}
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-3xl p-6">
          <h3 className="text-sm font-bold text-slate-900">
            Leave donor program
          </h3>

          <p className="text-xs text-slate-500 leading-5 mt-2">
            Your donor profile will be deactivated
            and you won't appear in active donor
            searches.
          </p>

          <button
            type="button"
            onClick={onLeave}
            disabled={leavingProgram}
            className="mt-5 w-full px-4 py-3 rounded-xl border border-red-200 text-red-600 text-xs font-bold hover:bg-red-50 disabled:opacity-50"
          >
            {leavingProgram
              ? "Leaving..."
              : "Leave donor program"}
          </button>
        </div>
      </aside>
    </div>
  );
};

const DonorCard = ({
  donor,
  onClick,
}) => {
  const user = donor.user;

  return (
    <button
      type="button"
      onClick={onClick}
      className="text-left bg-white border border-slate-200 rounded-3xl p-5 hover:border-red-200 hover:shadow-xl hover:shadow-slate-900/5 transition"
    >
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center font-black">
          {user?.bloodGroup ||
            "🩸"}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-slate-900 truncate">
              {user?.fullName ||
                "Anonymous donor"}
            </h3>

            {user?.isVerified && (
              <span className="text-blue-500 text-xs">
                ✓
              </span>
            )}
          </div>

          <p className="text-xs text-slate-500 mt-1">
            {user?.city ||
              "Location unavailable"}
          </p>
        </div>

        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
      </div>

      <div className="grid grid-cols-2 gap-3 mt-5">
        <MiniInfo
          label="Blood"
          value={
            user?.bloodGroup ||
            "—"
          }
        />

        <MiniInfo
          label="Status"
          value="Available"
        />
      </div>

      {donor.emergencyAvailable && (
        <div className="mt-3 px-3 py-2 rounded-xl bg-red-50 text-red-600 text-[10px] font-bold">
          ⚡ Emergency donation available
        </div>
      )}

      <div className="flex items-center justify-between mt-5 pt-4 border-t border-slate-100">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
          Active donor
        </span>

        <span className="text-xs font-bold text-slate-700">
          View profile →
        </span>
      </div>
    </button>
  );
};

const DonorModal = ({
  donor,
  onClose,
}) => {
  const user = donor.user;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden">
        <div className="bg-[#071f3d] p-7 text-white">
          <div className="flex justify-between items-start">
            <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center text-xl font-black">
              {user?.bloodGroup ||
                "🩸"}
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-xl bg-white/10 text-white flex items-center justify-center hover:bg-white/20"
            >
              ×
            </button>
          </div>

          <h2 className="text-2xl font-black mt-6">
            {user?.fullName ||
              "Blood donor"}
          </h2>

          <p className="text-sm text-slate-300 mt-1">
            {user?.city ||
              "Location unavailable"}
          </p>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-2 gap-3">
            <Detail
              label="Blood group"
              value={
                user?.bloodGroup ||
                "—"
              }
            />

            <Detail
              label="Availability"
              value="Available"
            />

            <Detail
              label="Emergency"
              value={
                donor.emergencyAvailable
                  ? "Available"
                  : "Unavailable"
              }
            />

            <Detail
              label="Donations"
              value={
                donor.totalDonations ||
                0
              }
            />
          </div>

          {donor.remarks && (
            <div className="mt-4 p-4 rounded-xl bg-slate-50">
              <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                Remarks
              </p>

              <p className="text-sm text-slate-600 leading-6 mt-2">
                {donor.remarks}
              </p>
            </div>
          )}

          <div className="mt-5 p-4 rounded-xl bg-blue-50 border border-blue-100">
            <p className="text-xs text-blue-700 leading-5">
              For privacy and safety, donor contact
              details should preferably be handled
              through Sahara's blood request/contact
              workflow rather than exposing personal
              phone numbers publicly.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-full mt-5 px-5 py-3 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

const ToggleRow = ({
  title,
  description,
  checked,
  disabled,
  onChange,
}) => (
  <div className="flex items-center justify-between gap-5 p-4 rounded-2xl bg-slate-50 border border-slate-100">
    <div>
      <p className="text-sm font-bold text-slate-800">
        {title}
      </p>

      <p className="text-xs text-slate-400 mt-1">
        {description}
      </p>
    </div>

    <button
      type="button"
      disabled={disabled}
      onClick={() =>
        onChange(!checked)
      }
      className={`relative w-12 h-7 rounded-full transition shrink-0 ${
        checked
          ? "bg-emerald-500"
          : "bg-slate-300"
      } ${
        disabled
          ? "opacity-50"
          : ""
      }`}
    >
      <span
        className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow transition ${
          checked
            ? "left-6"
            : "left-1"
        }`}
      />
    </button>
  </div>
);

const MiniInfo = ({
  label,
  value,
}) => (
  <div className="p-3 rounded-xl bg-slate-50">
    <p className="text-[9px] uppercase tracking-wider font-bold text-slate-400">
      {label}
    </p>

    <p className="text-xs font-bold text-slate-700 mt-1">
      {value}
    </p>
  </div>
);

const Detail = ({
  label,
  value,
}) => (
  <div className="p-3 rounded-xl bg-slate-50">
    <p className="text-[9px] uppercase tracking-wider font-bold text-slate-400">
      {label}
    </p>

    <p className="text-sm font-bold text-slate-700 mt-1">
      {value}
    </p>
  </div>
);

const Step = ({
  number,
  title,
  text,
}) => (
  <div className="flex gap-4">
    <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-500 flex items-center justify-center text-[10px] font-black shrink-0">
      {number}
    </div>

    <div>
      <p className="text-sm font-bold text-slate-800">
        {title}
      </p>

      <p className="text-xs text-slate-500 leading-5 mt-1">
        {text}
      </p>
    </div>
  </div>
);

const Stat = ({
  value,
  label,
}) => (
  <div className="px-4 py-3 rounded-xl bg-white border border-slate-200">
    <p className="text-xl font-black text-slate-900">
      {value}
    </p>

    <p className="text-[9px] uppercase tracking-wider font-bold text-slate-400">
      {label}
    </p>
  </div>
);

const TabButton = ({
  active,
  onClick,
  children,
}) => (
  <button
    type="button"
    onClick={onClick}
    className={`px-4 py-2.5 rounded-xl text-xs font-bold transition ${
      active
        ? "bg-white text-slate-900 shadow-sm"
        : "text-slate-500 hover:text-slate-700 hover:bg-white/50"
    }`}
  >
    {children}
  </button>
);

const Alert = ({
  type,
  message,
  onClose,
}) => {
  const success =
    type === "success";

  return (
    <div
      className={`mb-5 rounded-xl border p-4 ${
        success
          ? "bg-emerald-50 border-emerald-100 text-emerald-700"
          : "bg-red-50 border-red-100 text-red-700"
      }`}
    >
      <div className="flex items-start gap-3">
        <span className="font-black">
          {success ? "✓" : "!"}
        </span>

        <p className="text-sm flex-1">
          {message}
        </p>

        <button
          type="button"
          onClick={onClose}
          className="opacity-60 hover:opacity-100"
        >
          ×
        </button>
      </div>
    </div>
  );
};

const EmptyDonors = ({
  onBecomeDonor,
}) => (
  <div className="bg-white border border-slate-200 rounded-3xl py-16 px-6 text-center">
    <div className="w-16 h-16 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto">
      <BloodIcon size={28} />
    </div>

    <h3 className="text-xl font-black text-slate-900 mt-5">
      No active donors found
    </h3>

    <p className="text-sm text-slate-500 max-w-md mx-auto leading-6 mt-2">
      Try another blood group or city. You can
      also join the donor network and help someone
      in your community.
    </p>

    <button
      type="button"
      onClick={onBecomeDonor}
      className="mt-6 px-5 py-3 rounded-xl bg-red-600 text-white text-xs font-bold hover:bg-red-700"
    >
      Become a donor
    </button>
  </div>
);

const LoadingState = ({
  text,
}) => (
  <div className="bg-white border border-slate-200 rounded-3xl py-16 flex flex-col items-center">
    <Spinner dark />

    <p className="text-sm font-semibold text-slate-600 mt-4">
      {text}
    </p>
  </div>
);

const Spinner = ({
  dark = false,
}) => (
  <span
    className={`inline-block w-4 h-4 border-2 rounded-full animate-spin ${
      dark
        ? "border-slate-300 border-t-slate-700"
        : "border-white/40 border-t-white"
    }`}
  />
);

const BloodIcon = ({
  size = 20,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M12 3S6 10 6 14a6 6 0 0 0 12 0c0-4-6-11-6-11Z" />
    <path d="M9 15a3 3 0 0 0 3 3" />
  </svg>
);

export default BloodDonor;