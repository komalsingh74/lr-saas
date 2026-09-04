import LR from "../models/LR.js";
import Party from "../models/Party.js";
import asyncHandler from "../utils/asyncHandler.js";
import QRCode from "qrcode";

// ➕ Create LR
export const createLR = asyncHandler(async (req, res) => {
  const data = req.body;

  const lr = await LR.create({
    ...data,
    companyId: req.user.companyId, // 🔥 important
  });

  // Update company stats
  const { Company } = await import("../models/Company.js");
  await Company.findByIdAndUpdate(req.user.companyId, {
    $inc: { totalLRs: 1 },
    $set: { lastActivity: new Date() }
  });

  res.status(201).json({
    message: "LR created successfully",
    lr,
    trackingUrl: `${process.env.FRONTEND_URL || "http://localhost:3000"}/track/${lr.trackingToken}`,
  });
});

// Fetch one LR for edit/copy, scoped to the logged-in company.
export const getLRById = asyncHandler(async (req, res) => {
  const lr = await LR.findOne({ _id: req.params.id, companyId: req.user.companyId })
    .populate("consignor consignee fromCity toCity vehicle item");

  if (!lr) return res.status(404).json({ message: "LR not found" });
  res.json({ lr });
});

// Public tracking read. The token is the only public identifier.
export const getPublicLRByToken = asyncHandler(async (req, res) => {
  const lr = await LR.findOne({ trackingToken: req.params.token, isActive: true })
    .select("lrNumber date status fromCity toCity updatedAt")
    .populate("fromCity toCity");

  if (!lr) return res.status(404).json({ message: "Tracking link is invalid or expired" });
  res.json({
    lr: {
      lrNumber: lr.lrNumber,
      date: lr.date,
      status: lr.status,
      from: lr.fromCity?.cityName || "",
      to: lr.toCity?.cityName || "",
      updatedAt: lr.updatedAt,
    },
  });
});

export const getTrackingQr = asyncHandler(async (req, res) => {
  const exists = await LR.exists({ trackingToken: req.params.token, isActive: true });
  if (!exists) return res.status(404).send("QR not found");

  const trackingUrl = `${process.env.FRONTEND_URL || "http://localhost:3000"}/track/${req.params.token}`;
  const qr = await QRCode.toBuffer(trackingUrl, { margin: 1, width: 180 });
  res.type("png").send(qr);
});


// 📄 Get LRs (Pagination + Search)
export const getLRs = asyncHandler(async (req, res) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const search = req.query.search || "";

  const query = {
    companyId: req.user.companyId,
    lrNumber: { $regex: search, $options: "i" },
  };

  const total = await LR.countDocuments(query);

  // Debug: log query and counts to help frontend mismatch issues
  console.log('[filterLRs] company:', req.user.companyId.toString(), 'query:', JSON.stringify(query), 'page:', page, 'limit:', limit, 'totalMatches:', total);

  const lrs = await LR.find(query)
    .populate("consignor consignee fromCity toCity vehicle item")
    .skip((page - 1) * limit)
    .limit(limit)
    .sort({ createdAt: -1 });

  res.json({
    lrs,
    totalResults: total,
    totalPages: Math.ceil(total / limit),
    currentPage: page,
  });
});

// 📄 Filter LRs (with pagination + search via POST body)
export const filterLRs = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    search = "",
    status,
    paymentType,
    recordStatus = "all",
    dateFrom,
    dateTo,
    consignor,
  } = req.body;



  const query = {
    companyId: req.user.companyId,
  };

  if (search) {
    const regex = { $regex: search, $options: "i" };
    query.$or = [
      { lrNumber: regex },
      { driverName: regex },
      { paymentType: regex },
      { status: regex },
    ];
  }

  if (status && status !== "all") {
    query.status = status;
  }

  if (paymentType && paymentType !== "all") {
    query.paymentType = paymentType;
  }

  if (recordStatus === "active") {
    query.isActive = true;
  } else if (recordStatus === "inactive") {
    query.isActive = false;
  }

  // Filter by consignor (party) - accept either party _id or partyName
  if (consignor && consignor !== "all") {
    // If looks like an ObjectId, use directly
    if (typeof consignor === 'string' && consignor.match(/^[0-9a-fA-F]{24}$/)) {
      query.consignor = consignor;
    } else {
      // Find matching parties within the same company
      const parties = await Party.find({ partyName: consignor, companyId: req.user.companyId }).select('_id');
      const ids = parties.map(p => p._id);
      if (ids.length > 0) {
        query.consignor = { $in: ids };
      } else {
        // No matching party, force empty result
        query.consignor = { $in: [] };
      }
    }
  }

  // Date filtering (inclusive end date)
  if (dateFrom || dateTo) {
    query.date = {};
    if (dateFrom) {
      const from = new Date(dateFrom);
      from.setHours(0, 0, 0, 0);
      query.date.$gte = from;
    }
    if (dateTo) {
      const to = new Date(dateTo);
      to.setHours(23, 59, 59, 999);
      query.date.$lte = to;
    }
  }

  const total = await LR.countDocuments(query);

  const lrs = await LR.find(query)
    .populate("consignor consignee fromCity toCity vehicle item")
    .skip((page - 1) * limit)
    .limit(limit)
    .sort({ createdAt: -1 });

  res.json({
    lrs,
    totalResults: total,
    totalPages: Math.ceil(total / limit),
    currentPage: Number(page),
  });
});

