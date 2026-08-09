import {
  useEffect,
  useState,
} from "react";

import {
  Outlet,
  useNavigate,
} from "react-router-dom";

import DashboardLayout from "./DashboardLayout";

/* =========================================================
   GET STORED USER
========================================================= */

const getStoredUser = () => {
  const token =
    localStorage.getItem("token") ||
    sessionStorage.getItem("token");

  const storedUser =
    localStorage.getItem("user") ||
    sessionStorage.getItem("user");

  if (
    !token ||
    !storedUser
  ) {
    return null;
  }

  try {
    return JSON.parse(
      storedUser,
    );
  } catch {
    localStorage.removeItem(
      "token",
    );

    localStorage.removeItem(
      "user",
    );

    sessionStorage.removeItem(
      "token",
    );

    sessionStorage.removeItem(
      "user",
    );

    return null;
  }
};

/* =========================================================
   ROLE LAYOUT
========================================================= */

const RoleLayout = () => {
  const navigate =
    useNavigate();

  const [
    user,
    setUser,
  ] = useState(null);

  const [
    loading,
    setLoading,
  ] = useState(true);

  /* =====================================================
     LOAD SESSION
  ===================================================== */

  useEffect(() => {
    const storedUser =
      getStoredUser();

    if (!storedUser) {
      navigate(
        "/login",
        {
          replace: true,
        },
      );

      setLoading(false);

      return;
    }

    setUser(storedUser);

    setLoading(false);
  }, [navigate]);

  /* =====================================================
     LOGOUT
  ===================================================== */

  const handleLogout = () => {
    localStorage.removeItem(
      "token",
    );

    localStorage.removeItem(
      "user",
    );

    localStorage.removeItem(
      "profile",
    );

    sessionStorage.removeItem(
      "token",
    );

    sessionStorage.removeItem(
      "user",
    );

    sessionStorage.removeItem(
      "profile",
    );

    navigate(
      "/login",
      {
        replace: true,
      },
    );
  };

  /* =====================================================
     LOADING
  ===================================================== */

  if (
    loading ||
    !user
  ) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F6F8FC]">

        <div className="text-center">

          <div className="mx-auto grid h-12 w-12 animate-pulse place-items-center rounded-[14px] bg-[#1717E8] text-sm font-black text-white">
            S
          </div>

          <p className="mt-3 text-sm font-semibold text-[#536A82]">
            Loading SAHARA...
          </p>
        </div>
      </div>
    );
  }

  /* =====================================================
     SINGLE DASHBOARD LAYOUT
  ===================================================== */

  return (
    <DashboardLayout
      user={user}
      onLogout={
        handleLogout
      }
    >
      <Outlet
        context={{
          user,
        }}
      />
    </DashboardLayout>
  );
};

export default RoleLayout;