const mongoose = require("mongoose");

const bloodRequestSchema = new mongoose.Schema(
    {
        // =====================================================
        // REQUESTED BY
        // =====================================================

        requestedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },


        // =====================================================
        // PATIENT
        // =====================================================

        patientName: {
            type: String,
            required: true,
            trim: true,
        },


        // =====================================================
        // BLOOD
        // =====================================================

        bloodGroup: {
            type: String,

            required: true,

            enum: [
                "A+",
                "A-",
                "B+",
                "B-",
                "AB+",
                "AB-",
                "O+",
                "O-",
            ],

            index: true,
        },

        unitsRequired: {
            type: Number,
            required: true,
            min: 1,
        },


        // =====================================================
        // HOSPITAL
        // =====================================================

        hospital: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Hospital",
            required: true,
            index: true,
        },


        // =====================================================
        // LOCATION BY CITY/ADDRESS
        // =====================================================

        city: {
            type: String,
            required: true,
            trim: true,
            index: true,
        },

        address: {
            type: String,
            required: true,
            trim: true,
        },


        // =====================================================
        // URGENCY
        // =====================================================

        urgency: {
            type: String,

            enum: [
                "Low",
                "Medium",
                "High",
                "Critical",
            ],

            default: "Medium",
            index: true,
        },


        // =====================================================
        // REQUIRED BY
        // =====================================================

        requiredBy: {
            type: Date,
            required: true,
        },


        // =====================================================
        // CONTACT
        // =====================================================

        contactName: {
            type: String,
            required: true,
            trim: true,
        },

        contactPhone: {
            type: String,
            required: true,
            trim: true,
        },


        // =====================================================
        // NOTES
        // =====================================================

        additionalNotes: {
            type: String,
            trim: true,
            maxlength: 500,
        },


        // =====================================================
        // STATUS
        // =====================================================

        status: {
            type: String,

            enum: [
                "Open",
                "Matched",
                "Completed",
                "Cancelled",
                "Expired",
            ],

            default: "Open",
            index: true,
        },
    },

    {
        timestamps: true,
    }
);


// ============================================================
// INDEXES
// ============================================================

bloodRequestSchema.index({
    city: 1,
    bloodGroup: 1,
    status: 1,
});

bloodRequestSchema.index({
    hospital: 1,
    status: 1,
});

bloodRequestSchema.index({
    requestedBy: 1,
    createdAt: -1,
});


module.exports =
    mongoose.model(
        "BloodRequest",
        bloodRequestSchema
    );