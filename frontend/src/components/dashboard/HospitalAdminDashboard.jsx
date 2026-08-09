import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import {
  Activity,
  Ambulance,
  ArrowUpRight,
  BedDouble,
  Building2,
  CheckCircle2,
  Droplets,
  HeartPulse,
  Hospital,
  LoaderCircle,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  UsersRound,
} from "lucide-react";

import StatCard from "./StatCard";
import QuickAction from "./QuickAction";

import {
  apiRequest,
  formatDate,
} from "../../utils/api";

const bloodGroups = [
  "A+",
  "A-",
  "B+",
  "B-",
  "AB+",
  "AB-",
  "O+",
  "O-",
];

const HospitalAdminDashboard = ({ user }) => {
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadOverview = async () => {
      try {
        const data = await apiRequest(
          "/dashboard/overview",
        );

        setOverview(
          data?.overview || null,
        );
      } catch (err) {
        setError(
          err?.message ||
            "Unable to load hospital dashboard.",
        );
      } finally {
        setLoading(false);
      }
    };

    loadOverview();
  }, []);

  const stats = overview?.stats || {};
  const hospital = overview?.hospital;

  const bloodInventory =
    overview?.bloodInventory || {};

  const recentAppointments =
    overview?.recentAppointments || [];

  const profile =
    overview?.user || user;

  if (loading) {
    return (
      <div className="flex min-h-[520px] items-center justify-center">

        <div className="text-center">

          <div className="mx-auto grid h-14 w-14 place-items-center rounded-[17px] bg-[#1717E8] text-white shadow-[0_14px_30px_rgba(23,23,232,0.22)]">

            <LoaderCircle
              size={24}
              className="animate-spin"
            />
          </div>

          <p className="mt-4 text-[12px] font-bold text-[#526A82]">
            Loading hospital command center...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[1500px] space-y-6">

      {error && (
        <div className="rounded-[16px] border border-red-200 bg-red-50 px-5 py-4 text-[11px] font-semibold text-red-700">
          {error}
        </div>
      )}

      {!hospital && (
        <div className="rounded-[16px] border border-amber-200 bg-amber-50 px-5 py-4 text-[11px] font-semibold text-amber-800">
          No hospital is currently linked to this account.
        </div>
      )}

      {/* HERO */}

      <section className="relative overflow-hidden rounded-[26px] bg-[radial-gradient(circle_at_82%_18%,rgba(79,137,255,0.24),transparent_27%),linear-gradient(135deg,#0C2B50_0%,#164B87_55%,#3156E7_130%)] p-6 text-white shadow-[0_24px_55px_rgba(14,38,77,0.15)] sm:p-8">

        <div className="absolute -right-24 -top-28 h-80 w-80 rounded-full border-[45px] border-white/[0.04]" />

        <div className="relative flex flex-col justify-between gap-7 xl:flex-row xl:items-center">

          <div className="max-w-[700px]">

            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.08] px-3 py-2">

              <Hospital
                size={14}
                className="text-cyan-200"
              />

              <span className="!text-white text-[9px] font-extrabold uppercase tracking-[0.14em]">
                Hospital Operations
              </span>
            </div>

            <h2 className="mt-5 font-[Manrope] text-[28px] font-extrabold tracking-[-0.045em] !text-white sm:text-[36px]">
              {hospital?.name ||
                "Hospital Command Center"}
            </h2>

            <p className="mt-3 max-w-[620px] text-[12px] leading-6 !text-blue-100">
              Monitor capacity, doctors, blood inventory and hospital services from one SAHARA workspace.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">

              <StatusChip
                icon={Activity}
                label="Hospital"
                active={stats.isOpen}
                activeText="Open"
                inactiveText="Closed"
              />

              <StatusChip
                icon={HeartPulse}
                label="Emergency"
                active={
                  stats.emergencyAvailable
                }
                activeText="Available"
                inactiveText="Unavailable"
              />

              <StatusChip
                icon={Ambulance}
                label="Ambulance"
                active={
                  stats.ambulanceAvailable
                }
                activeText="Available"
                inactiveText="Unavailable"
              />
            </div>

            <div className="mt-6 flex flex-wrap gap-3">

              <Link
                to="/appointment"
                className="inline-flex min-h-[44px] items-center gap-2 rounded-[12px] bg-white px-4 text-[10px] font-extrabold shadow-sm transition hover:bg-[#F4F7FF]"
              >
                <Stethoscope
                  size={15}
                  className="text-[#1717E8]"
                />

                <span className="!text-[#10233F]">
                  View Appointments
                </span>
              </Link>

              <Link
                to="/bloodRequest"
                className="inline-flex min-h-[44px] items-center gap-2 rounded-[12px] border border-white/20 bg-white/10 px-4 text-[10px] font-extrabold transition hover:bg-white/15"
              >
                <Droplets
                  size={15}
                  className="text-white"
                />

                <span className="!text-white">
                  Blood Requests
                </span>
              </Link>
            </div>
          </div>

          <div className="grid min-w-[250px] grid-cols-2 gap-3">

            <HeroMetric
              label="Total Beds"
              value={
                stats.totalBeds || 0
              }
            />

            <HeroMetric
              label="Available Beds"
              value={
                stats.availableBeds || 0
              }
            />

            <HeroMetric
              label="Doctors"
              value={
                stats.activeDoctors || 0
              }
            />

            <HeroMetric
              label="Blood Units"
              value={
                stats.bloodUnits || 0
              }
            />
          </div>
        </div>
      </section>

      {/* STATS */}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

        <StatCard
          icon={BedDouble}
          label="Bed Occupancy"
          value={`${stats.bedOccupancy || 0}%`}
          trend={`${stats.availableBeds || 0} available`}
          accent="blue"
          helper="Current hospital capacity"
        />

        <StatCard
          icon={Stethoscope}
          label="Active Doctors"
          value={String(
            stats.activeDoctors || 0,
          )}
          accent="cyan"
          helper="Available hospital doctors"
        />

        <StatCard
          icon={Building2}
          label="Total Beds"
          value={String(
            stats.totalBeds || 0,
          )}
          accent="violet"
          helper={`${stats.icuBeds || 0} ICU • ${stats.emergencyBeds || 0} emergency`}
        />

        <StatCard
          icon={Droplets}
          label="Blood Units"
          value={String(
            stats.bloodUnits || 0,
          )}
          accent="rose"
          helper="Total hospital blood inventory"
        />
      </section>

      {/* CAPACITY + ACTIONS */}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.55fr)_minmax(320px,0.75fr)]">

        <section className="rounded-[22px] border border-[#DFE8F1] bg-white p-5 shadow-[0_12px_34px_rgba(23,47,78,0.045)] sm:p-6">

          <div className="mb-6">

            <p className="text-[9px] font-extrabold uppercase tracking-[0.13em] text-[#1717E8]">
              Capacity Overview
            </p>

            <h3 className="mt-1 font-[Manrope] text-[16px] font-extrabold text-[#1C344F]">
              Bed Status
            </h3>

            <p className="mt-1 text-[9.5px] text-[#8998A8]">
              Live bed availability across hospital services.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">

            <BedBlock
              label="General Beds"
              total={stats.totalBeds || 0}
              available={
                stats.availableBeds || 0
              }
              icon={BedDouble}
              accent="blue"
            />

            <BedBlock
              label="ICU Beds"
              total={stats.icuBeds || 0}
              available={
                stats.icuBeds || 0
              }
              icon={Activity}
              accent="violet"
            />

            <BedBlock
              label="Emergency Beds"
              total={
                stats.emergencyBeds || 0
              }
              available={
                stats.emergencyBeds || 0
              }
              icon={HeartPulse}
              accent="rose"
            />

            <BedBlock
              label="Occupied Beds"
              total={stats.totalBeds || 0}
              available={Math.max(
                (stats.totalBeds || 0) -
                  (stats.availableBeds || 0),
                0,
              )}
              icon={UsersRound}
              accent="amber"
              occupiedMode
            />
          </div>
        </section>

        <section>

          <div className="mb-4">

            <p className="text-[9px] font-extrabold uppercase tracking-[0.13em] text-[#1717E8]">
              Shortcuts
            </p>

            <h3 className="mt-1 font-[Manrope] text-[16px] font-extrabold text-[#1C344F]">
              Quick Actions
            </h3>
          </div>

          <div className="space-y-3">

            <QuickAction
              icon={Stethoscope}
              title="Appointments"
              description="View hospital appointments"
              to="/appointment"
              variant="primary"
            />

            <QuickAction
              icon={Droplets}
              title="Blood Requests"
              description="Review blood request activity"
              to="/bloodRequest"
              variant="danger"
            />

            <QuickAction
              icon={HeartPulse}
              title="Blood Network"
              description="View donor and blood information"
              to="/blood-donor"
            />

            <QuickAction
              icon={Sparkles}
              title="SAHARA AI"
              description="Open healthcare AI assistance"
              to="/ai-bot"
            />
          </div>
        </section>
      </div>

      {/* BLOOD INVENTORY */}

      <section className="rounded-[22px] border border-[#DFE8F1] bg-white p-5 shadow-[0_12px_34px_rgba(23,47,78,0.045)] sm:p-6">

        <div className="flex items-center justify-between gap-4">

          <div>

            <p className="text-[9px] font-extrabold uppercase tracking-[0.13em] text-rose-600">
              Blood Management
            </p>

            <h3 className="mt-1 font-[Manrope] text-[16px] font-extrabold text-[#1C344F]">
              Blood Inventory
            </h3>

            <p className="mt-1 text-[9.5px] text-[#8998A8]">
              Current stored units by blood group.
            </p>
          </div>

          <div className="grid h-10 w-10 place-items-center rounded-[12px] bg-rose-50 text-rose-600">
            <Droplets size={19} />
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4 xl:grid-cols-8">

          {bloodGroups.map(
            (group) => (
              <BloodCard
                key={group}
                group={group}
                value={
                  bloodInventory[group] ||
                  0
                }
              />
            ),
          )}
        </div>
      </section>

      {/* APPOINTMENTS + PROFILE */}

      <div className="grid gap-6 lg:grid-cols-2">

        <section className="overflow-hidden rounded-[22px] border border-[#DFE8F1] bg-white shadow-[0_12px_34px_rgba(23,47,78,0.045)]">

          <div className="flex items-center justify-between border-b border-[#EDF2F7] px-5 py-5 sm:px-6">

            <div>

              <p className="text-[9px] font-extrabold uppercase tracking-[0.13em] text-[#1717E8]">
                Hospital Schedule
              </p>

              <h3 className="mt-1 font-[Manrope] text-[16px] font-extrabold text-[#1C344F]">
                Recent Appointments
              </h3>
            </div>

            <Link
              to="/appointment"
              className="grid h-9 w-9 place-items-center rounded-[11px] bg-[#EEF2FF] text-[#1717E8]"
            >
              <ArrowUpRight size={15} />
            </Link>
          </div>

          {recentAppointments.length === 0 ? (
            <div className="px-6 py-14 text-center">

              <Stethoscope
                size={25}
                className="mx-auto text-[#B3BFCA]"
              />

              <p className="mt-3 text-[10px] font-semibold text-[#8998A8]">
                No recent hospital appointments.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-[#EDF2F7]">

              {recentAppointments.map(
                (item) => (
                  <div
                    key={item._id}
                    className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6"
                  >

                    <div className="flex min-w-0 items-center gap-3">

                      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-[12px] bg-[#EEF2FF] text-[#1717E8]">
                        <Stethoscope size={17} />
                      </div>

                      <div className="min-w-0">

                        <p className="truncate text-[10.5px] font-extrabold text-[#344C65]">
                          {item.patient?.fullName ||
                            "Patient"}
                        </p>

                        <p className="mt-1 text-[8.5px] text-[#8998A8]">
                          Dr.{" "}
                          {item.doctor?.user?.fullName ||
                            "Doctor"}{" "}
                          •{" "}
                          {item.appointmentType}
                        </p>
                      </div>
                    </div>

                    <span className="text-[8.5px] font-semibold text-[#98A5B3]">
                      {formatDate(
                        item.appointmentDate,
                        true,
                      )}
                    </span>
                  </div>
                ),
              )}
            </div>
          )}
        </section>

        {/* PROFILE */}

        <section className="relative overflow-hidden rounded-[22px] bg-[linear-gradient(145deg,#0C2B50,#164B87)] p-6 text-white shadow-[0_16px_38px_rgba(13,37,75,0.12)]">

          <div className="absolute -right-20 -top-20 h-60 w-60 rounded-full border-[34px] border-white/[0.04]" />

          <div className="relative">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-[9px] font-extrabold uppercase tracking-[0.13em] !text-cyan-200">
                  Hospital Profile
                </p>

                <h3 className="mt-1 font-[Manrope] text-[17px] font-extrabold !text-white">
                  Administration
                </h3>
              </div>

              <div className="grid h-10 w-10 place-items-center rounded-[12px] bg-white/10 text-cyan-200">
                <Hospital size={19} />
              </div>
            </div>

            <div className="mt-6">

              <p className="font-[Manrope] text-[21px] font-extrabold !text-white">
                {hospital?.name ||
                  "Hospital"}
              </p>

              <p className="mt-1 text-[10px] !text-blue-200">
                {hospital?.city ||
                  "Healthcare Facility"}
              </p>
            </div>

            <div className="mt-6 space-y-3">

              <ProfileRow
                icon={ShieldCheck}
                label="Administrator"
                value={
                  profile?.fullName ||
                  "Hospital Admin"
                }
              />

              <ProfileRow
                icon={Building2}
                label="Address"
                value={
                  hospital?.address ||
                  "Not set"
                }
              />

              <ProfileRow
                icon={Stethoscope}
                label="Active Doctors"
                value={String(
                  stats.activeDoctors || 0,
                )}
              />
            </div>

            <div className="mt-6 flex items-center gap-2 border-t border-white/10 pt-5">

              <CheckCircle2
                size={14}
                className={
                  profile?.isVerified
                    ? "text-emerald-300"
                    : "text-amber-300"
                }
              />

              <span className="text-[9px] font-semibold !text-blue-100">
                {profile?.isVerified
                  ? "Administrator verified"
                  : "Verification pending"}
              </span>
            </div>
          </div>
        </section>
      </div>

      {/* WORKSPACE */}

      <section>

        <div className="mb-4">

          <p className="text-[9px] font-extrabold uppercase tracking-[0.13em] text-[#1717E8]">
            Hospital Tools
          </p>

          <h3 className="mt-1 font-[Manrope] text-[16px] font-extrabold text-[#1C344F]">
            Operations Workspace
          </h3>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">

          <WorkspaceCard
            icon={Stethoscope}
            title="Appointments"
            description="Review patient appointments."
            to="/appointment"
          />

          <WorkspaceCard
            icon={Droplets}
            title="Blood Requests"
            description="Review current blood requests."
            to="/bloodRequest"
            danger
          />

          <WorkspaceCard
            icon={HeartPulse}
            title="Blood Network"
            description="Access donor information."
            to="/blood-donor"
          />

          <WorkspaceCard
            icon={Hospital}
            title="Hospital"
            description="Monitor hospital operations."
            to="/dashboard"
          />

          <WorkspaceCard
            icon={Sparkles}
            title="SAHARA AI"
            description="Healthcare AI assistance."
            to="/ai-bot"
            featured
          />
        </div>
      </section>
    </div>
  );
};

