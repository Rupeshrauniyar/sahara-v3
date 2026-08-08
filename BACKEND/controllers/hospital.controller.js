const mongoose = require("mongoose");
const HospitalModel = require("../models/Hospital");

// ============================================================
// HELPER: GET AUTHENTICATED USER ID
// Supports different JWT/auth middleware formats
// ============================================================

const getUserId = (req) => {
  return req.user?.id || req.user?._id || req.user?.userId || null;
};

// ============================================================
// HELPER: CHECK HOSPITAL ADMIN
// ============================================================

const isHospitalAdmin = (req) => {
  const role = req.user?.role;

  return (
    role === "HospitalAdmin" ||
    role === "hospitalAdmin" ||
    role === "hospital_admin"
  );
};

// ============================================================
// CREATE HOSPITAL
// ============================================================

const createHospital = async (req, res) => {
  try {
    const {
      name,
      description,
      phone,
      email,
      website,
      address,
      city,
      departments,
      beds,
      bloodInventory,
      emergencyAvailable,
      ambulanceAvailable,
      isOpen,
    } = req.body;

    const admin = getUserId(req);

    // ----------------------------------------------------
    // AUTH CHECK
    // ----------------------------------------------------

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: "User authentication information is missing.",
      });
    }

    // ----------------------------------------------------
    // ROLE CHECK
    // ----------------------------------------------------

    if (!isHospitalAdmin(req)) {
      return res.status(403).json({
        success: false,
        message: "Only hospital administrators can create a hospital.",
      });
    }

    // ----------------------------------------------------
    // REQUIRED FIELDS
    // ----------------------------------------------------

    if (!name || !phone || !email || !address || !city) {
      return res.status(400).json({
        success: false,
        message: "Name, phone, email, address and city are required.",
      });
    }

    // ----------------------------------------------------
    // CHECK EXISTING HOSPITAL
    // ----------------------------------------------------

    const existingHospital = await HospitalModel.findOne({
      admin,
    });

    if (existingHospital) {
      return res.status(409).json({
        success: false,
        message: "You already have a registered hospital.",
        hospital: existingHospital,
      });
    }

    // ----------------------------------------------------
    // CREATE HOSPITAL
    // ----------------------------------------------------

    const hospital = await HospitalModel.create({
      admin,

      name: name.trim(),

      description: description?.trim() || undefined,

      phone: phone.trim(),

      email: email.toLowerCase().trim(),

      website: website?.trim() || undefined,

      address: address.trim(),

      city: city.trim(),

      departments: Array.isArray(departments) ? departments : [],

      beds: {
        total: Number(beds?.total) || 0,

        available: Number(beds?.available) || 0,

        icu: Number(beds?.icu) || 0,

        emergency: Number(beds?.emergency) || 0,
      },

      bloodInventory: {
        "A+": Number(bloodInventory?.["A+"]) || 0,

        "A-": Number(bloodInventory?.["A-"]) || 0,

        "B+": Number(bloodInventory?.["B+"]) || 0,

        "B-": Number(bloodInventory?.["B-"]) || 0,

        "AB+": Number(bloodInventory?.["AB+"]) || 0,

        "AB-": Number(bloodInventory?.["AB-"]) || 0,

        "O+": Number(bloodInventory?.["O+"]) || 0,

        "O-": Number(bloodInventory?.["O-"]) || 0,
      },

      emergencyAvailable:
        emergencyAvailable !== undefined ? emergencyAvailable : true,

      ambulanceAvailable:
        ambulanceAvailable !== undefined ? ambulanceAvailable : false,

      isOpen: isOpen !== undefined ? isOpen : true,
    });

    return res.status(201).json({
      success: true,
      message: "Hospital registered successfully.",
      hospital,
    });
  } catch (error) {
    console.error("Create Hospital Error:", error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong while creating the hospital.",
    });
  }
};

// ============================================================
// GET ALL HOSPITALS
// ============================================================

const getHospitals = async (req, res) => {
  try {
    const { city, emergencyOnly, ambulanceOnly, isOpen } = req.query;

    const filter = {};

    if (city) {
      filter.city = new RegExp(`^${city.trim()}$`, "i");
    }

    if (emergencyOnly === "true") {
      filter.emergencyAvailable = true;
    }

    if (ambulanceOnly === "true") {
      filter.ambulanceAvailable = true;
    }

    if (isOpen === "true") {
      filter.isOpen = true;
    }

    const hospitals = await HospitalModel.find(filter).select("-__v").sort({
      name: 1,
    });

    return res.status(200).json({
      success: true,
      count: hospitals.length,
      hospitals,
    });
  } catch (error) {
    console.error("Get Hospitals Error:", error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong while fetching hospitals.",
    });
  }
};

