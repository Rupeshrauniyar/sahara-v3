import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  AlertTriangle,
  Ambulance,
  CheckCircle2,
  Clipboard,
  Cross,
  Droplets,
  HeartPulse,
  LocateFixed,
  MapPin,
  Phone,
  ShieldAlert,
  Sparkles,
  Stethoscope,
  X,
} from "lucide-react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

/* =========================================================
   CONSTANTS
========================================================= */

const HOLD_DURATION = 2000;

const EMERGENCY_TYPES = [
  {
    id: "medical",
    label: "Medical Emergency",
    description:
      "Sudden illness, breathing difficulty, unconsciousness or severe symptoms.",
    icon: HeartPulse,
  },
  {
    id: "accident",
    label: "Accident / Injury",
    description:
      "Road accident, fall, serious injury or trauma.",
    icon: ShieldAlert,
  },
  {
    id: "blood",
    label: "Blood Emergency",
    description:
      "Urgent blood requirement or emergency transfusion support.",
    icon: Droplets,
  },
  {
    id: "other",
    label: "Other Emergency",
    description:
      "Any urgent situation that requires immediate help.",
    icon: AlertTriangle,
  },
];

/* =========================================================
   EMERGENCY SOS
========================================================= */

const EmergencySOS = () => {
  const navigate =
    useNavigate();

  const holdTimer =
    useRef(null);

  const [
    activated,
    setActivated,
  ] = useState(false);

  const [
    holding,
    setHolding,
  ] = useState(false);

  const [
    progress,
    setProgress,
  ] = useState(0);

  const [
    emergencyType,
    setEmergencyType,
  ] = useState("");

  const [
    location,
    setLocation,
  ] = useState(null);

  const [
    locationLoading,
    setLocationLoading,
  ] = useState(false);

  const [
    locationError,
    setLocationError,
  ] = useState("");

  const [
    copied,
    setCopied,
  ] = useState(false);

  /* =====================================================
     CLEAN TIMER
  ===================================================== */

  useEffect(() => {
    return () => {
      if (
        holdTimer.current
      ) {
        clearInterval(
          holdTimer.current,
        );
      }
    };
  }, []);

  /* =====================================================
     HOLD SOS
  ===================================================== */

  const startHold = () => {
    if (activated) {
      return;
    }

    setHolding(true);
    setProgress(0);

    const startedAt =
      Date.now();

    holdTimer.current =
      setInterval(() => {
        const elapsed =
          Date.now() -
          startedAt;

        const percent =
          Math.min(
            (elapsed /
              HOLD_DURATION) *
              100,
            100,
          );

        setProgress(
          percent,
        );

        if (
          elapsed >=
          HOLD_DURATION
        ) {
          clearInterval(
            holdTimer.current,
          );

          holdTimer.current =
            null;

          setHolding(false);
          setProgress(100);
          setActivated(true);

          detectLocation();
        }
      }, 40);
  };

  const stopHold = () => {
    if (
      activated
    ) {
      return;
    }

    if (
      holdTimer.current
    ) {
      clearInterval(
        holdTimer.current,
      );

      holdTimer.current =
        null;
    }

    setHolding(false);
    setProgress(0);
  };

  /* =====================================================
     LOCATION
  ===================================================== */

  const detectLocation =
    () => {
      setLocationError("");
      setLocationLoading(true);

      if (
        !navigator.geolocation
      ) {
        setLocationLoading(false);

        setLocationError(
          "Location is not supported by this browser.",
        );

        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude:
              Number(
                position.coords.latitude.toFixed(
                  6,
                ),
              ),

            longitude:
              Number(
                position.coords.longitude.toFixed(
                  6,
                ),
              ),

            accuracy:
              Math.round(
                position.coords.accuracy,
              ),
          });

          setLocationLoading(
            false,
          );
        },

        () => {
          setLocationLoading(
            false,
          );

          setLocationError(
            "Location permission was unavailable. Emergency calling still works.",
          );
        },

        {
          enableHighAccuracy:
            true,

          timeout:
            10000,

          maximumAge:
            30000,
        },
      );
    };

  /* =====================================================
     COPY LOCATION
  ===================================================== */

  const copyLocation =
    async () => {
      if (!location) {
        return;
      }

      const text =
        `Emergency location: ${location.latitude}, ${location.longitude}`;

      try {
        await navigator.clipboard.writeText(
          text,
        );

        setCopied(true);

        setTimeout(
          () =>
            setCopied(
              false,
            ),
          1800,
        );
      } catch {
        setCopied(false);
      }
    };

  /* =====================================================
     AI
  ===================================================== */

  const openAi = () => {
    navigate(
      "/ai-bot",
      {
        state: {
          emergencyMode:
            true,

          emergencyType:
            emergencyType ||
            "medical",

          location,
        },
      },
    );
  };

  /* =====================================================
     RESET
  ===================================================== */

  const resetEmergency =
    () => {
      setActivated(false);
      setEmergencyType("");
      setProgress(0);
      setLocation(null);
      setLocationError("");
      setCopied(false);
    };

  /* =====================================================
     INITIAL PAGE
  ===================================================== */

  if (!activated) {
    return (
      <div className="mx-auto flex min-h-[calc(100vh-160px)] w-full max-w-5xl items-center justify-center py-6">

        <div className="w-full">

          <section className="overflow-hidden rounded-[28px] border border-red-100 bg-white shadow-[0_20px_60px_rgba(162,28,28,0.08)]">

            <div className="bg-[radial-gradient(circle_at_50%_15%,rgba(239,68,68,0.14),transparent_35%)] px-6 py-12 text-center sm:px-10 sm:py-16">

              <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-red-200 bg-red-50 px-4 py-2">

                <AlertTriangle
                  size={14}
                  className="text-red-600"
                />

                <span className="text-[9px] font-extrabold uppercase tracking-[0.14em] text-red-600">
                  Emergency Assistance
                </span>
              </div>

              <h1 className="mt-6 font-[Manrope] text-[32px] font-extrabold tracking-[-0.045em] text-[#152D46] sm:text-[44px]">
                Emergency SOS
              </h1>

              <p className="mx-auto mt-3 max-w-[600px] text-[10px] leading-6 text-[#74869A] sm:text-[11px]">
                If someone is in immediate danger, hold the SOS button for two seconds to open emergency actions.
              </p>

              {/* SOS BUTTON */}

              <div className="mt-10 flex justify-center">

                <button
                  type="button"
                  onMouseDown={
                    startHold
                  }
                  onMouseUp={
                    stopHold
                  }
                  onMouseLeave={
                    stopHold
                  }
                  onTouchStart={
                    startHold
                  }
                  onTouchEnd={
                    stopHold
                  }
                  className="relative grid h-[190px] w-[190px] select-none place-items-center rounded-full border-[10px] border-red-100 bg-red-600 shadow-[0_22px_50px_rgba(220,38,38,0.28)] transition active:scale-[0.97]"
                >

                  <div
                    className="absolute inset-[-10px] rounded-full"
                    style={{
                      background: `conic-gradient(#991b1b ${progress}%, transparent ${progress}%)`,
                      mask:
                        "radial-gradient(circle, transparent 70%, black 71%)",
                      WebkitMask:
                        "radial-gradient(circle, transparent 70%, black 71%)",
                    }}
                  />

                  <div className="relative text-center">

                    <ShieldAlert
                      size={34}
                      className="mx-auto text-white"
                    />

                    <p className="mt-2 font-[Manrope] text-[28px] font-black !text-white">
                      SOS
                    </p>

                    <p className="mt-1 text-[8px] font-extrabold uppercase tracking-[0.15em] !text-red-100">
                      Hold 2 sec
                    </p>
                  </div>
                </button>
              </div>

              <p className="mt-6 text-[9px] font-semibold text-[#8796A5]">
                {holding
                  ? "Keep holding..."
                  : "Press and hold to activate"}
              </p>

              {/* DIRECT CALL */}

              <div className="mx-auto mt-9 grid max-w-[520px] gap-3 sm:grid-cols-2">

                <a
                  href="tel:102"
                  className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-[13px] bg-red-600 px-5 text-[9px] font-extrabold !text-white shadow-sm"
                >
                  <Ambulance
                    size={16}
                  />

                  <span className="!text-white">
                    Ambulance 102
                  </span>
                </a>

                <a
                  href="tel:100"
                  className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-[13px] border border-[#DCE5EE] bg-white px-5 text-[9px] font-extrabold !text-[#405972]"
                >
                  <Phone
                    size={15}
                  />

                  Police 100
                </a>
              </div>

              <p className="mx-auto mt-5 max-w-[560px] text-[8px] leading-5 text-[#9AA7B5]">
                For life-threatening situations, contact emergency services immediately. SAHARA does not replace professional emergency responders.
              </p>
            </div>
          </section>
        </div>
      </div>
    );
  }

  /* =====================================================
     ACTIVATED PANEL
  ===================================================== */

  return (
    <div className="mx-auto w-full max-w-6xl">

      {/* ALERT HEADER */}

      <section className="overflow-hidden rounded-[24px] bg-[radial-gradient(circle_at_90%_10%,rgba(255,255,255,0.12),transparent_25%),linear-gradient(135deg,#8E1111,#D62121)] p-6 text-white shadow-[0_18px_45px_rgba(185,28,28,0.20)] sm:p-8">

        <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-center">

          <div>

            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-2">

              <ShieldAlert
                size={14}
                className="text-white"
              />

              <span className="text-[8px] font-extrabold uppercase tracking-[0.15em] !text-white">
                SOS Activated
              </span>
            </div>

            <h1 className="mt-4 font-[Manrope] text-[30px] font-extrabold tracking-[-0.04em] !text-white sm:text-[38px]">
              Get the right help now.
            </h1>

            <p className="mt-2 max-w-[600px] text-[10px] leading-6 !text-red-100">
              Choose the emergency type and use the fastest available action below.
            </p>
          </div>

          <button
            type="button"
            onClick={
              resetEmergency
            }
            className="inline-flex min-h-[42px] self-start items-center gap-2 rounded-[11px] border border-white/20 bg-white/10 px-4 text-[8.5px] font-extrabold !text-white"
          >
            <X
              size={14}
            />

            <span className="!text-white">
              Exit SOS
            </span>
          </button>
        </div>
      </section>

      {/* EMERGENCY TYPE */}

      <section className="mt-6 rounded-[22px] border border-[#DFE7F0] bg-white p-5 shadow-[0_10px_30px_rgba(20,46,79,0.04)] sm:p-6">

        <p className="text-[8px] font-extrabold uppercase tracking-[0.13em] text-red-600">
          Step 1
        </p>

        <h2 className="mt-2 font-[Manrope] text-[18px] font-extrabold text-[#29425D]">
          What is happening?
        </h2>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">

          {EMERGENCY_TYPES.map(
            (item) => {
              const Icon =
                item.icon;

              const active =
                emergencyType ===
                item.id;

              return (
                <button
                  key={
                    item.id
                  }
                  type="button"
                  onClick={() =>
                    setEmergencyType(
                      item.id,
                    )
                  }
                  className={`flex items-start gap-4 rounded-[17px] border p-4 text-left transition ${
                    active
                      ? "border-red-300 bg-red-50 shadow-[0_8px_20px_rgba(220,38,38,0.07)]"
                      : "border-[#E0E7EF] bg-[#FAFCFE] hover:border-[#CCD7E2]"
                  }`}
                >

                  <div
                    className={`grid h-11 w-11 shrink-0 place-items-center rounded-[12px] ${
                      active
                        ? "bg-red-600 text-white"
                        : "bg-white text-[#65798F]"
                    }`}
                  >
                    <Icon
                      size={18}
                    />
                  </div>

                  <div>

                    <p className="text-[10px] font-extrabold text-[#304861]">
                      {
                        item.label
                      }
                    </p>

                    <p className="mt-1 text-[8px] leading-5 text-[#8494A4]">
                      {
                        item.description
                      }
                    </p>
                  </div>
                </button>
              );
            },
          )}
        </div>
      </section>

      {/* LOCATION */}

      <section className="mt-6 rounded-[22px] border border-[#DFE7F0] bg-white p-5 shadow-[0_10px_30px_rgba(20,46,79,0.04)] sm:p-6">

        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">

          <div>

            <p className="text-[8px] font-extrabold uppercase tracking-[0.13em] text-[#1717E8]">
              Step 2
            </p>

            <h2 className="mt-2 font-[Manrope] text-[18px] font-extrabold text-[#29425D]">
              Your location
            </h2>
          </div>

          <button
            type="button"
            onClick={
              detectLocation
            }
            disabled={
              locationLoading
            }
            className="inline-flex min-h-[42px] items-center gap-2 rounded-[11px] bg-[#1717E8] px-4 text-[8.5px] font-extrabold !text-white disabled:opacity-50"
          >

            {locationLoading ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
            ) : (
              <LocateFixed
                size={14}
              />
            )}

            <span className="!text-white">
              Detect Location
            </span>
          </button>
        </div>

        {location && (
          <div className="mt-5 rounded-[16px] border border-emerald-200 bg-emerald-50 p-4">

            <div className="flex items-start gap-3">

              <div className="grid h-9 w-9 shrink-0 place-items-center rounded-[10px] bg-emerald-100 text-emerald-700">

                <MapPin
                  size={16}
                />
              </div>

              <div className="min-w-0 flex-1">

                <div className="flex items-center gap-2">

                  <CheckCircle2
                    size={13}
                    className="text-emerald-600"
                  />

                  <p className="text-[9px] font-extrabold text-emerald-800">
                    Location detected
                  </p>
                </div>

                <p className="mt-2 font-mono text-[8.5px] text-emerald-700">
                  {
                    location.latitude
                  },{" "}
                  {
                    location.longitude
                  }
                </p>

                <p className="mt-1 text-[7.5px] text-emerald-600">
                  Accuracy approximately{" "}
                  {
                    location.accuracy
                  }
                  m
                </p>
              </div>

              <button
                type="button"
                onClick={
                  copyLocation
                }
                className="inline-flex min-h-[38px] items-center gap-2 rounded-[10px] border border-emerald-200 bg-white px-3 text-[8px] font-extrabold text-emerald-700"
              >

                {copied ? (
                  <CheckCircle2
                    size={13}
                  />
                ) : (
                  <Clipboard
                    size={13}
                  />
                )}

                {copied
                  ? "Copied"
                  : "Copy"}
              </button>
            </div>
          </div>
        )}

        {locationLoading && (
          <div className="mt-5 rounded-[15px] bg-[#F5F7FA] p-4">

            <p className="text-[9px] font-semibold text-[#718398]">
              Detecting your location...
            </p>
          </div>
        )}

        {locationError && (
          <div className="mt-5 rounded-[15px] border border-amber-200 bg-amber-50 p-4">

            <p className="text-[8.5px] leading-5 text-amber-700">
              {
                locationError
              }
            </p>
          </div>
        )}
      </section>

      {/* ACTIONS */}

      <section className="mt-6 rounded-[22px] border border-[#DFE7F0] bg-white p-5 shadow-[0_10px_30px_rgba(20,46,79,0.04)] sm:p-6">

        <p className="text-[8px] font-extrabold uppercase tracking-[0.13em] text-red-600">
          Step 3
        </p>

        <h2 className="mt-2 font-[Manrope] text-[18px] font-extrabold text-[#29425D]">
          Emergency actions
        </h2>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">

          <a
            href="tel:102"
            className="rounded-[17px] bg-red-600 p-5 transition hover:bg-red-700"
          >

            <Ambulance
              size={23}
              className="text-white"
            />

            <p className="mt-4 text-[11px] font-extrabold !text-white">
              Call Ambulance
            </p>

            <p className="mt-1 text-[8px] !text-red-100">
              Nepal Ambulance 102
            </p>
          </a>

          <Link
            to="/bloodRequest"
            className="rounded-[17px] border border-red-100 bg-red-50 p-5 transition hover:border-red-200"
          >

            <Droplets
              size={23}
              className="text-red-600"
            />

            <p className="mt-4 text-[11px] font-extrabold !text-[#304861]">
              Request Blood
            </p>

            <p className="mt-1 text-[8px] text-[#8393A4]">
              Start an urgent blood request
            </p>
          </Link>

          <Link
            to="/doctor"
            className="rounded-[17px] border border-[#DFE6EF] bg-[#FAFCFE] p-5 transition hover:border-[#C8D3DE]"
          >

            <Stethoscope
              size={23}
              className="text-[#1717E8]"
            />

            <p className="mt-4 text-[11px] font-extrabold !text-[#304861]">
              Find Doctor
            </p>

            <p className="mt-1 text-[8px] text-[#8393A4]">
              Search available doctors
            </p>
          </Link>

          <button
            type="button"
            onClick={
              openAi
            }
            className="rounded-[17px] border border-[#DDE2FF] bg-[#F2F4FF] p-5 text-left transition hover:border-[#BDC6FF]"
          >

            <Sparkles
              size={23}
              className="text-[#1717E8]"
            />

            <p className="mt-4 text-[11px] font-extrabold text-[#304861]">
              SAHARA AI
            </p>

            <p className="mt-1 text-[8px] text-[#8393A4]">
              Get immediate navigation guidance
            </p>
          </button>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">

          <a
            href="tel:100"
            className="inline-flex min-h-[47px] items-center justify-center gap-2 rounded-[12px] border border-[#DCE5EE] bg-white px-5 text-[9px] font-extrabold !text-[#405972]"
          >
            <Phone
              size={15}
            />

            Police 100
          </a>

          <button
            type="button"
            onClick={
              detectLocation
            }
            className="inline-flex min-h-[47px] items-center justify-center gap-2 rounded-[12px] border border-[#DCE5EE] bg-white px-5 text-[9px] font-extrabold text-[#405972]"
          >
            <MapPin
              size={15}
            />

            Refresh Location
          </button>
        </div>
      </section>

      {/* SAFETY */}

      <section className="mt-6 rounded-[18px] border border-amber-200 bg-amber-50 p-5">

        <div className="flex items-start gap-3">

          <AlertTriangle
            size={17}
            className="mt-0.5 shrink-0 text-amber-600"
          />

          <p className="text-[8.5px] leading-5 text-amber-800">
            SAHARA helps connect users to emergency resources but does not itself dispatch ambulances or emergency responders. For a life-threatening emergency, contact emergency services immediately.
          </p>
        </div>
      </section>
    </div>
  );
};

export default EmergencySOS;