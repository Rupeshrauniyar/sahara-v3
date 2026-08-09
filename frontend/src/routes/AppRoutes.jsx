import {
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import Home from "../pages/Home";
import Signin from "../pages/Signin";
import Signup from "../pages/Signup";

import EmergencySOS from "../pages/EmergencySOS";

import Dashboard from "../pages/Dashboard";
import Doctor from "../pages/Doctor";
import Appointment from "../pages/Appointment";
import DoctorAppointments from "../pages/DoctorAppointments";

import BloodDonor from "../pages/BloodDonor";
import BloodRequest from "../pages/BloodRequest";
import AiBot from "../pages/AiBot";

import MyProfile from "../pages/MyProfile";
import BloodInventory from "../pages/BloodInventory";
import HospitalProfileUpdate from "../pages/HospitalProfileUpdate";
import HospitalBloodRequests from "../pages/HospitalBloodRequests";

import RoleLayout from "../components/dashboard/RoleLayout";

const AppRoutes = () => {
  return (
    <Routes>

      {/* PUBLIC */}

      <Route
        path="/"
        element={<Home />}
      />

      <Route
        path="/login"
        element={<Signin />}
      />

      <Route
        path="/signup"
        element={<Signup />}
      />

      {/* Emergency SOS is intentionally public */}

      <Route
        path="/emergency-sos"
        element={<EmergencySOS />}
      />

      {/* AUTHENTICATED */}

      <Route element={<RoleLayout />}>

        <Route
          path="/dashboard"
          element={<Dashboard />}
        />

        <Route
          path="/doctor"
          element={<Doctor />}
        />

        <Route
          path="/appointment"
          element={<Appointment />}
        />

        <Route
          path="/doctor-appointments"
          element={<DoctorAppointments />}
        />

        <Route
          path="/profile"
          element={<MyProfile />}
        />

        <Route
          path="/blood-donor"
          element={<BloodDonor />}
        />

        <Route
          path="/bloodRequest"
          element={<BloodRequest />}
        />

        <Route
          path="/hospital-profile-update"
          element={<HospitalProfileUpdate />}
        />

        <Route
          path="/hospital-blood-requests"
          element={<HospitalBloodRequests />}
        />

        <Route
          path="/blood-inventory"
          element={<BloodInventory />}
        />

        <Route
          path="/ai-bot"
          element={<AiBot />}
        />
      </Route>

      <Route
        path="*"
        element={
          <Navigate
            to="/"
            replace
          />
        }
      />
    </Routes>
  );
};

export default AppRoutes;