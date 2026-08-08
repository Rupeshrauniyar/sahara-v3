const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
    {
        // =====================================================
        // BASIC INFORMATION
        // =====================================================

        fullName: {
            type: String,
            required: true,
            trim: true,
            minlength: 3,
            maxlength: 100,
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            index: true,
        },

        phone: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            index: true,
        },

        password: {
            type: String,
            required: true,
            minlength: 8,
            select: false,
        },


        // =====================================================
        // ROLE
        // =====================================================

        role: {
            type: String,

            enum: [
                "Patient",
                "Doctor",
                "HospitalAdmin",
                "Admin",
            ],

            default: "Patient",
            index: true,
        },


        // =====================================================
        // PROFILE
        // =====================================================

        profileImage: {
            type: String,
            default: "",
        },

        gender: {
            type: String,

            enum: [
                "Male",
                "Female",
                "Other",
            ],
        },

        dateOfBirth: {
            type: Date,
        },

        address: {
            type: String,
            trim: true,
        },

        city: {
            type: String,
            trim: true,
            index: true,
        },


        // =====================================================
        // BLOOD DONOR INFORMATION
        // =====================================================

        bloodGroup: {
            type: String,

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

        availability: {
            type: Boolean,
            default: true,
            index: true,
        },

        emergencyAvailable: {
            type: Boolean,
            default: true,
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


        // =====================================================
        // ACCOUNT STATUS
        // =====================================================

        isVerified: {
            type: Boolean,
            default: false,
        },

        isActive: {
            type: Boolean,
            default: true,
        },

        lastLogin: {
            type: Date,
        },
    },

    {
        timestamps: true,
    }
);


// ============================================================
// PASSWORD HASHING
// ============================================================

userSchema.pre("save", async function () {

    // Password hasn't changed
    if (!this.isModified("password")) {
        return;
    }

    const salt =
        await bcrypt.genSalt(10);

    this.password =
        await bcrypt.hash(
            this.password,
            salt
        );
});


// ============================================================
// PASSWORD COMPARISON
// ============================================================

userSchema.methods.comparePassword =
    async function (password) {

        if (!this.password) {
            return false;
        }

        return bcrypt.compare(
            password,
            this.password
        );
    };


module.exports =
    mongoose.model(
        "User",
        userSchema
    );