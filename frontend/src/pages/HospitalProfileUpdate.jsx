import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Ambulance,
  BedDouble,
  Building2,
  CheckCircle2,
  Cross,
  Droplets,
  HeartPulse,
  Hospital,
  LocateFixed,
  LoaderCircle,
  MapPin,
  Plus,
  Save,
  ShieldCheck,
  Trash2,
  X,
} from "lucide-react";

import {
  MapContainer,
  Marker,
  TileLayer,
  useMap,
  useMapEvents,
} from "react-leaflet";

import L from "leaflet";

import "leaflet/dist/leaflet.css";

/* =========================================================
   API
========================================================= */

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:3000/api";

/* =========================================================
   MAP DEFAULT
========================================================= */

const DEFAULT_CENTER = [
  27.7172,
  85.324,
];

/* =========================================================
   BLOOD
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

/* =========================================================
   MAP MARKER
========================================================= */

const hospitalMarkerIcon =
  L.divIcon({
    className: "",

    html: `
      <div
        style="
          width:42px;
          height:42px;
          border-radius:14px;
          background:#1717E8;
          border:4px solid white;
          box-shadow:0 8px 24px rgba(23,23,232,.30);
          display:flex;
          align-items:center;
          justify-content:center;
          color:white;
          font-size:21px;
          font-weight:900;
        "
      >
        +
      </div>
    `,

    iconSize: [42, 42],

    iconAnchor: [
      21,
      42,
    ],
  });

/* =========================================================
   TOKEN
========================================================= */

const getToken = () =>
  localStorage.getItem(
    "token",
  ) ||
  sessionStorage.getItem(
    "token",
  ) ||
  localStorage.getItem(
    "accessToken",
  ) ||
  sessionStorage.getItem(
    "accessToken",
  );

/* =========================================================
   MAP CLICK
========================================================= */

const LocationPicker = ({
  onSelect,
}) => {
  useMapEvents({
    click(event) {
      onSelect({
        latitude:
          event.latlng.lat,

        longitude:
          event.latlng.lng,
      });
    },
  });

  return null;
};

/* =========================================================
   MAP RECENTER
========================================================= */

const RecenterMap = ({
  latitude,
  longitude,
}) => {
  const map = useMap();

  useEffect(() => {
    if (
      Number.isFinite(
        latitude,
      ) &&
      Number.isFinite(
        longitude,
      )
    ) {
      map.setView(
        [
          latitude,
          longitude,
        ],
        15,
      );
    }
  }, [
    latitude,
    longitude,
    map,
  ]);

  return null;
};

/* =========================================================
   MAIN PAGE
========================================================= */

