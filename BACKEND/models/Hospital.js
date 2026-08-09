const mongoose = require("mongoose");

const hospitalSchema = new mongoose.Schema(
  {
    // =====================================================
    // ADMIN
    // =====================================================

    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },

    // =====================================================
    // BASIC INFORMATION
    // =====================================================

    name: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    description: {
      type: String,
      trim: true,
      maxlength: 1000,
    },

    phone: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },

    website: {
      type: String,
      trim: true,
    },

    address: {
      type: String,
      required: true,
      trim: true,
    },

    city: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    // =====================================================
    // LOCATION
    // =====================================================

    latitude: {
      type: Number,
      min: -90,
      max: 90,
      default: null,
    },

    longitude: {
      type: Number,
      min: -180,
      max: 180,
      default: null,
    },

    // =====================================================
    // DEPARTMENTS
    // =====================================================

    departments: [
      {
        type: String,
        trim: true,
      },
    ],

    // =====================================================
    // BEDS
    // =====================================================

    beds: {
      total: {
        type: Number,
        default: 0,
        min: 0,
      },

      available: {
        type: Number,
        default: 0,
        min: 0,
      },

      icu: {
        type: Number,
        default: 0,
        min: 0,
      },

      emergency: {
        type: Number,
        default: 0,
        min: 0,
      },
    },

    // =====================================================
    // BLOOD INVENTORY
    // =====================================================

    bloodInventory: {
      "A+": {
        type: Number,
        default: 0,
        min: 0,
      },

      "A-": {
        type: Number,
        default: 0,
        min: 0,
      },

      "B+": {
        type: Number,
        default: 0,
        min: 0,
      },

      "B-": {
        type: Number,
        default: 0,
        min: 0,
      },

      "AB+": {
        type: Number,
        default: 0,
        min: 0,
      },

      "AB-": {
        type: Number,
        default: 0,
        min: 0,
      },

      "O+": {
        type: Number,
        default: 0,
        min: 0,
      },

      "O-": {
        type: Number,
        default: 0,
        min: 0,
      },
    },

    // =====================================================
    // EMERGENCY / OPERATING STATUS
    // =====================================================

    emergencyAvailable: {
      type: Boolean,
      default: true,
      index: true,
    },

    ambulanceAvailable: {
      type: Boolean,
      default: false,
    },

    isOpen: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

// ============================================================
// INDEXES
// ============================================================

hospitalSchema.index({
  city: 1,
  emergencyAvailable: 1,
});

hospitalSchema.index({
  admin: 1,
});

hospitalSchema.index({
  latitude: 1,
  longitude: 1,
});

// ============================================================
// VIRTUAL: DOES HOSPITAL HAVE MAP LOCATION?
// ============================================================

hospitalSchema.virtual("hasLocation").get(function () {
  return (
    typeof this.latitude === "number" &&
    typeof this.longitude === "number"
  );
});

// ============================================================
// JSON / OBJECT SETTINGS
// ============================================================

hospitalSchema.set("toJSON", {
  virtuals: true,
});

hospitalSchema.set("toObject", {
  virtuals: true,
});

// ============================================================
// EXPORT
// ============================================================

module.exports = mongoose.model(
  "Hospital",
  hospitalSchema,
);