const StatusChip = ({
  icon: Icon,
  label,
  active,
  activeText,
  inactiveText,
}) => (
  <div className="inline-flex items-center gap-2 rounded-[11px] bg-white/10 px-3 py-2">

    <Icon
      size={13}
      className={
        active
          ? "text-emerald-300"
          : "text-slate-300"
      }
    />

    <span className="text-[9px] font-bold !text-blue-100">
      {label}:
    </span>

    <span className="text-[9px] font-extrabold !text-white">
      {active
        ? activeText
        : inactiveText}
    </span>
  </div>
);

const HeroMetric = ({
  label,
  value,
}) => (
  <div className="rounded-[15px] border border-white/15 bg-white/[0.10] p-4 backdrop-blur">

    <p className="font-[Manrope] text-[20px] font-extrabold !text-white">
      {value}
    </p>

    <p className="mt-1 text-[8.5px] font-semibold !text-blue-100">
      {label}
    </p>
  </div>
);

const BedBlock = ({
  label,
  total,
  available,
  icon: Icon,
  accent,
  occupiedMode = false,
}) => {
  const percentage =
    total > 0
      ? Math.min(
          Math.round(
            (Number(available) /
              Number(total)) *
              100,
          ),
          100,
        )
      : 0;

  const styles = {
    blue: {
      icon:
        "bg-[#EEF2FF] text-[#1717E8]",
      bar:
        "bg-[#1717E8]",
    },

    violet: {
      icon:
        "bg-violet-50 text-violet-600",
      bar:
        "bg-violet-500",
    },

    rose: {
      icon:
        "bg-rose-50 text-rose-600",
      bar:
        "bg-rose-500",
    },

    amber: {
      icon:
        "bg-amber-50 text-amber-600",
      bar:
        "bg-amber-500",
    },
  };

  const current =
    styles[accent] ||
    styles.blue;

  return (
    <div className="rounded-[17px] border border-[#E1E8F0] bg-[#FAFCFE] p-4">

      <div className="flex items-start justify-between gap-3">

        <div
          className={`grid h-10 w-10 place-items-center rounded-[12px] ${current.icon}`}
        >
          <Icon size={18} />
        </div>

        <p className="font-[Manrope] text-[16px] font-extrabold text-[#203A55]">
          {available}
          <span className="text-[10px] font-bold text-[#9AA7B4]">
            /{total}
          </span>
        </p>
      </div>

      <p className="mt-4 text-[10px] font-extrabold text-[#435A73]">
        {label}
      </p>

      <div className="mt-3 h-[6px] overflow-hidden rounded-full bg-[#E9EFF5]">

        <div
          className={`h-full rounded-full ${current.bar}`}
          style={{
            width: `${percentage}%`,
          }}
        />
      </div>

      <p className="mt-2 text-[8.5px] text-[#96A4B2]">
        {occupiedMode
          ? `${percentage}% currently occupied`
          : `${percentage}% available`}
      </p>
    </div>
  );
};

