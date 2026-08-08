import React, { useEffect, useMemo, useState } from "react";

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:3000/api";

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

const EMPTY_BLOOD = {
  "A+": 0,
  "A-": 0,
  "B+": 0,
  "B-": 0,
  "AB+": 0,
  "AB-": 0,
  "O+": 0,
  "O-": 0,
};

const HospitalProfileUpdate = () => {
  const [hospital, setHospital] = useState(null);

  const [profile, setProfile] = useState({
    name: "",
    description: "",
    phone: "",
    email: "",
    website: "",
    address: "",
    city: "",
    departments: [],
  });

  const [beds, setBeds] = useState({
    total: 0,
    available: 0,
    icu: 0,
    emergency: 0,
  });

  const [bloodInventory, setBloodInventory] =
    useState(EMPTY_BLOOD);

  const [emergencyAvailable, setEmergencyAvailable] =
    useState(false);

  const [ambulanceAvailable, setAmbulanceAvailable] =
    useState(false);

  const [isOpen, setIsOpen] = useState(true);

  const [departmentInput, setDepartmentInput] =
    useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const getToken = () => {
    return (
      localStorage.getItem("token") ||
      localStorage.getItem("accessToken")
    );
  };

  const getHeaders = () => {
    const token = getToken();

    return {
      "Content-Type": "application/json",
      ...(token
        ? {
            Authorization: `Bearer ${token}`,
          }
        : {}),
    };
  };

  useEffect(() => {
    loadHospital();
  }, []);

  const loadHospital = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_BASE_URL}/hospitals/my`,
        {
          method: "GET",
          headers: getHeaders(),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message ||
            "Unable to load hospital information."
        );
      }

      if (!data?.hospital) {
        throw new Error(
          "Hospital information was not found."
        );
      }

      const item = data.hospital;

      setHospital(item);

      setProfile({
        name: item.name || "",
        description: item.description || "",
        phone: item.phone || "",
        email: item.email || "",
        website: item.website || "",
        address: item.address || "",
        city: item.city || "",
        departments: Array.isArray(
          item.departments
        )
          ? item.departments
          : [],
      });

      setBeds({
        total: Number(item.beds?.total || 0),
        available: Number(
          item.beds?.available || 0
        ),
        icu: Number(item.beds?.icu || 0),
        emergency: Number(
          item.beds?.emergency || 0
        ),
      });

      setBloodInventory({
        ...EMPTY_BLOOD,
        ...(item.bloodInventory || {}),
      });

      setEmergencyAvailable(
        Boolean(item.emergencyAvailable)
      );

      setAmbulanceAvailable(
        Boolean(item.ambulanceAvailable)
      );

      setIsOpen(
        item.isOpen !== false
      );
    } catch (err) {
      setError(
        err?.message ||
          "Unable to load hospital information."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleProfileChange = (event) => {
    const { name, value } = event.target;

    setProfile((previous) => ({
      ...previous,
      [name]: value,
    }));

    clearMessages();
  };

  const handleBedChange = (field, value) => {
    if (value === "") {
      setBeds((previous) => ({
        ...previous,
        [field]: "",
      }));

      return;
    }

    const number = Number(value);

    if (
      Number.isNaN(number) ||
      number < 0
    ) {
      return;
    }

    setBeds((previous) => ({
      ...previous,
      [field]: Math.floor(number),
    }));

    clearMessages();
  };

  const handleBloodChange = (
    bloodGroup,
    value
  ) => {
    if (value === "") {
      setBloodInventory((previous) => ({
        ...previous,
        [bloodGroup]: "",
      }));

      return;
    }

    const number = Number(value);

    if (
      Number.isNaN(number) ||
      number < 0
    ) {
      return;
    }

    setBloodInventory((previous) => ({
      ...previous,
      [bloodGroup]: Math.floor(number),
    }));

    clearMessages();
  };

  const addDepartment = () => {
    const value =
      departmentInput.trim();

    if (!value) return;

    const exists =
      profile.departments.some(
        (department) =>
          department.toLowerCase() ===
          value.toLowerCase()
      );

    if (exists) {
      setDepartmentInput("");
      return;
    }

    setProfile((previous) => ({
      ...previous,
      departments: [
        ...previous.departments,
        value,
      ],
    }));

    setDepartmentInput("");
    clearMessages();
  };

  const removeDepartment = (department) => {
    setProfile((previous) => ({
      ...previous,
      departments:
        previous.departments.filter(
          (item) => item !== department
        ),
    }));

    clearMessages();
  };

  const clearMessages = () => {
    setError("");
    setSuccess("");
  };

  const validateBeds = () => {
    const total = Number(beds.total);
    const available = Number(
      beds.available
    );
    const icu = Number(beds.icu);
    const emergency = Number(
      beds.emergency
    );

    if (
      !Number.isInteger(total) ||
      total < 0
    ) {
      return "Total beds must be a valid number.";
    }

    if (
      !Number.isInteger(available) ||
      available < 0
    ) {
      return "Available beds must be a valid number.";
    }

    if (
      !Number.isInteger(icu) ||
      icu < 0
    ) {
      return "ICU beds must be a valid number.";
    }

    if (
      !Number.isInteger(emergency) ||
      emergency < 0
    ) {
      return "Emergency beds must be a valid number.";
    }

    if (available > total) {
      return "Available beds cannot be greater than total beds.";
    }

    if (icu > total) {
      return "ICU beds cannot be greater than total beds.";
    }

    if (emergency > total) {
      return "Emergency beds cannot be greater than total beds.";
    }

    return null;
  };

  const saveProfile = async () => {
    if (!hospital?._id) {
      throw new Error(
        "Hospital ID is not available."
      );
    }

    if (!profile.name.trim()) {
      throw new Error(
        "Hospital name is required."
      );
    }

    if (!profile.phone.trim()) {
      throw new Error(
        "Hospital phone number is required."
      );
    }

    if (!profile.email.trim()) {
      throw new Error(
        "Hospital email is required."
      );
    }

    if (!profile.address.trim()) {
      throw new Error(
        "Hospital address is required."
      );
    }

    if (!profile.city.trim()) {
      throw new Error(
        "Hospital city is required."
      );
    }

    const response = await fetch(
      `${API_BASE_URL}/hospitals/${hospital._id}`,
      {
        method: "PUT",
        headers: getHeaders(),
        body: JSON.stringify({
          name: profile.name.trim(),
          description:
            profile.description.trim(),
          phone: profile.phone.trim(),
          email: profile.email.trim(),
          website: profile.website.trim(),
          address: profile.address.trim(),
          city: profile.city.trim(),
          departments: profile.departments,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data?.message ||
          "Failed to update hospital profile."
      );
    }

    return data;
  };

  const saveBeds = async () => {
    const validation = validateBeds();

    if (validation) {
      throw new Error(validation);
    }

    const response = await fetch(
      `${API_BASE_URL}/hospitals/${hospital._id}/beds`,
      {
        method: "PUT",
        headers: getHeaders(),
        body: JSON.stringify({
          total: Number(beds.total),
          available: Number(
            beds.available
          ),
          icu: Number(beds.icu),
          emergency: Number(
            beds.emergency
          ),
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data?.message ||
          "Failed to update bed information."
      );
    }

    return data;
  };

  const saveBloodInventory = async () => {
    const cleaned = {};

    for (const group of BLOOD_GROUPS) {
      const value = Number(
        bloodInventory[group]
      );

      if (
        !Number.isInteger(value) ||
        value < 0
      ) {
        throw new Error(
          `Invalid blood inventory value for ${group}.`
        );
      }

      cleaned[group] = value;
    }

    const response = await fetch(
      `${API_BASE_URL}/hospitals/${hospital._id}/blood-inventory`,
      {
        method: "PUT",
        headers: getHeaders(),
        body: JSON.stringify(cleaned),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data?.message ||
          "Failed to update blood inventory."
      );
    }

    return data;
  };

  const saveEmergencyStatus = async () => {
    const response = await fetch(
      `${API_BASE_URL}/hospitals/${hospital._id}/emergency`,
      {
        method: "PATCH",
        headers: getHeaders(),
        body: JSON.stringify({
          emergencyAvailable,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data?.message ||
          "Failed to update emergency status."
      );
    }

    return data;
  };

  const saveAmbulanceStatus = async () => {
    const response = await fetch(
      `${API_BASE_URL}/hospitals/${hospital._id}/ambulance`,
      {
        method: "PATCH",
        headers: getHeaders(),
        body: JSON.stringify({
          ambulanceAvailable,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data?.message ||
          "Failed to update ambulance status."
      );
    }

    return data;
  };

  const saveHospitalStatus = async () => {
    const response = await fetch(
      `${API_BASE_URL}/hospitals/${hospital._id}/status`,
      {
        method: "PATCH",
        headers: getHeaders(),
        body: JSON.stringify({
          isOpen,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data?.message ||
          "Failed to update hospital status."
      );
    }

    return data;
  };

  const handleSaveEverything = async () => {
    try {
      setSaving(true);
      setError("");
      setSuccess("");

      if (!hospital?._id) {
        throw new Error(
          "Hospital ID is not available."
        );
      }

      await saveProfile();
      await saveBeds();
      await saveBloodInventory();
      await saveEmergencyStatus();
      await saveAmbulanceStatus();
      await saveHospitalStatus();

      setSuccess(
        "Hospital information and operational status updated successfully."
      );

      await loadHospital();
    } catch (err) {
      setError(
        err?.message ||
          "Unable to save hospital information."
      );
    } finally {
      setSaving(false);
    }
  };

  const totalBloodUnits = useMemo(() => {
    return BLOOD_GROUPS.reduce(
      (total, group) =>
        total +
        Number(
          bloodInventory[group] || 0
        ),
      0
    );
  }, [bloodInventory]);

  if (loading) {
    return (
      <div className="min-h-[500px] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-blue-600 text-white flex items-center justify-center font-black animate-pulse">
            S
          </div>

          <p className="mt-4 text-sm font-semibold text-slate-700">
            Loading hospital management...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto">

      <div className="mb-7">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600">
          Hospital Management
        </p>

        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 mt-2">
          <div>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-950 tracking-tight">
              Hospital Operations
            </h1>

            <p className="mt-2 text-sm sm:text-base text-slate-500 max-w-3xl">
              Manage your hospital information,
              bed availability, blood inventory and
              emergency services from one place.
            </p>
          </div>

          <div
            className={`inline-flex items-center gap-3 px-4 py-3 rounded-2xl border ${
              isOpen
                ? "bg-emerald-50 border-emerald-200"
                : "bg-red-50 border-red-200"
            }`}
          >
            <span
              className={`w-3 h-3 rounded-full ${
                isOpen
                  ? "bg-emerald-500"
                  : "bg-red-500"
              }`}
            />

            <div>
              <p
                className={`text-xs font-bold ${
                  isOpen
                    ? "text-emerald-800"
                    : "text-red-800"
                }`}
              >
                Hospital is{" "}
                {isOpen
                  ? "Open"
                  : "Closed"}
              </p>

              <p className="text-[10px] text-slate-500 mt-0.5">
                Public availability status
              </p>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-5">
          <div className="flex gap-3">
            <div className="w-9 h-9 rounded-xl bg-red-100 text-red-600 flex items-center justify-center font-bold shrink-0">
              !
            </div>

            <div>
              <p className="text-sm font-bold text-red-800">
                Update failed
              </p>

              <p className="text-xs text-red-600 mt-1">
                {error}
              </p>
            </div>
          </div>
        </div>
      )}

      {success && (
        <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
          <div className="flex gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold shrink-0">
              ✓
            </div>

            <div>
              <p className="text-sm font-bold text-emerald-800">
                Changes saved
              </p>

              <p className="text-xs text-emerald-600 mt-1">
                {success}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-6">

        {/* Hospital Status */}

        <section className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
          <SectionHeader
            icon="🏥"
            title="Hospital Availability"
            description="Control how your hospital appears to patients and emergency services."
          />

          <div className="p-6 grid md:grid-cols-3 gap-4">

            <StatusCard
              title="Hospital Status"
              description={
                isOpen
                  ? "Hospital is currently open."
                  : "Hospital is currently closed."
              }
              enabled={isOpen}
              onClick={() => {
                setIsOpen(!isOpen);
                clearMessages();
              }}
              enabledText="Open"
              disabledText="Closed"
            />

            <StatusCard
              title="Emergency Services"
              description={
                emergencyAvailable
                  ? "Emergency services available."
                  : "Emergency services unavailable."
              }
              enabled={emergencyAvailable}
              onClick={() => {
                setEmergencyAvailable(
                  !emergencyAvailable
                );
                clearMessages();
              }}
              enabledText="Available"
              disabledText="Unavailable"
            />

            <StatusCard
              title="Ambulance"
              description={
                ambulanceAvailable
                  ? "Ambulance service available."
                  : "No ambulance currently available."
              }
              enabled={ambulanceAvailable}
              onClick={() => {
                setAmbulanceAvailable(
                  !ambulanceAvailable
                );
                clearMessages();
              }}
              enabledText="Available"
              disabledText="Unavailable"
            />

          </div>
        </section>

        {/* Beds */}

        <section className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
          <SectionHeader
            icon="🛏️"
            title="Bed Availability"
            description="Update the current capacity of your hospital."
          />

          <div className="p-6">

            <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">

              <NumberCard
                label="Total Beds"
                value={beds.total}
                onChange={(value) =>
                  handleBedChange(
                    "total",
                    value
                  )
                }
                icon="🏥"
              />

              <NumberCard
                label="Available Beds"
                value={beds.available}
                onChange={(value) =>
                  handleBedChange(
                    "available",
                    value
                  )
                }
                icon="🛏️"
                highlight
              />

              <NumberCard
                label="ICU Beds"
                value={beds.icu}
                onChange={(value) =>
                  handleBedChange(
                    "icu",
                    value
                  )
                }
                icon="❤️"
              />

              <NumberCard
                label="Emergency Beds"
                value={beds.emergency}
                onChange={(value) =>
                  handleBedChange(
                    "emergency",
                    value
                  )
                }
                icon="🚨"
              />

            </div>

            <div className="mt-5 rounded-2xl bg-blue-50 border border-blue-100 p-4">
              <p className="text-xs text-blue-700">
                Available beds:
                <strong className="ml-1">
                  {beds.available || 0}
                </strong>
                {" "}of{" "}
                <strong>
                  {beds.total || 0}
                </strong>
              </p>

              <div className="h-2 bg-blue-100 rounded-full mt-3 overflow-hidden">
                <div
                  className="h-full bg-blue-600 rounded-full transition-all"
                  style={{
                    width:
                      Number(beds.total) > 0
                        ? `${Math.min(
                            (Number(
                              beds.available
                            ) /
                              Number(
                                beds.total
                              )) *
                              100,
                            100
                          )}%`
                        : "0%",
                  }}
                />
              </div>
            </div>

          </div>
        </section>

        {/* Blood */}

        <section className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
          <SectionHeader
            icon="🩸"
            title="Blood Inventory"
            description="Maintain accurate blood stock for emergency searches and requests."
            right={
              <span className="text-xs font-bold text-red-600 bg-red-50 px-3 py-1.5 rounded-full">
                {totalBloodUnits} total units
              </span>
            }
          />

          <div className="p-6">

            <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">

              {BLOOD_GROUPS.map(
                (group) => (
                  <div
                    key={group}
                    className="rounded-2xl border border-slate-200 p-4 hover:border-red-200 transition"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center font-black">
                        {group}
                      </div>

                      <span className="text-[10px] font-semibold text-slate-400">
                        Units
                      </span>
                    </div>

                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={
                        bloodInventory[
                          group
                        ]
                      }
                      onChange={(event) =>
                        handleBloodChange(
                          group,
                          event.target.value
                        )
                      }
                      className="w-full rounded-xl border border-slate-200 px-4 py-3 text-lg font-bold outline-none focus:border-red-500 focus:ring-4 focus:ring-red-500/10"
                    />
                  </div>
                )
              )}

            </div>

          </div>
        </section>

        {/* Basic Profile */}

        <section className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
          <SectionHeader
            icon="📋"
            title="Hospital Information"
            description="Update the information shown on your hospital profile."
          />

          <div className="p-6 space-y-5">

            <div className="grid md:grid-cols-2 gap-5">

              <InputField
                label="Hospital Name"
                name="name"
                value={profile.name}
                onChange={handleProfileChange}
                required
              />

              <InputField
                label="Phone"
                name="phone"
                value={profile.phone}
                onChange={handleProfileChange}
                required
              />

              <InputField
                label="Email"
                name="email"
                value={profile.email}
                onChange={handleProfileChange}
                required
              />

              <InputField
                label="Website"
                name="website"
                value={profile.website}
                onChange={handleProfileChange}
              />

              <InputField
                label="City"
                name="city"
                value={profile.city}
                onChange={handleProfileChange}
                required
              />

              <InputField
                label="Address"
                name="address"
                value={profile.address}
                onChange={handleProfileChange}
                required
              />

            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Description
              </label>

              <textarea
                name="description"
                value={profile.description}
                onChange={handleProfileChange}
                rows={4}
                maxLength={1000}
                placeholder="Describe your hospital..."
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none resize-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Departments
              </label>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={departmentInput}
                  onChange={(event) =>
                    setDepartmentInput(
                      event.target.value
                    )
                  }
                  onKeyDown={(event) => {
                    if (
                      event.key === "Enter"
                    ) {
                      event.preventDefault();
                      addDepartment();
                    }
                  }}
                  placeholder="e.g. Cardiology"
                  className="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                />

                <button
                  type="button"
                  onClick={addDepartment}
                  className="px-5 rounded-xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-700"
                >
                  Add
                </button>
              </div>

              <div className="flex flex-wrap gap-2 mt-3">
                {profile.departments.map(
                  (department) => (
                    <span
                      key={department}
                      className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 text-blue-700 px-3 py-2 rounded-xl text-xs font-semibold"
                    >
                      {department}

                      <button
                        type="button"
                        onClick={() =>
                          removeDepartment(
                            department
                          )
                        }
                        className="text-blue-500 hover:text-red-500"
                      >
                        ×
                      </button>
                    </span>
                  )
                )}
              </div>
            </div>

          </div>
        </section>

        {/* Save */}

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">

          <div>
            <p className="text-sm font-bold text-slate-800">
              Save hospital changes
            </p>

            <p className="text-xs text-slate-400 mt-1">
              All operational information will be
              updated across Sahara.
            </p>
          </div>

          <button
            type="button"
            onClick={handleSaveEverything}
            disabled={saving}
            className="inline-flex items-center justify-center gap-2 px-7 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white text-sm font-bold shadow-lg shadow-blue-600/20 transition"
          >
            {saving ? (
              <>
                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                Saving changes...
              </>
            ) : (
              <>
                ✓ Save All Changes
              </>
            )}
          </button>

        </div>

      </div>
    </div>
  );
};

const SectionHeader = ({
  icon,
  title,
  description,
  right,
}) => {
  return (
    <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
          {icon}
        </div>

        <div>
          <h2 className="font-bold text-slate-900">
            {title}
          </h2>

          <p className="text-xs text-slate-400 mt-1">
            {description}
          </p>
        </div>
      </div>

      {right}
    </div>
  );
};

const NumberCard = ({
  label,
  value,
  onChange,
  icon,
  highlight = false,
}) => {
  return (
    <div
      className={`rounded-2xl border p-5 ${
        highlight
          ? "border-emerald-200 bg-emerald-50/40"
          : "border-slate-200 bg-slate-50/40"
      }`}
    >
      <div className="flex items-center justify-between mb-4">
        <span className="text-lg">
          {icon}
        </span>

        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
          Beds
        </span>
      </div>

      <p className="text-sm font-semibold text-slate-700 mb-2">
        {label}
      </p>

      <input
        type="number"
        min="0"
        step="1"
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-xl font-black text-slate-900 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
      />
    </div>
  );
};

const InputField = ({
  label,
  name,
  value,
  onChange,
  required,
}) => {
  return (
    <div>
      <label className="block text-sm font-semibold text-slate-700 mb-2">
        {label}

        {required && (
          <span className="text-red-500 ml-1">
            *
          </span>
        )}
      </label>

      <input
        type="text"
        name={name}
        value={value}
        onChange={onChange}
        className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
      />
    </div>
  );
};

const StatusCard = ({
  title,
  description,
  enabled,
  onClick,
  enabledText,
  disabledText,
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`text-left rounded-2xl border p-5 transition ${
        enabled
          ? "border-emerald-200 bg-emerald-50/50"
          : "border-slate-200 bg-slate-50"
      }`}
    >
      <div className="flex items-center justify-between">
        <div
          className={`w-11 h-11 rounded-xl flex items-center justify-center ${
            enabled
              ? "bg-emerald-100"
              : "bg-slate-200"
          }`}
        >
          <span
            className={`w-3 h-3 rounded-full ${
              enabled
                ? "bg-emerald-500"
                : "bg-slate-400"
            }`}
          />
        </div>

        <div
          className={`w-11 h-6 rounded-full p-1 transition ${
            enabled
              ? "bg-emerald-500"
              : "bg-slate-300"
          }`}
        >
          <div
            className={`w-4 h-4 rounded-full bg-white transition ${
              enabled
                ? "translate-x-5"
                : "translate-x-0"
            }`}
          />
        </div>
      </div>

      <p className="font-bold text-slate-900 mt-5">
        {title}
      </p>

      <p className="text-xs text-slate-500 mt-1 leading-5">
        {description}
      </p>

      <p
        className={`text-xs font-bold mt-4 ${
          enabled
            ? "text-emerald-600"
            : "text-slate-500"
        }`}
      >
        {enabled
          ? enabledText
          : disabledText}
      </p>
    </button>
  );
};

export default HospitalProfileUpdate;