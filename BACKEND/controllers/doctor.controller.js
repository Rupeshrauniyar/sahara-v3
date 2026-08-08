const mongoose = require("mongoose");

const DoctorModel = require("../models/Doctor");
const UserModel = require("../models/User");
const HospitalModel = require("../models/Hospital");

// ============================================================
// CREATE DOCTOR PROFILE
// ============================================================

const createDoctor = async (req, res) => {
  try {
    // Logged-in doctor's User ID
    const userId = req.user.id;

    const {
      practiceType,
      hospital,
      specialization,
      qualification,
      experience,
      consultationFee,
      virtualConsultationFee,
      availableDays,
      availableTime,
      isAvailable,
      bio,
    } = req.body;

    // ====================================================
    // CHECK USER ROLE
    // ====================================================

    if (req.user.role !== "Doctor") {
      return res.status(403).json({
        success: false,
        message: "Only doctors can create a doctor profile.",
      });
    }

    // ====================================================
    // BASIC VALIDATION
    // ====================================================

    if (
      !specialization ||
      !qualification ||
      experience === undefined ||
      consultationFee === undefined
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Specialization, qualification, experience and consultation fee are required.",
      });
    }

    // ====================================================
    // PRACTICE TYPE
    // ====================================================

    const doctorPracticeType = practiceType || "Independent";

    if (!["Hospital", "Independent"].includes(doctorPracticeType)) {
      return res.status(400).json({
        success: false,
        message: "Practice type must be Hospital or Independent.",
      });
    }

    // ====================================================
    // CHECK EXISTING DOCTOR PROFILE
    // ====================================================

    const existingDoctor = await DoctorModel.findOne({
      user: userId,
    });

    if (existingDoctor) {
      return res.status(409).json({
        success: false,
        message: "Doctor profile already exists.",
      });
    }

    // ====================================================
    // VALIDATE EXPERIENCE
    // ====================================================

    const doctorExperience = Number(experience);

    if (!Number.isFinite(doctorExperience) || doctorExperience < 0) {
      return res.status(400).json({
        success: false,
        message: "Experience must be a valid non-negative number.",
      });
    }

    // ====================================================
    // VALIDATE CONSULTATION FEE
    // ====================================================

    const doctorFee = Number(consultationFee);

    if (!Number.isFinite(doctorFee) || doctorFee < 0) {
      return res.status(400).json({
        success: false,
        message: "Consultation fee must be a valid non-negative number.",
      });
    }

    // ====================================================
    // VALIDATE VIRTUAL FEE
    // ====================================================

    let virtualFee;

    if (
      virtualConsultationFee !== undefined &&
      virtualConsultationFee !== null &&
      virtualConsultationFee !== ""
    ) {
      virtualFee = Number(virtualConsultationFee);

      if (!Number.isFinite(virtualFee) || virtualFee < 0) {
        return res.status(400).json({
          success: false,
          message:
            "Virtual consultation fee must be a valid non-negative number.",
        });
      }
    }

    // ====================================================
    // HOSPITAL VALIDATION
    // ====================================================

    let hospitalId;

    if (doctorPracticeType === "Hospital") {
      if (!hospital) {
        return res.status(400).json({
          success: false,
          message: "Hospital is required for hospital-based doctors.",
        });
      }

      if (!mongoose.Types.ObjectId.isValid(hospital)) {
        return res.status(400).json({
          success: false,
          message: "Invalid hospital ID.",
        });
      }

      const hospitalExists = await HospitalModel.findById(hospital);

      if (!hospitalExists) {
        return res.status(404).json({
          success: false,
          message: "Hospital not found.",
        });
      }

      hospitalId = hospital;
    }

    // ====================================================
    // AVAILABLE DAYS
    // ====================================================

    const validDays = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];

    let doctorAvailableDays = availableDays || [];

    if (!Array.isArray(doctorAvailableDays)) {
      return res.status(400).json({
        success: false,
        message: "availableDays must be an array.",
      });
    }

    const invalidDays = doctorAvailableDays.filter(
      (day) => !validDays.includes(day),
    );

    if (invalidDays.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Invalid available day(s): ${invalidDays.join(", ")}`,
      });
    }

    // ====================================================
    // CREATE DOCTOR
    // ====================================================

    const doctorPayload = {
      user: userId,

      practiceType: doctorPracticeType,

      specialization: specialization.trim(),

      qualification: qualification.trim(),

      experience: doctorExperience,

      consultationFee: doctorFee,

      availableDays: doctorAvailableDays,

      availableTime: availableTime || undefined,

      isAvailable: isAvailable !== undefined ? isAvailable : true,

      bio: bio?.trim() || undefined,
    };

    if (virtualFee !== undefined) {
      doctorPayload.virtualConsultationFee = virtualFee;
    }

    if (hospitalId) {
      doctorPayload.hospital = hospitalId;
    }

    const doctor = await DoctorModel.create(doctorPayload);

    // ====================================================
    // POPULATE RESPONSE
    // ====================================================

    const populatedDoctor = await DoctorModel.findById(doctor._id)
      .populate("user", "fullName email phone profileImage gender city")
      .populate("hospital", "name phone email address city");

    return res.status(201).json({
      success: true,

      message: "Doctor profile created successfully.",

      doctor: populatedDoctor,
    });
  } catch (error) {
    console.error("Create Doctor Error:", error);

    return res.status(500).json({
      success: false,

      message: "Something went wrong while creating the doctor profile.",
    });
  }
};

// ============================================================
// GET ALL DOCTORS / SEARCH DOCTORS
// ============================================================

const getDoctors = async (req, res) => {
  try {
    const {
      specialization,
      city,
      practiceType,
      hospital,
      available,
      limit = 20,
    } = req.query;

    const filter = {};

    // ====================================================
    // SPECIALIZATION
    // ====================================================

    if (specialization) {
      filter.specialization = new RegExp(specialization.trim(), "i");
    }

    // ====================================================
    // PRACTICE TYPE
    // ====================================================

    if (practiceType) {
      if (!["Hospital", "Independent"].includes(practiceType)) {
        return res.status(400).json({
          success: false,
          message: "Invalid practice type.",
        });
      }

      filter.practiceType = practiceType;
    }

    // ====================================================
    // HOSPITAL
    // ====================================================

    if (hospital) {
      if (!mongoose.Types.ObjectId.isValid(hospital)) {
        return res.status(400).json({
          success: false,
          message: "Invalid hospital ID.",
        });
      }

      filter.hospital = hospital;
    }

    // ====================================================
    // AVAILABILITY
    // ====================================================

    if (available === "true") {
      filter.isAvailable = true;
    }

    if (available === "false") {
      filter.isAvailable = false;
    }

    // ====================================================
    // CITY
    // ====================================================

    let doctorsQuery = DoctorModel.find(filter)
      .populate("user", "fullName email phone profileImage city")
      .populate("hospital", "name phone address city");

    /*
     * City belongs to User in your current architecture,
     * not Doctor.
     *
     * Therefore we filter city after population.
     *
     * For a small hackathon dataset this is acceptable.
     */

    const doctors = await doctorsQuery
      .limit(Math.min(Number(limit) || 20, 100))
      .lean();

    let finalDoctors = doctors;

    if (city) {
      finalDoctors = doctors.filter((doctor) =>
        doctor.user?.city?.toLowerCase().includes(city.trim().toLowerCase()),
      );
    }

    return res.status(200).json({
      success: true,

      count: finalDoctors.length,

      doctors: finalDoctors,
    });
  } catch (error) {
    console.error("Get Doctors Error:", error);

    return res.status(500).json({
      success: false,

      message: "Something went wrong while fetching doctors.",
    });
  }
};

// ============================================================
// GET DOCTOR BY ID
// ============================================================

const getDoctorById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid doctor ID.",
      });
    }

    const doctor = await DoctorModel.findById(id)
      .populate(
        "user",
        "fullName email phone profileImage gender dateOfBirth city address",
      )
      .populate(
        "hospital",
        "name description phone email website address city departments beds bloodInventory emergencyAvailable ambulanceAvailable isOpen",
      );

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found.",
      });
    }

    return res.status(200).json({
      success: true,

      doctor,
    });
  } catch (error) {
    console.error("Get Doctor Error:", error);

    return res.status(500).json({
      success: false,

      message: "Something went wrong while fetching the doctor.",
    });
  }
};

// ============================================================
// GET LOGGED-IN DOCTOR PROFILE
// ============================================================

const getMyDoctorProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const doctor = await DoctorModel.findOne({
      user: userId,
    })
      .populate(
        "user",
        "fullName email phone profileImage gender dateOfBirth city address",
      )
      .populate("hospital", "name phone email address city departments");

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor profile not found.",
      });
    }

    return res.status(200).json({
      success: true,

      doctor,
    });
  } catch (error) {
    console.error("Get My Doctor Error:", error);

    return res.status(500).json({
      success: false,

      message: "Something went wrong.",
    });
  }
};

// ============================================================
// UPDATE DOCTOR PROFILE
// ============================================================

const updateDoctor = async (req, res) => {
  try {
    const userId = req.user.id;

    const doctor = await DoctorModel.findOne({
      user: userId,
    });

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor profile not found.",
      });
    }

    const {
      practiceType,
      hospital,
      specialization,
      qualification,
      experience,
      consultationFee,
      virtualConsultationFee,
      availableDays,
      availableTime,
      isAvailable,
      bio,
    } = req.body;

    // ====================================================
    // PRACTICE TYPE
    // ====================================================

    if (practiceType !== undefined) {
      if (!["Hospital", "Independent"].includes(practiceType)) {
        return res.status(400).json({
          success: false,
          message: "Invalid practice type.",
        });
      }

      doctor.practiceType = practiceType;
    }

    // ====================================================
    // HOSPITAL
    // ====================================================

    if (doctor.practiceType === "Hospital") {
      const hospitalId = hospital !== undefined ? hospital : doctor.hospital;

      if (!hospitalId) {
        return res.status(400).json({
          success: false,
          message: "Hospital is required for hospital-based doctors.",
        });
      }

      if (!mongoose.Types.ObjectId.isValid(hospitalId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid hospital ID.",
        });
      }

      const hospitalExists = await HospitalModel.findById(hospitalId);

      if (!hospitalExists) {
        return res.status(404).json({
          success: false,
          message: "Hospital not found.",
        });
      }

      doctor.hospital = hospitalId;
    } else {
      // Independent doctor
      doctor.hospital = undefined;
    }

    // ====================================================
    // BASIC INFORMATION
    // ====================================================

    if (specialization !== undefined) {
      doctor.specialization = specialization.trim();
    }

    if (qualification !== undefined) {
      doctor.qualification = qualification.trim();
    }

    if (experience !== undefined) {
      const value = Number(experience);

      if (!Number.isFinite(value) || value < 0) {
        return res.status(400).json({
          success: false,
          message: "Invalid experience.",
        });
      }

      doctor.experience = value;
    }

    if (consultationFee !== undefined) {
      const value = Number(consultationFee);

      if (!Number.isFinite(value) || value < 0) {
        return res.status(400).json({
          success: false,
          message: "Invalid consultation fee.",
        });
      }

      doctor.consultationFee = value;
    }

    if (virtualConsultationFee !== undefined) {
      if (virtualConsultationFee === null || virtualConsultationFee === "") {
        doctor.virtualConsultationFee = undefined;
      } else {
        const value = Number(virtualConsultationFee);

        if (!Number.isFinite(value) || value < 0) {
          return res.status(400).json({
            success: false,
            message: "Invalid virtual consultation fee.",
          });
        }

        doctor.virtualConsultationFee = value;
      }
    }

    // ====================================================
    // AVAILABLE DAYS
    // ====================================================

    if (availableDays !== undefined) {
      const validDays = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ];

      if (!Array.isArray(availableDays)) {
        return res.status(400).json({
          success: false,
          message: "availableDays must be an array.",
        });
      }

      const invalidDays = availableDays.filter(
        (day) => !validDays.includes(day),
      );

      if (invalidDays.length > 0) {
        return res.status(400).json({
          success: false,
          message: "Invalid available day.",
        });
      }

      doctor.availableDays = availableDays;
    }

    // ====================================================
    // AVAILABLE TIME
    // ====================================================

    if (availableTime !== undefined) {
      doctor.availableTime = availableTime;
    }

    // ====================================================
    // AVAILABILITY
    // ====================================================

    if (isAvailable !== undefined) {
      if (typeof isAvailable !== "boolean") {
        return res.status(400).json({
          success: false,
          message: "isAvailable must be true or false.",
        });
      }

      doctor.isAvailable = isAvailable;
    }

    // ====================================================
    // BIO
    // ====================================================

    if (bio !== undefined) {
      doctor.bio = bio.trim();
    }

    await doctor.save();

    const updatedDoctor = await DoctorModel.findById(doctor._id)
      .populate("user", "fullName email phone profileImage city")
      .populate("hospital", "name phone email address city");

    return res.status(200).json({
      success: true,

      message: "Doctor profile updated successfully.",

      doctor: updatedDoctor,
    });
  } catch (error) {
    console.error("Update Doctor Error:", error);

    return res.status(500).json({
      success: false,

      message: "Something went wrong while updating the doctor.",
    });
  }
};

// ============================================================
// UPDATE DOCTOR AVAILABILITY
// ============================================================

const updateDoctorAvailability = async (req, res) => {
  try {
    const userId = req.user.id;

    const { isAvailable } = req.body;

    if (typeof isAvailable !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "isAvailable must be true or false.",
      });
    }

    const doctor = await DoctorModel.findOneAndUpdate(
      {
        user: userId,
      },

      {
        $set: {
          isAvailable,
        },
      },

      {
        new: true,
        runValidators: true,
      },
    );

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor profile not found.",
      });
    }

    return res.status(200).json({
      success: true,

      message: "Doctor availability updated.",

      isAvailable: doctor.isAvailable,
    });
  } catch (error) {
    console.error("Update Doctor Availability Error:", error);

    return res.status(500).json({
      success: false,

      message: "Something went wrong.",
    });
  }
};

// ============================================================
// GET DOCTORS OF A HOSPITAL
// ============================================================

const getHospitalDoctors = async (req, res) => {
  try {
    const { hospitalId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(hospitalId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid hospital ID.",
      });
    }

    const hospital = await HospitalModel.findById(hospitalId);

    if (!hospital) {
      return res.status(404).json({
        success: false,
        message: "Hospital not found.",
      });
    }

    const doctors = await DoctorModel.find({
      hospital: hospitalId,
    })
      .populate("user", "fullName email phone profileImage city")
      .populate("hospital", "name city address")
      .sort({
        specialization: 1,
      });

    return res.status(200).json({
      success: true,

      hospital: {
        id: hospital._id,
        name: hospital.name,
        city: hospital.city,
      },

      count: doctors.length,

      doctors,
    });
  } catch (error) {
    console.error("Get Hospital Doctors Error:", error);

    return res.status(500).json({
      success: false,

      message: "Something went wrong while fetching hospital doctors.",
    });
  }
};

// ============================================================
// DELETE DOCTOR PROFILE
// ============================================================

const deleteDoctor = async (req, res) => {
  try {
    const userId = req.user.id;

    const doctor = await DoctorModel.findOneAndDelete({
      user: userId,
    });

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor profile not found.",
      });
    }

    return res.status(200).json({
      success: true,

      message: "Doctor profile deleted successfully.",
    });
  } catch (error) {
    console.error("Delete Doctor Error:", error);

    return res.status(500).json({
      success: false,

      message: "Something went wrong while deleting the doctor profile.",
    });
  }
};

// ============================================================
// EXPORT
// ============================================================

module.exports = {
  createDoctor,

  getDoctors,

  getDoctorById,

  getMyDoctorProfile,

  updateDoctor,

  updateDoctorAvailability,

  getHospitalDoctors,

  deleteDoctor,
};
