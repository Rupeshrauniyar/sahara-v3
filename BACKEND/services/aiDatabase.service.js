const Doctor = require("../models/Doctor");
const Hospital = require("../models/Hospital");
const User = require("../models/User");

// =====================================================
// FIND DOCTORS
// =====================================================

const findDoctors = async ({
  specialization,
  city,
  hospital,
}) => {

  const query = {
    isAvailable: true,
  };

  // Specialization
  if (specialization) {
    query.specialization = {
      $regex: specialization,
      $options: "i",
    };
  }

  // Hospital
  if (hospital) {
    query.hospital = hospital;
  }

  let doctors = await Doctor.find(query)
    .populate({
      path: "user",
      select: "fullName profileImage gender",
    })
    .populate({
      path: "hospital",
      select: "name city address location",
    })
    .limit(10)
    .lean();


  // Filter city if required
  if (city) {
    doctors = doctors.filter(
      (doctor) =>
        doctor.hospital?.city
          ?.toLowerCase()
          .includes(city.toLowerCase())
    );
  }


  return doctors;
};


// =====================================================
// FIND HOSPITALS
// =====================================================

const findHospitals = async ({
  city,
  emergencyOnly = false,
}) => {

  const query = {
    isOpen: true,
  };

  if (city) {
    query.city = {
      $regex: city,
      $options: "i",
    };
  }

  if (emergencyOnly) {
    query.emergencyAvailable = true;
  }


  return Hospital.find(query)
    .select(
      "name description phone email website address city location departments beds emergencyAvailable ambulanceAvailable isOpen"
    )
    .limit(10)
    .lean();
};


// =====================================================
// EXPORT
// =====================================================

module.exports = {
  findDoctors,
  findHospitals,
};