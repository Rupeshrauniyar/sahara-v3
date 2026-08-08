const mongoose = require("mongoose");

const bloodDonorSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },

    availability: {
      type: Boolean,
      default: true,
      index: true,
    },

    emergencyAvailable: {
      type: Boolean,
      default: true,
      index: true,
    },

    lastDonationDate: {
      type: Date,
    },

    totalDonations: {
      type: Number,
      default: 0,
      min: 0,
    },

    remarks: {
      type: String,
      trim: true,
      maxlength: 500,
    },

    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

bloodDonorSchema.index({
  availability: 1,
  emergencyAvailable: 1,
  isActive: 1,
});

module.exports = mongoose.model(
  "BloodDonor",
  bloodDonorSchema
);