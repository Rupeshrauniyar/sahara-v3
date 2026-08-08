const AppointmentModel = require("../models/Appointment");
const DoctorModel = require("../models/Doctor");

const VALID_APPOINTMENT_TYPES = ["Virtual", "Physical"];
const VALID_STATUSES = [
  "Pending",
  "Confirmed",
  "Completed",
  "Cancelled",
  "Rejected",
];

const populateAppointment = (query) =>
  query
    .populate("patient", "fullName email phone city")
    .populate({
      path: "doctor",
      select:
        "specialization qualification experience consultationFee virtualConsultationFee isAvailable hospital user",
      populate: [
        { path: "user", select: "fullName email phone profileImage" },
        { path: "hospital", select: "name address city phone" },
      ],
    })
    .populate("hospital", "name address city phone");

// =====================================================
// LIST AVAILABLE DOCTORS (for booking)
// =====================================================

const getAvailableDoctors = async (req, res) => {
  try {
    const { specialization, search } = req.query;

    const filter = { isAvailable: true };

    if (specialization) {
      filter.specialization = {
        $regex: specialization.trim(),
        $options: "i",
      };
    }

    let doctors = await DoctorModel.find(filter)
      .populate("user", "fullName email phone profileImage city")
      .populate("hospital", "name address city phone")
      .sort({ createdAt: -1 });

    if (search?.trim()) {
      const term = search.trim().toLowerCase();

      doctors = doctors.filter((doctor) => {
        const name = doctor.user?.fullName?.toLowerCase() || "";
        const spec = doctor.specialization?.toLowerCase() || "";
        const hospitalName = doctor.hospital?.name?.toLowerCase() || "";

        return (
          name.includes(term) ||
          spec.includes(term) ||
          hospitalName.includes(term)
        );
      });
    }

    const doctorsWithFees = doctors.map((doctor) => ({
      ...doctor.toObject(),
      fees: {
        physical: doctor.consultationFee,
        virtual: doctor.getFeeForType("Virtual"),
      },
    }));

    return res.status(200).json({
      success: true,
      count: doctorsWithFees.length,
      doctors: doctorsWithFees,
    });
  } catch (error) {
    console.error("Get Available Doctors Error:", error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong while fetching doctors.",
    });
  }
};

// =====================================================
// CREATE APPOINTMENT (Patient)
// =====================================================

const createAppointment = async (req, res) => {
  try {
    if (req.user.role !== "Patient") {
      return res.status(403).json({
        success: false,
        message: "Only patients can book appointments.",
      });
    }

    const { doctor, appointmentDate, appointmentType, reason, notes } =
      req.body;

    if (!doctor || !appointmentDate || !appointmentType || !reason?.trim()) {
      return res.status(400).json({
        success: false,
        message:
          "Doctor, appointment date, appointment type, and reason are required.",
      });
    }

    if (!VALID_APPOINTMENT_TYPES.includes(appointmentType)) {
      return res.status(400).json({
        success: false,
        message: "Appointment type must be Virtual or Physical.",
      });
    }

    const doctorProfile = await DoctorModel.findById(doctor).populate(
      "hospital",
    );

    if (!doctorProfile) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found.",
      });
    }

    if (!doctorProfile.isAvailable) {
      return res.status(400).json({
        success: false,
        message: "This doctor is currently not accepting appointments.",
      });
    }

    const scheduledDate = new Date(appointmentDate);

    if (Number.isNaN(scheduledDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid appointment date.",
      });
    }

    if (scheduledDate <= new Date()) {
      return res.status(400).json({
        success: false,
        message: "Appointment date must be in the future.",
      });
    }

    const consultationFee = doctorProfile.getFeeForType(appointmentType);

    const appointment = await AppointmentModel.create({
      patient: req.user.id,
      doctor: doctorProfile._id,
      hospital: doctorProfile.hospital?._id || doctorProfile.hospital || undefined,
      appointmentDate: scheduledDate,
      appointmentType,
      reason: reason.trim(),
      notes: notes?.trim() || undefined,
      consultationFee,
      status: "Pending",
      paymentStatus: "Pending",
    });

    const populatedAppointment = await populateAppointment(
      AppointmentModel.findById(appointment._id),
    );

    return res.status(201).json({
      success: true,
      message: "Appointment booked successfully.",
      appointment: populatedAppointment,
    });
  } catch (error) {
    console.error("Create Appointment Error:", error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong while booking the appointment.",
    });
  }
};

// =====================================================
// GET MY APPOINTMENTS (Patient)
// =====================================================

const getMyAppointments = async (req, res) => {
  try {
    if (req.user.role !== "Patient") {
      return res.status(403).json({
        success: false,
        message: "Only patients can access this endpoint.",
      });
    }

    const appointments = await populateAppointment(
      AppointmentModel.find({ patient: req.user.id }).sort({
        appointmentDate: -1,
      }),
    );

    return res.status(200).json({
      success: true,
      count: appointments.length,
      appointments,
    });
  } catch (error) {
    console.error("Get My Appointments Error:", error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong while fetching appointments.",
    });
  }
};

