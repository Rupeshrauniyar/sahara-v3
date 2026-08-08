const mongoose = require("mongoose");

const doctorSchema = new mongoose.Schema(
  {
    // ============================================
    // USER
    // ============================================

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },

    // ============================================
    // PRACTICE TYPE
    // ============================================

    practiceType: {
      type: String,
      enum: ["Hospital", "Independent"],
      required: true,
      default: "Independent",
      index: true,
    },

    // ============================================
    // HOSPITAL
    // ============================================

    hospital: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hospital",
      required: function () {
        return this.practiceType === "Hospital";
      },
      index: true,
    },

    // ============================================
    // DOCTOR INFORMATION
    // ============================================

    specialization: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    qualification: {
      type: String,
      required: true,
      trim: true,
    },

    experience: {
      type: Number,
      required: true,
      min: 0,
    },

    consultationFee: {
      type: Number,
      required: true,
      min: 0,
    },

    virtualConsultationFee: {
      type: Number,
      min: 0,
    },

    // ============================================
    // AVAILABILITY
    // ============================================

    availableDays: {
      type: [String],
      enum: [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ],
      default: [],
    },

    availableTime: {
      start: {
        type: String,
        // Example: "09:00"
      },

      end: {
        type: String,
        // Example: "17:00"
      },
    },

    isAvailable: {
      type: Boolean,
      default: true,
      index: true,
    },

    // ============================================
    // PROFILE
    // ============================================

    bio: {
      type: String,
      trim: true,
      maxlength: 1000,
    },
  },
  {
    timestamps: true,
  }
);

// ============================================
// INDEXES
// ============================================

doctorSchema.index({ 
  specialization: 1,
  hospital: 1,
});

doctorSchema.methods.getFeeForType = function (appointmentType) {
  if (appointmentType === "Virtual") {
    if (this.virtualConsultationFee != null) {
      return this.virtualConsultationFee;
    }

    return Math.round(this.consultationFee * 0.7);
  }

  return this.consultationFee;
};
 
module.exports = mongoose.model("Doctor", doctorSchema);