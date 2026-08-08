import { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import DashboardLayout from "./DashboardLayout";

const getStoredUser = () => {
  const token =
    localStorage.getItem("token") || sessionStorage.getItem("token");
  const storedUser =
    localStorage.getItem("user") || sessionStorage.getItem("user");

  if (!token || !storedUser) {
    return null;
  }

  try {
    return JSON.parse(storedUser);
  } catch {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
    return null;
  }
};

const RoleLayout = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = getStoredUser();

    if (!storedUser) {
      navigate("/login", { replace: true });
      return;
    }

    setUser(storedUser);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
    navigate("/login");
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-slate-500 mt-4 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout user={user} onLogout={handleLogout}>
      <Outlet context={{ user }} />
    </DashboardLayout>
  );
};

export default RoleLayout;