const BloodCard = ({
  group,
  value,
}) => (
  <div className="rounded-[16px] border border-[#E4EAF1] bg-[#FAFCFE] p-4 text-center transition hover:-translate-y-0.5 hover:border-rose-200 hover:bg-rose-50/30">

    <div className="mx-auto grid h-9 w-9 place-items-center rounded-full bg-rose-50 text-[10px] font-extrabold text-rose-600">
      {group}
    </div>

    <p className="mt-3 font-[Manrope] text-[17px] font-extrabold text-[#263E59]">
      {value}
    </p>

    <p className="mt-0.5 text-[8px] font-bold uppercase tracking-[0.08em] text-[#9AA7B5]">
      units
    </p>
  </div>
);

const ProfileRow = ({
  icon: Icon,
  label,
  value,
}) => (
  <div className="flex items-center gap-3 rounded-[12px] bg-white/[0.07] px-3 py-3">

    <div className="grid h-8 w-8 shrink-0 place-items-center rounded-[9px] bg-white/10 text-cyan-200">
      <Icon size={14} />
    </div>

    <div className="min-w-0">

      <p className="text-[8px] font-bold uppercase tracking-[0.09em] !text-blue-200">
        {label}
      </p>

      <p className="mt-0.5 truncate text-[9.5px] font-bold !text-white">
        {value}
      </p>
    </div>
  </div>
);

