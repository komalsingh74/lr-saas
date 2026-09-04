import City from "../models/city.js";
import asyncHandler from "../utils/asyncHandler.js";

// ➕ Create City
export const createCity = asyncHandler(async (req, res) => {
  const { cityName, state } = req.body;

  if (!cityName || !state) {
    return res.status(400).json({
      message: "City name and state are required",
    });
  }

  const city = await City.create({
    cityName,
    state,
    companyId: req.user.companyId,
  });

  res.status(201).json({
    message: "City created successfully",
    city,
  });
});

// 📄 Get Cities (pagination + search)
export const filterCities = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    search = "",
    state,
    isActive,
  } = req.body;

  let query = {
    companyId: req.user.companyId, // 🔥 SaaS filter
  };

  // 🔍 Search
  if (search) {
    query.cityName = { $regex: search, $options: "i" };
  }

  // 🎯 Filters
  if (state) {
    query.state = state;
  }

  if (isActive !== undefined) {
    query.isActive = isActive;
  }

  const total = await City.countDocuments(query);

  const cities = await City.find(query)
    .skip((page - 1) * limit)
    .limit(limit)
    .sort({ createdAt: -1 });

  res.json({
    cities,
    totalResults: total,
    totalPages: Math.ceil(total / limit),
    currentPage: Number(page),
  });
});

// ✏️ Update City
export const updateCity = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { cityName, state, isActive } = req.body;

  const update = {};
  if (cityName !== undefined) update.cityName = cityName;
  if (state !== undefined) update.state = state;
  if (isActive !== undefined) update.isActive = isActive;

  const city = await City.findOneAndUpdate(
    { _id: id, companyId: req.user.companyId }, // 🔥 security
    update,
    { new: true }
  );

  if (!city) {
    return res.status(404).json({ message: "City not found" });
  }

  res.json({
    message: "City updated successfully",
    city,
  });
});

// ❌ Delete City
export const deleteCity = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const city = await City.findOneAndUpdate(
    { _id: id, companyId: req.user.companyId },
    { isActive: false },
    { new: true }
  );

  if (!city) {
    return res.status(404).json({ message: "City not found" });
  }

  res.json({ message: "City deactivated successfully", city });
});

// 📋 Get Cities Dropdown
export const getCitiesDropdown = asyncHandler(async (req, res) => {
  const cities = await City.find({
    companyId: req.user.companyId,
    isActive: true,
  }).select("_id cityName");

  res.json(cities);
});