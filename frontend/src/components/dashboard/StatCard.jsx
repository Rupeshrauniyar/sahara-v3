const StatCard = ({ icon, label, value, trend, trendUp = true, accent = "emerald" }) => {
  const accents = {
    emerald: "bg-emerald-50 text-emerald-700 border-emerald-100",
    blue: "bg-blue-50 text-blue-700 border-blue-100",
    amber: "bg-amber-50 text-amber-700 border-amber-100",
    rose: "bg-rose-50 text-rose-700 border-rose-100",
    violet: "bg-violet-50 text-violet-700 border-violet-100",
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-3">
        <div
          className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl border ${accents[accent]}`}
        >
          {icon}
        </div>

        {trend && (
          <span
            className={`text-xs font-semibold px-2 py-1 rounded-full ${
              trendUp
                ? "bg-emerald-50 text-emerald-700"
                : "bg-rose-50 text-rose-700"
            }`}
          >
            {trend}
          </span>
        )}
      </div>

      <p className="mt-4 text-2xl font-bold text-slate-900">{value}</p>
      <p className="text-sm text-slate-500 mt-1">{label}</p>
    </div>
  );
};

export default StatCard;