const WorkspaceCard = ({
  icon: Icon,
  title,
  description,
  to,
  featured = false,
  danger = false,
}) => (
  <Link
    to={to}
    className={`group rounded-[19px] border p-5 transition-all duration-250 hover:-translate-y-0.5 hover:shadow-[0_16px_34px_rgba(20,46,79,0.08)] ${
      featured
        ? "border-[#1717E8] bg-[#1717E8]"
        : danger
          ? "border-red-200 bg-red-50/40"
          : "border-[#DFE8F1] bg-white"
    }`}
  >

    <div
      className={`grid h-11 w-11 place-items-center rounded-[13px] ${
        featured
          ? "bg-white/15 text-white"
          : danger
            ? "bg-red-100 text-red-600"
            : "bg-[#EEF2FF] text-[#1717E8]"
      }`}
    >
      <Icon size={19} />
    </div>

    <p
      className={`mt-4 text-[11px] font-extrabold ${
        featured
          ? "!text-white"
          : danger
            ? "!text-red-700"
            : "!text-[#304861]"
      }`}
    >
      {title}
    </p>

    <p
      className={`mt-1 text-[9px] leading-5 ${
        featured
          ? "!text-blue-100"
          : danger
            ? "!text-red-500"
            : "!text-[#8796A6]"
      }`}
    >
      {description}
    </p>

    <div
      className={`mt-4 inline-flex items-center gap-1 text-[8.5px] font-extrabold ${
        featured
          ? "!text-white"
          : danger
            ? "!text-red-600"
            : "!text-[#1717E8]"
      }`}
    >
      <span
        className={
          featured
            ? "!text-white"
            : danger
              ? "!text-red-600"
              : "!text-[#1717E8]"
        }
      >
        Open
      </span>

      <ArrowUpRight size={11} />
    </div>
  </Link>
);

export default HospitalAdminDashboard;