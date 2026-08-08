import { Routes, Route } from "react-router-dom";
import Home from "../pages/Home";
import Signin from "../pages/Signin";
import Signup from "../pages/Signup";
import Doctor from "../pages/Doctor";
import BloodDonor from "../pages/BloodDonor";
import Appointment from "../pages/Appointment";
import Dashboard from "../pages/Dashboard";
import AiBot from "../pages/AiBot";
import BloodRequest from "../pages/BloodRequest";
import RoleLayout from "../components/dashboard/RoleLayout";
import MyProfile from "../pages/MyProfile";
import BloodInventory from "../pages/BloodInventory";
import HospitalProfileUpdate from "../pages/HospitalProfileUpdate";
import HospitalBloodRequests from "../pages/HospitalBloodRequests";
const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Signin />} />
      <Route path="/signup" element={<Signup />} />

      <Route element={<RoleLayout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/appointment" element={<Appointment />} />
        <Route path="/doctor" element={<Doctor />} />
        <Route path="/profile" element={<MyProfile />} />
        <Route path="/hospital-profile-update" element={<HospitalProfileUpdate />} />
        <Route path="/blood-donor" element={<BloodDonor />} />
        <Route path="/bloodRequest" element={<BloodRequest />} />
        <Route path="/blood-inventory" element={<BloodInventory />} />
        <Route path="/ai-bot" element={<AiBot />} />
        <Route path="/hospital-blood-requests" element={<HospitalBloodRequests />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
