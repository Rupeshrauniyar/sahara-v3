const mongoose = require("mongoose");

const emergencyRequestSchema = new mongoose.Schema(
  {
    requestedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    emergencyType: {
      type: String,
      required: true,
      enum: [
        "Accident",
        "Heart Attack",
        "Stroke",
        "Breathing Problem",
        "Burn",
        "Pregnancy",
        "Poisoning",
        "Bleeding",
        "Other",
      ],
      default: "Other",
      index: true,
    },

    description: {
      type: String,
      trim: true,
      maxlength: 1000,
    },

    severity: {
      type: String,
      enum: [
        "Low",
        "Medium",
        "High",
        "Critical",
      ],
      default: "High",
      index: true,
    },

    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        default: undefined,
      },
    },

    address: {
      type: String,
      required: true,
      trim: true,
    },

    assignedHospital: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hospital",
      default: null,
      index: true,
    },

    aiRecommendation: {
      type: String,
      trim: true,
      maxlength: 1000,
    },

    status: {
      type: String,
      enum: [
        "Pending",
        "Accepted",
        "In Progress",
        "Completed",
        "Cancelled",
      ],
      default: "Pending",
      index: true,
    },

    emergencyContactName: {
      type: String,
      trim: true,
    },

    emergencyContactPhone: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

emergencyRequestSchema.index(
  { location: "2dsphere" },
  { sparse: true }
);

module.exports = mongoose.model(
  "EmergencyRequest",
  emergencyRequestSchema
);