// ============================================================
// GET HOSPITAL BY ID
// ============================================================

const getHospitalById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid hospital ID.",
      });
    }

    const hospital = await HospitalModel.findById(id).populate(
      "admin",
      "fullName email phone",
    );

    if (!hospital) {
      return res.status(404).json({
        success: false,
        message: "Hospital not found.",
      });
    }

    return res.status(200).json({
      success: true,
      hospital,
    });
  } catch (error) {
    console.error("Get Hospital Error:", error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong while fetching the hospital.",
    });
  }
};

// ============================================================
// GET MY HOSPITAL
// IMPORTANT FIX
// ============================================================

const getMyHospital = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id || req.user?.userId;

    console.log("=================================");
    console.log("GET MY HOSPITAL");
    console.log("req.user:", req.user);
    console.log("userId:", userId);
    console.log("=================================");

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication user ID not found.",
      });
    }

    // First try the normal owner relationship
    let hospital = await HospitalModel.findOne({
      admin: userId,
    });

    // If not found, try converting the ID explicitly
    if (!hospital) {
      try {
        const objectId = new mongoose.Types.ObjectId(userId);

        hospital = await HospitalModel.findOne({
          admin: objectId,
        });
      } catch (err) {
        console.log("Could not convert user ID to ObjectId");
      }
    }

    if (!hospital) {
      console.log("NO HOSPITAL FOUND FOR USER:", userId);

      // DO NOT return the old misleading response
      // until we know how your database is structured.

      return res.status(404).json({
        success: false,
        message:
          "Hospital could not be linked to the currently logged-in account.",
        userId,
      });
    }

    console.log("HOSPITAL FOUND:", hospital._id);

    return res.status(200).json({
      success: true,
      hospital,
    });
  } catch (error) {
    console.error("GET MY HOSPITAL ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong while fetching hospital information.",
    });
  }
};

// ============================================================
// UPDATE HOSPITAL PROFILE
// ============================================================

const updateHospital = async (req, res) => {
  try {
    const { id } = req.params;
    const admin = getUserId(req);

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid hospital ID.",
      });
    }

    const hospital = await HospitalModel.findOne({
      _id: id,
      admin,
    });

    if (!hospital) {
      return res.status(404).json({
        success: false,
        message: "Hospital not found or you are not authorized.",
      });
    }

    const {
      name,
      description,
      phone,
      email,
      website,
      address,
      city,
      departments,
    } = req.body;

    if (name !== undefined) {
      hospital.name = name.trim();
    }

    if (description !== undefined) {
      hospital.description = description.trim();
    }

    if (phone !== undefined) {
      hospital.phone = phone.trim();
    }

    if (email !== undefined) {
      hospital.email = email.toLowerCase().trim();
    }

    if (website !== undefined) {
      hospital.website = website.trim();
    }

    if (address !== undefined) {
      hospital.address = address.trim();
    }

    if (city !== undefined) {
      hospital.city = city.trim();
    }

    if (departments !== undefined) {
      if (!Array.isArray(departments)) {
        return res.status(400).json({
          success: false,
          message: "Departments must be an array.",
        });
      }

      hospital.departments = departments;
    }

    await hospital.save();

    return res.status(200).json({
      success: true,
      message: "Hospital profile updated successfully.",
      hospital,
    });
  } catch (error) {
    console.error("Update Hospital Error:", error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong while updating the hospital.",
    });
  }
};

// ============================================================
// UPDATE BEDS
// ============================================================

const updateBeds = async (req, res) => {
  try {
    const { id } = req.params;
    const admin = getUserId(req);

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid hospital ID.",
      });
    }

    const hospital = await HospitalModel.findOne({
      _id: id,
      admin,
    });

    if (!hospital) {
      return res.status(404).json({
        success: false,
        message: "Hospital not found or unauthorized.",
      });
    }

    const { total, available, icu, emergency } = req.body;

    if (total !== undefined) {
      hospital.beds.total = Number(total);
    }

    if (available !== undefined) {
      hospital.beds.available = Number(available);
    }

    if (icu !== undefined) {
      hospital.beds.icu = Number(icu);
    }

    if (emergency !== undefined) {
      hospital.beds.emergency = Number(emergency);
    }

    // ----------------------------------------------------
    // VALIDATION
    // ----------------------------------------------------

    if (
      hospital.beds.total < 0 ||
      hospital.beds.available < 0 ||
      hospital.beds.icu < 0 ||
      hospital.beds.emergency < 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Bed counts cannot be negative.",
      });
    }

    if (hospital.beds.available > hospital.beds.total) {
      return res.status(400).json({
        success: false,
        message: "Available beds cannot exceed total beds.",
      });
    }

    await hospital.save();

    return res.status(200).json({
      success: true,
      message: "Hospital bed information updated.",
      beds: hospital.beds,
    });
  } catch (error) {
    console.error("Update Beds Error:", error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong while updating beds.",
    });
  }
};

