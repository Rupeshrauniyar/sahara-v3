const UserModel = require("../models/User");
const DoctorModel = require("../models/Doctor");
const HospitalModel = require("../models/Hospital");
const AppointmentModel = require("../models/Appointment");
const BloodRequestModel = require("../models/BloodRequest");

const ACTIVE_APPOINTMENT_STATUSES = ["Pending", "Confirmed"];

const startOfDay = (date = new Date()) => {
  const value = new Date(date);
  value.setHours(0, 0, 0, 0);
  return value;
};

const endOfDay = (date = new Date()) => {
  const value = new Date(date);
  value.setHours(23, 59, 59, 999);
  return value;
};

const startOfWeek = (date = new Date()) => {
  const value = startOfDay(date);
  const day = value.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  value.setDate(value.getDate() + diff);
  return value;
};

const endOfWeek = (date = new Date()) => {
  const value = startOfWeek(date);
  value.setDate(value.getDate() + 6);
  value.setHours(23, 59, 59, 999);
  return value;
};

const populateAppointment = (query) =>
  query
    .populate("patient", "fullName email phone")
    .populate({
      path: "doctor",
      select: "specialization hospital user",
      populate: [
        { path: "user", select: "fullName" },
        { path: "hospital", select: "name city" },
      ],
    })
    .populate("hospital", "name city");

const getPatientOverview = async (userId) => {
  const now = new Date();
  const weekStart = startOfWeek();
  const weekEnd = endOfWeek();

  const [user, appointments, bloodRequests] = await Promise.all([
    UserModel.findById(userId).select(
      "fullName email phone city bloodGroup isVerified gender address",
    ),
    populateAppointment(
      AppointmentModel.find({ patient: userId }).sort({ appointmentDate: 1 }),
    ),
    BloodRequestModel.find({ requestedBy: userId }).sort({ createdAt: -1 }),
  ]);

  const upcomingAppointments = appointments.filter(
    (item) =>
      new Date(item.appointmentDate) >= now &&
      ACTIVE_APPOINTMENT_STATUSES.includes(item.status),
  );

  const appointmentsThisWeek = appointments.filter((item) => {
    const date = new Date(item.appointmentDate);
    return date >= weekStart && date <= weekEnd;
  });

  const hospitalsVisited = new Set(
    appointments
      .map((item) => String(item.hospital?._id || item.hospital || ""))
      .filter(Boolean),
  ).size;

  const openBloodRequests = bloodRequests.filter(
    (item) => item.status === "Open" || item.status === "Matched",
  ).length;

  return {
    user,
    stats: {
      upcomingAppointments: upcomingAppointments.length,
      appointmentsThisWeek: appointmentsThisWeek.length,
      hospitalsVisited,
      openBloodRequests,
      bloodGroup: user?.bloodGroup || null,
      totalBloodRequests: bloodRequests.length,
    },
    upcomingAppointments: upcomingAppointments.slice(0, 5),
    recentBloodRequests: bloodRequests.slice(0, 3),
  };
};

const getDoctorOverview = async (userId) => {
  const now = new Date();
  const todayStart = startOfDay();
  const todayEnd = endOfDay();
  const weekStart = startOfWeek();
  const weekEnd = endOfWeek();

  const [user, doctorProfile] = await Promise.all([
    UserModel.findById(userId).select("fullName email phone isVerified"),
    DoctorModel.findOne({ user: userId })
      .populate("hospital", "name city address phone")
      .populate("user", "fullName email phone"),
  ]);

  if (!doctorProfile) {
    return {
      user,
      doctorProfile: null,
      stats: {
        patientsToday: 0,
        appointmentsThisWeek: 0,
        pendingAppointments: 0,
        consultationFee: 0,
        virtualConsultationFee: 0,
        isAvailable: false,
      },
      todaySchedule: [],
      weeklyCounts: [],
    };
  }

  const appointments = await populateAppointment(
    AppointmentModel.find({ doctor: doctorProfile._id }).sort({
      appointmentDate: 1,
    }),
  );

  const todaySchedule = appointments.filter((item) => {
    const date = new Date(item.appointmentDate);
    return (
      date >= todayStart &&
      date <= todayEnd &&
      !["Cancelled", "Rejected"].includes(item.status)
    );
  });

  const appointmentsThisWeek = appointments.filter((item) => {
    const date = new Date(item.appointmentDate);
    return (
      date >= weekStart &&
      date <= weekEnd &&
      !["Cancelled", "Rejected"].includes(item.status)
    );
  });

  const pendingAppointments = appointments.filter(
    (item) => item.status === "Pending",
  ).length;

  const dayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const weeklyCounts = dayLabels.map((label, index) => {
    const dayStart = new Date(weekStart);
    dayStart.setDate(weekStart.getDate() + index);
    const dayEnd = endOfDay(dayStart);

    const count = appointments.filter((item) => {
      const date = new Date(item.appointmentDate);
      return (
        date >= dayStart &&
        date <= dayEnd &&
        !["Cancelled", "Rejected"].includes(item.status)
      );
    }).length;

    return { label, count };
  });

  return {
    user,
    doctorProfile,
    stats: {
      patientsToday: todaySchedule.length,
      appointmentsThisWeek: appointmentsThisWeek.length,
      pendingAppointments,
      consultationFee: doctorProfile.consultationFee,
      virtualConsultationFee: doctorProfile.getFeeForType("Virtual"),
      isAvailable: doctorProfile.isAvailable,
      specialization: doctorProfile.specialization,
    },
    todaySchedule: todaySchedule.slice(0, 8),
    weeklyCounts,
  };
};

