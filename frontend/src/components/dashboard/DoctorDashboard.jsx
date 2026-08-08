import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import StatCard from "./StatCard";
import QuickAction from "./QuickAction";
import { apiRequest, formatDate } from "../../utils/api";

const STATUS_STYLES = {
  Pending: "bg-amber-50 text-amber-700",
  Confirmed: "bg-emerald-50 text-emerald-700",
  Completed: "bg-blue-50 text-blue-700",
  InProgress: "bg-blue-50 text-blue-700",
  Waiting: "bg-amber-50 text-amber-700",
  Scheduled: "bg-slate-100 text-slate-600",
};

const DoctorDashboard = ({ user }) => {
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadOverview = async () => {
      try {
        const data = await apiRequest("/dashboard/overview");
        setOverview(data?.overview || null);
      } catch (err) {
        setError(
          err?.message ||
            "Unable to load dashboard data."
        );
      } finally {
        setLoading(false);
      }
    };

    loadOverview();
  }, []);

  const stats = overview?.stats;
  const profile = overview?.user || user;
  const doctorProfile = overview?.doctorProfile;
  const todaySchedule =
    overview?.todaySchedule || [];
  const weeklyCounts =
    overview?.weeklyCounts || [];

  const maxWeeklyCount = Math.max(
    ...weeklyCounts.map(
      (item) => item.count
    ),
    1
  );

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white mx-auto flex items-center justify-center font-black animate-pulse">
            S
          </div>

          <p className="text-sm font-semibold text-slate-700 mt-3">
            Loading dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {error && (
        <div className="mb-6 rounded-xl bg-red-50 border border-red-200 px-5 py-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {!doctorProfile && (
        <div className="mb-6 rounded-xl bg-amber-50 border border-amber-200 px-5 py-4 text-sm text-amber-800">
          Doctor profile not found. Complete your
          doctor registration to see full dashboard
          data.
        </div>
      )}

      {/* Availability */}

      <section className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-sm mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-sm text-slate-500">
              Availability Status
            </p>

            <p className="text-xl font-bold text-slate-900 mt-1">
              {stats?.isAvailable
                ? "Accepting patients"
                : "Currently unavailable"}
            </p>

            {doctorProfile?.specialization && (
              <p className="text-sm text-slate-500 mt-1">
                {doctorProfile.specialization}
              </p>
            )}
          </div>

          <span
            className={`inline-flex self-start px-4 py-2 rounded-full text-xs font-semibold ${
              stats?.isAvailable
                ? "bg-emerald-50 text-emerald-700"
                : "bg-slate-100 text-slate-600"
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full mr-2 ${
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

      {/* Statistics */}

      <section className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <StatCard
          icon="👥"
          label="Patients Today"
          value={String(
            stats?.patientsToday ?? 0
          )}
          trend={`${stats?.pendingAppointments ?? 0} pending`}
        />

        <StatCard
          icon="📅"
          label="This Week"
          value={String(
            stats?.appointmentsThisWeek ?? 0
          )}
          accent="blue"
        />

        <StatCard
          icon="💻"
          label="Virtual Fee"
          value={`Rs. ${
            stats?.virtualConsultationFee ?? 0
          }`}
          accent="amber"
        />

        <StatCard
          icon="💰"
          label="Physical Fee"
          value={`Rs. ${
            stats?.consultationFee ?? 0
          }`}
          accent="violet"
        />
      </section>

      {/* Schedule + Actions */}

      <div className="grid lg:grid-cols-3 gap-6 mb-6">
        <section className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="font-bold text-slate-900">
                Today's Schedule
              </h2>

              <p className="text-xs text-slate-400 mt-1">
                Your upcoming patient visits
              </p>
            </div>

            <Link
              to="/appointment"
              className="text-sm text-blue-600 font-semibold hover:text-blue-700"
            >
              View all
            </Link>
          </div>

          {todaySchedule.length === 0 ? (
            <div className="px-6 py-14 text-center">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 mx-auto flex items-center justify-center text-xl">
                📅
              </div>

              <p className="text-sm font-bold text-slate-800 mt-4">
                No appointments today
              </p>

              <p className="text-xs text-slate-400 mt-1">
                Your schedule is clear for today.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {todaySchedule.map((item) => (
                <div
                  key={item._id}
                  className="px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-semibold text-sm">
                      {getInitials(
                        item.patient?.fullName ||
                          "Patient"
                      )}
                    </div>

                    <div>
                      <p className="font-semibold text-slate-900">
                        {item.patient?.fullName ||
                          "Patient"}
                      </p>

                      <p className="text-sm text-slate-500">
                        {formatDate(
                          item.appointmentDate,
                          true
                        )}{" "}
                        •{" "}
                        {item.appointmentType}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`self-start sm:self-center text-xs font-semibold px-3 py-1.5 rounded-full ${
                      STATUS_STYLES[item.status] ||
                      "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {item.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="space-y-3">
          <h2 className="font-bold text-slate-900 px-1">
            Quick Actions
          </h2>

          <QuickAction
            icon="📋"
            title="View Appointments"
            description="Manage patient appointments"
            to="/appointment"
            variant="primary"
          />

          <QuickAction
            icon="🩸"
            title="Blood Donors"
            description="Find available blood donors"
            to="/blood-donor"
          />

          <QuickAction
            icon="🚨"
            title="Blood Requests"
            description="View active blood requests"
            to="/blood-request"
          />

          <QuickAction
            icon="✦"
            title="AI Assistant"
            description="Healthcare support from Sahara AI"
            to="/ai-bot"
          />
        </section>
      </div>

      {/* Weekly + Profile */}

      <section className="grid lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-bold text-slate-900">
                Weekly Overview
              </h3>

              <p className="text-xs text-slate-400 mt-1">
                Appointment activity this week
              </p>
            </div>

            <Link
              to="/appointment"
              className="text-xs font-bold text-blue-600"
            >
              View →
            </Link>
          </div>

          {weeklyCounts.length === 0 ? (
            <div className="h-28 flex items-center justify-center text-sm text-slate-400">
              No weekly data available.
            </div>
          ) : (
            <div className="flex items-end gap-3 h-32">
              {weeklyCounts.map((item) => (
                <div
                  key={item.label}
                  className="flex-1 h-full flex flex-col items-center justify-end gap-2"
                >
                  <div className="w-full h-24 flex items-end justify-center">
                    <div
                      className="w-full max-w-[44px] bg-blue-500 rounded-t-lg transition-all"
                      style={{
                        height: `${Math.max(
                          (item.count /
                            maxWeeklyCount) *
                            100,
                          item.count ? 12 : 4
                        )}%`,
                      }}
                    />
                  </div>

                  <span className="text-[10px] text-slate-400">
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-2xl bg-[#071f3d] p-6 text-white relative overflow-hidden">
          <div className="absolute -right-16 -top-16 w-48 h-48 rounded-full bg-blue-400/10" />

          <div className="relative">
            <p className="text-blue-300 text-xs uppercase tracking-[0.16em] font-bold">
              Doctor Profile
            </p>

            <div className="flex items-center gap-4 mt-4">
              <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center text-lg font-black">
                {getInitials(
                  profile?.fullName
                )}
              </div>

              <div>
                <p className="text-xl font-black">
                  {profile?.fullName ||
                    "Doctor"}
                </p>

                <p className="text-blue-200 text-sm">
                  {doctorProfile?.specialization ||
                    "Medical Professional"}
                </p>
              </div>
            </div>

            <p className="text-blue-100 text-sm mt-4">
              {profile?.email}
            </p>

            {doctorProfile?.hospital?.name && (
              <p className="text-blue-100 text-sm mt-1">
                {doctorProfile.hospital.name}
              </p>
            )}

            <div className="flex items-center justify-between mt-6">
              <p className="text-xs text-blue-200">
                {profile?.isVerified
                  ? "✓ Credentials verified"
                  : "Verification pending"}
              </p>

              <Link
                to="/profile"
                className="px-4 py-2 rounded-xl bg-white text-slate-900 text-xs font-bold hover:bg-blue-50 transition"
              >
                Manage profile
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Doctor workspace */}

      <section>
        <div className="mb-4">
          <h2 className="font-bold text-slate-900">
            Doctor Workspace
          </h2>

          <p className="text-xs text-slate-400 mt-1">
            Everything you need from your Sahara
            workspace.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 xl:grid-cols-5 gap-4">
          <WorkspaceCard
            icon="📅"
            title="Appointments"
            description="Manage patient appointments."
            to="/appointment"
          />

          <WorkspaceCard
            icon="🩸"
            title="Blood Donors"
            description="Find available blood donors."
            to="/blood-donor"
          />

          <WorkspaceCard
            icon="🚨"
            title="Blood Requests"
            description="View active blood requests."
            to="/blood-request"
          />

          <WorkspaceCard
            icon="👨‍⚕️"
            title="My Profile"
            description="Manage your professional profile."
            to="/profile"
          />

          <WorkspaceCard
            icon="✦"
            title="Sahara AI"
            description="AI-powered healthcare assistance."
            to="/ai-bot"
            featured
          />
        </div>
      </section>
    </div>
  );
};

const WorkspaceCard = ({
  icon,
  title,
  description,
  to,
  featured = false,
}) => {
  return (
    <Link
      to={to}
      className={`group rounded-2xl border p-5 transition hover:-translate-y-0.5 hover:shadow-lg ${
        featured
          ? "bg-blue-600 border-blue-600 text-white"
          : "bg-white border-slate-200"
      }`}
    >
      <div
        className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${
          featured
            ? "bg-white/15"
            : "bg-slate-100"
        }`}
      >
        {icon}
      </div>

      <h3
        className={`font-bold mt-4 ${
          featured
            ? "text-white"
            : "text-slate-900"
        }`}
      >
        {title}
      </h3>

      <p
        className={`text-xs leading-5 mt-1 ${
          featured
            ? "text-blue-100"
            : "text-slate-500"
        }`}
      >
        {description}
      </p>

      <span
        className={`inline-block mt-4 text-[10px] font-bold ${
          featured
            ? "text-blue-100"
            : "text-blue-600"
        }`}
      >
        Open →
      </span>
    </Link>
  );
};

const getInitials = (name) => {
  if (!name) return "DR";

  return name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
};

export default DoctorDashboard;