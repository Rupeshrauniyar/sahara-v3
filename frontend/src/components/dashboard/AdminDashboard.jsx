import StatCard from "./StatCard";
import QuickAction from "./QuickAction";

const pendingVerifications = [
  { id: 1, name: "Dr. Nisha Adhikari", type: "Doctor", submitted: "2 days ago" },
  { id: 2, name: "Green Valley Hospital", type: "Hospital", submitted: "3 days ago" },
  { id: 3, name: "Dr. Hari Pokhrel", type: "Doctor", submitted: "5 days ago" },
];

const recentActivity = [
  { id: 1, action: "New patient registered", user: "Kamal BC", time: "10 min ago" },
  { id: 2, action: "Hospital profile updated", user: "City Care Hospital", time: "1 hr ago" },
  { id: 3, action: "Blood request fulfilled", user: "System", time: "2 hr ago" },
  { id: 4, action: "Doctor account verified", user: "Dr. Sita Sharma", time: "4 hr ago" },
];

const AdminDashboard = ({ user }) => {
  return (
    <div className="space-y-8">
      <div className="rounded-2xl bg-amber-50 border border-amber-200 px-5 py-4 flex items-start gap-3">
        <span className="text-xl">🛡️</span>
        <div>
          <p className="font-semibold text-amber-900">Administrator Access</p>
          <p className="text-sm text-amber-700 mt-1">
            You have full platform control. Manage users, hospitals, and system settings.
          </p>
        </div>
      </div>

      <section className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard icon="👥" label="Total Users" value="1,248" trend="+42 this month" />
        <StatCard icon="🏥" label="Hospitals" value="18" accent="violet" />
        <StatCard icon="👨‍⚕️" label="Doctors" value="156" accent="blue" />
        <StatCard icon="⏳" label="Pending Verifications" value="3" accent="amber" trendUp={false} />
      </section>

      <div className="grid lg:grid-cols-3 gap-6">
        <section className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
            <h2 className="font-bold text-slate-900">Pending Verifications</h2>
            <span className="text-sm text-amber-600 font-medium">Review all</span>
          </div>

          <div className="divide-y divide-slate-100">
            {pendingVerifications.map((item) => (
              <div
                key={item.id}
                className="px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div>
                  <p className="font-semibold text-slate-900">{item.name}</p>
                  <p className="text-sm text-slate-500">
                    {item.type} · Submitted {item.submitted}
                  </p>
                </div>

                <div className="flex gap-2 self-start sm:self-center">
                  <button
                    type="button"
                    className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition"
                  >
                    Approve
                  </button>
                  <button
                    type="button"
                    className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition"
                  >
                    Review
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="font-bold text-slate-900 px-1">Quick Actions</h2>

          <QuickAction
            icon="👥"
            title="Manage Users"
            description="View, edit, or deactivate accounts"
            to="/dashboard"
            variant="primary"
          />

          <QuickAction
            icon="🏥"
            title="Hospitals"
            description="Oversee hospital registrations"
            to="/doctor"
          />

          <QuickAction
            icon="📊"
            title="Platform Analytics"
            description="Usage stats and reports"
            to="/dashboard"
          />
        </section>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <section className="bg-white rounded-2xl border border-slate-200 shadow-sm">
          <div className="px-6 py-5 border-b border-slate-100">
            <h2 className="font-bold text-slate-900">Users by Role</h2>
          </div>

          <div className="p-6 space-y-4">
            <RoleBar label="Patients" count={980} total={1248} color="emerald" />
            <RoleBar label="Doctors" count={156} total={1248} color="blue" />
            <RoleBar label="Hospital Admins" count={18} total={1248} color="violet" />
            <RoleBar label="Administrators" count={4} total={1248} color="amber" />
          </div>
        </section>

        <section className="bg-white rounded-2xl border border-slate-200 shadow-sm">
          <div className="px-6 py-5 border-b border-slate-100">
            <h2 className="font-bold text-slate-900">Recent Activity</h2>
          </div>

          <div className="divide-y divide-slate-100">
            {recentActivity.map((item) => (
              <div key={item.id} className="px-6 py-4">
                <p className="font-medium text-slate-900 text-sm">{item.action}</p>
                <p className="text-sm text-slate-500 mt-0.5">
                  {item.user} · {item.time}
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className="bg-slate-900 rounded-2xl p-6 text-white">
        <p className="text-slate-400 text-sm font-medium">Platform Admin</p>
        <p className="text-xl font-bold mt-1">{user.fullName}</p>
        <p className="text-slate-300 text-sm mt-2">{user.email}</p>
      </section>
    </div>
  );
};

const RoleBar = ({ label, count, total, color }) => {
  const percent = Math.round((count / total) * 100);

  const colors = {
    emerald: "bg-emerald-500",
    blue: "bg-blue-500",
    violet: "bg-violet-500",
    amber: "bg-amber-500",
  };

  return (
    <div>
      <div className="flex justify-between text-sm mb-1.5">
        <span className="font-medium text-slate-700">{label}</span>
        <span className="text-slate-500">
          {count.toLocaleString()} ({percent}%)
        </span>
      </div>
      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${colors[color]}`} style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
};

export default AdminDashboard;
