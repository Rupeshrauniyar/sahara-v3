import { Link, NavLink, useLocation } from "react-router-dom";
import { getPageTitle, getRoleConfig } from "../../config/roleConfig";

const navLinkClass = ({ isActive }) =>
  `flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${
    isActive
      ? "bg-emerald-600 text-white shadow-sm shadow-emerald-600/20"
      : "text-slate-600 hover:bg-emerald-50 hover:text-emerald-700"
  }`;

const mobileNavLinkClass = ({ isActive }) =>
  `flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap shrink-0 transition-colors ${
    isActive
      ? "bg-emerald-600 text-white"
      : "bg-slate-100 text-slate-700 hover:bg-emerald-50 hover:text-emerald-700"
  }`;

const DashboardLayout = ({ user, onLogout, children }) => {
  const { pathname } = useLocation();
  const config = getRoleConfig(user.role);
  const pageTitle = getPageTitle(pathname, user.role);
  const isFullHeightPage = pathname === "/ai-bot";

  const initials = user.fullName
    ?.split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Fixed left sidebar — desktop */}
      <aside className="hidden lg:flex fixed inset-y-0 left-0 z-30 w-64 flex-col bg-white border-r border-slate-200">
        <div className="p-6 border-b border-slate-100">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white text-lg">
              ✚
            </div>
            <span className="text-xl font-bold text-slate-900">Sahara</span>
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {config.nav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/dashboard"}
              className={navLinkClass}
            >
              <span>{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-100">
          <div className="flex items-center gap-3 px-4 py-3 mb-2">
            <div className="w-9 h-9 rounded-full bg-emerald-600 text-white flex items-center justify-center font-semibold text-xs shrink-0">
              {initials || "?"}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-900 truncate">
                {user.fullName}
              </p>
              <p className="text-xs text-slate-500">{config.label}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 hover:bg-rose-50 hover:text-rose-700 transition-colors font-medium"
          >
            <span>🚪</span>
            Sign out
          </button>
        </div>
      </aside>

      {/* Main area — offset for fixed sidebar */}
      <div className="lg:pl-64 flex flex-col min-h-screen min-w-0">
        <header className="bg-white border-b border-slate-200 px-4 sm:px-6 lg:px-8 py-4 sticky top-0 z-20">
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="text-sm text-emerald-600 font-semibold uppercase tracking-wide">
                {config.label}
              </p>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 truncate">
                {pageTitle}
              </h1>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <span
                className={`hidden sm:inline-flex text-xs font-semibold px-3 py-1 rounded-full ${config.badge}`}
              >
                {config.label}
              </span>

              <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center font-semibold text-sm">
                {initials || "?"}
              </div>

              <button
                type="button"
                onClick={onLogout}
                className="lg:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100"
                aria-label="Sign out"
              >
                🚪
              </button>
            </div>
          </div>

          {/* Mobile nav */}
          <nav className="lg:hidden flex gap-2 mt-4 overflow-x-auto pb-1">
            {config.nav.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/dashboard"}
                className={mobileNavLinkClass}
              >
                <span>{item.icon}</span>
                {item.label}
              </NavLink>
            ))}
          </nav>
        </header>

        <main
          className={`flex-1 min-h-0 ${
            isFullHeightPage
              ? "flex flex-col overflow-hidden"
              : "p-4 sm:p-6 lg:p-8 overflow-auto"
          }`}
        >
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
