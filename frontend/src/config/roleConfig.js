/* =========================================================
   SAHARA ROLE CONFIGURATION
========================================================= */

export const ROLE_CONFIG = {
  /* =====================================================
     PATIENT
  ===================================================== */

  Patient: {
    label: "Patient",

    badge:
      "bg-emerald-100 text-emerald-800",

    nav: [
      {
        to: "/dashboard",
        label: "Overview",
      },

      {
        to: "/appointment",
        label: "Appointments",
      },

      {
        to: "/doctor",
        label: "Find Doctors",
      },

      {
        to: "/bloodRequest",
        label: "Blood Request",
      },

      {
        to: "/blood-donor",
        label: "Blood Donors",
      },

      {
        to: "/ai-bot",
        label: "AI Assistant",
      },
    ],
  },

  /* =====================================================
     DOCTOR
  ===================================================== */

  Doctor: {
    label: "Doctor",

    badge:
      "bg-blue-100 text-blue-800",

    nav: [
      {
        to: "/dashboard",
        label: "Overview",
      },

      {
        to: "/doctor-appointments",
        label: "Appointments",
      },

      

      {
        to: "/blood-donor",
        label: "Blood Donors",
      },

      {
        to: "/bloodRequest",
        label: "Blood Requests",
      },

      {
        to: "/ai-bot",
        label: "AI Assistant",
      },
    ],
  },

  /* =====================================================
     HOSPITAL ADMIN
  ===================================================== */

  HospitalAdmin: {
    label: "Hospital Admin",

    badge:
      "bg-violet-100 text-violet-800",

    nav: [
      {
        to: "/dashboard",
        label: "Overview",
      },

      {
        to: "/hospital-profile-update",
        label: "Hospital Profile",
      },

      {
        to: "/hospital-blood-requests",
        label: "Blood Requests",
      },

      {
        to: "/blood-inventory",
        label: "Blood Inventory",
      },

      {
        to: "/ai-bot",
        label: "AI Assistant",
      },
    ],
  },

  /* =====================================================
     ADMIN
  ===================================================== */

  Admin: {
    label: "Administrator",

    badge:
      "bg-amber-100 text-amber-800",

    nav: [
      {
        to: "/dashboard",
        label: "Overview",
      },

      {
        to: "/doctor",
        label: "Doctors",
      },

      {
        to: "/bloodRequest",
        label: "Blood Requests",
      },

      {
        to: "/blood-donor",
        label: "Blood Network",
      },

      {
        to: "/ai-bot",
        label: "AI Assistant",
      },
    ],
  },
};

/* =========================================================
   GET ROLE CONFIG
========================================================= */

export const getRoleConfig = (
  role,
) => {
  return (
    ROLE_CONFIG[role] ||
    ROLE_CONFIG.Patient
  );
};

/* =========================================================
   PAGE TITLES
========================================================= */

const PAGE_TITLES = {
  "/dashboard":
    "Overview",

  "/appointment":
    "Appointments",

  "/doctor-appointments":
    "Appointments",

  "/doctor":
    "Find Doctors",

  "/profile":
    "My Profile",

  "/bloodRequest":
    "Blood Request",

  "/blood-donor":
    "Blood Donors",

  "/blood-inventory":
    "Blood Inventory",

  "/hospital-profile-update":
    "Hospital Profile",

  "/hospital-blood-requests":
    "Blood Requests",

  "/ai-bot":
    "AI Assistant",
};

/* =========================================================
   GET PAGE TITLE
========================================================= */

export const getPageTitle = (
  pathname,
  role,
) => {
  const config =
    getRoleConfig(role);

  const navigationMatch =
    config.nav.find(
      (item) =>
        item.to === pathname,
    );

  if (navigationMatch) {
    return navigationMatch.label;
  }

  if (
    PAGE_TITLES[pathname]
  ) {
    return PAGE_TITLES[pathname];
  }

  return "SAHARA";
};