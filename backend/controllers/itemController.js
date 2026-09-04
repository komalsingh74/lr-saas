import Item from "../models/Item.js";
import asyncHandler from "../utils/asyncHandler.js";

// ➕ Create Item
export const createItem = asyncHandler(async (req, res) => {
  const { itemName, description, unit, hsnCode } = req.body;

  if (!itemName) {
    return res.status(400).json({
      message: "Item name is required",
    });
  }

  const item = await Item.create({
    itemName,
    description,
    unit,
    hsnCode,
    companyId: req.user.companyId, // 🔥 key
  });

  res.status(201).json({
    message: "Item created successfully",
    item,
  });
});

// 📄 Get Items (pagination + search)
export const filterItems = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    search = "",
    unit,
    hsnCode,
    isActive,
  } = req.body;

  let query = {
    companyId: req.user.companyId, // 🔥 SaaS filter
  };

  // 🔍 Search
  if (search) {
    query.$or = [
      { itemName: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
      { hsnCode: { $regex: search, $options: "i" } },
    ];
  }

  // 🎯 Filters
  if (unit) {
    query.unit = unit;
  }

  if (hsnCode) {
    query.hsnCode = hsnCode;
  }

  if (isActive !== undefined) {
    query.isActive = isActive;
  }

  const total = await Item.countDocuments(query);

  const items = await Item.find(query)
    .skip((page - 1) * limit)
    .limit(limit)
    .sort({ createdAt: -1 });

  res.json({
    items,
    totalResults: total,
    totalPages: Math.ceil(total / limit),
    currentPage: Number(page),
  });
});

// ✏️ Update Item
export const updateItem = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const item = await Item.findOneAndUpdate(
    { _id: id, companyId: req.user.companyId }, // 🔥 security
    req.body,
    { new: true }
  );

  if (!item) {
    return res.status(404).json({ message: "Item not found" });
  }

  res.json({
    message: "Item updated successfully",
    item,
  });
});

// ❌ Delete Item
export const deleteItem = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const item = await Item.findOneAndUpdate(
    { _id: id, companyId: req.user.companyId },
    { isActive: false },
    { new: true }
  );

  if (!item) {
    return res.status(404).json({ message: "Item not found" });
  }

  res.json({ message: "Item deactivated successfully", item });
});

// 📋 Get Items Dropdown
export const getItemsDropdown = asyncHandler(async (req, res) => {
  const items = await Item.find({
    companyId: req.user.companyId,
    isActive: true,
  }).select("_id itemName");

  res.json(items);
});