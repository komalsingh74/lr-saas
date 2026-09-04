import Party from "../models/party.js";

// ➕ Create Party
export const createParty = async (req, res) => {
  try {
    const { partyName, phone, gstNumber, city } = req.body;

    if (!partyName || !phone) {
      return res.status(400).json({
        message: "Party name and phone are required",
      });
    }

    const party = await Party.create({
      partyName,
      phone,
      gstNumber,
      city,
      companyId: req.user.companyId, // 🔥 core logic
    });

    res.status(201).json({
      message: "Party created successfully",
      party,
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({
        message: "Party already exists",
      });
    }
    res.status(500).json({ message: err.message });
  }
};

// 📄 Get Parties (with pagination + search) - supports both query params and POST body
export const getParties = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const search = req.query.search || "";

    const query = {
      companyId: req.user.companyId, // 🔥 filter
      partyName: { $regex: search, $options: "i" },
    };

    const total = await Party.countDocuments(query);

    const parties = await Party.find(query)
      .populate("city", "cityName")
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 });

    res.json({
      parties,
      totalResults: total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 📄 Filter Parties (with pagination + search) - POST version for consistency
export const filterParties = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = "",
      city,
      isActive,
    } = req.body;

    let query = {
      companyId: req.user.companyId, // 🔥 filter
    };

    // 🔍 Search
    if (search) {
      query.$or = [
        { partyName: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
        { gstNumber: { $regex: search, $options: "i" } },
      ];
    }

    // 🎯 Filters
    if (city) {
      query.city = city;
    }

    if (isActive !== undefined) {
      query.isActive = isActive;
    }

    const total = await Party.countDocuments(query);

    const parties = await Party.find(query)
      .populate("city", "cityName")
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 });

    res.json({
      parties,
      totalResults: total,
      totalPages: Math.ceil(total / limit),
      currentPage: Number(page),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✏️ Update Party
export const updateParty = async (req, res) => {
  try {
    const { id } = req.params;

    const party = await Party.findOneAndUpdate(
      { _id: id, companyId: req.user.companyId }, // 🔥 security
      req.body,
      { new: true }
    );

    if (!party) {
      return res.status(404).json({ message: "Party not found" });
    }

    res.json({
      message: "Party updated successfully",
      party,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ❌ Delete Party
export const deleteParty = async (req, res) => {
  try {
    const { id } = req.params;

    const party = await Party.findOneAndUpdate(
      { _id: id, companyId: req.user.companyId },
      { isActive: false },
      { new: true }
    );

    if (!party) {
      return res.status(404).json({ message: "Party not found" });
    }

    res.json({ message: "Party deactivated successfully", party });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getPartiesDropdown = async (req, res) => {
  const parties = await Party.find({
    companyId: req.user.companyId,
    isActive: true,
  }).select("_id partyName");

  res.json(parties);
};