import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import StatCard from "./StatCard";
import QuickAction from "./QuickAction";
import { apiRequest, formatDate } from "../../utils/api";

const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

const HospitalAdminDashboard = ({ user }) => {
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
  const hospital = overview?.hospital;
  const bloodInventory = overview?.bloodInventory || {};
  const recentAppointments = overview?.recentAppointments || [];
  const profile = overview?.user || user;

  if (loading) {
    return <DashboardLoading label="Loading hospital dashboard..." />;
  }

  return (
    <div className="space-y-8">
      {error && (
        <div className="rounded-2xl bg-rose-50 border border-rose-200 px-5 py-4 text-sm text-rose-700">
          {error}
        </div>
      )}

      {!hospital && (
        <div className="rounded-2xl bg-amber-50 border border-amber-200 px-5 py-4 text-sm text-amber-800">
          No hospital is linked to your account yet. Register your hospital to see live stats here.
        </div>
      )}

      <div className="grid sm:grid-cols-3 gap-4">
        <ServicePill icon="🚨" label="Emergency" active={stats?.emergencyAvailable} />
        <ServicePill icon="🚑" label="Ambulance" active={stats?.ambulanceAvailable} />
        <ServicePill icon="🏥" label="Hospital Open" active={stats?.isOpen} />
      </div>

      <section className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          icon="🛏️"
          label="Bed Occupancy"
          value={`${stats?.bedOccupancy ?? 0}%`}
          trend={`${stats?.availableBeds ?? 0} available`}
        />
        <StatCard
          icon="👨‍⚕️"
          label="Active Doctors"
          value={String(stats?.activeDoctors ?? 0)}
          accent="blue"
        />
        <StatCard
          icon="🏥"
          label="Total Beds"
          value={String(stats?.totalBeds ?? 0)}
          accent="rose"
        />
        <StatCard
          icon="🩸"
          label="Blood Units"
          value={String(stats?.bloodUnits ?? 0)}
          accent="violet"
        />
      </section>

      <div className="grid lg:grid-cols-3 gap-6">
        <section className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <div className="px-6 py-5 border-b border-slate-100">
            <h2 className="font-bold text-slate-900">Bed Status</h2>
            <p className="text-sm text-slate-500 mt-1">
              {hospital?.name || "Hospital capacity overview"}
            </p>
          </div>

          <div className="p-6 grid sm:grid-cols-2 gap-4">
            <BedBlock
              label="General Beds"
              total={stats?.totalBeds || 0}
              available={stats?.availableBeds || 0}
              color="emerald"
            />
            <BedBlock
              label="ICU Beds"
              total={stats?.icuBeds || 0}
              available={stats?.icuBeds || 0}
              color="blue"
            />
            <BedBlock
              label="Emergency Beds"
              total={stats?.emergencyBeds || 0}
              available={stats?.emergencyBeds || 0}
              color="rose"
            />
            <BedBlock
              label="Occupied"
              total={stats?.totalBeds || 0}
              available={(stats?.totalBeds || 0) - (stats?.availableBeds || 0)}
              color="violet"
            />
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="font-bold text-slate-900 px-1">Quick Actions</h2>

          <QuickAction
            icon="📅"
            title="Appointments"
            description="View hospital appointments"
            to="/appointment"
            variant="primary"
          />

          <QuickAction
            icon="🩸"
            title="Blood Requests"
            description="Review blood request activity"
            to="/bloodRequest"
          />

          <QuickAction
            icon="🩸"
            title="Blood Inventory"
            description="Update blood stock levels"
            to="/blood-donor"
          />
        </section>
      </div>

      <section className="bg-white rounded-2xl border border-slate-200 shadow-sm">
        <div className="px-6 py-5 border-b border-slate-100">
          <h2 className="font-bold text-slate-900">Blood Inventory</h2>
        </div>

        <div className="p-6 grid grid-cols-4 sm:grid-cols-8 gap-3">
          {bloodGroups.map((group) => (
            <div
              key={group}
              className="text-center p-3 rounded-xl bg-slate-50 border border-slate-100"
            >
              <p className="text-xs font-semibold text-slate-500">{group}</p>
              <p className="text-lg font-bold text-slate-900 mt-1">
                {bloodInventory[group] ?? 0}
              </p>
              <p className="text-[10px] text-slate-400">units</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-white rounded-2xl border border-slate-200 shadow-sm">
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-bold text-slate-900">Recent Appointments</h2>
          <Link to="/appointment" className="text-sm text-emerald-600 font-medium">
            View all
          </Link>
        </div>

        {recentAppointments.length === 0 ? (
          <div className="px-6 py-10 text-center text-sm text-slate-500">
            No appointments recorded for this hospital yet.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {recentAppointments.map((item) => (
              <div
                key={item._id}
                className="px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
              >
                <div>
                  <p className="font-semibold text-slate-900">
                    {item.patient?.fullName || "Patient"}
                  </p>
                  <p className="text-sm text-slate-500">
                    Dr. {item.doctor?.user?.fullName || "Doctor"} • {item.appointmentType}
                  </p>
                </div>
                <span className="text-sm text-slate-400">
                  {formatDate(item.appointmentDate, true)}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="bg-violet-700 rounded-2xl p-6 text-white">
        <p className="text-violet-200 text-sm font-medium">Hospital Administrator</p>
        <p className="text-xl font-bold mt-1">{profile.fullName}</p>
        <p className="text-violet-100 text-sm mt-2">{profile.email}</p>
        {hospital?.name && (
          <p className="text-violet-100 text-sm mt-2">{hospital.name}</p>
        )}
      </section>
    </div>
  );
};

const ServicePill = ({ icon, label, active }) => (
  <div
    className={`flex items-center gap-3 px-4 py-3 rounded-2xl border ${
      active
        ? "bg-emerald-50 border-emerald-200 text-emerald-800"
        : "bg-slate-50 border-slate-200 text-slate-500"
    }`}
  >
    <span className="text-xl">{icon}</span>
    <div>
      <p className="font-semibold text-sm">{label}</p>
      <p className="text-xs opacity-70">{active ? "Active" : "Inactive"}</p>
    </div>
  </div>
);

const BedBlock = ({ label, total, available, color }) => {
  const used = Math.max(total - available, 0);
  const percent = total > 0 ? Math.round((used / total) * 100) : 0;

  const barColors = {
    emerald: "bg-emerald-500",
    blue: "bg-blue-500",
    rose: "bg-rose-500",
    violet: "bg-violet-500",
  };

  return (
    <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
      <div className="flex justify-between items-center mb-2">
        <p className="font-semibold text-slate-900 text-sm">{label}</p>
        <p className="text-xs text-slate-500">
          {available}/{total}
        </p>
      </div>
      <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${barColors[color]}`}
          style={{ width: `${percent}%` }}
        />
      </div>
      <p className="text-xs text-slate-400 mt-2">{percent}% occupied</p>
    </div>
  );
};

const DashboardLoading = ({ label }) => (
  <div className="rounded-2xl bg-white border border-slate-200 p-10 text-center">
    <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
    <p className="text-slate-500 mt-4 text-sm">{label}</p>
  </div>
);

export default HospitalAdminDashboard;
