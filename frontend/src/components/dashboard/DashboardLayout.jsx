import {
  CalendarDays,
  ChevronRight,
  Droplets,
  HeartPulse,
  Hospital,
  LayoutDashboard,
  LogOut,
  Menu,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  UserRound,
  UsersRound,
  X,
} from "lucide-react";

import {
  NavLink,
  useLocation,
} from "react-router-dom";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  getPageTitle,
  getRoleConfig,
} from "../../config/roleConfig";

import saharaLogo from "../../assets/sahara-logo.png";

/* =========================================================
   NAV ICON
========================================================= */

const getNavIcon = (label = "") => {
  const text = label.toLowerCase();

  if (text.includes("overview")) {
    return LayoutDashboard;
  }

  if (text.includes("appointment")) {
    return CalendarDays;
  }

  if (
    text.includes("blood donor") ||
    text.includes("blood network")
  ) {
    return Droplets;
  }

  if (text.includes("blood request")) {
    return HeartPulse;
  }

  if (
    text.includes("doctor") ||
    text.includes("profile")
  ) {
    return Stethoscope;
  }

  if (text.includes("hospital")) {
    return Hospital;
  }

  if (
    text.includes("user") ||
    text.includes("patient")
  ) {
    return UsersRound;
  }

  if (
    text.includes("ai") ||
    text.includes("assistant")
  ) {
    return Sparkles;
  }

  return ChevronRight;
};

/* =========================================================
   ROLE ICON
========================================================= */

const getRoleIcon = (role) => {
  switch (role) {
    case "Doctor":
      return Stethoscope;

    case "HospitalAdmin":
      return Hospital;

    case "Admin":
      return ShieldCheck;

    default:
      return UserRound;
  }
};

/* =========================================================
   REMOVE DUPLICATE NAV ITEMS
========================================================= */

const normalizeNavigation = (items = []) => {
  const result = [];
  const seenPaths = new Set();
  const seenLabels = new Set();

  for (const item of items) {
    if (!item?.to || !item?.label) {
      continue;
    }

    const path =
      item.to.trim().toLowerCase();

    const label =
      item.label
        .trim()
        .toLowerCase()
        .replace(/\s+/g, " ");

    const isOverview =
      label === "overview" ||
      path === "/dashboard";

    const alreadyHasOverview =
      result.some((existing) => {
        const existingPath =
          existing.to
            ?.trim()
            .toLowerCase();

        const existingLabel =
          existing.label
            ?.trim()
            .toLowerCase();

        return (
          existingPath === "/dashboard" ||
          existingLabel === "overview"
        );
      });

    if (
      isOverview &&
      alreadyHasOverview
    ) {
      continue;
    }

    if (
      seenPaths.has(path) ||
      seenLabels.has(label)
    ) {
      continue;
    }

    seenPaths.add(path);
    seenLabels.add(label);

    result.push(item);
  }

  return result;
};

/* =========================================================
   DASHBOARD LAYOUT
========================================================= */