const HospitalProfileUpdate =
  () => {
    const [
      hospital,
      setHospital,
    ] = useState(null);

    const [
      profile,
      setProfile,
    ] = useState({
      name: "",
      description: "",
      phone: "",
      email: "",
      website: "",
      address: "",
      city: "",
      departments: [],
      latitude: null,
      longitude: null,
    });

    const [
      beds,
      setBeds,
    ] = useState({
      total: 0,
      available: 0,
      icu: 0,
      emergency: 0,
    });

    const [
      bloodInventory,
      setBloodInventory,
    ] =
      useState(
        EMPTY_BLOOD,
      );

    const [
      emergencyAvailable,
      setEmergencyAvailable,
    ] =
      useState(false);

    const [
      ambulanceAvailable,
      setAmbulanceAvailable,
    ] =
      useState(false);

    const [
      isOpen,
      setIsOpen,
    ] =
      useState(true);

    const [
      departmentInput,
      setDepartmentInput,
    ] =
      useState("");

    const [
      loading,
      setLoading,
    ] =
      useState(true);

    const [
      saving,
      setSaving,
    ] =
      useState(false);

    const [
      locating,
      setLocating,
    ] =
      useState(false);

    const [
      error,
      setError,
    ] =
      useState("");

    const [
      success,
      setSuccess,
    ] =
      useState("");

    /* =====================================================
       HEADERS
    ===================================================== */

    const getHeaders =
      () => {
        const token =
          getToken();

        return {
          "Content-Type":
            "application/json",

          ...(token
            ? {
                Authorization:
                  `Bearer ${token}`,
              }
            : {}),
        };
      };

    /* =====================================================
       CLEAR MESSAGES
    ===================================================== */

    const clearMessages =
      () => {
        setError("");
        setSuccess("");
      };

    /* =====================================================
       LOAD HOSPITAL
    ===================================================== */

    const loadHospital =
      async () => {
        try {
          setLoading(
            true,
          );

          setError("");

          const response =
            await fetch(
              `${API_BASE_URL}/hospitals/my`,
              {
                method:
                  "GET",

                headers:
                  getHeaders(),
              },
            );

          const data =
            await response.json();

          if (
            !response.ok
          ) {
            throw new Error(
              data?.message ||
                "Unable to load hospital information.",
            );
          }

          if (
            !data?.hospital
          ) {
            throw new Error(
              "Hospital information was not found.",
            );
          }

          const item =
            data.hospital;

          setHospital(
            item,
          );

          setProfile({
            name:
              item.name ||
              "",

            description:
              item.description ||
              "",

            phone:
              item.phone ||
              "",

            email:
              item.email ||
              "",

            website:
              item.website ||
              "",

            address:
              item.address ||
              "",

            city:
              item.city ||
              "",

            departments:
              Array.isArray(
                item.departments,
              )
                ? item.departments
                : [],

            latitude:
              item.latitude !==
                undefined &&
              item.latitude !==
                null
                ? Number(
                    item.latitude,
                  )
                : null,

            longitude:
              item.longitude !==
                undefined &&
              item.longitude !==
                null
                ? Number(
                    item.longitude,
                  )
                : null,
          });

          setBeds({
            total:
              Number(
                item.beds
                  ?.total ||
                  0,
              ),

            available:
              Number(
                item.beds
                  ?.available ||
                  0,
              ),

            icu:
              Number(
                item.beds
                  ?.icu ||
                  0,
              ),

            emergency:
              Number(
                item.beds
                  ?.emergency ||
                  0,
              ),
          });

          setBloodInventory(
            {
              ...EMPTY_BLOOD,

              ...(item.bloodInventory ||
                {}),
            },
          );

          setEmergencyAvailable(
            Boolean(
              item.emergencyAvailable,
            ),
          );

          setAmbulanceAvailable(
            Boolean(
              item.ambulanceAvailable,
            ),
          );

          setIsOpen(
            item.isOpen !==
              false,
          );
        } catch (err) {
          setError(
            err?.message ||
              "Unable to load hospital information.",
          );
        } finally {
          setLoading(
            false,
          );
        }
      };

    useEffect(() => {
      loadHospital();
    }, []);

    /* =====================================================
       PROFILE INPUT
    ===================================================== */

    const handleProfileChange =
      (event) => {
        const {
          name,
          value,
        } = event.target;

        setProfile(
          (previous) => ({
            ...previous,

            [name]:
              value,
          }),
        );

        clearMessages();
      };

    /* =====================================================
       BED INPUT
    ===================================================== */

    const handleBedChange =
      (
        field,
        value,
      ) => {
        if (
          value === ""
        ) {
          setBeds(
            (
              previous,
            ) => ({
              ...previous,

              [field]:
                "",
            }),
          );

          return;
        }

        const number =
          Number(value);

        if (
          Number.isNaN(
            number,
          ) ||
          number < 0
        ) {
          return;
        }

        setBeds(
          (
            previous,
          ) => ({
            ...previous,

            [field]:
              Math.floor(
                number,
              ),
          }),
        );

        clearMessages();
      };

    /* =====================================================
       BLOOD INPUT
    ===================================================== */

    const handleBloodChange =
      (
        bloodGroup,
        value,
      ) => {
        if (
          value === ""
        ) {
          setBloodInventory(
            (
              previous,
            ) => ({
              ...previous,

              [bloodGroup]:
                "",
            }),
          );

          return;
        }

        const number =
          Number(value);

        if (
          Number.isNaN(
            number,
          ) ||
          number < 0
        ) {
          return;
        }

        setBloodInventory(
          (
            previous,
          ) => ({
            ...previous,

            [bloodGroup]:
              Math.floor(
                number,
              ),
          }),
        );

        clearMessages();
      };

    /* =====================================================
       DEPARTMENT
    ===================================================== */

    const addDepartment =
      () => {
        const value =
          departmentInput.trim();

        if (!value) {
          return;
        }

        const exists =
          profile.departments.some(
            (
              department,
            ) =>
              department.toLowerCase() ===
              value.toLowerCase(),
          );

        if (exists) {
          setDepartmentInput(
            "",
          );

          return;
        }

        setProfile(
          (
            previous,
          ) => ({
            ...previous,

            departments: [
              ...previous.departments,

              value,
            ],
          }),
        );

        setDepartmentInput(
          "",
        );

        clearMessages();
      };

    const removeDepartment =
      (
        department,
      ) => {
        setProfile(
          (
            previous,
          ) => ({
            ...previous,

            departments:
              previous.departments.filter(
                (
                  item,
                ) =>
                  item !==
                  department,
              ),
          }),
        );

        clearMessages();
      };

    /* =====================================================
       LOCATION
    ===================================================== */

    const setLocation =
      ({
        latitude,
        longitude,
      }) => {
        setProfile(
          (
            previous,
          ) => ({
            ...previous,

            latitude:
              Number(
                latitude.toFixed(
                  6,
                ),
              ),

            longitude:
              Number(
                longitude.toFixed(
                  6,
                ),
              ),
          }),
        );

        clearMessages();
      };

    const useCurrentLocation =
      () => {
        if (
          !navigator.geolocation
        ) {
          setError(
            "Location access is not supported by this browser.",
          );

          return;
        }

        setLocating(
          true,
        );

        setError("");

        navigator.geolocation.getCurrentPosition(
          (
            position,
          ) => {
            setLocation({
              latitude:
                position
                  .coords
                  .latitude,

              longitude:
                position
                  .coords
                  .longitude,
            });

            setLocating(
              false,
            );
          },

          (geoError) => {
            setLocating(
              false,
            );

            if (
              geoError.code ===
              1
            ) {
              setError(
                "Location permission was denied. You can still click directly on the map.",
              );

              return;
            }

            setError(
              "Unable to detect your current location. Select the hospital manually on the map.",
            );
          },

          {
            enableHighAccuracy:
              true,

            timeout:
              10000,

            maximumAge:
              60000,
          },
        );
      };

    const removeLocation =
      () => {
        setProfile(
          (
            previous,
          ) => ({
            ...previous,

            latitude:
              null,

            longitude:
              null,
          }),
        );

        clearMessages();
      };

    /* =====================================================
       BED VALIDATION
    ===================================================== */

    const validateBeds =
      () => {
        const total =
          Number(
            beds.total,
          );

        const available =
          Number(
            beds.available,
          );

        const icu =
          Number(
            beds.icu,
          );

        const emergency =
          Number(
            beds.emergency,
          );

        if (
          !Number.isInteger(
            total,
          ) ||
          total < 0
        ) {
          return "Total beds must be a valid number.";
        }

        if (
          !Number.isInteger(
            available,
          ) ||
          available < 0
        ) {
          return "Available beds must be a valid number.";
        }

        if (
          !Number.isInteger(
            icu,
          ) ||
          icu < 0
        ) {
          return "ICU beds must be a valid number.";
        }

        if (
          !Number.isInteger(
            emergency,
          ) ||
          emergency < 0
        ) {
          return "Emergency beds must be a valid number.";
        }

        if (
          available >
          total
        ) {
          return "Available beds cannot be greater than total beds.";
        }

        if (
          icu > total
        ) {
          return "ICU beds cannot be greater than total beds.";
        }

        if (
          emergency >
          total
        ) {
          return "Emergency beds cannot be greater than total beds.";
        }

        return null;
      };

    /* =====================================================
       SAVE PROFILE
    ===================================================== */

    const saveProfile =
      async () => {
        if (
          !hospital?._id
        ) {
          throw new Error(
            "Hospital ID is not available.",
          );
        }

        if (
          !profile.name.trim()
        ) {
          throw new Error(
            "Hospital name is required.",
          );
        }

        if (
          !profile.phone.trim()
        ) {
          throw new Error(
            "Hospital phone number is required.",
          );
        }

        if (
          !profile.email.trim()
        ) {
          throw new Error(
            "Hospital email is required.",
          );
        }

        if (
          !profile.address.trim()
        ) {
          throw new Error(
            "Hospital address is required.",
          );
        }

        if (
          !profile.city.trim()
        ) {
          throw new Error(
            "Hospital city is required.",
          );
        }

        const response =
          await fetch(
            `${API_BASE_URL}/hospitals/${hospital._id}`,
            {
              method:
                "PUT",

              headers:
                getHeaders(),

              body:
                JSON.stringify(
                  {
                    name:
                      profile.name.trim(),

                    description:
                      profile.description.trim(),

                    phone:
                      profile.phone.trim(),

                    email:
                      profile.email.trim(),

                    website:
                      profile.website.trim(),

                    address:
                      profile.address.trim(),

                    city:
                      profile.city.trim(),

                    departments:
                      profile.departments,

                    latitude:
                      profile.latitude,

                    longitude:
                      profile.longitude,
                  },
                ),
            },
          );

        const data =
          await response.json();

        if (
          !response.ok
        ) {
          throw new Error(
            data?.message ||
              "Failed to update hospital profile.",
          );
        }

        return data;
      };

    /* =====================================================
       SAVE BEDS
    ===================================================== */

    const saveBeds =
      async () => {
        const validation =
          validateBeds();

        if (
          validation
        ) {
          throw new Error(
            validation,
          );
        }

        const response =
          await fetch(
            `${API_BASE_URL}/hospitals/${hospital._id}/beds`,
            {
              method:
                "PUT",

              headers:
                getHeaders(),

              body:
                JSON.stringify(
                  {
                    total:
                      Number(
                        beds.total,
                      ),

                    available:
                      Number(
                        beds.available,
                      ),

                    icu:
                      Number(
                        beds.icu,
                      ),

                    emergency:
                      Number(
                        beds.emergency,
                      ),
                  },
                ),
            },
          );

        const data =
          await response.json();

        if (
          !response.ok
        ) {
          throw new Error(
            data?.message ||
              "Failed to update bed information.",
          );
        }

        return data;
      };

    /* =====================================================
       SAVE BLOOD
    ===================================================== */

    const saveBloodInventory =
      async () => {
        const cleaned =
          {};

        for (
          const group of
          BLOOD_GROUPS
        ) {
          const value =
            Number(
              bloodInventory[
                group
              ],
            );

          if (
            !Number.isInteger(
              value,
            ) ||
            value < 0
          ) {
            throw new Error(
              `Invalid blood inventory value for ${group}.`,
            );
          }

          cleaned[
            group
          ] = value;
        }

        const response =
          await fetch(
            `${API_BASE_URL}/hospitals/${hospital._id}/blood-inventory`,
            {
              method:
                "PUT",

              headers:
                getHeaders(),

              body:
                JSON.stringify(
                  cleaned,
                ),
            },
          );

        const data =
          await response.json();

        if (
          !response.ok
        ) {
          throw new Error(
            data?.message ||
              "Failed to update blood inventory.",
          );
        }

        return data;
      };

    /* =====================================================
       SAVE EMERGENCY
    ===================================================== */

    const saveEmergencyStatus =
      async () => {
        const response =
          await fetch(
            `${API_BASE_URL}/hospitals/${hospital._id}/emergency`,
            {
              method:
                "PATCH",

              headers:
                getHeaders(),

              body:
                JSON.stringify(
                  {
                    emergencyAvailable,
                  },
                ),
            },
          );

        const data =
          await response.json();

        if (
          !response.ok
        ) {
          throw new Error(
            data?.message ||
              "Failed to update emergency status.",
          );
        }

        return data;
      };

    /* =====================================================
       SAVE AMBULANCE
    ===================================================== */

    const saveAmbulanceStatus =
      async () => {
        const response =
          await fetch(
            `${API_BASE_URL}/hospitals/${hospital._id}/ambulance`,
            {
              method:
                "PATCH",

              headers:
                getHeaders(),

              body:
                JSON.stringify(
                  {
                    ambulanceAvailable,
                  },
                ),
            },
          );

        const data =
          await response.json();

        if (
          !response.ok
        ) {
          throw new Error(
            data?.message ||
              "Failed to update ambulance status.",
          );
        }

        return data;
      };

    /* =====================================================
       SAVE OPEN STATUS
    ===================================================== */

    const saveHospitalStatus =
      async () => {
        const response =
          await fetch(
            `${API_BASE_URL}/hospitals/${hospital._id}/status`,
            {
              method:
                "PATCH",

              headers:
                getHeaders(),

              body:
                JSON.stringify(
                  {
                    isOpen,
                  },
                ),
            },
          );

        const data =
          await response.json();

        if (
          !response.ok
        ) {
          throw new Error(
            data?.message ||
              "Failed to update hospital status.",
          );
        }

        return data;
      };

    /* =====================================================
       SAVE EVERYTHING
    ===================================================== */

    const handleSaveEverything =
      async () => {
        try {
          setSaving(
            true,
          );

          setError("");
          setSuccess("");

          if (
            !hospital?._id
          ) {
            throw new Error(
              "Hospital ID is not available.",
            );
          }

          await saveProfile();

          await saveBeds();

          await saveBloodInventory();

          await saveEmergencyStatus();

          await saveAmbulanceStatus();

          await saveHospitalStatus();

          setSuccess(
            "Hospital profile, location and operational information updated successfully.",
          );

          await loadHospital();
        } catch (err) {
          setError(
            err?.message ||
              "Unable to save hospital information.",
          );
        } finally {
          setSaving(
            false,
          );
        }
      };

    /* =====================================================
       TOTAL BLOOD
    ===================================================== */

    const totalBloodUnits =
      useMemo(() => {
        return BLOOD_GROUPS.reduce(
          (
            total,
            group,
          ) =>
            total +
            Number(
              bloodInventory[
                group
              ] || 0,
            ),
          0,
        );
      }, [
        bloodInventory,
      ]);

    /* =====================================================
       LOCATION STATE
    ===================================================== */

    const hasLocation =
      Number.isFinite(
        profile.latitude,
      ) &&
      Number.isFinite(
        profile.longitude,
      );

    const mapCenter =
      hasLocation
        ? [
            profile.latitude,
            profile.longitude,
          ]
        : DEFAULT_CENTER;

    /* =====================================================
       LOADING
    ===================================================== */

    if (loading) {
      return (
        <div className="flex min-h-[500px] items-center justify-center">

          <div className="text-center">

            <div className="mx-auto grid h-12 w-12 place-items-center rounded-[14px] bg-[#1717E8] text-white">

              <LoaderCircle
                size={20}
                className="animate-spin"
              />
            </div>

            <p className="mt-4 text-[11px] font-semibold text-[#526A82]">
              Loading hospital management...
            </p>
          </div>
        </div>
      );
    }

    /* =====================================================
       PAGE
    ===================================================== */

    return (
      <div className="mx-auto w-full max-w-7xl">

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="mb-7">

          <p className="text-[9px] font-extrabold uppercase tracking-[0.16em] text-[#1717E8]">
            Hospital Management
          </p>

          <div className="mt-2 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">

            <div>

              <h1 className="font-[Manrope] text-[31px] font-extrabold tracking-[-0.045em] text-[#10233F] sm:text-[38px]">
                Hospital Operations
              </h1>

              <p className="mt-2 max-w-3xl text-[10px] leading-6 text-[#718398]">
                Manage hospital information, location, bed availability, blood inventory and emergency services.
              </p>
            </div>

            <div
              className={`inline-flex items-center gap-3 rounded-[15px] border px-4 py-3 ${
                isOpen
                  ? "border-emerald-200 bg-emerald-50"
                  : "border-red-200 bg-red-50"
              }`}
            >

              <span
                className={`h-3 w-3 rounded-full ${
                  isOpen
                    ? "bg-emerald-500"
                    : "bg-red-500"
                }`}
              />

              <div>

                <p
                  className={`text-[9px] font-extrabold ${
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

                <p className="mt-0.5 text-[7.5px] text-[#8293A4]">
                  Public availability status
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* =================================================
            ERROR
        ================================================= */}

        {error && (
          <div className="mb-6 flex gap-3 rounded-[16px] border border-red-200 bg-red-50 p-5">

            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-[10px] bg-red-100 text-red-600">
              <X size={15} />
            </div>

            <div>

              <p className="text-[10px] font-extrabold text-red-800">
                Update failed
              </p>

              <p className="mt-1 text-[9px] text-red-600">
                {error}
              </p>
            </div>
          </div>
        )}

        {/* =================================================
            SUCCESS
        ================================================= */}

        {success && (
          <div className="mb-6 flex gap-3 rounded-[16px] border border-emerald-200 bg-emerald-50 p-5">

            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-[10px] bg-emerald-100 text-emerald-700">

              <CheckCircle2
                size={16}
              />
            </div>

            <div>

              <p className="text-[10px] font-extrabold text-emerald-800">
                Changes saved
              </p>

              <p className="mt-1 text-[9px] text-emerald-600">
                {success}
              </p>
            </div>
          </div>
        )}

        <div className="space-y-6">

          {/* =================================================
              STATUS
          ================================================= */}

          <section className="overflow-hidden rounded-[22px] border border-[#DFE7F0] bg-white shadow-[0_10px_30px_rgba(20,46,79,0.04)]">

            <SectionHeader
              icon={
                Building2
              }
              title="Hospital Availability"
              description="Control how your hospital appears to patients and emergency services."
            />

            <div className="grid gap-4 p-6 md:grid-cols-3">

              <StatusCard
                icon={
                  Hospital
                }
                title="Hospital Status"
                description={
                  isOpen
                    ? "Hospital is currently open."
                    : "Hospital is currently closed."
                }
                enabled={
                  isOpen
                }
                onClick={() => {
                  setIsOpen(
                    !isOpen,
                  );

                  clearMessages();
                }}
                enabledText="Open"
                disabledText="Closed"
              />

              <StatusCard
                icon={
                  HeartPulse
                }
                title="Emergency Services"
                description={
                  emergencyAvailable
                    ? "Emergency services available."
                    : "Emergency services unavailable."
                }
                enabled={
                  emergencyAvailable
                }
                onClick={() => {
                  setEmergencyAvailable(
                    !emergencyAvailable,
                  );

                  clearMessages();
                }}
                enabledText="Available"
                disabledText="Unavailable"
              />

              <StatusCard
                icon={
                  Ambulance
                }
                title="Ambulance"
                description={
                  ambulanceAvailable
                    ? "Ambulance service available."
                    : "No ambulance currently available."
                }
                enabled={
                  ambulanceAvailable
                }
                onClick={() => {
                  setAmbulanceAvailable(
                    !ambulanceAvailable,
                  );

                  clearMessages();
                }}
                enabledText="Available"
                disabledText="Unavailable"
              />
            </div>
          </section>

          {/* =================================================
              LOCATION MAP
          ================================================= */}

          <section className="overflow-hidden rounded-[22px] border border-[#DFE7F0] bg-white shadow-[0_10px_30px_rgba(20,46,79,0.04)]">

            <SectionHeader
              icon={MapPin}
              title="Hospital Location"
              description="Click the map to place the hospital marker or use your current location."
              right={
                hasLocation ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-[8px] font-extrabold text-emerald-700">

                    <CheckCircle2
                      size={11}
                    />

                    Location selected
                  </span>
                ) : (
                  <span className="rounded-full bg-amber-50 px-3 py-1.5 text-[8px] font-extrabold text-amber-700">
                    Location required for map
                  </span>
                )
              }
            />

            <div className="p-6">

              <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">

                <div>

                  <p className="text-[9px] font-extrabold text-[#425B74]">
                    Select exact hospital position
                  </p>

                  <p className="mt-1 text-[8px] leading-5 text-[#8393A4]">
                    Zoom into the correct area and click directly on the hospital building.
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">

                  <button
                    type="button"
                    onClick={
                      useCurrentLocation
                    }
                    disabled={
                      locating
                    }
                    className="inline-flex min-h-[40px] items-center gap-2 rounded-[11px] bg-[#1717E8] px-4 text-[8.5px] font-extrabold !text-white disabled:opacity-60"
                  >

                    {locating ? (
                      <LoaderCircle
                        size={14}
                        className="animate-spin"
                      />
                    ) : (
                      <LocateFixed
                        size={14}
                      />
                    )}

                    <span className="!text-white">
                      {locating
                        ? "Locating..."
                        : "Use My Location"}
                    </span>
                  </button>

                  {hasLocation && (
                    <button
                      type="button"
                      onClick={
                        removeLocation
                      }
                      className="inline-flex min-h-[40px] items-center gap-2 rounded-[11px] border border-red-200 bg-red-50 px-4 text-[8.5px] font-extrabold !text-red-600"
                    >

                      <Trash2
                        size={13}
                      />

                      Remove
                    </button>
                  )}
                </div>
              </div>

              <div className="overflow-hidden rounded-[18px] border border-[#DDE5EE]">

                <div className="h-[420px]">

                  <MapContainer
                    center={
                      mapCenter
                    }
                    zoom={
                      hasLocation
                        ? 15
                        : 7
                    }
                    scrollWheelZoom
                    className="h-full w-full"
                  >

                    <TileLayer
                      attribution='&copy; OpenStreetMap contributors'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />

                    <LocationPicker
                      onSelect={
                        setLocation
                      }
                    />

                    <RecenterMap
                      latitude={
                        profile.latitude
                      }
                      longitude={
                        profile.longitude
                      }
                    />

                    {hasLocation && (
                      <Marker
                        position={[
                          profile.latitude,
                          profile.longitude,
                        ]}
                        icon={
                          hospitalMarkerIcon
                        }
                      />
                    )}
                  </MapContainer>
                </div>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">

                <CoordinateCard
                  label="Latitude"
                  value={
                    hasLocation
                      ? profile.latitude
                      : "Not selected"
                  }
                />

                <CoordinateCard
                  label="Longitude"
                  value={
                    hasLocation
                      ? profile.longitude
                      : "Not selected"
                  }
                />
              </div>

              <div className="mt-4 rounded-[14px] border border-blue-100 bg-blue-50 p-4">

                <p className="text-[8.5px] leading-5 text-blue-700">
                  This location is used by SAHARA Hospital Finder to place your hospital accurately on the map. Only select the real hospital location.
                </p>
              </div>
            </div>
          </section>

          {/* =================================================
              BEDS
          ================================================= */}

          <section className="overflow-hidden rounded-[22px] border border-[#DFE7F0] bg-white shadow-[0_10px_30px_rgba(20,46,79,0.04)]">

            <SectionHeader
              icon={
                BedDouble
              }
              title="Bed Availability"
              description="Update the current capacity of your hospital."
            />

            <div className="p-6">

              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

                <NumberCard
                  label="Total Beds"
                  value={
                    beds.total
                  }
                  onChange={(
                    value,
                  ) =>
                    handleBedChange(
                      "total",
                      value,
                    )
                  }
                  icon={
                    Hospital
                  }
                />

                <NumberCard
                  label="Available Beds"
                  value={
                    beds.available
                  }
                  onChange={(
                    value,
                  ) =>
                    handleBedChange(
                      "available",
                      value,
                    )
                  }
                  icon={
                    BedDouble
                  }
                  highlight
                />

                <NumberCard
                  label="ICU Beds"
                  value={
                    beds.icu
                  }
                  onChange={(
                    value,
                  ) =>
                    handleBedChange(
                      "icu",
                      value,
                    )
                  }
                  icon={
                    HeartPulse
                  }
                />

                <NumberCard
                  label="Emergency Beds"
                  value={
                    beds.emergency
                  }
                  onChange={(
                    value,
                  ) =>
                    handleBedChange(
                      "emergency",
                      value,
                    )
                  }
                  icon={
                    Cross
                  }
                />
              </div>

              <div className="mt-5 rounded-[15px] border border-blue-100 bg-blue-50 p-4">

                <p className="text-[9px] text-blue-700">
                  Available beds:{" "}

                  <strong>
                    {beds.available ||
                      0}
                  </strong>{" "}
                  of{" "}

                  <strong>
                    {beds.total ||
                      0}
                  </strong>
                </p>

                <div className="mt-3 h-2 overflow-hidden rounded-full bg-blue-100">

                  <div
                    className="h-full rounded-full bg-[#1717E8] transition-all"
                    style={{
                      width:
                        Number(
                          beds.total,
                        ) > 0
                          ? `${Math.min(
                              (Number(
                                beds.available,
                              ) /
                                Number(
                                  beds.total,
                                )) *
                                100,
                              100,
                            )}%`
                          : "0%",
                    }}
                  />
                </div>
              </div>
            </div>
          </section>

          {/* =================================================
              BLOOD
          ================================================= */}

          <section className="overflow-hidden rounded-[22px] border border-[#DFE7F0] bg-white shadow-[0_10px_30px_rgba(20,46,79,0.04)]">

            <SectionHeader
              icon={Droplets}
              title="Blood Inventory"
              description="Maintain accurate blood stock for emergency searches and requests."
              right={
                <span className="rounded-full bg-red-50 px-3 py-1.5 text-[8px] font-extrabold text-red-600">
                  {totalBloodUnits} total units
                </span>
              }
            />

            <div className="p-6">

              <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">

                {BLOOD_GROUPS.map(
                  (
                    group,
                  ) => (
                    <div
                      key={
                        group
                      }
                      className="rounded-[16px] border border-[#E0E7EF] p-4 transition hover:border-red-200"
                    >

                      <div className="mb-3 flex items-center justify-between">

                        <div className="grid h-10 w-10 place-items-center rounded-[11px] bg-red-50 text-[10px] font-extrabold text-red-600">
                          {group}
                        </div>

                        <span className="text-[7.5px] font-semibold text-[#98A5B3]">
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
                        onChange={(
                          event,
                        ) =>
                          handleBloodChange(
                            group,
                            event
                              .target
                              .value,
                          )
                        }
                        className="w-full rounded-[11px] border border-[#DDE5EE] px-4 py-3 text-[14px] font-extrabold text-[#203A55] outline-none focus:border-red-500 focus:ring-4 focus:ring-red-500/10"
                      />
                    </div>
                  ),
                )}
              </div>
            </div>
          </section>

          {/* =================================================
              BASIC PROFILE
          ================================================= */}

          <section className="overflow-hidden rounded-[22px] border border-[#DFE7F0] bg-white shadow-[0_10px_30px_rgba(20,46,79,0.04)]">

            <SectionHeader
              icon={
                ShieldCheck
              }
              title="Hospital Information"
              description="Update the information shown on your hospital profile."
            />

            <div className="space-y-5 p-6">

              <div className="grid gap-5 md:grid-cols-2">

                <InputField
                  label="Hospital Name"
                  name="name"
                  value={
                    profile.name
                  }
                  onChange={
                    handleProfileChange
                  }
                  required
                />

                <InputField
                  label="Phone"
                  name="phone"
                  value={
                    profile.phone
                  }
                  onChange={
                    handleProfileChange
                  }
                  required
                />

                <InputField
                  label="Email"
                  name="email"
                  value={
                    profile.email
                  }
                  onChange={
                    handleProfileChange
                  }
                  required
                />

                <InputField
                  label="Website"
                  name="website"
                  value={
                    profile.website
                  }
                  onChange={
                    handleProfileChange
                  }
                />

                <InputField
                  label="City"
                  name="city"
                  value={
                    profile.city
                  }
                  onChange={
                    handleProfileChange
                  }
                  required
                />

                <InputField
                  label="Address"
                  name="address"
                  value={
                    profile.address
                  }
                  onChange={
                    handleProfileChange
                  }
                  required
                />
              </div>

              <div>

                <label className="mb-2 block text-[9px] font-extrabold text-[#526A82]">
                  Description
                </label>

                <textarea
                  name="description"
                  value={
                    profile.description
                  }
                  onChange={
                    handleProfileChange
                  }
                  rows={4}
                  maxLength={
                    1000
                  }
                  placeholder="Describe your hospital..."
                  className="w-full resize-none rounded-[12px] border border-[#DDE5EE] px-4 py-3 text-[10px] text-[#304861] outline-none focus:border-[#1717E8] focus:ring-4 focus:ring-[#1717E8]/10"
                />
              </div>

              {/* DEPARTMENTS */}

              <div>

                <label className="mb-2 block text-[9px] font-extrabold text-[#526A82]">
                  Departments
                </label>

                <div className="flex gap-2">

                  <input
                    type="text"
                    value={
                      departmentInput
                    }
                    onChange={(
                      event,
                    ) =>
                      setDepartmentInput(
                        event
                          .target
                          .value,
                      )
                    }
                    onKeyDown={(
                      event,
                    ) => {
                      if (
                        event.key ===
                        "Enter"
                      ) {
                        event.preventDefault();

                        addDepartment();
                      }
                    }}
                    placeholder="e.g. Cardiology"
                    className="min-w-0 flex-1 rounded-[12px] border border-[#DDE5EE] px-4 py-3 text-[10px] text-[#304861] outline-none focus:border-[#1717E8] focus:ring-4 focus:ring-[#1717E8]/10"
                  />

                  <button
                    type="button"
                    onClick={
                      addDepartment
                    }
                    className="inline-flex items-center gap-2 rounded-[12px] bg-[#1717E8] px-5 text-[8.5px] font-extrabold !text-white"
                  >

                    <Plus
                      size={13}
                    />

                    <span className="!text-white">
                      Add
                    </span>
                  </button>
                </div>

                <div className="mt-3 flex flex-wrap gap-2">

                  {profile.departments.map(
                    (
                      department,
                    ) => (
                      <span
                        key={
                          department
                        }
                        className="inline-flex items-center gap-2 rounded-[10px] border border-[#DCE4FF] bg-[#F1F4FF] px-3 py-2 text-[8.5px] font-semibold text-[#334DB5]"
                      >

                        {
                          department
                        }

                        <button
                          type="button"
                          onClick={() =>
                            removeDepartment(
                              department,
                            )
                          }
                          className="text-[#7082C6] transition hover:text-red-500"
                        >

                          <X
                            size={11}
                          />
                        </button>
                      </span>
                    ),
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* =================================================
              SAVE
          ================================================= */}

          <div className="flex flex-col justify-between gap-4 rounded-[20px] border border-[#DFE7F0] bg-white p-5 shadow-[0_10px_30px_rgba(20,46,79,0.04)] sm:flex-row sm:items-center">

            <div>

              <p className="text-[10px] font-extrabold text-[#304861]">
                Save hospital changes
              </p>

              <p className="mt-1 text-[8.5px] leading-5 text-[#8998A8]">
                Hospital profile, location and operational information will be updated across SAHARA.
              </p>
            </div>

            <button
              type="button"
              onClick={
                handleSaveEverything
              }
              disabled={
                saving
              }
              className="inline-flex min-h-[45px] items-center justify-center gap-2 rounded-[12px] bg-[#1717E8] px-7 text-[9px] font-extrabold !text-white shadow-[0_10px_24px_rgba(23,23,232,0.18)] transition hover:bg-[#1010C9] disabled:opacity-50"
            >

              {saving ? (
                <>
                  <LoaderCircle
                    size={15}
                    className="animate-spin"
                  />

                  <span className="!text-white">
                    Saving...
                  </span>
                </>
              ) : (
                <>
                  <Save
                    size={15}
                  />

                  <span className="!text-white">
                    Save All Changes
                  </span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  };

/* =========================================================
   SECTION HEADER
========================================================= */

const SectionHeader = ({
  icon: Icon,
  title,
  description,
  right,
}) => (
  <div className="flex items-center justify-between gap-4 border-b border-[#EDF2F7] px-6 py-5">

    <div className="flex items-center gap-3">

      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-[11px] bg-[#EEF2FF] text-[#1717E8]">

        <Icon
          size={17}
        />
      </div>

      <div>

        <h2 className="font-[Manrope] text-[13px] font-extrabold text-[#29425D]">
          {title}
        </h2>

        <p className="mt-1 text-[8px] leading-5 text-[#8998A8]">
          {description}
        </p>
      </div>
    </div>

    {right}
  </div>
);

/* =========================================================
   STATUS CARD
========================================================= */

const StatusCard = ({
  icon: Icon,
  title,
  description,
  enabled,
  onClick,
  enabledText,
  disabledText,
}) => (
  <button
    type="button"
    onClick={onClick}
    className={`rounded-[17px] border p-5 text-left transition ${
      enabled
        ? "border-emerald-200 bg-emerald-50/50"
        : "border-[#DFE6EF] bg-[#F8FAFD]"
    }`}
  >

    <div className="flex items-center justify-between">

      <div
        className={`grid h-11 w-11 place-items-center rounded-[12px] ${
          enabled
            ? "bg-emerald-100 text-emerald-700"
            : "bg-[#E8EDF3] text-[#8795A5]"
        }`}
      >

        <Icon
          size={18}
        />
      </div>

      <div
        className={`h-6 w-11 rounded-full p-1 transition ${
          enabled
            ? "bg-emerald-500"
            : "bg-[#CCD5DF]"
        }`}
      >

        <div
          className={`h-4 w-4 rounded-full bg-white transition ${
            enabled
              ? "translate-x-5"
              : "translate-x-0"
          }`}
        />
      </div>
    </div>

    <p className="mt-5 text-[10px] font-extrabold text-[#304861]">
      {title}
    </p>

    <p className="mt-1 text-[8px] leading-5 text-[#7B8D9F]">
      {description}
    </p>

    <p
      className={`mt-4 text-[8px] font-extrabold ${
        enabled
          ? "text-emerald-600"
          : "text-[#7A8B9D]"
      }`}
    >
      {enabled
        ? enabledText
        : disabledText}
    </p>
  </button>
);

/* =========================================================
   NUMBER CARD
========================================================= */

const NumberCard = ({
  label,
  value,
  onChange,
  icon: Icon,
  highlight = false,
}) => (
  <div
    className={`rounded-[17px] border p-5 ${
      highlight
        ? "border-emerald-200 bg-emerald-50/40"
        : "border-[#DFE6EF] bg-[#FAFCFE]"
    }`}
  >

    <div className="mb-4 flex items-center justify-between">

      <div
        className={`grid h-9 w-9 place-items-center rounded-[10px] ${
          highlight
            ? "bg-emerald-100 text-emerald-700"
            : "bg-[#EEF2FF] text-[#1717E8]"
        }`}
      >

        <Icon
          size={15}
        />
      </div>

      <span className="text-[7px] font-extrabold uppercase tracking-[0.1em] text-[#9AA7B4]">
        Beds
      </span>
    </div>

    <p className="mb-2 text-[9px] font-extrabold text-[#526A82]">
      {label}
    </p>

    <input
      type="number"
      min="0"
      step="1"
      value={value}
      onChange={(
        event,
      ) =>
        onChange(
          event.target
            .value,
        )
      }
      className="w-full rounded-[11px] border border-[#DDE5EE] bg-white px-4 py-3 text-[17px] font-extrabold text-[#203A55] outline-none focus:border-[#1717E8] focus:ring-4 focus:ring-[#1717E8]/10"
    />
  </div>
);

/* =========================================================
   INPUT FIELD
========================================================= */

const InputField = ({
  label,
  name,
  value,
  onChange,
  required,
}) => (
  <div>

    <label className="mb-2 block text-[9px] font-extrabold text-[#526A82]">

      {label}

      {required && (
        <span className="ml-1 text-red-500">
          *
        </span>
      )}
    </label>

    <input
      type="text"
      name={name}
      value={value}
      onChange={onChange}
      className="w-full rounded-[12px] border border-[#DDE5EE] px-4 py-3 text-[10px] text-[#304861] outline-none focus:border-[#1717E8] focus:ring-4 focus:ring-[#1717E8]/10"
    />
  </div>
);

/* =========================================================
   COORDINATE CARD
========================================================= */

const CoordinateCard = ({
  label,
  value,
}) => (
  <div className="rounded-[13px] border border-[#E2E8F0] bg-[#FAFCFE] p-4">

    <p className="text-[7px] font-extrabold uppercase tracking-[0.1em] text-[#98A5B3]">
      {label}
    </p>

    <p className="mt-2 font-mono text-[10px] font-bold text-[#405972]">
      {value}
    </p>
  </div>
);

export default HospitalProfileUpdate;