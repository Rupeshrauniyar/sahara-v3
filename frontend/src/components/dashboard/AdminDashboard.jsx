import {
  Activity,
  Building2,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Droplets,
  HeartPulse,
  LoaderCircle,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  UserCheck,
  UsersRound,
} from "lucide-react";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import StatCard from "./StatCard";
import QuickAction from "./QuickAction";

import {
  apiRequest,
} from "../../utils/api";

/* =========================================================
   HELPERS
========================================================= */

const formatRelativeTime = (
  value,
) => {
  if (!value) {
    return "Recently";
  }

  const date =
    new Date(value);

  const now =
    new Date();

  const seconds =
    Math.floor(
      (now - date) /
        1000,
    );

  if (seconds < 60) {
    return "Just now";
  }

  const minutes =
    Math.floor(
      seconds / 60,
    );

  if (minutes < 60) {
    return `${minutes}m ago`;
  }

  const hours =
    Math.floor(
      minutes / 60,
    );

  if (hours < 24) {
    return `${hours}h ago`;
  }

  const days =
    Math.floor(
      hours / 24,
    );

  return `${days}d ago`;
};

const getActivityIcon = (
  action = "",
) => {
  const value =
    action.toLowerCase();

  if (
    value.includes(
      "blood",
    )
  ) {
    return Droplets;
  }

  if (
    value.includes(
      "appointment",
    )
  ) {
    return Clock3;
  }

  if (
    value.includes(
      "doctor",
    )
  ) {
    return Stethoscope;
  }

  if (
    value.includes(
      "hospital",
    )
  ) {
    return Building2;
  }

  return Activity;
};

/* =========================================================
   ADMIN DASHBOARD
========================================================= */

