const mongoose = require("mongoose");
const BloodRequestModel = require("../models/BloodRequest");
const HospitalModel = require("../models/Hospital");

// =====================================================
// HELPERS
// =====================================================

const isHospitalAdmin = (req) => {
  return req.user?.role === "HospitalAdmin";
};

const getMyHospital = async (userId) => {
  return HospitalModel.findOne({
    admin: userId,
  });
};

// =====================================================
// CREATE BLOOD REQUEST
// =====================================================

const createBloodRequest = async (req, res) => {
  try {
    const {
      patientName,
      bloodGroup,
      unitsRequired,
      hospital,
      hospitalName,
      city,
      address,
      urgency,
      requiredBy,
      contactName,
      contactPhone,
      additionalNotes,
    } = req.body;

    const requestedBy = req.user.id;

    const trimmedHospitalName =
      hospitalName?.trim();

    if (
      !patientName ||
      !bloodGroup ||
      !unitsRequired ||
      (!hospital && !trimmedHospitalName) ||
      !city ||
      !address ||
      !requiredBy ||
      !contactName ||
      !contactPhone
    ) {
      return res.status(400).json({
        success: false,
        message:
          "All required fields must be provided.",
      });
    }

    const validBloodGroups = [
      "A+",
      "A-",
      "B+",
      "B-",
      "AB+",
      "AB-",
      "O+",
      "O-",
    ];

    if (!validBloodGroups.includes(bloodGroup)) {
      return res.status(400).json({
        success: false,
        message: "Invalid blood group.",
      });
    }

    const units = Number(unitsRequired);

    if (
      !Number.isInteger(units) ||
      units < 1
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Units required must be at least 1.",
      });
    }

    const validUrgencies = [
      "Low",
      "Medium",
      "High",
      "Critical",
    ];

    const requestUrgency =
      urgency || "Medium";

    if (
      !validUrgencies.includes(requestUrgency)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid urgency level.",
      });
    }

    const requiredDate = new Date(
      requiredBy
    );

    if (
      Number.isNaN(
        requiredDate.getTime()
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid required-by date.",
      });
    }

    if (requiredDate <= new Date()) {
      return res.status(400).json({
        success: false,
        message:
          "Required-by date must be in the future.",
      });
    }

    if (hospital) {
      if (
        !mongoose.Types.ObjectId.isValid(
          hospital
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid hospital ID.",
        });
      }

      const hospitalExists =
        await HospitalModel.findById(
          hospital
        );

      if (!hospitalExists) {
        return res.status(404).json({
          success: false,
          message:
            "Hospital not found.",
        });
      }
    }

    const bloodRequest =
      await BloodRequestModel.create({
        requestedBy,

        patientName:
          patientName.trim(),

        bloodGroup,

        unitsRequired: units,

        hospital:
          hospital || undefined,

        hospitalName:
          trimmedHospitalName ||
          undefined,

        city: city.trim(),

        address: address.trim(),

        urgency: requestUrgency,

        requiredBy: requiredDate,

        contactName:
          contactName.trim(),

        contactPhone:
          contactPhone.trim(),

        additionalNotes:
          additionalNotes?.trim() ||
          undefined,

        status: "Open",
      });

    const populatedRequest =
      await BloodRequestModel
        .findById(
          bloodRequest._id
        )
        .populate(
          "requestedBy",
          "fullName email phone"
        )
        .populate(
          "hospital",
          "name address city phone email"
        );

    return res.status(201).json({
      success: true,
      message:
        "Blood request created successfully.",
      request: populatedRequest,
    });
  } catch (error) {
    console.error(
      "Create Blood Request Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Something went wrong while creating the blood request.",
    });
  }
};

// =====================================================
// GET MY BLOOD REQUESTS
// =====================================================

const getMyBloodRequests = async (
  req,
  res
) => {
  try {
    const requestedBy = req.user.id;

    const requests =
      await BloodRequestModel
        .find({
          requestedBy,
        })
        .populate(
          "hospital",
          "name address city phone"
        )
        .sort({
          createdAt: -1,
        });

    return res.status(200).json({
      success: true,
      count: requests.length,
      requests,
    });
  } catch (error) {
    console.error(
      "Get My Blood Requests Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Something went wrong while fetching blood requests.",
    });
  }
};

// =====================================================
// GET ACTIVE BLOOD REQUESTS
// =====================================================

