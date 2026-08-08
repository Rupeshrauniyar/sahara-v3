export const ROLE_CONFIG = {
  Patient: {
    label: "Patient",
    badge: "bg-emerald-100 text-emerald-800",
    nav: [
      { to: "/dashboard", label: "Overview", icon: "📊" },
      { to: "/appointment", label: "Appointments", icon: "📅" },
      { to: "/doctor", label: "Find Doctors", icon: "👨‍⚕️" },
      { to: "/bloodRequest", label: "Blood Request", icon: "🩸" },
      { to: "/blood-donor", label: "Blood Donor", icon: "❤️" },
      { to: "/ai-bot", label: "AI Assistant", icon: "✦" },
    ],
  },
  Doctor: {
    label: "Doctor",
    badge: "bg-blue-100 text-blue-800",
    nav: [
      { to: "/dashboard", label: "Overview", icon: "📊" },
      { to: "/appointment", label: "Appointments", icon: "📅" },
      { to: "/blood-donor", label: "Blood Donors", icon: "🩸" },
      { to: "/bloodRequest", label: "Blood Requests", icon: "🚨" },
      // { to: "/profile", label: "My Profile", icon: "👨‍⚕️" },
      { to: "/ai-bot", label: "AI Assistant", icon: "✦" },
    ],
  },
  HospitalAdmin: {
    label: "Hospital Admin",
    badge: "bg-violet-100 text-violet-800",
    nav: [
      { to: "/dashboard", label: "Overview", icon: "📊" },
      // { to: "/appointment", label: "Appointments", icon: "📅" },
      { to: "/hospital-profile-update", label: "Hospital Profile Update", icon: "🏥" },
      { to: "/hospital-blood-requests", label: "Blood Requests", icon: "🩸" },
      { to: "/blood-inventory", label: "Blood Inventory", icon: "❤️" },
    ],
  },
  Admin: {
    label: "Administrator",
    badge: "bg-amber-100 text-amber-800",
    nav: [
      { to: "/dashboard", label: "Overview", icon: "📊" },
      { to: "/appointment", label: "Appointments", icon: "📅" },
      { to: "/doctor", label: "Doctors", icon: "👨‍⚕️" },
      { to: "/bloodRequest", label: "Blood Requests", icon: "🩸" },
      { to: "/blood-donor", label: "Blood Network", icon: "❤️" },
      { to: "/ai-bot", label: "AI Assistant", icon: "✦" },
    ],
  },
};

export const getRoleConfig = (role) => ROLE_CONFIG[role] || ROLE_CONFIG.Patient;

export const getPageTitle = (pathname, role) => {
  const config = getRoleConfig(role);
  const match = config.nav.find((item) => item.to === pathname);

  if (match) {
    return match.label;
  }

  if (pathname === "/dashboard") {
    return "Overview";
  }

  return "Sahara";
};
