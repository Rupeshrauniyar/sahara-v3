import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import {
  Activity,
  ArrowUpRight,
  CalendarDays,
  CheckCircle2,
  Clock3,
  DollarSign,
  Droplets,
  HeartPulse,
  Hospital,
  LoaderCircle,
  Sparkles,
  Stethoscope,
  UserRound,
  UsersRound,
  Video,
} from "lucide-react";

import StatCard from "./StatCard";
import QuickAction from "./QuickAction";

import {
  apiRequest,
  formatDate,
} from "../../utils/api";

const STATUS_STYLES = {
  Pending: "bg-amber-50 text-amber-700",
  Confirmed: "bg-emerald-50 text-emerald-700",
  Completed: "bg-blue-50 text-blue-700",
  Cancelled: "bg-slate-100 text-slate-600",
  Rejected: "bg-rose-50 text-rose-700",
};

const DoctorDashboard = ({ user }) => {
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
            "Unable to load doctor dashboard.",
        );
      } finally {
        setLoading(false);
      }
    };

    loadOverview();
  }, []);

  const stats = overview?.stats || {};
  const profile = overview?.user || user;
  const doctorProfile = overview?.doctorProfile;

  const todaySchedule =
    overview?.todaySchedule || [];

  const weeklyCounts =
    overview?.weeklyCounts || [];

  const maxWeeklyCount = useMemo(
    () =>
      Math.max(
        ...weeklyCounts.map(
          (item) =>
            Number(item.count || 0),
        ),
        1,
      ),
    [weeklyCounts],
  );

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
            Loading doctor workspace...
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

      {!doctorProfile && (
        <div className="rounded-[16px] border border-amber-200 bg-amber-50 px-5 py-4 text-[11px] font-semibold text-amber-800">
          Doctor profile not found. Complete your doctor registration to see full dashboard data.
        </div>
      )}

      {/* HERO */}

      <section className="relative overflow-hidden rounded-[26px] bg-[radial-gradient(circle_at_85%_25%,rgba(77,137,255,0.24),transparent_28%),linear-gradient(135deg,#0C2B50_0%,#164B87_55%,#3156E7_130%)] p-6 text-white shadow-[0_24px_55px_rgba(14,38,77,0.15)] sm:p-8">

        <div className="absolute -right-24 -top-28 h-80 w-80 rounded-full border-[45px] border-white/[0.04]" />

        <div className="relative flex flex-col justify-between gap-8 xl:flex-row xl:items-center">

          <div className="max-w-[700px]">

            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.08] px-3 py-2">

              <Stethoscope
                size={14}
                className="text-cyan-200"
              />

              <span className="!text-white text-[9px] font-extrabold uppercase tracking-[0.14em]">
                Doctor Workspace
              </span>
            </div>

            <h2 className="mt-5 font-[Manrope] text-[28px] font-extrabold tracking-[-0.045em] !text-white sm:text-[36px]">
              Welcome, Dr.{" "}
              {profile?.fullName || "Doctor"}
            </h2>

            <p className="mt-3 max-w-[620px] text-[12px] leading-6 !text-blue-100">
              Manage today's consultations, monitor appointment activity and access SAHARA healthcare tools from one workspace.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">

              <div className="inline-flex items-center gap-2 rounded-[11px] bg-white/10 px-3 py-2">

                <Activity
                  size={13}
                  className={
                    stats.isAvailable
                      ? "text-emerald-300"
                      : "text-slate-300"
                  }
                />

                <span className="!text-white text-[9.5px] font-bold">
                  {stats.isAvailable
                    ? "Accepting patients"
                    : "Currently unavailable"}
                </span>
              </div>

              {doctorProfile?.specialization && (
                <div className="inline-flex items-center gap-2 rounded-[11px] bg-white/10 px-3 py-2">

                  <Stethoscope
                    size={13}
                    className="text-cyan-200"
                  />

                  <span className="!text-white text-[9.5px] font-bold">
                    {doctorProfile.specialization}
                  </span>
                </div>
              )}

              {doctorProfile?.hospital?.name && (
                <div className="inline-flex items-center gap-2 rounded-[11px] bg-white/10 px-3 py-2">

                  <Hospital
                    size={13}
                    className="text-blue-200"
                  />

                  <span className="!text-white text-[9.5px] font-bold">
                    {doctorProfile.hospital.name}
                  </span>
                </div>
              )}
            </div>

            <div className="mt-6 flex flex-wrap gap-3">

              <Link
                to="/appointment"
                className="inline-flex min-h-[44px] items-center gap-2 rounded-[12px] bg-white px-4 text-[10px] font-extrabold shadow-sm transition hover:bg-[#F4F7FF]"
              >
                <CalendarDays
                  size={15}
                  className="text-[#1717E8]"
                />

                <span className="!text-[#10233F]">
                  View Appointments
                </span>
              </Link>

              <Link
                to="/ai-bot"
                className="inline-flex min-h-[44px] items-center gap-2 rounded-[12px] border border-white/20 bg-white/10 px-4 text-[10px] font-extrabold transition hover:bg-white/15"
              >
                <Sparkles
                  size={15}
                  className="text-white"
                />

                <span className="!text-white">
                  Ask SAHARA AI
                </span>
              </Link>
            </div>
          </div>

          <div className="min-w-[250px] rounded-[19px] border border-white/15 bg-white/[0.10] p-5 backdrop-blur">

            <p className="text-[9px] font-extrabold uppercase tracking-[0.13em] !text-blue-100">
              Availability Status
            </p>

            <div className="mt-4 flex items-center justify-between gap-4">

              <div>

                <p className="font-[Manrope] text-[20px] font-extrabold !text-white">
                  {stats.isAvailable
                    ? "Available"
                    : "Unavailable"}
                </p>

                <p className="mt-1 text-[9px] !text-blue-100">
                  Appointment visibility
                </p>
              </div>

              <div
                className={`grid h-12 w-12 place-items-center rounded-[14px] ${
                  stats.isAvailable
                    ? "bg-emerald-400/15 text-emerald-300"
                    : "bg-white/10 text-slate-300"
                }`}
              >
                {stats.isAvailable ? (
                  <CheckCircle2 size={22} />
                ) : (
                  <Clock3 size={22} />
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

        <StatCard
          icon={UsersRound}
          label="Patients Today"
          value={String(
            stats.patientsToday || 0,
          )}
          trend={`${stats.pendingAppointments || 0} pending`}
          accent="blue"
          helper="Today's active schedule"
        />

        <StatCard
          icon={CalendarDays}
          label="Appointments This Week"
          value={String(
            stats.appointmentsThisWeek || 0,
          )}
          accent="cyan"
          helper="Weekly consultation load"
        />

        <StatCard
          icon={Video}
          label="Virtual Fee"
          value={`Rs. ${
            stats.virtualConsultationFee || 0
          }`}
          accent="violet"
          helper="Virtual consultation"
        />

        <StatCard
          icon={DollarSign}
          label="Physical Fee"
          value={`Rs. ${
            stats.consultationFee || 0
          }`}
          accent="amber"
          helper="Physical consultation"
        />
      </section>

      {/* SCHEDULE + ACTIONS */}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.55fr)_minmax(320px,0.75fr)]">

        <section className="overflow-hidden rounded-[22px] border border-[#DFE8F1] bg-white shadow-[0_12px_34px_rgba(23,47,78,0.045)]">

          <div className="flex items-center justify-between border-b border-[#EDF2F7] px-5 py-5 sm:px-6">

            <div>
              <p className="text-[9px] font-extrabold uppercase tracking-[0.13em] text-[#1717E8]">
                Today's Workflow
              </p>

              <h3 className="mt-1 font-[Manrope] text-[16px] font-extrabold text-[#1C344F]">
                Today's Schedule
              </h3>

              <p className="mt-1 text-[9.5px] text-[#8998A8]">
                Your upcoming patient consultations.
              </p>
            </div>

            <Link
              to="/appointment"
              className="inline-flex items-center gap-1.5 text-[9.5px] font-extrabold !text-[#1717E8]"
            >
              <span className="!text-[#1717E8]">
                View all
              </span>

              <ArrowUpRight
                size={13}
                className="text-[#1717E8]"
              />
            </Link>
          </div>

          {todaySchedule.length === 0 ? (
            <div className="px-6 py-14 text-center">

              <div className="mx-auto grid h-16 w-16 place-items-center rounded-[19px] bg-[#EEF2FF] text-[#1717E8]">
                <CalendarDays size={25} />
              </div>

              <p className="mt-4 text-[12px] font-extrabold text-[#304861]">
                No appointments today
              </p>

              <p className="mt-1 text-[9.5px] text-[#8998A8]">
                Your schedule is currently clear.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-[#EDF2F7]">

              {todaySchedule.map(
                (item) => (
                  <div
                    key={item._id}
                    className="flex flex-col gap-4 px-5 py-4 transition hover:bg-[#FAFCFF] sm:flex-row sm:items-center sm:justify-between sm:px-6"
                  >

                    <div className="flex min-w-0 items-center gap-3">

                      <div className="grid h-11 w-11 shrink-0 place-items-center rounded-[13px] bg-[#EEF2FF] text-[10px] font-extrabold text-[#1717E8]">
                        {getInitials(
                          item.patient?.fullName ||
                            "Patient",
                        )}
                      </div>

                      <div className="min-w-0">

                        <p className="truncate text-[11.5px] font-extrabold text-[#2B425C]">
                          {item.patient?.fullName ||
                            "Patient"}
                        </p>

                        <p className="mt-1 text-[9px] text-[#8998A8]">
                          {formatDate(
                            item.appointmentDate,
                            true,
                          )}{" "}
                          •{" "}
                          {item.appointmentType}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`inline-flex self-start rounded-full px-3 py-1.5 text-[8.5px] font-extrabold sm:self-center ${
                        STATUS_STYLES[item.status] ||
                        "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>
                ),
              )}
            </div>
          )}
        </section>

        {/* QUICK ACTIONS */}

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
              icon={CalendarDays}
              title="View Appointments"
              description="Manage patient appointments"
              to="/appointment"
              variant="primary"
            />

            <QuickAction
              icon={Droplets}
              title="Blood Donors"
              description="Find available blood donors"
              to="/blood-donor"
            />

            <QuickAction
              icon={HeartPulse}
              title="Blood Requests"
              description="Review active blood requests"
              to="/bloodRequest"
              variant="danger"
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

      {/* WEEKLY + PROFILE */}

      <div className="grid gap-6 lg:grid-cols-2">

        <section className="rounded-[22px] border border-[#DFE8F1] bg-white p-5 shadow-[0_12px_34px_rgba(23,47,78,0.045)] sm:p-6">

          <div className="flex items-start justify-between gap-4">

            <div>
              <p className="text-[9px] font-extrabold uppercase tracking-[0.13em] text-[#1717E8]">
                Appointment Activity
              </p>

              <h3 className="mt-1 font-[Manrope] text-[16px] font-extrabold text-[#1C344F]">
                Weekly Overview
              </h3>

              <p className="mt-1 text-[9.5px] text-[#8998A8]">
                Consultation activity across this week.
              </p>
            </div>

            <Link
              to="/appointment"
              className="grid h-9 w-9 place-items-center rounded-[11px] bg-[#EEF2FF] text-[#1717E8]"
            >
              <ArrowUpRight size={15} />
            </Link>
          </div>

          {weeklyCounts.length === 0 ? (
            <div className="flex h-[190px] items-center justify-center text-[10px] font-semibold text-[#99A7B5]">
              No weekly appointment data.
            </div>
          ) : (
            <div className="mt-7 flex h-[190px] items-end gap-3">

              {weeklyCounts.map(
                (item) => {
                  const height =
                    Number(item.count || 0) > 0
                      ? Math.max(
                          (Number(item.count) /
                            maxWeeklyCount) *
                            100,
                          12,
                        )
                      : 4;

                  return (
                    <div
                      key={item.label}
                      className="flex h-full flex-1 flex-col items-center justify-end gap-2"
                    >

                      <span className="text-[8px] font-bold text-[#708298]">
                        {item.count}
                      </span>

                      <div className="flex h-[135px] w-full items-end justify-center rounded-[10px] bg-[#F5F7FB] px-1">

                        <div
                          className="w-full max-w-[42px] rounded-t-[8px] bg-[linear-gradient(180deg,#4A6BFF,#1717E8)] transition-all duration-500"
                          style={{
                            height: `${height}%`,
                          }}
                        />
                      </div>

                      <span className="text-[8.5px] font-bold text-[#8C9AAA]">
                        {item.label}
                      </span>
                    </div>
                  );
                },
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
                  Professional Profile
                </p>

                <h3 className="mt-1 font-[Manrope] text-[17px] font-extrabold !text-white">
                  Doctor Profile
                </h3>
              </div>

              <div className="grid h-10 w-10 place-items-center rounded-[12px] bg-white/10 text-cyan-200">
                <Stethoscope size={19} />
              </div>
            </div>

            <div className="mt-6 flex items-center gap-4">

              <div className="grid h-14 w-14 place-items-center rounded-[16px] bg-white/10 text-[13px] font-extrabold !text-white ring-1 ring-white/10">
                {getInitials(
                  profile?.fullName,
                )}
              </div>

              <div>
                <p className="font-[Manrope] text-[19px] font-extrabold !text-white">
                  {profile?.fullName ||
                    "Doctor"}
                </p>

                <p className="mt-1 text-[10px] font-semibold !text-blue-200">
                  {doctorProfile?.specialization ||
                    "Medical Professional"}
                </p>
              </div>
            </div>

            <div className="mt-6 space-y-3">

              <ProfileRow
                icon={UserRound}
                label="Email"
                value={
                  profile?.email ||
                  "Not provided"
                }
              />

              <ProfileRow
                icon={Activity}
                label="Experience"
                value={
                  doctorProfile?.experience !==
                  undefined
                    ? `${doctorProfile.experience} years`
                    : "Not set"
                }
              />

              <ProfileRow
                icon={Hospital}
                label="Practice"
                value={
                  doctorProfile?.hospital?.name ||
                  doctorProfile?.practiceType ||
                  "Independent"
                }
              />
            </div>

            <div className="mt-6 flex items-center justify-between gap-4 border-t border-white/10 pt-5">

              <div className="flex items-center gap-2">

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
                    ? "Credentials verified"
                    : "Verification pending"}
                </span>
              </div>

              <Link
                to="/doctor"
                className="inline-flex items-center gap-1.5 rounded-[10px] bg-white px-3 py-2 text-[8.5px] font-extrabold shadow-sm"
              >
                <span className="!text-[#10233F]">
                  Manage Profile
                </span>

                <ArrowUpRight
                  size={12}
                  className="text-[#1717E8]"
                />
              </Link>
            </div>
          </div>
        </section>
      </div>

      {/* WORKSPACE */}

      <section>

        <div className="mb-4">

          <p className="text-[9px] font-extrabold uppercase tracking-[0.13em] text-[#1717E8]">
            Tools
          </p>

          <h3 className="mt-1 font-[Manrope] text-[16px] font-extrabold text-[#1C344F]">
            Doctor Workspace
          </h3>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">

          <WorkspaceCard
            icon={CalendarDays}
            title="Appointments"
            description="Manage patient appointments."
            to="/appointment"
          />

          <WorkspaceCard
            icon={Droplets}
            title="Blood Donors"
            description="Find active blood donors."
            to="/blood-donor"
          />

          <WorkspaceCard
            icon={HeartPulse}
            title="Blood Requests"
            description="Review active requests."
            to="/bloodRequest"
            danger
          />

          <WorkspaceCard
            icon={Stethoscope}
            title="My Profile"
            description="Review your doctor profile."
            to="/doctor"
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

const getInitials = (name) => {
  if (!name) {
    return "DR";
  }

  return name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
};

export default DoctorDashboard;