// 📊 Get LR Summary (Dashboard Stats)
export const getLRSummary = asyncHandler(async (req, res) => {
  const companyId = req.user.companyId;

  const totalLR = await LR.countDocuments({ companyId });
  const todayLR = await LR.countDocuments({
    companyId,
    createdAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) }
  });
  const inTransit = await LR.countDocuments({ companyId, status: "In Transit" });
  const delivered = await LR.countDocuments({ companyId, status: "Delivered" });

  res.json({
    totalLR,
    todayLR,
    inTransit,
    delivered
  });
});

// 📊 Get LR Reports Stats (Detailed stats for reports page)
export const getLRReportsStats = asyncHandler(async (req, res) => {
  const companyId = req.user.companyId;
  const { fromDate, toDate } = req.query;

  let dateFilter = {};
  if (fromDate || toDate) {
    const range = { date: {} };

    if (fromDate) {
      const from = new Date(fromDate);
      from.setHours(0, 0, 0, 0);
      range.date.$gte = from;
    }

    if (toDate) {
      const to = new Date(toDate);
      to.setHours(23, 59, 59, 999);
      range.date.$lte = to;
    }

    dateFilter = range;
  }

  const query = { companyId, ...dateFilter };

  // Basic counts
  const totalLR = await LR.countDocuments(query);
  const pending = await LR.countDocuments({ ...query, status: "Pending" });
  const inTransit = await LR.countDocuments({ ...query, status: "In Transit" });
  const delivered = await LR.countDocuments({ ...query, status: "Delivered" });

  // Financial calculations
  const lrs = await LR.find(query).select('freightAmount weight status paymentType');
  const totalFreight = lrs.reduce((sum, lr) => sum + (lr.freightAmount || 0), 0);
  const totalWeight = lrs.reduce((sum, lr) => sum + (lr.weight || 0), 0);
  const avgWeight = totalLR > 0 ? totalWeight / totalLR : 0;

  // Payment type breakdown
  const toPayCount = lrs.filter(lr => lr.paymentType === "To Pay").length;
  const paidCount = lrs.filter(lr => lr.paymentType === "Paid").length;

  res.json({
    totalLR,
    pending,
    inTransit,
    delivered,
    totalFreight,
    totalWeight,
    avgWeight: parseFloat(avgWeight.toFixed(2)),
    toPayCount,
    paidCount
  });
});

// ✏️ Update LR
export const updateLR = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const update = { ...req.body };

  if (Object.prototype.hasOwnProperty.call(update, "trackingRemarks")) {
    update.trackingRemarks = String(update.trackingRemarks || "").trim().slice(0, 200);
    update.trackingUpdatedAt = new Date();
  }

  const lr = await LR.findOneAndUpdate(
    { _id: id, companyId: req.user.companyId },
    update,
    { new: true }
  );

  if (!lr) {
    return res.status(404).json({ message: "LR not found" });
  }

  // Update company last activity
  const { Company } = await import("../models/Company.js");
  await Company.findByIdAndUpdate(req.user.companyId, {
    $set: { lastActivity: new Date() }
  });

  await lr.populate("consignor consignee fromCity toCity vehicle item");

  res.json({
    message: "LR updated",
    lr,
  });
});


// ❌ Delete LR
export const deleteLR = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const lr = await LR.findOneAndUpdate(
    { _id: id, companyId: req.user.companyId },
    { isActive: false },
    { new: true }
  );

  if (!lr) {
    return res.status(404).json({ message: "LR not found" });
  }

  res.json({ message: "LR deactivated", lr });
});