// =====================================================
// GET DOCTOR APPOINTMENTS
// =====================================================

const getDoctorAppointments = async (req, res) => {
  try {
    if (req.user.role !== "Doctor") {
      return res.status(403).json({
        success: false,
        message: "Only doctors can access this endpoint.",
      });
    }

    const doctorProfile = await DoctorModel.findOne({ user: req.user.id });

    if (!doctorProfile) {
      return res.status(404).json({
        success: false,
        message: "Doctor profile not found.",
      });
    }

    const appointments = await populateAppointment(
      AppointmentModel.find({ doctor: doctorProfile._id }).sort({
        appointmentDate: -1,
      }),
    );

    return res.status(200).json({
      success: true,
      count: appointments.length,
      appointments,
    });
  } catch (error) {
    console.error("Get Doctor Appointments Error:", error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong while fetching appointments.",
    });
  }
};

// =====================================================
// GET SINGLE APPOINTMENT
// =====================================================

const getAppointmentById = async (req, res) => {
  try {
    const { id } = req.params;

    const appointment = await populateAppointment(
      AppointmentModel.findById(id),
    );

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found.",
      });
    }

    const isPatient =
      req.user.role === "Patient" &&
      String(appointment.patient._id || appointment.patient) ===
        String(req.user.id);

    let isDoctor = false;

    if (req.user.role === "Doctor") {
      const doctorProfile = await DoctorModel.findOne({ user: req.user.id });
      isDoctor =
        doctorProfile &&
        String(appointment.doctor._id || appointment.doctor) ===
          String(doctorProfile._id);
    }

    if (!isPatient && !isDoctor && req.user.role !== "Admin") {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to view this appointment.",
      });
    }

    return res.status(200).json({
      success: true,
      appointment,
    });
  } catch (error) {
    console.error("Get Appointment Error:", error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong while fetching the appointment.",
    });
  }
};

// =====================================================
// UPDATE APPOINTMENT STATUS (Doctor)
// =====================================================

const updateAppointmentStatus = async (req, res) => {
  try {
    if (req.user.role !== "Doctor") {
      return res.status(403).json({
        success: false,
        message: "Only doctors can update appointment status.",
      });
    }

    const { id } = req.params;
    const { status } = req.body;

    if (!status || !VALID_STATUSES.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Valid status is required.",
      });
    }

    const doctorProfile = await DoctorModel.findOne({ user: req.user.id });

    if (!doctorProfile) {
      return res.status(404).json({
        success: false,
        message: "Doctor profile not found.",
      });
    }

    const appointment = await AppointmentModel.findOne({
      _id: id,
      doctor: doctorProfile._id,
    });

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found.",
      });
    }

    if (["Cancelled", "Completed", "Rejected"].includes(appointment.status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot update an appointment that is already ${appointment.status.toLowerCase()}.`,
      });
    }

    appointment.status = status;
    await appointment.save();

    const populatedAppointment = await populateAppointment(
      AppointmentModel.findById(appointment._id),
    );

    return res.status(200).json({
      success: true,
      message: "Appointment status updated successfully.",
      appointment: populatedAppointment,
    });
  } catch (error) {
    console.error("Update Appointment Status Error:", error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong while updating the appointment.",
    });
  }
};

// =====================================================
// CANCEL APPOINTMENT
// =====================================================

const cancelAppointment = async (req, res) => {
  try {
    const { id } = req.params;

    const appointment = await AppointmentModel.findById(id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found.",
      });
    }

    const isPatient =
      req.user.role === "Patient" &&
      String(appointment.patient) === String(req.user.id);

    let isDoctor = false;

    if (req.user.role === "Doctor") {
      const doctorProfile = await DoctorModel.findOne({ user: req.user.id });
      isDoctor =
        doctorProfile &&
        String(appointment.doctor) === String(doctorProfile._id);
    }

    if (!isPatient && !isDoctor) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to cancel this appointment.",
      });
    }

    if (["Cancelled", "Completed", "Rejected"].includes(appointment.status)) {
      return res.status(400).json({
        success: false,
        message: `Appointment is already ${appointment.status.toLowerCase()}.`,
      });
    }

    appointment.status = "Cancelled";
    appointment.cancelledBy = isPatient ? "Patient" : "Doctor";
    await appointment.save();

    const populatedAppointment = await populateAppointment(
      AppointmentModel.findById(appointment._id),
    );

    return res.status(200).json({
      success: true,
      message: "Appointment cancelled successfully.",
      appointment: populatedAppointment,
    });
  } catch (error) {
    console.error("Cancel Appointment Error:", error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong while cancelling the appointment.",
    });
  }
};

module.exports = {
  getAvailableDoctors,
  createAppointment,
  getMyAppointments,
  getDoctorAppointments,
  getAppointmentById,
  updateAppointmentStatus,
  cancelAppointment,
};