const getHospitalAdminOverview = async (userId) => {
  const [user, hospital] = await Promise.all([
    UserModel.findById(userId).select("fullName email phone isVerified city"),
    HospitalModel.findOne({ admin: userId }),
  ]);

  if (!hospital) {
    return {
      user,
      hospital: null,
      stats: {
        bedOccupancy: 0,
        availableBeds: 0,
        totalBeds: 0,
        activeDoctors: 0,
        bloodUnits: 0,
      },
      bloodInventory: {},
      recentAppointments: [],
    };
  }

  const [doctorCount, appointments] = await Promise.all([
    DoctorModel.countDocuments({ hospital: hospital._id, isAvailable: true }),
    populateAppointment(
      AppointmentModel.find({ hospital: hospital._id })
        .sort({ appointmentDate: -1 })
        .limit(5),
    ),
  ]);

  const totalBeds = hospital.beds?.total || 0;
  const availableBeds = hospital.beds?.available || 0;
  const occupancy =
    totalBeds > 0
      ? Math.round(((totalBeds - availableBeds) / totalBeds) * 100)
      : 0;

  const bloodInventory = hospital.bloodInventory?.toObject
    ? hospital.bloodInventory.toObject()
    : hospital.bloodInventory || {};

  const bloodUnits = Object.values(bloodInventory).reduce(
    (sum, value) => sum + Number(value || 0),
    0,
  );

  return {
    user,
    hospital,
    stats: {
      bedOccupancy: occupancy,
      availableBeds,
      totalBeds,
      icuBeds: hospital.beds?.icu || 0,
      emergencyBeds: hospital.beds?.emergency || 0,
      activeDoctors: doctorCount,
      bloodUnits,
      emergencyAvailable: hospital.emergencyAvailable,
      ambulanceAvailable: hospital.ambulanceAvailable,
      isOpen: hospital.isOpen,
    },
    bloodInventory,
    recentAppointments: appointments,
  };
};

const getAdminOverview = async (userId) => {
  const user = await UserModel.findById(userId).select(
    "fullName email phone isVerified",
  );

  const [
    totalUsers,
    totalHospitals,
    totalDoctors,
    pendingVerifications,
    usersByRole,
    recentUsers,
    recentBloodRequests,
    recentAppointments,
  ] = await Promise.all([
    UserModel.countDocuments(),
    HospitalModel.countDocuments(),
    DoctorModel.countDocuments(),
    UserModel.countDocuments({
      isVerified: false,
      role: { $in: ["Doctor", "HospitalAdmin"] },
    }),
    UserModel.aggregate([
      {
        $group: {
          _id: "$role",
          count: { $sum: 1 },
        },
      },
    ]),
    UserModel.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select("fullName email role isVerified createdAt"),
    BloodRequestModel.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("requestedBy", "fullName"),
    AppointmentModel.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("patient", "fullName")
      .populate({
        path: "doctor",
        populate: { path: "user", select: "fullName" },
      }),
  ]);

  const roleCounts = usersByRole.reduce((accumulator, item) => {
    accumulator[item._id] = item.count;
    return accumulator;
  }, {});

  const pendingVerificationList = await UserModel.find({
    isVerified: false,
    role: { $in: ["Doctor", "HospitalAdmin"] },
  })
    .sort({ createdAt: -1 })
    .limit(5)
    .select("fullName email role createdAt");

  const recentActivity = [
    ...recentUsers.map((item) => ({
      id: item._id,
      action: `New ${item.role.toLowerCase()} registered`,
      user: item.fullName,
      time: item.createdAt,
    })),
    ...recentBloodRequests.map((item) => ({
      id: item._id,
      action: `Blood request ${item.status.toLowerCase()}`,
      user: item.requestedBy?.fullName || "Patient",
      time: item.createdAt,
    })),
    ...recentAppointments.map((item) => ({
      id: item._id,
      action: `Appointment ${item.status.toLowerCase()}`,
      user: item.patient?.fullName || "Patient",
      time: item.createdAt,
    })),
  ]
    .sort((a, b) => new Date(b.time) - new Date(a.time))
    .slice(0, 6);

  return {
    user,
    stats: {
      totalUsers,
      totalHospitals,
      totalDoctors,
      pendingVerifications,
    },
    usersByRole: {
      Patient: roleCounts.Patient || 0,
      Doctor: roleCounts.Doctor || 0,
      HospitalAdmin: roleCounts.HospitalAdmin || 0,
      Admin: roleCounts.Admin || 0,
    },
    pendingVerificationList,
    recentActivity,
  };
};

const getDashboardOverview = async (req, res) => {
  try {
    let overview;

    switch (req.user.role) {
      case "Patient":
        overview = await getPatientOverview(req.user.id);
        break;
      case "Doctor":
        overview = await getDoctorOverview(req.user.id);
        break;
      case "HospitalAdmin":
        overview = await getHospitalAdminOverview(req.user.id);
        break;
      case "Admin":
        overview = await getAdminOverview(req.user.id);
        break;
      default:
        overview = await getPatientOverview(req.user.id);
    }

    return res.status(200).json({
      success: true,
      role: req.user.role,
      overview,
    });
  } catch (error) {
    console.error("Get Dashboard Overview Error:", error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong while fetching dashboard data.",
    });
  }
};

module.exports = {
  getDashboardOverview,
};
