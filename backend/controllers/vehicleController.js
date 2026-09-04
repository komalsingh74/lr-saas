import Vehicle from "../models/vehicle.js";

// ➕ Create Vehicle
export const createVehicle = async (req, res) => {
  try {
    const {
      vehicleNumber,
      vehicleType,
      capacity,
      ownerName,
      ownerPhone,
      //   registrationDate,
    } = req.body;

    if (!vehicleNumber || !vehicleType || !capacity) {
      return res.status(400).json({
        message: "Vehicle number, type and capacity are required",
      });
    }

    const vehicle = await Vehicle.create({
      vehicleNumber,
      vehicleType,
      capacity,
      ownerName,
      ownerPhone,
      //   registrationDate,
      companyId: req.user.companyId, // 🔥 core logic
    });

    res.status(201).json({
      message: "Vehicle created successfully",
      vehicle,
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({
        message: "Vehicle already exists",
      });
    }
    res.status(500).json({ message: err.message });
  }
};


// 📄 Get Vehicles (pagination + search)
export const filterVehicles = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = "",
      vehicleType,
      isActive,
      minCapacity,
      maxCapacity,
    } = req.body;

    let query = {
      companyId: req.user.companyId,
    };

    // 🔍 Search
    if (search) {
      query.$or = [
        { vehicleNumber: { $regex: search, $options: "i" } },
        { ownerName: { $regex: search, $options: "i" } },
        { ownerPhone: { $regex: search, $options: "i" } },
      ];
    }

    // 🎯 Filters
    if (vehicleType) {
      query.vehicleType = vehicleType;
    }

    if (isActive !== undefined) {
      query.isActive = isActive;
    }

    // 📦 Capacity Range
    if (minCapacity || maxCapacity) {
      query.capacity = {};
      if (minCapacity) query.capacity.$gte = minCapacity;
      if (maxCapacity) query.capacity.$lte = maxCapacity;
    }

    const total = await Vehicle.countDocuments(query);

    const vehicles = await Vehicle.find(query)
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 });

    res.json({
      vehicles,
      totalResults: total,
      totalPages: Math.ceil(total / limit),
      currentPage: Number(page),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// ✏️ Update Vehicle
export const updateVehicle = async (req, res) => {
  try {
    const { id } = req.params;

    const vehicle = await Vehicle.findOneAndUpdate(
      { _id: id, companyId: req.user.companyId }, // 🔥 security
      req.body,
      { new: true }
    );

    if (!vehicle) {
      return res.status(404).json({ message: "Vehicle not found" });
    }

    res.json({
      message: "Vehicle updated successfully",
      vehicle,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// ❌ Delete Vehicle
export const deleteVehicle = async (req, res) => {
  try {
    const { id } = req.params;
    const vehicle = await Vehicle.findOneAndUpdate(
      { _id: id, companyId: req.user.companyId },
      { isActive: false },
      { new: true }
    );

    if (!vehicle) {
      return res.status(404).json({ message: "Vehicle not found" });
    }

    res.json({ message: "Vehicle deactivated successfully", vehicle });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 📋 Get Vehicles Dropdown
export const getVehiclesDropdown = async (req, res) => {
  const vehicles = await Vehicle.find({
    companyId: req.user.companyId,
    isActive: true,
  }).select("_id vehicleNumber vehicleType ownerName ownerPhone capacity");

  res.json(vehicles);
};