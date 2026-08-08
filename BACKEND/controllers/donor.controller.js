const BloodDonorModel = require("../models/Donor");
const UserModel = require("../models/User");

const becomeDonor = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await UserModel.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: "Your account is inactive.",
      });
    }

    if (!user.bloodGroup) {
      return res.status(400).json({
        success: false,
        message:
          "Please add your blood group to your profile before becoming a donor.",
      });
    }

    const existingDonor =
      await BloodDonorModel.findOne({
        user: userId,
      });

    if (existingDonor) {
      if (!existingDonor.isActive) {
        existingDonor.isActive = true;
        existingDonor.availability = true;
        await existingDonor.save();

        return res.status(200).json({
          success: true,
          message: "You have been reactivated as a blood donor.",
          donor: existingDonor,
        });
      }

      return res.status(409).json({
        success: false,
        message: "You are already registered as a blood donor.",
        donor: existingDonor,
      });
    }

    const donor = await BloodDonorModel.create({
      user: userId,
      availability: true,
      emergencyAvailable: true,
      isActive: true,
    });

    const populatedDonor =
      await BloodDonorModel.findById(donor._id).populate(
        "user",
        "fullName email phone city bloodGroup profileImage location isVerified"
      );

    return res.status(201).json({
      success: true,
      message: "You are now registered as a blood donor.",
      donor: populatedDonor,
    });
  } catch (error) {
    console.error("Become Donor Error:", error);

    return res.status(500).json({
      success: false,
      message:
        "Something went wrong while registering as a donor.",
    });
  }
};

const getActiveDonors = async (req, res) => {
  try {
    const {
      bloodGroup,
      city,
      emergency,
    } = req.query;

    const donorQuery = {
      isActive: true,
      availability: true,
    };

    if (emergency === "true") {
      donorQuery.emergencyAvailable = true;
    }

    const donors =
      await BloodDonorModel.find(donorQuery)
        .populate(
          "user",
          "fullName phone city bloodGroup profileImage location isVerified"
        )
        .sort({
          emergencyAvailable: -1,
          createdAt: -1,
        });

    let filteredDonors = donors.filter(
      (donor) => donor.user
    );

    if (bloodGroup) {
      filteredDonors = filteredDonors.filter(
        (donor) =>
          donor.user.bloodGroup === bloodGroup
      );
    }

    if (city) {
      const searchCity =
        city.trim().toLowerCase();

      filteredDonors = filteredDonors.filter(
        (donor) =>
          donor.user.city
            ?.toLowerCase()
            .includes(searchCity)
      );
    }

    return res.status(200).json({
      success: true,
      count: filteredDonors.length,
      donors: filteredDonors,
    });
  } catch (error) {
    console.error(
      "Get Active Donors Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Something went wrong while fetching active donors.",
    });
  }
};

const getMyDonorProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const donor =
      await BloodDonorModel.findOne({
        user: userId,
      }).populate(
        "user",
        "fullName email phone city bloodGroup profileImage location isVerified"
      );

    if (!donor) {
      return res.status(404).json({
        success: false,
        message:
          "You are not registered as a blood donor.",
        donor: null,
      });
    }

    return res.status(200).json({
      success: true,
      donor,
    });
  } catch (error) {
    console.error(
      "Get My Donor Profile Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Something went wrong while fetching your donor profile.",
    });
  }
};

const updateDonorAvailability = async (
  req,
  res
) => {
  try {
    const userId = req.user.id;
    const { availability } = req.body;

    if (typeof availability !== "boolean") {
      return res.status(400).json({
        success: false,
        message:
          "Availability must be true or false.",
      });
    }

    const donor =
      await BloodDonorModel.findOne({
        user: userId,
        isActive: true,
      });

    if (!donor) {
      return res.status(404).json({
        success: false,
        message:
          "You are not registered as a blood donor.",
      });
    }

    donor.availability = availability;

    await donor.save();

    return res.status(200).json({
      success: true,
      message: availability
        ? "You are now available to donate."
        : "You are now unavailable to donate.",
      donor,
    });
  } catch (error) {
    console.error(
      "Update Donor Availability Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Something went wrong while updating availability.",
    });
  }
};

const updateEmergencyAvailability = async (
  req,
  res
) => {
  try {
    const userId = req.user.id;
    const { emergencyAvailable } =
      req.body;

    if (
      typeof emergencyAvailable !==
      "boolean"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Emergency availability must be true or false.",
      });
    }

    const donor =
      await BloodDonorModel.findOne({
        user: userId,
        isActive: true,
      });

    if (!donor) {
      return res.status(404).json({
        success: false,
        message:
          "You are not registered as a blood donor.",
      });
    }

    donor.emergencyAvailable =
      emergencyAvailable;

    await donor.save();

    return res.status(200).json({
      success: true,
      message: emergencyAvailable
        ? "Emergency donation availability enabled."
        : "Emergency donation availability disabled.",
      donor,
    });
  } catch (error) {
    console.error(
      "Update Emergency Availability Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Something went wrong while updating emergency availability.",
    });
  }
};

const updateDonorInformation = async (
  req,
  res
) => {
  try {
    const userId = req.user.id;

    const {
      lastDonationDate,
      totalDonations,
      remarks,
    } = req.body;

    const donor =
      await BloodDonorModel.findOne({
        user: userId,
        isActive: true,
      });

    if (!donor) {
      return res.status(404).json({
        success: false,
        message:
          "You are not registered as a blood donor.",
      });
    }

    if (lastDonationDate !== undefined) {
      if (lastDonationDate === "") {
        donor.lastDonationDate =
          undefined;
      } else {
        const parsedDate =
          new Date(lastDonationDate);

        if (Number.isNaN(
          parsedDate.getTime()
        )) {
          return res.status(400).json({
            success: false,
            message:
              "Invalid last donation date.",
          });
        }

        donor.lastDonationDate =
          parsedDate;
      }
    }

    if (totalDonations !== undefined) {
      const donations = Number(
        totalDonations
      );

      if (
        !Number.isInteger(donations) ||
        donations < 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Total donations must be a valid number.",
        });
      }

      donor.totalDonations =
        donations;
    }

    if (remarks !== undefined) {
      donor.remarks =
        String(remarks).trim();
    }

    await donor.save();

    const populatedDonor =
      await BloodDonorModel.findById(
        donor._id
      ).populate(
        "user",
        "fullName email phone city bloodGroup profileImage location isVerified"
      );

    return res.status(200).json({
      success: true,
      message:
        "Donor information updated successfully.",
      donor: populatedDonor,
    });
  } catch (error) {
    console.error(
      "Update Donor Information Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Something went wrong while updating donor information.",
    });
  }
};

const leaveDonorProgram = async (
  req,
  res
) => {
  try {
    const userId = req.user.id;

    const donor =
      await BloodDonorModel.findOne({
        user: userId,
      });

    if (!donor) {
      return res.status(404).json({
        success: false,
        message:
          "You are not registered as a blood donor.",
      });
    }

    donor.isActive = false;
    donor.availability = false;
    donor.emergencyAvailable = false;

    await donor.save();

    return res.status(200).json({
      success: true,
      message:
        "You have left the blood donor program.",
    });
  } catch (error) {
    console.error(
      "Leave Donor Program Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Something went wrong while leaving the donor program.",
    });
  }
};

module.exports = {
  becomeDonor,
  getActiveDonors,
  getMyDonorProfile,
  updateDonorAvailability,
  updateEmergencyAvailability,
  updateDonorInformation,
  leaveDonorProgram,
};