const AdminDashboard = ({
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

  useEffect(() => {
    const loadDashboard =
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
              "Unable to load administrator dashboard.",
          );
        } finally {
          setLoading(false);
        }
      };

    loadDashboard();
  }, []);

  const stats =
    overview?.stats || {};

  const usersByRole =
    overview?.usersByRole ||
    {};

  const pending =
    overview?.pendingVerificationList ||
    [];

  const activity =
    overview?.recentActivity ||
    [];

  const profile =
    overview?.user ||
    user;

  const totalUsers =
    Number(
      stats.totalUsers ||
        0,
    );

  const roleData =
    useMemo(
      () => [
        {
          label:
            "Patients",

          value:
            usersByRole.Patient ||
            0,

          icon:
            UsersRound,

          accent:
            "bg-[#EEF2FF] text-[#1717E8]",
        },

        {
          label:
            "Doctors",

          value:
            usersByRole.Doctor ||
            0,

          icon:
            Stethoscope,

          accent:
            "bg-cyan-50 text-cyan-600",
        },

        {
          label:
            "Hospital Admins",

          value:
            usersByRole.HospitalAdmin ||
            0,

          icon:
            Building2,

          accent:
            "bg-violet-50 text-violet-600",
        },

        {
          label:
            "Administrators",

          value:
            usersByRole.Admin ||
            0,

          icon:
            ShieldCheck,

          accent:
            "bg-amber-50 text-amber-600",
        },
      ],
      [usersByRole],
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
            Loading SAHARA Command Center...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[1500px] space-y-6">

      {/* =====================================================
          ERROR
      ===================================================== */}

      {error && (
        <div className="rounded-[16px] border border-red-200 bg-red-50 px-5 py-4 text-[11px] font-semibold text-red-700">
          {error}
        </div>
      )}

      {/* =====================================================
          ADMIN HERO
      ===================================================== */}

      <section className="relative overflow-hidden rounded-[26px] bg-[radial-gradient(circle_at_80%_20%,rgba(76,137,255,0.34),transparent_28%),linear-gradient(135deg,#081C3A_0%,#0F2D68_52%,#1717E8_130%)] p-6 text-white shadow-[0_24px_55px_rgba(14,38,77,0.17)] sm:p-8">

        <div className="absolute -right-24 -top-28 h-80 w-80 rounded-full border-[45px] border-white/[0.04]" />

        <div className="absolute bottom-[-100px] right-[18%] h-64 w-64 rounded-full bg-[#1717E8]/20 blur-3xl" />

        <div className="relative flex flex-col justify-between gap-8 xl:flex-row xl:items-center">

          <div className="max-w-[670px]">

            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.08] px-3 py-2">

              <ShieldCheck
                size={14}
                className="text-cyan-200"
              />

              <span className="text-[9px] font-extrabold uppercase tracking-[0.14em] text-blue-100">
                Administrator Access
              </span>
            </div>

            <h2 className="mt-5 font-[Manrope] text-[29px] font-extrabold tracking-[-0.045em] sm:text-[36px]">
              SAHARA Command Center
            </h2>

            <p className="mt-3 max-w-[620px] text-[12px] leading-6 text-blue-100/75">
              Monitor the healthcare network, registrations,
              doctors, hospitals and platform activity from one
              central workspace.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">

              <div className="inline-flex items-center gap-2 rounded-[11px] bg-white/10 px-3 py-2 text-[9.5px] font-bold text-blue-50">

                <Activity
                  size={13}
                  className="text-emerald-300"
                />

                Platform operational
              </div>

              <div className="inline-flex items-center gap-2 rounded-[11px] bg-white/10 px-3 py-2 text-[9.5px] font-bold text-blue-50">

                <UserCheck
                  size={13}
                  className="text-cyan-200"
                />

                {
                  stats.pendingVerifications ||
                  0
                }{" "}
                pending reviews
              </div>
            </div>
          </div>

          <div className="grid min-w-[250px] grid-cols-2 gap-3">

            <HeroMetric
              label="Users"
              value={
                stats.totalUsers ||
                0
              }
            />

            <HeroMetric
              label="Hospitals"
              value={
                stats.totalHospitals ||
                0
              }
            />

            <HeroMetric
              label="Doctors"
              value={
                stats.totalDoctors ||
                0
              }
            />

            <HeroMetric
              label="Reviews"
              value={
                stats.pendingVerifications ||
                0
              }
            />
          </div>
        </div>
      </section>

      {/* =====================================================
          STATS
      ===================================================== */}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

        <StatCard
          icon={UsersRound}
          label="Total Users"
          value={String(
            stats.totalUsers ||
              0,
          )}
          accent="blue"
          helper="Registered SAHARA accounts"
        />

        <StatCard
          icon={Building2}
          label="Hospitals"
          value={String(
            stats.totalHospitals ||
              0,
          )}
          accent="violet"
          helper="Healthcare facilities"
        />

        <StatCard
          icon={Stethoscope}
          label="Doctors"
          value={String(
            stats.totalDoctors ||
              0,
          )}
          accent="cyan"
          helper="Doctor profiles"
        />

        <StatCard
          icon={UserCheck}
          label="Pending Verification"
          value={String(
            stats.pendingVerifications ||
              0,
          )}
          accent="amber"
          helper="Doctor & hospital reviews"
        />
      </section>

      {/* =====================================================
          MAIN GRID
      ===================================================== */}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.55fr)_minmax(320px,0.75fr)]">

        {/* Pending */}

        <section className="overflow-hidden rounded-[22px] border border-[#DFE8F1] bg-white shadow-[0_12px_34px_rgba(23,47,78,0.045)]">

          <div className="flex items-center justify-between border-b border-[#EDF2F7] px-5 py-5 sm:px-6">

            <div>
              <p className="text-[9px] font-extrabold uppercase tracking-[0.13em] text-[#1717E8]">
                Verification Queue
              </p>

              <h3 className="mt-1 font-[Manrope] text-[16px] font-extrabold text-[#1C344F]">
                Pending Verifications
              </h3>
            </div>

            <span className="rounded-full bg-amber-50 px-3 py-1.5 text-[9px] font-extrabold text-amber-600">
              {
                pending.length
              }{" "}
              waiting
            </span>
          </div>

          {pending.length ===
          0 ? (
            <div className="px-6 py-14 text-center">

              <div className="mx-auto grid h-14 w-14 place-items-center rounded-[16px] bg-emerald-50 text-emerald-600">

                <CheckCircle2
                  size={23}
                />
              </div>

              <p className="mt-4 text-[12px] font-extrabold text-[#304861]">
                Verification queue is clear
              </p>

              <p className="mt-1 text-[10px] text-[#8897A7]">
                There are no pending doctor or hospital accounts.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-[#EDF2F7]">

              {pending.map(
                (item) => {
                  const isDoctor =
                    item.role ===
                    "Doctor";

                  const Icon =
                    isDoctor
                      ? Stethoscope
                      : Building2;

                  return (
                    <div
                      key={
                        item._id ||
                        item.id
                      }
                      className="flex flex-col gap-4 px-5 py-4 transition hover:bg-[#FAFCFF] sm:flex-row sm:items-center sm:justify-between sm:px-6"
                    >

                      <div className="flex min-w-0 items-center gap-3">

                        <div
                          className={`grid h-11 w-11 shrink-0 place-items-center rounded-[13px] ${
                            isDoctor
                              ? "bg-cyan-50 text-cyan-600"
                              : "bg-violet-50 text-violet-600"
                          }`}
                        >
                          <Icon
                            size={19}
                          />
                        </div>

                        <div className="min-w-0">

                          <p className="truncate text-[11.5px] font-extrabold text-[#2B425C]">
                            {
                              item.fullName ||
                              "Account"
                            }
                          </p>

                          <div className="mt-1 flex flex-wrap items-center gap-2 text-[9px] text-[#8998A8]">

                            <span>
                              {
                                item.role
                              }
                            </span>

                            <span>
                              •
                            </span>

                            <span className="truncate">
                              {
                                item.email
                              }
                            </span>

                            {item.createdAt && (
                              <>
                                <span>
                                  •
                                </span>

                                <span>
                                  {formatRelativeTime(
                                    item.createdAt,
                                  )}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <span className="inline-flex self-start items-center gap-1.5 rounded-[9px] bg-amber-50 px-3 py-2 text-[8.5px] font-extrabold text-amber-700 sm:self-center">

                        <Clock3
                          size={12}
                        />

                        Awaiting review
                      </span>
                    </div>
                  );
                },
              )}
            </div>
          )}
        </section>

        {/* Quick actions */}

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
              icon={
                Stethoscope
              }
              title="Doctor Network"
              description="Review doctors and medical professionals"
              to="/doctor"
              variant="primary"
            />

            <QuickAction
              icon={Droplets}
              title="Blood Network"
              description="Monitor requests and donor activity"
              to="/bloodRequest"
            />

            <QuickAction
              icon={
                Sparkles
              }
              title="SAHARA AI"
              description="Open the healthcare AI assistant"
              to="/ai-bot"
            />
          </div>
        </section>
      </div>

      {/* =====================================================
          ROLE DISTRIBUTION + ACTIVITY
      ===================================================== */}

      <div className="grid gap-6 lg:grid-cols-2">

        {/* Role distribution */}

        <section className="rounded-[22px] border border-[#DFE8F1] bg-white p-5 shadow-[0_12px_34px_rgba(23,47,78,0.045)] sm:p-6">

          <div>
            <p className="text-[9px] font-extrabold uppercase tracking-[0.13em] text-[#1717E8]">
              Platform Users
            </p>

            <h3 className="mt-1 font-[Manrope] text-[16px] font-extrabold text-[#1C344F]">
              Users by Role
            </h3>

            <p className="mt-1 text-[9.5px] text-[#8998A8]">
              Account distribution across the SAHARA network.
            </p>
          </div>

          <div className="mt-6 space-y-5">

            {roleData.map(
              (item) => (
                <RoleRow
                  key={
                    item.label
                  }
                  {...item}
                  total={
                    totalUsers
                  }
                />
              ),
            )}
          </div>
        </section>

        {/* Activity */}

        <section className="overflow-hidden rounded-[22px] border border-[#DFE8F1] bg-white shadow-[0_12px_34px_rgba(23,47,78,0.045)]">

          <div className="border-b border-[#EDF2F7] px-5 py-5 sm:px-6">

            <p className="text-[9px] font-extrabold uppercase tracking-[0.13em] text-[#1717E8]">
              Live Feed
            </p>

            <h3 className="mt-1 font-[Manrope] text-[16px] font-extrabold text-[#1C344F]">
              Recent Platform Activity
            </h3>
          </div>

          {activity.length ===
          0 ? (
            <div className="px-6 py-14 text-center">

              <Activity
                size={24}
                className="mx-auto text-[#B3BFCA]"
              />

              <p className="mt-3 text-[10px] font-semibold text-[#8998A8]">
                No recent platform activity.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-[#EDF2F7]">

              {activity.map(
                (item) => {
                  const Icon =
                    getActivityIcon(
                      item.action,
                    );

                  return (
                    <div
                      key={
                        item.id ||
                        `${item.action}-${item.time}`
                      }
                      className="flex gap-3 px-5 py-4 sm:px-6"
                    >

                      <div className="relative">

                        <div className="grid h-10 w-10 place-items-center rounded-[12px] bg-[#F1F5FF] text-[#1717E8]">

                          <Icon
                            size={17}
                          />
                        </div>

                        <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-500" />
                      </div>

                      <div className="min-w-0 flex-1">

                        <p className="text-[10.5px] font-extrabold text-[#344C65]">
                          {
                            item.action
                          }
                        </p>

                        <div className="mt-1 flex items-center justify-between gap-3">

                          <span className="truncate text-[9px] text-[#8998A8]">
                            {
                              item.user
                            }
                          </span>

                          <span className="shrink-0 text-[8.5px] font-semibold text-[#A0ADBA]">
                            {formatRelativeTime(
                              item.time,
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                },
              )}
            </div>
          )}
        </section>
      </div>

      {/* =====================================================
          ADMIN PROFILE
      ===================================================== */}

      <section className="flex flex-col justify-between gap-5 rounded-[22px] border border-[#DDE6F1] bg-[linear-gradient(120deg,#FFFFFF,#F3F6FF)] p-5 sm:flex-row sm:items-center sm:p-6">

        <div className="flex items-center gap-4">

          <div className="grid h-13 w-13 h-[52px] w-[52px] place-items-center rounded-[15px] bg-[#1717E8] text-white shadow-[0_12px_26px_rgba(23,23,232,0.2)]">

            <ShieldCheck
              size={23}
            />
          </div>

          <div>

            <p className="text-[9px] font-extrabold uppercase tracking-[0.12em] text-[#1717E8]">
              Platform Administrator
            </p>

            <p className="mt-1 font-[Manrope] text-[15px] font-extrabold text-[#203A55]">
              {
                profile?.fullName ||
                "Administrator"
              }
            </p>

            <p className="mt-0.5 text-[9.5px] text-[#8393A4]">
              {
                profile?.email ||
                ""
              }
            </p>
          </div>
        </div>

        <div className="inline-flex items-center gap-2 self-start rounded-full bg-emerald-50 px-3 py-2 text-[9px] font-extrabold text-emerald-600 sm:self-center">

          <CheckCircle2
            size={13}
          />

          Administrator session active
        </div>
      </section>
    </div>
  );
};

/* =========================================================
   HERO METRIC
========================================================= */

const HeroMetric = ({
  label,
  value,
}) => (
  <div className="rounded-[15px] border border-white/10 bg-white/[0.08] p-4 backdrop-blur">

    <p className="font-[Manrope] text-[21px] font-extrabold">
      {value}
    </p>

    <p className="mt-1 text-[8.5px] font-semibold text-blue-100/65">
      {label}
    </p>
  </div>
);

/* =========================================================
   ROLE ROW
========================================================= */

const RoleRow = ({
  label,
  value,
  total,
  icon: Icon,
  accent,
}) => {
  const percent =
    total > 0
      ? Math.round(
          (Number(value) /
            total) *
            100,
        )
      : 0;

  return (
    <div>

      <div className="mb-2.5 flex items-center justify-between gap-4">

        <div className="flex items-center gap-3">

          <div
            className={`grid h-9 w-9 place-items-center rounded-[11px] ${accent}`}
          >
            <Icon
              size={16}
            />
          </div>

          <div>

            <p className="text-[10px] font-extrabold text-[#435B73]">
              {label}
            </p>

            <p className="mt-0.5 text-[8.5px] text-[#99A6B4]">
              {percent}% of accounts
            </p>
          </div>
        </div>

        <span className="font-[Manrope] text-[13px] font-extrabold text-[#203A55]">
          {Number(
            value,
          ).toLocaleString()}
        </span>
      </div>

      <div className="h-[6px] overflow-hidden rounded-full bg-[#EEF2F6]">

        <div
          className="h-full rounded-full bg-[#1717E8] transition-all duration-500"
          style={{
            width: `${percent}%`,
          }}
        />
      </div>
    </div>
  );
};

export default AdminDashboard;