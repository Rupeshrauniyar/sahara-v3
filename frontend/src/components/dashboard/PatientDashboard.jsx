import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import StatCard from "./StatCard";
import QuickAction from "./QuickAction";
import { apiRequest, formatDate } from "../../utils/api";

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
        const data = await apiRequest("/dashboard/overview");
        setOverview(data.overview);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadOverview();
  }, []);

  const stats = overview?.stats;
  const profile = overview?.user || user;
  const upcomingAppointments = overview?.upcomingAppointments || [];

  if (loading) {
    return <DashboardLoading label="Loading your dashboard..." />;
  }

  return (
    <div className="space-y-8">
      {error && (
        <div className="rounded-2xl bg-rose-50 border border-rose-200 px-5 py-4 text-sm text-rose-700">
          {error}
        </div>
      )}

      {!profile.isVerified && (
        <div className="rounded-2xl bg-amber-50 border border-amber-200 px-5 py-4 flex items-start gap-3">
          <span className="text-xl">⚠️</span>
          <div>
            <p className="font-semibold text-amber-900">Account not verified</p>
            <p className="text-sm text-amber-700 mt-1">
              Complete your profile verification to unlock all healthcare services.
            </p>
          </div>
        </div>
      )}

      <section className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          icon="📅"
          label="Upcoming Appointments"
          value={String(stats?.upcomingAppointments ?? 0)}
          trend={`${stats?.appointmentsThisWeek ?? 0} this week`}
        />
        <StatCard
          icon="🩸"
          label="Open Blood Requests"
          value={String(stats?.openBloodRequests ?? 0)}
          accent="rose"
          trend={`${stats?.totalBloodRequests ?? 0} total`}
        />
        <StatCard
          icon="🏥"
          label="Hospitals Visited"
          value={String(stats?.hospitalsVisited ?? 0)}
          accent="violet"
        />
        <StatCard
          icon="🩸"
          label="Blood Group"
          value={stats?.bloodGroup || profile.bloodGroup || "—"}
          accent="rose"
        />
      </section>

      <div className="grid lg:grid-cols-3 gap-6">
        <section className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
            <h2 className="font-bold text-slate-900">Upcoming Appointments</h2>
            <Link to="/appointment" className="text-sm text-emerald-600 font-medium">
              View all
            </Link>
          </div>

          {upcomingAppointments.length === 0 ? (
            <div className="px-6 py-10 text-center text-sm text-slate-500">
              No upcoming appointments yet.{" "}
              <Link to="/appointment" className="text-emerald-600 font-semibold">
                Book one now
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {upcomingAppointments.map((appt) => (
                <div
                  key={appt._id}
                  className="px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div>
                    <p className="font-semibold text-slate-900">
                      Dr. {appt.doctor?.user?.fullName || "Doctor"}
                    </p>
                    <p className="text-sm text-slate-500">
                      {appt.doctor?.specialization || "General consultation"}
                    </p>
                    <p className="text-sm text-slate-400 mt-1">
                      {formatDate(appt.appointmentDate, true)} • {appt.appointmentType}
                    </p>
                  </div>

                  <span
                    className={`self-start sm:self-center text-xs font-semibold px-3 py-1 rounded-full ${
                      STATUS_STYLES[appt.status] || "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {appt.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="space-y-3">
          <h2 className="font-bold text-slate-900 px-1">Quick Actions</h2>

          <QuickAction
            icon="📅"
            title="Book Appointment"
            description="Schedule a visit with a doctor"
            to="/appointment"
            variant="primary"
          />

          <QuickAction
            icon="👨‍⚕️"
            title="Find Doctors"
            description="Search by specialty or hospital"
            to="/appointment"
          />

          <QuickAction
            icon="🩸"
            title="Blood Request"
            description="Request blood when you need it"
            to="/bloodRequest"
          />

          <QuickAction
            icon="❤️"
            title="Blood Donor"
            description="Register as a blood donor"
            to="/blood-donor"
          />

          <QuickAction
            icon="✦"
            title="AI Assistant"
            description="Get health guidance instantly"
            to="/ai-bot"
          />
        </section>
      </div>

      <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <h2 className="font-bold text-slate-900 mb-4">Your Profile</h2>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
          <ProfileField label="Full name" value={profile.fullName || user.fullName} />
          <ProfileField label="Email" value={profile.email || user.email} />
          <ProfileField label="Phone" value={profile.phone || user.phone} />
          <ProfileField label="City" value={profile.city || user.city || "Not set"} />
          <ProfileField
            label="Verification"
            value={profile.isVerified ? "Verified" : "Pending"}
            highlight={profile.isVerified}
          />
        </div>
      </section>
    </div>
  );
};

const ProfileField = ({ label, value, highlight }) => (
  <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
    <p className="text-slate-500 text-xs font-medium uppercase tracking-wide">{label}</p>
    <p
      className={`mt-1 font-semibold truncate ${
        highlight ? "text-emerald-700" : "text-slate-900"
      }`}
    >
      {value}
    </p>
  </div>
);

const DashboardLoading = ({ label }) => (
  <div className="rounded-2xl bg-white border border-slate-200 p-10 text-center">
    <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
    <p className="text-slate-500 mt-4 text-sm">{label}</p>
  </div>
);

export default PatientDashboard;
