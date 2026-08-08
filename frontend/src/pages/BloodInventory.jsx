import React, { useEffect, useMemo, useState } from "react";

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:3000/api";

const BLOOD_GROUPS = [
  { key: "A+", label: "A+" },
  { key: "A-", label: "A-" },
  { key: "B+", label: "B+" },
  { key: "B-", label: "B-" },
  { key: "AB+", label: "AB+" },
  { key: "AB-", label: "AB-" },
  { key: "O+", label: "O+" },
  { key: "O-", label: "O-" },
];

const EMPTY_INVENTORY = {
  "A+": 0,
  "A-": 0,
  "B+": 0,
  "B-": 0,
  "AB+": 0,
  "AB-": 0,
  "O+": 0,
  "O-": 0,
};

const BloodInventory = () => {
  const [hospital, setHospital] = useState(null);
  const [inventory, setInventory] =
    useState(EMPTY_INVENTORY);

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
            "Failed to load hospital information."
        );
      }

      if (!data?.hospital) {
        throw new Error(
          "Hospital information was not found."
        );
      }

      setHospital(data.hospital);

      setInventory({
        ...EMPTY_INVENTORY,
        ...(data.hospital.bloodInventory || {}),
      });
    } catch (err) {
      setError(
        err?.message ||
          "Unable to load blood inventory."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHospital();
  }, []);

  const handleChange = (bloodGroup, value) => {
    setError("");
    setSuccess("");

    if (value === "") {
      setInventory((previous) => ({
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

    setInventory((previous) => ({
      ...previous,
      [bloodGroup]: Math.floor(number),
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError("");
      setSuccess("");

      if (!hospital?._id) {
        throw new Error(
          "Hospital ID is not available."
        );
      }

      const cleanedInventory = {};

      for (const group of BLOOD_GROUPS) {
        const value = Number(
          inventory[group.key]
        );

        if (
          !Number.isInteger(value) ||
          value < 0
        ) {
          throw new Error(
            `Invalid value for ${group.label}.`
          );
        }

        cleanedInventory[group.key] = value;
      }

      const response = await fetch(
        `${API_BASE_URL}/hospitals/${hospital._id}/blood-inventory`,
        {
          method: "PUT",
          headers: getHeaders(),
          body: JSON.stringify(
            cleanedInventory
          ),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message ||
            "Failed to update blood inventory."
        );
      }

      if (!data?.success) {
        throw new Error(
          data?.message ||
            "Blood inventory update failed."
        );
      }

      setInventory({
        ...EMPTY_INVENTORY,
        ...(data.bloodInventory || {}),
      });

      setSuccess(
        "Blood inventory updated successfully."
      );
    } catch (err) {
      setError(
        err?.message ||
          "Unable to update blood inventory."
      );
    } finally {
      setSaving(false);
    }
  };

  const totalUnits = useMemo(() => {
    return BLOOD_GROUPS.reduce(
      (total, group) =>
        total +
        Number(inventory[group.key] || 0),
      0
    );
  }, [inventory]);

  const availableGroups = useMemo(() => {
    return BLOOD_GROUPS.filter(
      (group) =>
        Number(inventory[group.key] || 0) > 0
    ).length;
  }, [inventory]);

  const lowStockGroups = useMemo(() => {
    return BLOOD_GROUPS.filter((group) => {
      const value = Number(
        inventory[group.key] || 0
      );

      return value > 0 && value <= 5;
    }).length;
  }, [inventory]);

  if (loading) {
    return (
      <div className="min-h-[500px] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-black text-xl animate-pulse">
            S
          </div>

          <p className="mt-4 text-sm font-semibold text-slate-700">
            Loading blood inventory...
          </p>

          <p className="mt-1 text-xs text-slate-400">
            Fetching hospital data
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto">

      <div className="mb-7">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-600">
          Blood Management
        </p>

        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 mt-2">
          <div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-950">
              Blood Inventory
            </h1>

            <p className="mt-2 text-sm sm:text-base text-slate-500 max-w-2xl">
              Manage your hospital's available
              blood stock and keep emergency
              information up to date.
            </p>
          </div>

          {hospital && (
            <div className="flex items-center gap-3 bg-white border border-slate-200 rounded-2xl px-4 py-3 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center text-lg">
                🏥
              </div>

              <div>
                <p className="text-sm font-bold text-slate-900">
                  {hospital.name}
                </p>

                <p className="text-xs text-slate-500">
                  {hospital.city}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-5 py-4">
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-lg bg-red-100 text-red-600 flex items-center justify-center font-bold">
              !
            </div>

            <div>
              <p className="text-sm font-bold text-red-800">
                Something went wrong
              </p>

              <p className="text-xs text-red-600 mt-1">
                {error}
              </p>
            </div>
          </div>
        </div>
      )}

      {success && (
        <div className="mb-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4">
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              ✓
            </div>

            <div>
              <p className="text-sm font-bold text-emerald-800">
                Inventory updated
              </p>

              <p className="text-xs text-emerald-600 mt-1">
                {success}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid sm:grid-cols-3 gap-4 mb-6">

        <SummaryCard
          icon="🩸"
          label="Total Units"
          value={totalUnits}
          description="Available blood units"
          className="emerald"
        />

        <SummaryCard
          icon="✓"
          label="Available Groups"
          value={`${availableGroups}/8`}
          description="Groups currently in stock"
          className="blue"
        />

        <SummaryCard
          icon="⚠"
          label="Low Stock"
          value={lowStockGroups}
          description="5 units or fewer"
          className="amber"
        />

      </div>

      <section className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">

        <div className="px-5 sm:px-7 py-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">

          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Current Blood Stock
            </h2>

            <p className="text-xs text-slate-400 mt-1">
              Enter the currently available units.
            </p>
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-50 text-xs font-semibold text-slate-500">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            Hospital inventory
          </div>

        </div>

        <div className="p-5 sm:p-7">

          <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">

            {BLOOD_GROUPS.map((group) => {
              const quantity = Number(
                inventory[group.key] || 0
              );

              const empty = quantity === 0;

              const low =
                quantity > 0 &&
                quantity <= 5;

              return (
                <div
                  key={group.key}
                  className={`rounded-2xl border p-5 transition ${
                    empty
                      ? "bg-slate-50 border-slate-200"
                      : low
                      ? "bg-amber-50/50 border-amber-200"
                      : "bg-emerald-50/30 border-emerald-100"
                  }`}
                >

                  <div className="flex items-start justify-between">

                    <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center font-black text-lg">
                      {group.label}
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                        empty
                          ? "bg-slate-200 text-slate-500"
                          : low
                          ? "bg-amber-100 text-amber-700"
                          : "bg-emerald-100 text-emerald-700"
                      }`}
                    >
                      {empty
                        ? "Empty"
                        : low
                        ? "Low stock"
                        : "Available"}
                    </span>

                  </div>

                  <div className="mt-5">

                    <label
                      htmlFor={`blood-${group.key}`}
                      className="block text-xs font-semibold text-slate-500 mb-2"
                    >
                      Available units
                    </label>

                    <div className="relative">

                      <input
                        id={`blood-${group.key}`}
                        type="number"
                        min="0"
                        step="1"
                        value={
                          inventory[group.key]
                        }
                        onChange={(e) =>
                          handleChange(
                            group.key,
                            e.target.value
                          )
                        }
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 pr-16 text-xl font-bold text-slate-900 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                      />

                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">
                        units
                      </span>

                    </div>

                  </div>

                </div>
              );
            })}

          </div>

        </div>

        <div className="px-5 sm:px-7 py-5 border-t border-slate-100 bg-slate-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-4">

          <div>
            <p className="text-sm font-semibold text-slate-700">
              Keep your blood stock updated
            </p>

            <p className="text-xs text-slate-400 mt-1">
              Accurate inventory helps Sahara provide
              better emergency information.
            </p>
          </div>

          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300 text-white text-sm font-bold shadow-lg shadow-emerald-600/20 transition"
          >
            {saving ? (
              <>
                <span className="w-4 h-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <span>✓</span>
                Save Inventory
              </>
            )}
          </button>

        </div>

      </section>

    </div>
  );
};

const SummaryCard = ({
  icon,
  label,
  value,
  description,
  className,
}) => {

  const styles = {
    emerald:
      "bg-emerald-50 text-emerald-700",

    blue:
      "bg-blue-50 text-blue-700",

    amber:
      "bg-amber-50 text-amber-700",
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">

      <div
        className={`w-11 h-11 rounded-xl flex items-center justify-center ${
          styles[className]
        }`}
      >
        {icon}
      </div>

      <p className="text-2xl font-black text-slate-950 mt-5">
        {value}
      </p>

      <p className="text-sm font-semibold text-slate-700 mt-1">
        {label}
      </p>

      <p className="text-xs text-slate-400 mt-1">
        {description}
      </p>

    </div>
  );
};

export default BloodInventory;