import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import {
  Activity,
  ArrowUpRight,
  CalendarDays,
  CheckCircle2,
  Droplets,
  HeartPulse,
  Hospital,
  LoaderCircle,
  MapPin,
  Phone,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  UserRound,
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

const PatientDashboard = ({ user }) => {
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
            "Unable to load patient dashboard.",
        );
      } finally {
        setLoading(false);
      }
    };

    loadOverview();
  }, []);

  const stats = overview?.stats || {};

  const profile =
    overview?.user || user;

  const upcomingAppointments =
    overview?.upcomingAppointments || [];

  const recentBloodRequests =
    overview?.recentBloodRequests || [];

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
            Loading your healthcare dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[1500px] space-y-6">

      {/* ERROR */}

      {error && (
        <div className="rounded-[16px] border border-red-200 bg-red-50 px-5 py-4 text-[11px] font-semibold text-red-700">
          {error}
        </div>
      )}

      {/* VERIFICATION */}

      {!profile?.isVerified && (
        <div className="flex items-start gap-3 rounded-[17px] border border-amber-200 bg-amber-50 px-5 py-4">

          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-[12px] bg-amber-100 text-amber-700">
            <ShieldCheck size={19} />
          </div>

          <div>
            <p className="text-[11px] font-extrabold text-amber-900">
              Account verification pending
            </p>

            <p className="mt-1 text-[9.5px] leading-5 text-amber-700">
              Complete your profile verification to unlock all SAHARA healthcare services.
            </p>
          </div>
        </div>
      )}

      {/* HERO */}

      <section className="relative overflow-hidden rounded-[26px] bg-[radial-gradient(circle_at_82%_18%,rgba(79,137,255,0.22),transparent_27%),linear-gradient(135deg,#0C2B50_0%,#164B87_55%,#3156E7_130%)] p-6 text-white shadow-[0_24px_55px_rgba(14,38,77,0.14)] sm:p-8">

        <div className="absolute -right-24 -top-28 h-80 w-80 rounded-full border-[45px] border-white/[0.04]" />

        <div className="relative flex flex-col justify-between gap-7 xl:flex-row xl:items-center">

          <div className="max-w-[700px]">

            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.08] px-3 py-2">

              <HeartPulse
                size={14}
                className="text-cyan-200"
              />

              <span className="!text-white text-[9px] font-extrabold uppercase tracking-[0.14em]">
                Patient Healthcare Hub
              </span>
            </div>

            <h2 className="mt-5 font-[Manrope] text-[28px] font-extrabold tracking-[-0.045em] !text-white sm:text-[36px]">
              Welcome back,{" "}
              {profile?.fullName || "Patient"}
            </h2>

            <p className="mt-3 max-w-[620px] text-[12px] leading-6 !text-blue-100">
              Access appointments, doctors, blood support and SAHARA AI from one connected healthcare workspace.
            </p>

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
                  Book Appointment
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

          <div className="grid min-w-[250px] grid-cols-2 gap-3">

            <HeroMetric
              label="Appointments"
              value={stats.upcomingAppointments || 0}
            />

            <HeroMetric
              label="Blood Requests"
              value={stats.openBloodRequests || 0}
            />

            <HeroMetric
              label="Hospitals"
              value={stats.hospitalsVisited || 0}
            />

            <HeroMetric
              label="Blood Group"
              value={
                stats.bloodGroup ||
                profile?.bloodGroup ||
                "—"
              }
            />
          </div>
        </div>
      </section>

      {/* STATS */}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

        <StatCard
          icon={CalendarDays}
          label="Upcoming Appointments"
          value={String(
            stats.upcomingAppointments || 0,
          )}
          trend={`${stats.appointmentsThisWeek || 0} this week`}
          accent="blue"
          helper="Scheduled consultations"
        />

        <StatCard
          icon={HeartPulse}
          label="Open Blood Requests"
          value={String(
            stats.openBloodRequests || 0,
          )}
          accent="rose"
          helper={`${stats.totalBloodRequests || 0} total requests`}
        />

        <StatCard
          icon={Hospital}
          label="Hospitals Visited"
          value={String(
            stats.hospitalsVisited || 0,
          )}
          accent="violet"
          helper="From appointment history"
        />

        <StatCard
          icon={Droplets}
          label="Blood Group"
          value={
            stats.bloodGroup ||
            profile?.bloodGroup ||
            "—"
          }
          accent="rose"
          helper="Saved blood information"
        />
      </section>

      {/* APPOINTMENTS + ACTIONS */}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.55fr)_minmax(320px,0.75fr)]">

        <section className="overflow-hidden rounded-[22px] border border-[#DFE8F1] bg-white shadow-[0_12px_34px_rgba(23,47,78,0.045)]">

          <div className="flex items-center justify-between border-b border-[#EDF2F7] px-5 py-5 sm:px-6">

            <div>
              <p className="text-[9px] font-extrabold uppercase tracking-[0.13em] text-[#1717E8]">
                Care Schedule
              </p>

              <h3 className="mt-1 font-[Manrope] text-[16px] font-extrabold text-[#1C344F]">
                Upcoming Appointments
              </h3>

              <p className="mt-1 text-[9.5px] text-[#8998A8]">
                Your next consultations and visits.
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

          {upcomingAppointments.length === 0 ? (
            <div className="px-6 py-14 text-center">

              <div className="mx-auto grid h-16 w-16 place-items-center rounded-[19px] bg-[#EEF2FF] text-[#1717E8]">
                <CalendarDays size={25} />
              </div>

              <p className="mt-4 text-[12px] font-extrabold text-[#304861]">
                No upcoming appointments
              </p>

              <p className="mt-1 text-[9.5px] text-[#8998A8]">
                Book a doctor consultation when you need one.
              </p>

              <Link
                to="/appointment"
                className="mt-4 inline-flex items-center gap-2 rounded-[11px] bg-[#1717E8] px-4 py-2.5 text-[9px] font-extrabold !text-white shadow-[0_8px_20px_rgba(23,23,232,0.16)]"
              >
                <Stethoscope
                  size={14}
                  className="text-white"
                />

                <span className="!text-white">
                  Book Appointment
                </span>
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-[#EDF2F7]">

              {upcomingAppointments.map(
                (appointment) => (
                  <div
                    key={appointment._id}
                    className="flex flex-col gap-4 px-5 py-4 transition hover:bg-[#FAFCFF] sm:flex-row sm:items-center sm:justify-between sm:px-6"
                  >

                    <div className="flex min-w-0 items-center gap-3">

                      <div className="grid h-11 w-11 shrink-0 place-items-center rounded-[13px] bg-[#EEF2FF] text-[#1717E8]">
                        <Stethoscope size={19} />
                      </div>

                      <div className="min-w-0">

                        <p className="truncate text-[11.5px] font-extrabold text-[#2B425C]">
                          Dr.{" "}
                          {appointment.doctor?.user?.fullName ||
                            "Doctor"}
                        </p>

                        <p className="mt-1 text-[9px] font-semibold text-[#6F8296]">
                          {appointment.doctor?.specialization ||
                            "Medical consultation"}
                        </p>

                        <p className="mt-1 text-[8.5px] text-[#98A5B3]">
                          {formatDate(
                            appointment.appointmentDate,
                            true,
                          )}{" "}
                          •{" "}
                          {
                            appointment.appointmentType
                          }
                        </p>
                      </div>
                    </div>

                    <span
                      className={`inline-flex self-start rounded-full px-3 py-1.5 text-[8.5px] font-extrabold sm:self-center ${
                        STATUS_STYLES[
                          appointment.status
                        ] ||
                        "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {appointment.status}
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
              title="Book Appointment"
              description="Schedule a consultation with a doctor"
              to="/appointment"
              variant="primary"
            />

            <QuickAction
              icon={Stethoscope}
              title="Find Doctors"
              description="Search doctors by specialty"
              to="/doctor"
            />

            <QuickAction
              icon={HeartPulse}
              title="Blood Request"
              description="Request blood during urgent situations"
              to="/bloodRequest"
              variant="danger"
            />

            <QuickAction
              icon={Droplets}
              title="Become a Donor"
              description="Join the SAHARA blood donor network"
              to="/blood-donor"
            />

            <QuickAction
              icon={Sparkles}
              title="SAHARA AI"
              description="Get healthcare navigation assistance"
              to="/ai-bot"
            />
          </div>
        </section>
      </div>

      {/* BLOOD REQUESTS + PROFILE */}

      <div className="grid gap-6 lg:grid-cols-2">

        <section className="overflow-hidden rounded-[22px] border border-[#DFE8F1] bg-white shadow-[0_12px_34px_rgba(23,47,78,0.045)]">

          <div className="flex items-center justify-between border-b border-[#EDF2F7] px-5 py-5 sm:px-6">

            <div>
              <p className="text-[9px] font-extrabold uppercase tracking-[0.13em] text-rose-600">
                Blood Support
              </p>

              <h3 className="mt-1 font-[Manrope] text-[16px] font-extrabold text-[#1C344F]">
                Recent Blood Requests
              </h3>
            </div>

            <Link
              to="/bloodRequest"
              className="grid h-9 w-9 place-items-center rounded-[11px] bg-rose-50 text-rose-600"
            >
              <ArrowUpRight size={15} />
            </Link>
          </div>

          {recentBloodRequests.length === 0 ? (
            <div className="px-6 py-12 text-center">

              <Droplets
                size={25}
                className="mx-auto text-[#B3BFCA]"
              />

              <p className="mt-3 text-[10px] font-semibold text-[#8998A8]">
                No recent blood requests.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-[#EDF2F7]">

              {recentBloodRequests.map(
                (request) => (
                  <div
                    key={request._id}
                    className="flex items-center justify-between gap-4 px-5 py-4 sm:px-6"
                  >

                    <div className="flex min-w-0 items-center gap-3">

                      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-[12px] bg-rose-50 text-[11px] font-extrabold text-rose-600">
                        {request.bloodGroup || "?"}
                      </div>

                      <div className="min-w-0">

                        <p className="truncate text-[10.5px] font-extrabold text-[#344C65]">
                          {request.patientName ||
                            "Blood request"}
                        </p>

                        <p className="mt-1 text-[8.5px] text-[#8998A8]">
                          {request.unitsRequired || 0} unit(s) •{" "}
                          {request.urgency || "Medium"}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`rounded-full px-3 py-1.5 text-[8px] font-extrabold ${
                        request.status === "Open"
                          ? "bg-rose-50 text-rose-600"
                          : request.status ===
                              "Completed"
                            ? "bg-emerald-50 text-emerald-600"
                            : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {request.status}
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
                  Patient Profile
                </p>

                <h3 className="mt-1 font-[Manrope] text-[17px] font-extrabold !text-white">
                  Your Healthcare Details
                </h3>
              </div>

              <div className="grid h-10 w-10 place-items-center rounded-[12px] bg-white/10 text-cyan-200">
                <UserRound size={19} />
              </div>
            </div>

            <div className="mt-6 flex items-center gap-4">

              <div className="grid h-14 w-14 place-items-center rounded-[16px] bg-white/10 text-[13px] font-extrabold text-white ring-1 ring-white/10">
                {getInitials(
                  profile?.fullName,
                )}
              </div>

              <div>
                <p className="font-[Manrope] text-[19px] font-extrabold !text-white">
                  {profile?.fullName ||
                    "Patient"}
                </p>

                <p className="mt-1 text-[10px] font-semibold !text-blue-200">
                  SAHARA Patient
                </p>
              </div>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">

              <ProfileItem
                icon={Phone}
                label="Phone"
                value={
                  profile?.phone ||
                  "Not set"
                }
              />

              <ProfileItem
                icon={MapPin}
                label="City"
                value={
                  profile?.city ||
                  "Not set"
                }
              />

              <ProfileItem
                icon={Droplets}
                label="Blood Group"
                value={
                  profile?.bloodGroup ||
                  "Not set"
                }
              />

              <ProfileItem
                icon={ShieldCheck}
                label="Verification"
                value={
                  profile?.isVerified
                    ? "Verified"
                    : "Pending"
                }
              />
            </div>

            <div className="mt-6 flex items-center justify-between gap-3 border-t border-white/10 pt-5">

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
                    ? "Account verified"
                    : "Verification pending"}
                </span>
              </div>

              <Link
                to="/ai-bot"
                className="inline-flex items-center gap-1.5 rounded-[10px] bg-white px-3 py-2 text-[8.5px] font-extrabold shadow-sm"
              >
                <span className="!text-[#10233F]">
                  Health Assistant
                </span>

                <Sparkles
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
            Healthcare Tools
          </p>

          <h3 className="mt-1 font-[Manrope] text-[16px] font-extrabold text-[#1C344F]">
            Patient Workspace
          </h3>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">

          <WorkspaceCard
            icon={Stethoscope}
            title="Find Doctors"
            description="Explore available doctors."
            to="/doctor"
          />

          <WorkspaceCard
            icon={CalendarDays}
            title="Appointments"
            description="Book and manage consultations."
            to="/appointment"
          />

          <WorkspaceCard
            icon={HeartPulse}
            title="Blood Request"
            description="Create an urgent blood request."
            to="/bloodRequest"
            danger
          />

          <WorkspaceCard
            icon={Droplets}
            title="Blood Donor"
            description="Join or find donors."
            to="/blood-donor"
          />

          <WorkspaceCard
            icon={Sparkles}
            title="SAHARA AI"
            description="Healthcare guidance and navigation."
            to="/ai-bot"
            featured
          />
        </div>
      </section>
    </div>
  );
};

/* HERO METRIC */

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

/* PROFILE ITEM */

const ProfileItem = ({
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

/* WORKSPACE CARD */

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

/* INITIALS */

const getInitials = (
  name,
) => {
  if (!name) {
    return "PT";
  }

  return name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
};

export default PatientDashboard;