// ============================================================
// UPDATE BLOOD INVENTORY
// ============================================================

const updateBloodInventory = async (req, res) => {
  try {
    const { id } = req.params;
    const admin = getUserId(req);

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid hospital ID.",
      });
    }

    const hospital = await HospitalModel.findOne({
      _id: id,
      admin,
    });

    if (!hospital) {
      return res.status(404).json({
        success: false,
        message: "Hospital not found or unauthorized.",
      });
    }

    const validBloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

    const inventory = req.body || {};

    for (const bloodGroup of validBloodGroups) {
      if (inventory[bloodGroup] !== undefined) {
        const amount = Number(inventory[bloodGroup]);

        if (!Number.isInteger(amount) || amount < 0) {
          return res.status(400).json({
            success: false,
            message: `Invalid inventory value for ${bloodGroup}.`,
          });
        }

        hospital.bloodInventory[bloodGroup] = amount;
      }
    }

    await hospital.save();

    return res.status(200).json({
      success: true,
      message: "Blood inventory updated successfully.",
      bloodInventory: hospital.bloodInventory,
    });
  } catch (error) {
    console.error("Update Blood Inventory Error:", error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong while updating blood inventory.",
    });
  }
};

// ============================================================
// UPDATE EMERGENCY STATUS
// ============================================================

const updateEmergencyStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const admin = getUserId(req);

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    const { emergencyAvailable } = req.body;

    if (typeof emergencyAvailable !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "emergencyAvailable must be true or false.",
      });
    }

    const hospital = await HospitalModel.findOneAndUpdate(
      {
        _id: id,
        admin,
      },
      {
        $set: {
          emergencyAvailable,
        },
      },
      {
        new: true,
        runValidators: true,
      },
    );

    if (!hospital) {
      return res.status(404).json({
        success: false,
        message: "Hospital not found or unauthorized.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Emergency availability updated.",
      emergencyAvailable: hospital.emergencyAvailable,
    });
  } catch (error) {
    console.error("Emergency Status Error:", error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong.",
    });
  }
};

// ============================================================
// UPDATE AMBULANCE STATUS
// ============================================================

const updateAmbulanceStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const admin = getUserId(req);

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    const { ambulanceAvailable } = req.body;

    if (typeof ambulanceAvailable !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "ambulanceAvailable must be true or false.",
      });
    }

    const hospital = await HospitalModel.findOneAndUpdate(
      {
        _id: id,
        admin,
      },
      {
        $set: {
          ambulanceAvailable,
        },
      },
      {
        new: true,
        runValidators: true,
      },
    );

    if (!hospital) {
      return res.status(404).json({
        success: false,
        message: "Hospital not found or unauthorized.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Ambulance availability updated.",
      ambulanceAvailable: hospital.ambulanceAvailable,
    });
  } catch (error) {
    console.error("Ambulance Status Error:", error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong.",
    });
  }
};

// ============================================================
// UPDATE HOSPITAL OPEN/CLOSED STATUS
// ============================================================

const updateHospitalStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const admin = getUserId(req);

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    const { isOpen } = req.body;

    if (typeof isOpen !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "isOpen must be true or false.",
      });
    }

    const hospital = await HospitalModel.findOneAndUpdate(
      {
        _id: id,
        admin,
      },
      {
        $set: {
          isOpen,
        },
      },
      {
        new: true,
        runValidators: true,
      },
    );

    if (!hospital) {
      return res.status(404).json({
        success: false,
        message: "Hospital not found or unauthorized.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Hospital status updated.",
      isOpen: hospital.isOpen,
    });
  } catch (error) {
    console.error("Hospital Status Error:", error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong.",
    });
  }
};

// ============================================================
// DELETE HOSPITAL
// ============================================================

const deleteHospital = async (req, res) => {
  try {
    const { id } = req.params;
    const admin = getUserId(req);

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    const hospital = await HospitalModel.findOneAndDelete({
      _id: id,
      admin,
    });

    if (!hospital) {
      return res.status(404).json({
        success: false,
        message: "Hospital not found or unauthorized.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Hospital deleted successfully.",
    });
  } catch (error) {
    console.error("Delete Hospital Error:", error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong while deleting the hospital.",
    });
  }
};

// ============================================================
// EXPORT
// ============================================================

module.exports = {
  createHospital,
  getHospitals,
  getHospitalById,
  getMyHospital,
  updateHospital,
  updateBeds,
  updateBloodInventory,
  updateEmergencyStatus,
  updateAmbulanceStatus,
  updateHospitalStatus,
  deleteHospital,
};