const getActiveBloodRequests = async (
  req,
  res
) => {
  try {
    const requests =
      await BloodRequestModel
        .find({
          status: "Open",
          requiredBy: {
            $gt: new Date(),
          },
        })
        .populate(
          "requestedBy",
          "fullName phone"
        )
        .populate(
          "hospital",
          "name address city phone"
        )
        .sort({
          requiredBy: 1,
          createdAt: -1,
        });

    return res.status(200).json({
      success: true,
      count: requests.length,
      requests,
    });
  } catch (error) {
    console.error(
      "Get Active Blood Requests Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Something went wrong while fetching active blood requests.",
    });
  }
};

// =====================================================
// GET REQUESTS FOR LOGGED-IN HOSPITAL
// =====================================================

const getHospitalBloodRequests = async (
  req,
  res
) => {
  try {
    if (!isHospitalAdmin(req)) {
      return res.status(403).json({
        success: false,
        message:
          "Only hospital administrators can access hospital requests.",
      });
    }

    const hospital =
      await getMyHospital(
        req.user.id
      );

    if (!hospital) {
      return res.status(404).json({
        success: false,
        message:
          "You do not have a registered hospital.",
      });
    }

    const requests =
      await BloodRequestModel
        .find({
          hospital: hospital._id,
        })
        .populate(
          "requestedBy",
          "fullName email phone"
        )
        .populate(
          "hospital",
          "name address city phone email"
        )
        .sort({
          createdAt: -1,
        });

    return res.status(200).json({
      success: true,

      count: requests.length,

      hospital: {
        _id: hospital._id,
        name: hospital.name,
        city: hospital.city,
      },

      requests,
    });
  } catch (error) {
    console.error(
      "Get Hospital Blood Requests Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Something went wrong while fetching hospital blood requests.",
    });
  }
};

// =====================================================
// GET ALL BLOOD REQUESTS FOR HOSPITAL ADMIN
// =====================================================

const getAllBloodRequestsForHospital =
  async (req, res) => {
    try {
      if (!isHospitalAdmin(req)) {
        return res.status(403).json({
          success: false,
          message:
            "Only hospital administrators can access all blood requests.",
        });
      }

      const hospital =
        await getMyHospital(
          req.user.id
        );

      if (!hospital) {
        return res.status(404).json({
          success: false,
          message:
            "You do not have a registered hospital.",
        });
      }

      const requests =
        await BloodRequestModel
          .find({})
          .populate(
            "requestedBy",
            "fullName email phone"
          )
          .populate(
            "hospital",
            "name address city phone email"
          )
          .sort({
            createdAt: -1,
          });

      return res.status(200).json({
        success: true,

        count: requests.length,

        hospital: {
          _id: hospital._id,
          name: hospital.name,
          city: hospital.city,
        },

        requests,
      });
    } catch (error) {
      console.error(
        "Get All Blood Requests For Hospital Error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Something went wrong while fetching all blood requests.",
      });
    }
  };

// =====================================================
// GET SINGLE BLOOD REQUEST
// =====================================================

const getBloodRequestById = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    if (
      !id ||
      !mongoose.Types.ObjectId.isValid(
        id
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid blood request ID.",
      });
    }

    const request =
      await BloodRequestModel
        .findById(id)
        .populate(
          "requestedBy",
          "fullName email phone"
        )
        .populate(
          "hospital",
          "name address city phone email"
        );

    if (!request) {
      return res.status(404).json({
        success: false,
        message:
          "Blood request not found.",
      });
    }

    return res.status(200).json({
      success: true,
      request,
    });
  } catch (error) {
    console.error(
      "Get Blood Request Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Something went wrong while fetching the blood request.",
    });
  }
};

// =====================================================
// CANCEL BLOOD REQUEST
// =====================================================

const cancelBloodRequest = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    if (
      !id ||
      !mongoose.Types.ObjectId.isValid(
        id
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid blood request ID.",
      });
    }

    const request =
      await BloodRequestModel.findOne({
        _id: id,
        requestedBy: req.user.id,
      });

    if (!request) {
      return res.status(404).json({
        success: false,
        message:
          "Blood request not found or you are not authorized.",
      });
    }

    if (
      request.status ===
      "Completed"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Completed blood requests cannot be cancelled.",
      });
    }

    if (
      request.status ===
      "Cancelled"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Blood request is already cancelled.",
      });
    }

    request.status = "Cancelled";

    await request.save();

    return res.status(200).json({
      success: true,
      message:
        "Blood request cancelled successfully.",
      request,
    });
  } catch (error) {
    console.error(
      "Cancel Blood Request Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Something went wrong while cancelling the blood request.",
    });
  }
};

// =====================================================
// EXPORT
// =====================================================

module.exports = {
  createBloodRequest,
  getMyBloodRequests,
  getActiveBloodRequests,
  getHospitalBloodRequests,
  getAllBloodRequestsForHospital,
  getBloodRequestById,
  cancelBloodRequest,
};