import { useOutletContext } from "react-router-dom";
import PatientDashboard from "../components/dashboard/PatientDashboard";
import DoctorDashboard from "../components/dashboard/DoctorDashboard";
import HospitalAdminDashboard from "../components/dashboard/HospitalAdminDashboard";
import AdminDashboard from "../components/dashboard/AdminDashboard";

const ROLE_VIEWS = {
  Patient: PatientDashboard,
  Doctor: DoctorDashboard,
  HospitalAdmin: HospitalAdminDashboard,
  Admin: AdminDashboard,
};

const Dashboard = () => {
  const { user } = useOutletContext();
  const RoleView = ROLE_VIEWS[user.role] || PatientDashboard;

  return <RoleView user={user} />;
};

export default Dashboard;
