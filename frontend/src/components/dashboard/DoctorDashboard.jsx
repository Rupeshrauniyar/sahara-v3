import {
  useEffect,
  useState,
} from "react";

import {
  Link,
} from "react-router-dom";

import {
  CalendarDays,
  CircleDollarSign,
  Droplets,
  HeartPulse,
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

/* =========================================================
   STATUS STYLES
========================================================= */

const STATUS_STYLES = {
  Pending:
    "bg-amber-50 text-amber-700",

  Confirmed:
    "bg-emerald-50 text-emerald-700",

  Completed:
    "bg-blue-50 text-blue-700",

  InProgress:
    "bg-blue-50 text-blue-700",

  Waiting:
    "bg-amber-50 text-amber-700",

  Scheduled:
    "bg-slate-100 text-slate-600",

  Cancelled:
    "bg-slate-100 text-slate-600",

  Rejected:
    "bg-red-50 text-red-700",
};

/* =========================================================
   DOCTOR DASHBOARD
========================================================= */

const DoctorDashboard = ({
  user,
}) => {
  const [
    overview,
    setOverview,
  ] = useState(null);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");

  /* =====================================================
     LOAD OVERVIEW
  ===================================================== */

  useEffect(() => {
    const loadOverview =
      async () => {
        try {
          const data =
            await apiRequest(
              "/dashboard/overview",
            );

          setOverview(
            data?.overview ||
              null,
          );
        } catch (err) {
          setError(
            err?.message ||
              "Unable to load dashboard data.",
          );
        } finally {
          setLoading(false);
        }
      };

    loadOverview();
  }, []);

  /* =====================================================
     DATA
  ===================================================== */

  const stats =
    overview?.stats;

  const profile =
    overview?.user ||
    user;

  const doctorProfile =
    overview?.doctorProfile;

  const todaySchedule =
    overview?.todaySchedule ||
    [];

  const weeklyCounts =
    overview?.weeklyCounts ||
    [];

  const maxWeeklyCount =
    Math.max(
      ...weeklyCounts.map(
        (item) =>
          item.count,
      ),
      1,
    );

  /* =====================================================
     LOADING
  ===================================================== */

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">

        <div className="text-center">

          <div className="mx-auto grid h-11 w-11 animate-pulse place-items-center rounded-xl bg-[#1717E8] font-black text-white">
            S
          </div>

          <p className="mt-3 text-sm font-semibold text-[#526A82]">
            Loading dashboard...
          </p>
        </div>
      </div>
    );
  }

  /* =====================================================
     PAGE
  ===================================================== */

  return (
    <div className="w-full">

      {/* ERROR */}

      {error && (
        <div className="mb-6 rounded-[14px] border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-700">
          {error}
        </div>
      )}

      {/* PROFILE WARNING */}

      {!doctorProfile && (
        <div className="mb-6 rounded-[14px] border border-amber-200 bg-amber-50 px-5 py-4 text-sm font-medium text-amber-800">
          Doctor profile not found. Complete your doctor registration to see full dashboard data.
        </div>
      )}

      {/* =================================================
          HERO
      ================================================= */}

      <section className="relative mb-6 overflow-hidden rounded-[25px] bg-[radial-gradient(circle_at_85%_15%,rgba(255,255,255,0.15),transparent_28%),linear-gradient(135deg,#0D315B,#175693)] p-6 text-white shadow-[0_18px_46px_rgba(13,49,91,0.15)] sm:p-8">

        <div className="relative flex flex-col justify-between gap-7 lg:flex-row lg:items-end">

          <div>

            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-2">

              <Stethoscope
                size={14}
                className="text-cyan-200"
              />

              <span className="text-[8.5px] font-extrabold uppercase tracking-[0.13em] !text-white">
                Doctor Workspace
              </span>
            </div>

            <h2 className="mt-5 font-[Manrope] text-[30px] font-extrabold tracking-[-0.045em] !text-white sm:text-[37px]">
              Welcome back,{" "}
              {profile?.fullName ||
                "Doctor"}.
            </h2>

            <p className="mt-3 max-w-[620px] text-[10.5px] leading-6 !text-blue-100">
              Review today's schedule, patient requests, availability and your professional SAHARA workspace.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">

            <Link
              to="/doctor-appointments"
              className="inline-flex min-h-[45px] items-center gap-2 rounded-[12px] bg-white px-4 text-[9px] font-extrabold shadow-sm"
            >
              <CalendarDays
                size={14}
                className="text-[#1717E8]"
              />

              <span className="!text-[#18324E]">
                View Appointments
              </span>
            </Link>

            <Link
              to="/ai-bot"
              className="inline-flex min-h-[45px] items-center gap-2 rounded-[12px] border border-white/20 bg-white/10 px-4 text-[9px] font-extrabold !text-white backdrop-blur"
            >
              <Sparkles
                size={14}
                className="text-white"
              />

              <span className="!text-white">
                Ask SAHARA AI
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* =================================================
          AVAILABILITY
      ================================================= */}

      <section className="mb-6 rounded-[20px] border border-[#DFE7F0] bg-white p-5 shadow-[0_10px_30px_rgba(20,46,79,0.04)] sm:p-6">

        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">

          <div>

            <p className="text-[9px] font-extrabold uppercase tracking-[0.1em] text-[#93A1AF]">
              Availability Status
            </p>

            <p className="mt-1 font-[Manrope] text-[20px] font-extrabold text-[#203A55]">
              {stats?.isAvailable
                ? "Accepting patients"
                : "Currently unavailable"}
            </p>

            {doctorProfile?.specialization && (
              <p className="mt-1 text-[10px] font-semibold text-[#7D8FA1]">
                {
                  doctorProfile.specialization
                }
              </p>
            )}
          </div>

          <span
            className={`inline-flex self-start items-center rounded-full px-4 py-2 text-[9px] font-extrabold ${
              stats?.isAvailable
                ? "bg-emerald-50 text-emerald-700"
                : "bg-slate-100 text-slate-600"
            }`}
          >
            <span
              className={`mr-2 h-2 w-2 rounded-full ${
                stats?.isAvailable
                  ? "bg-emerald-500"
                  : "bg-slate-400"
              }`}
            />

            {stats?.isAvailable
              ? "Available"
              : "Unavailable"}
          </span>
        </div>
      </section>

      {/* =================================================
          STATISTICS
      ================================================= */}

      <section className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

        <StatCard
          icon={UsersRound}
          label="Patients Today"
          value={String(
            stats?.patientsToday ??
              0,
          )}
          trend={`${stats?.pendingAppointments ?? 0} pending`}
          accent="blue"
        />

        <StatCard
          icon={CalendarDays}
          label="This Week"
          value={String(
            stats?.appointmentsThisWeek ??
              0,
          )}
          accent="cyan"
        />

        <StatCard
          icon={Video}
          label="Virtual Fee"
          value={`Rs. ${
            stats?.virtualConsultationFee ??
            0
          }`}
          accent="amber"
        />

        <StatCard
          icon={CircleDollarSign}
          label="Physical Fee"
          value={`Rs. ${
            stats?.consultationFee ??
            0
          }`}
          accent="violet"
        />
      </section>

      {/* =================================================
          SCHEDULE + QUICK ACTIONS
      ================================================= */}

      <div className="mb-6 grid gap-6 lg:grid-cols-3">

        {/* SCHEDULE */}

        <section className="overflow-hidden rounded-[20px] border border-[#DFE7F0] bg-white shadow-[0_10px_30px_rgba(20,46,79,0.04)] lg:col-span-2">

          <div className="flex items-center justify-between border-b border-[#EDF2F7] px-5 py-5 sm:px-6">

            <div>

              <h2 className="font-[Manrope] text-[16px] font-extrabold text-[#263F59]">
                Today's Schedule
              </h2>

              <p className="mt-1 text-[9px] text-[#8998A8]">
                Your upcoming patient visits
              </p>
            </div>

            <Link
              to="/doctor-appointments"
              className="text-[9px] font-extrabold !text-[#1717E8]"
            >
              View all
            </Link>
          </div>

          {todaySchedule.length ===
          0 ? (
            <div className="px-6 py-14 text-center">

              <div className="mx-auto grid h-14 w-14 place-items-center rounded-[16px] bg-[#EEF2FF] text-[#1717E8]">

                <CalendarDays
                  size={23}
                />
              </div>

              <p className="mt-4 text-[11px] font-extrabold text-[#3E566F]">
                No appointments today
              </p>

              <p className="mt-1 text-[9px] text-[#8A99A9]">
                Your schedule is clear for today.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-[#EDF2F7]">

              {todaySchedule.map(
                (item) => (
                  <div
                    key={
                      item._id
                    }
                    className="flex flex-col justify-between gap-3 px-5 py-4 sm:flex-row sm:items-center sm:px-6"
                  >
                    <div className="flex items-center gap-4">

                      <div className="grid h-10 w-10 place-items-center rounded-full bg-[#EEF2FF] text-[10px] font-extrabold text-[#1717E8]">

                        {getInitials(
                          item.patient
                            ?.fullName ||
                            "Patient",
                        )}
                      </div>

                      <div>

                        <p className="text-[10.5px] font-extrabold text-[#314A64]">
                          {item.patient
                            ?.fullName ||
                            "Patient"}
                        </p>

                        <p className="mt-1 text-[9px] text-[#7D8EA0]">
                          {formatDate(
                            item.appointmentDate,
                            true,
                          )}{" "}
                          •{" "}
                          {
                            item.appointmentType
                          }
                        </p>
                      </div>
                    </div>

                    <span
                      className={`self-start rounded-full px-3 py-1.5 text-[8px] font-extrabold sm:self-center ${
                        STATUS_STYLES[
                          item.status
                        ] ||
                        "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {
                        item.status
                      }
                    </span>
                  </div>
                ),
              )}
            </div>
          )}
        </section>

        {/* QUICK ACTIONS */}

        <section className="space-y-3">

          <h2 className="px-1 font-[Manrope] text-[15px] font-extrabold text-[#29425D]">
            Quick Actions
          </h2>

          <QuickAction
            icon={
              CalendarDays
            }
            title="View Appointments"
            description="Manage patient appointments"
            to="/doctor-appointments"
            variant="primary"
          />

          <QuickAction
            icon={Droplets}
            title="Blood Donors"
            description="Find available blood donors"
            to="/blood-donor"
          />

          <QuickAction
            icon={
              HeartPulse
            }
            title="Blood Requests"
            description="View active blood requests"
            to="/bloodRequest"
          />

          <QuickAction
            icon={Sparkles}
            title="AI Assistant"
            description="Healthcare support from SAHARA AI"
            to="/ai-bot"
          />
        </section>
      </div>

      {/* =================================================
          WEEKLY + PROFILE
      ================================================= */}

      <section className="mb-6 grid gap-6 lg:grid-cols-2">

        {/* WEEKLY */}

        <div className="rounded-[20px] border border-[#DFE7F0] bg-white p-6 shadow-[0_10px_30px_rgba(20,46,79,0.04)]">

          <div className="mb-5 flex items-center justify-between">

            <div>

              <h3 className="font-[Manrope] text-[15px] font-extrabold text-[#29425D]">
                Weekly Overview
              </h3>

              <p className="mt-1 text-[9px] text-[#8998A8]">
                Appointment activity this week
              </p>
            </div>

            <Link
              to="/doctor-appointments"
              className="text-[9px] font-extrabold !text-[#1717E8]"
            >
              View →
            </Link>
          </div>

          {weeklyCounts.length ===
          0 ? (
            <div className="flex h-28 items-center justify-center text-[10px] text-[#8998A8]">
              No weekly data available.
            </div>
          ) : (
            <div className="flex h-32 items-end gap-3">

              {weeklyCounts.map(
                (item) => (
                  <div
                    key={
                      item.label
                    }
                    className="flex h-full flex-1 flex-col items-center justify-end gap-2"
                  >
                    <div className="flex h-24 w-full items-end justify-center">

                      <div
                        className="w-full max-w-[44px] rounded-t-lg bg-[#1717E8] transition-all"
                        style={{
                          height: `${Math.max(
                            (item.count /
                              maxWeeklyCount) *
                              100,
                            item.count
                              ? 12
                              : 4,
                          )}%`,
                        }}
                      />
                    </div>

                    <span className="text-[8px] text-[#8998A8]">
                      {
                        item.label
                      }
                    </span>
                  </div>
                ),
              )}
            </div>
          )}
        </div>

        {/* PROFILE */}

        <div className="relative overflow-hidden rounded-[20px] bg-[#0C2B50] p-6 text-white">

          <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-blue-400/10" />

          <div className="relative">

            <p className="text-[8px] font-extrabold uppercase tracking-[0.15em] !text-blue-200">
              Doctor Profile
            </p>

            <div className="mt-4 flex items-center gap-4">

              <div className="grid h-14 w-14 place-items-center rounded-[16px] bg-white/10 text-[13px] font-extrabold !text-white">

                {getInitials(
                  profile?.fullName,
                )}
              </div>

              <div>

                <p className="font-[Manrope] text-[19px] font-extrabold !text-white">
                  {profile?.fullName ||
                    "Doctor"}
                </p>

                <p className="mt-1 text-[9px] !text-blue-100">
                  {doctorProfile
                    ?.specialization ||
                    "Medical Professional"}
                </p>
              </div>
            </div>

            <p className="mt-4 text-[9px] !text-blue-100">
              {profile?.email ||
                "Email not available"}
            </p>

            {doctorProfile
              ?.hospital
              ?.name && (
              <p className="mt-1 text-[9px] !text-blue-100">
                {
                  doctorProfile
                    .hospital
                    .name
                }
              </p>
            )}

            <div className="mt-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">

              <p className="text-[8.5px] !text-blue-100">
                {profile?.isVerified
                  ? "✓ Credentials verified"
                  : "Verification pending"}
              </p>

              <Link
                to="/profile"
                className="inline-flex min-h-[38px] items-center justify-center rounded-[10px] bg-white px-4 text-[8.5px] font-extrabold"
              >
                <span className="!text-[#10233F]">
                  Manage Profile
                </span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* =================================================
          WORKSPACE
      ================================================= */}

      <section>

        <div className="mb-4">

          <h2 className="font-[Manrope] text-[15px] font-extrabold text-[#29425D]">
            Doctor Workspace
          </h2>

          <p className="mt-1 text-[9px] text-[#8998A8]">
            Everything you need from your SAHARA workspace.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">

          <WorkspaceCard
            icon={
              CalendarDays
            }
            title="Appointments"
            description="Manage patient appointments."
            to="/doctor-appointments"
          />

          <WorkspaceCard
            icon={Droplets}
            title="Blood Donors"
            description="Find available blood donors."
            to="/blood-donor"
          />

          <WorkspaceCard
            icon={
              HeartPulse
            }
            title="Blood Requests"
            description="View active blood requests."
            to="/bloodRequest"
          />

          <WorkspaceCard
            icon={UserRound}
            title="My Profile"
            description="Manage your professional profile."
            to="/profile"
          />

          <WorkspaceCard
            icon={Sparkles}
            title="SAHARA AI"
            description="AI-powered healthcare navigation."
            to="/ai-bot"
            featured
          />
        </div>
      </section>
    </div>
  );
};

/* =========================================================
   WORKSPACE CARD
========================================================= */

const WorkspaceCard = ({
  icon: Icon,
  title,
  description,
  to,
  featured = false,
}) => {
  return (
    <Link
      to={to}
      className={`group rounded-[18px] border p-5 transition hover:-translate-y-0.5 hover:shadow-lg ${
        featured
          ? "border-[#1717E8] bg-[#1717E8]"
          : "border-[#DFE7F0] bg-white"
      }`}
    >

      <div
        className={`grid h-10 w-10 place-items-center rounded-[11px] ${
          featured
            ? "bg-white/15 text-white"
            : "bg-[#EEF2FF] text-[#1717E8]"
        }`}
      >
        <Icon
          size={17}
        />
      </div>

      <h3
        className={`mt-4 text-[10.5px] font-extrabold ${
          featured
            ? "!text-white"
            : "!text-[#304861]"
        }`}
      >
        {title}
      </h3>

      <p
        className={`mt-1 text-[8.5px] leading-5 ${
          featured
            ? "!text-blue-100"
            : "text-[#8393A4]"
        }`}
      >
        {description}
      </p>

      <span
        className={`mt-4 inline-block text-[8px] font-extrabold ${
          featured
            ? "!text-blue-100"
            : "!text-[#1717E8]"
        }`}
      >
        Open →
      </span>
    </Link>
  );
};

/* =========================================================
   INITIALS
========================================================= */

const getInitials = (
  name,
) => {
  if (!name) {
    return "DR";
  }

  return name
    .split(" ")
    .filter(Boolean)
    .map(
      (part) =>
        part[0],
    )
    .join("")
    .slice(0, 2)
    .toUpperCase();
};

export default DoctorDashboard;