const DashboardLayout = ({
  user,
  onLogout,
  children,
}) => {
  const { pathname } =
    useLocation();

  const config =
    getRoleConfig(user.role);

  const pageTitle =
    getPageTitle(
      pathname,
      user.role,
    );

  const [
    mobileOpen,
    setMobileOpen,
  ] = useState(false);

  const navigation =
    useMemo(
      () =>
        normalizeNavigation(
          config?.nav || [],
        ),
      [config],
    );

  const isFullHeightPage =
    pathname === "/ai-bot";

  const initials =
    user.fullName
      ?.split(" ")
      .filter(Boolean)
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "?";

  const RoleIcon =
    getRoleIcon(user.role);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <div className="min-h-screen bg-[#F6F8FC] text-[#10233F]">

      {/* MOBILE OVERLAY */}

      {mobileOpen && (
        <button
          type="button"
          aria-label="Close dashboard sidebar"
          onClick={() =>
            setMobileOpen(false)
          }
          className="fixed inset-0 z-40 bg-[#10233F]/35 backdrop-blur-[2px] lg:hidden"
        />
      )}

      {/* SIDEBAR */}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[276px] flex-col border-r border-[#E2E8F1] bg-white transition-transform duration-300 lg:translate-x-0 ${
          mobileOpen
            ? "translate-x-0"
            : "-translate-x-full"
        }`}
      >

        {/* LOGO */}

        <div className="flex min-h-[88px] items-center justify-between border-b border-[#EEF2F6] px-5">

          <NavLink
            to="/"
            aria-label="Return to SAHARA home"
            className="flex items-center transition-opacity hover:opacity-85"
          >
            <img
              src={saharaLogo}
              alt="SAHARA"
              className="h-[48px] w-auto max-w-[180px] object-contain"
            />
          </NavLink>

          <button
            type="button"
            onClick={() =>
              setMobileOpen(false)
            }
            className="grid h-9 w-9 place-items-center rounded-xl text-[#718297] transition hover:bg-[#F2F5F9] lg:hidden"
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        </div>

        {/* WORKSPACE TITLE */}

        <div className="px-5 pb-3 pt-6">

          <p className="text-[9px] font-extrabold uppercase tracking-[0.17em] text-[#9BA8B7]">
            Workspace
          </p>
        </div>

        {/* NAVIGATION */}

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 pb-5">

          {navigation.map(
            (item) => {
              const Icon =
                getNavIcon(
                  item.label,
                );

              return (
                <NavLink
                  key={`${item.to}-${item.label}`}
                  to={item.to}
                  end={
                    item.to ===
                    "/dashboard"
                  }
                  className={({
                    isActive,
                  }) =>
                    `group flex min-h-[48px] items-center gap-3 rounded-[14px] px-3.5 text-[13px] font-bold transition-all ${
                      isActive
                        ? "bg-[#1717E8] !text-white shadow-[0_10px_24px_rgba(23,23,232,0.18)]"
                        : "text-[#5D7188] hover:bg-[#F1F4FF] hover:text-[#1717E8]"
                    }`
                  }
                >
                  {({
                    isActive,
                  }) => (
                    <>
                      <div
                        className={`grid h-8 w-8 shrink-0 place-items-center rounded-[10px] transition ${
                          isActive
                            ? "bg-white/15 text-white"
                            : "bg-[#F1F4F8] text-[#71859B] group-hover:bg-white group-hover:text-[#1717E8]"
                        }`}
                      >
                        <Icon
                          size={17}
                          strokeWidth={2}
                        />
                      </div>

                      <span
                        className={
                          isActive
                            ? "!text-white"
                            : ""
                        }
                      >
                        {
                          item.label
                        }
                      </span>

                      {isActive && (
                        <ChevronRight
                          size={14}
                          className="text-white opacity-75"
                        />
                      )}
                    </>
                  )}
                </NavLink>
              );
            },
          )}
        </nav>

        {/* USER ACCOUNT */}

        <div className="border-t border-[#EDF1F5] p-4">

          <div className="mb-2 flex items-center gap-3 rounded-[14px] p-2">

            <div className="relative">

              <div className="grid h-11 w-11 place-items-center rounded-[13px] bg-[#1717E8] text-[11px] font-extrabold text-white shadow-[0_8px_20px_rgba(23,23,232,0.17)]">
                {initials}
              </div>

              <span className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-[3px] border-white bg-emerald-500" />
            </div>

            <div className="min-w-0 flex-1">

              <p className="truncate text-[12px] font-extrabold text-[#20364F]">
                {user.fullName}
              </p>

              <div className="mt-0.5 flex items-center gap-1.5 text-[9px] font-semibold text-[#8796A7]">

                <RoleIcon
                  size={11}
                />

                {config.label}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onLogout}
            className="flex min-h-[43px] w-full items-center gap-3 rounded-[12px] px-3 text-[11px] font-bold text-[#738396] transition hover:bg-red-50 hover:text-red-600"
          >
            <LogOut size={16} />

            Sign out
          </button>
        </div>
      </aside>

      {/* MAIN AREA */}

      <div className="min-h-screen lg:pl-[276px]">

        {/* HEADER */}

        <header className="sticky top-0 z-30 border-b border-[#E2E9F2] bg-white/95 backdrop-blur-xl">

          <div className="flex min-h-[82px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8 xl:px-10">

            <div className="flex min-w-0 items-center gap-3">

              <button
                type="button"
                onClick={() =>
                  setMobileOpen(true)
                }
                className="grid h-10 w-10 shrink-0 place-items-center rounded-[12px] border border-[#E0E7EF] bg-white text-[#52677D] lg:hidden"
                aria-label="Open dashboard menu"
              >
                <Menu size={19} />
              </button>

              <div className="min-w-0">

                <div className="flex items-center gap-2">

                  <span className="text-[9px] font-extrabold uppercase tracking-[0.16em] text-[#1717E8]">
                    {config.label}
                  </span>

                  <span className="h-1 w-1 rounded-full bg-[#B7C2CF]" />

                  <span className="hidden text-[9px] font-semibold text-[#97A4B3] sm:inline">
                    SAHARA Workspace
                  </span>
                </div>

                <h1 className="mt-1 truncate font-[Manrope] text-[21px] font-extrabold tracking-[-0.035em] text-[#10233F] sm:text-[25px]">
                  {pageTitle}
                </h1>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-3">

              <NavLink
                to="/"
                className="hidden min-h-[40px] items-center gap-2 rounded-[11px] border border-[#DFE6EF] bg-white px-3.5 text-[9px] font-extrabold !text-[#526A82] transition hover:border-[#C9D2E0] hover:bg-[#F7F9FC] hover:!text-[#1717E8] sm:inline-flex"
              >
                <HeartPulse size={14} />

                <span>
                  Home
                </span>
              </NavLink>

              <div className="hidden items-center gap-2 rounded-full border border-[#DCE5EF] bg-[#F8FAFD] px-3 py-2 md:flex">

                <span className="h-2 w-2 rounded-full bg-emerald-500" />

                <span className="text-[9px] font-extrabold text-[#5A6F84]">
                  System online
                </span>
              </div>

              <div className="grid h-10 w-10 place-items-center rounded-[12px] bg-[#1717E8] text-[10px] font-extrabold text-white">
                {initials}
              </div>

              <button
                type="button"
                onClick={onLogout}
                className="grid h-10 w-10 place-items-center rounded-[11px] border border-red-100 bg-red-50 text-red-600 lg:hidden"
                aria-label="Sign out"
              >
                <LogOut size={15} />
              </button>
            </div>
          </div>

          {/* MOBILE NAV */}

          <div className="flex gap-2 overflow-x-auto border-t border-[#EEF2F6] px-4 py-3 lg:hidden">

            {navigation.map(
              (item) => {
                const Icon =
                  getNavIcon(
                    item.label,
                  );

                return (
                  <NavLink
                    key={`mobile-${item.to}-${item.label}`}
                    to={item.to}
                    end={
                      item.to ===
                      "/dashboard"
                    }
                    className={({
                      isActive,
                    }) =>
                      `flex shrink-0 items-center gap-2 rounded-[10px] px-3 py-2 text-[10px] font-bold ${
                        isActive
                          ? "bg-[#1717E8] !text-white"
                          : "bg-[#F1F4F8] text-[#657A90]"
                      }`
                    }
                  >
                    {({
                      isActive,
                    }) => (
                      <>
                        <Icon size={14} />

                        <span
                          className={
                            isActive
                              ? "!text-white"
                              : ""
                          }
                        >
                          {
                            item.label
                          }
                        </span>
                      </>
                    )}
                  </NavLink>
                );
              },
            )}
          </div>
        </header>

        {/* CONTENT */}

        <main
          className={`${
            isFullHeightPage
              ? "flex min-h-[calc(100vh-82px)] flex-col overflow-hidden"
              : "p-4 sm:p-6 lg:p-8 xl:p-10"
          }`}
        >
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;