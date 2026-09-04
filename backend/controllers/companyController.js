import asyncHandler from "../utils/asyncHandler.js";
import AppError from "../utils/appError.js";
import { Company } from "../models/Company.js";
import { User } from "../models/User.js";
import { Counter } from "../models/Counter.js";
import jwt from "jsonwebtoken";
import { uploadToCloudinary } from "../utils/cloudinaryUpload.js";

// 🔑 Generate Token (same as userController)
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      role: user.role,
      companyId: user.companyId,
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

export const createCompany = asyncHandler(async (req, res, next) => {
  console.log("📝 CreateCompany Request:", {
    userId: req.user?.id,
    body: req.body,
    files: req.files ? Object.keys(req.files) : "No files",
  });

  const userId = req.user?.id;

  if (!userId) {
    return next(new AppError("User ID not found in token", 400));
  }

  const {
    companyName,
    email,
    phone,
    gstNumber,
    website,
    fleetSize,
    numberOfBranches,
    street,
    city,
    state,
    pincode,
    country,

  } = req.body;

  if (!companyName || !phone) {
    return next(
      new AppError("Company name and phone are required", 400)
    );
  }

  const user = await User.findById(userId);

  if (!user) {
    return next(new AppError("User not found", 404));
  }

  if (user.companyId) {
    return next(new AppError("User already has a company", 400));
  }

  // 🏠 Create structured address object
  const address = {
    street: street || "",
    city: city || "",
    state: state || "",
    pincode: pincode || "",
    country: country || "India",
  };

  // Validate address
  if (!street || !city || !state || !pincode) {
    return next(new AppError("Complete address is required", 400));
  }

  // 🖼️ HANDLE IMAGES (Optional)
  let logoUrl = "";
  let signatureUrl = "";

  if (req.files?.logo?.[0]) {
    try {
      console.log("📸 Uploading logo...");
      const result = await uploadToCloudinary(
        req.files.logo[0].buffer,
        "company/logo"
      );
      if (result?.secure_url) {
        logoUrl = result.secure_url;
        console.log("✅ Logo uploaded:", logoUrl);
      }
    } catch (uploadError) {
      console.error("⚠️ Logo upload failed:", uploadError.message);
      // Don't fail the entire request if logo upload fails
      // Files are optional
    }
  }

  if (req.files?.signature?.[0]) {
    try {
      console.log("✍️ Uploading signature...");
      const result = await uploadToCloudinary(
        req.files.signature[0].buffer,
        "company/signature"
      );
      if (result?.secure_url) {
        signatureUrl = result.secure_url;
        console.log("✅ Signature uploaded:", signatureUrl);
      }
    } catch (uploadError) {
      console.error("⚠️ Signature upload failed:", uploadError.message);
      // Don't fail the entire request if signature upload fails
      // Files are optional
    }
  }

  console.log("💾 Creating company in database...");

  // 🔢 Generate unique compCd using Counter
  const counter = await Counter.findOneAndUpdate(
    { name: "companyCode" },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  const compCd = `COMP${counter.seq}`;

  const company = await Company.create({
    companyName,
    email: email || "",
    phone,
    gstNumber: gstNumber || undefined,
    website: website || "",
    fleetSize: parseInt(fleetSize) || 0,
    numberOfBranches: parseInt(numberOfBranches) || 1,
    address,
    logo: logoUrl,
    signature: signatureUrl,
    owner: userId,
    compCd, // ✅ ADD compCd HERE
    createdBy: userId,
    updatedBy: userId,
    planType: "TRIAL",

    subscriptionStatus: "TRIAL",

    subscriptionStartDate: new Date(),

    trialEndsAt: new Date(
      Date.now() + 7 * 24 * 60 * 60 * 1000
    ),

    monthlyAmount: 0,

    totalRevenueGenerated: 0,

    lastActivityAt: new Date(),
  });

  console.log("✅ Company created:", company._id);

  // Link company to user
  user.companyId = company._id;
  await user.save();

  console.log("✅ User updated with company link");

  // 🔑 Generate NEW token with updated companyId
  const newToken = generateToken(user);

  res.status(201).json({
    status: "success",
    message: "Company created successfully",
    token: newToken, // ✅ NEW TOKEN with companyId
    data: {
      company: {
        id: company._id,
        companyName: company.companyName,
        email: company.email,
        phone: company.phone,
        compCd: company.compCd,
        logo: company.logo,
        signature: company.signature,
        address: company.address,
      },
    },
  });
});

// 🔍 Get current user's company
export const getCurrentCompany = asyncHandler(async (req, res, next) => {
  const userId = req.user?.id;

  if (!userId) {
    return next(new AppError("User ID not found in token", 400));
  }

  const user = await User.findById(userId).populate('companyId');

  if (!user) {
    return next(new AppError("User not found", 404));
  }

  if (!user.companyId) {
    return next(new AppError("User is not associated with any company", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      company: user.companyId,
    },
  });
});


// ✏️ Update current user's company
export const updateCompany = asyncHandler(async (req, res, next) => {
  const userId = req.user?.id;

  if (!userId) {
    return next(new AppError("User ID not found in token", 400));
  }

  const user = await User.findById(userId);

  if (!user) {
    return next(new AppError("User not found", 404));
  }

  if (!user.companyId) {
    return next(new AppError("User is not associated with any company", 404));
  }

  const company = await Company.findById(user.companyId);

  if (!company) {
    return next(new AppError("Company not found", 404));
  }

  let {
    companyName,
    phone,
    gstNumber,
    website,
    fleetSize,
    numberOfBranches,
    street,
    city,
    state,
    pincode,
    country,
    selectedTemplate,
    receiptTemplateConfig,
  } = req.body;

  if (typeof receiptTemplateConfig === "string") {
    try {
      receiptTemplateConfig = JSON.parse(receiptTemplateConfig);
    } catch (parseError) {
      console.warn("Failed to parse receiptTemplateConfig string", parseError);
      receiptTemplateConfig = undefined;
    }
  }

  if (companyName !== undefined) company.companyName = companyName;
  if (phone !== undefined) company.phone = phone;
  if (gstNumber !== undefined) company.gstNumber = gstNumber || undefined;
  if (website !== undefined) company.website = website || "";
  if (fleetSize !== undefined) company.fleetSize = parseInt(fleetSize) || 0;
  if (numberOfBranches !== undefined)
    company.numberOfBranches = parseInt(numberOfBranches) || 1;
  if (selectedTemplate !== undefined) company.selectedTemplate = selectedTemplate;
  if (receiptTemplateConfig !== undefined && typeof receiptTemplateConfig === "object") {
    company.receiptTemplateConfig = receiptTemplateConfig;
  }

  if (!company.address) {
    company.address = {
      street: "",
      city: "",
      state: "",
      pincode: "",
      country: "India",
    };
  }

  if (street !== undefined) company.address.street = street;
  if (city !== undefined) company.address.city = city;
  if (state !== undefined) company.address.state = state;
  if (pincode !== undefined) company.address.pincode = pincode;
  if (country !== undefined) company.address.country = country || "India";

  if (req.files?.logo?.[0]) {
    try {
      const result = await uploadToCloudinary(req.files.logo[0].buffer, "company/logo");
      if (result?.secure_url) {
        company.logo = result.secure_url;
      }
    } catch (uploadError) {
      console.error("⚠️ Logo upload failed:", uploadError.message);
    }
  }

  if (req.files?.signature?.[0]) {
    try {
      const result = await uploadToCloudinary(req.files.signature[0].buffer, "company/signature");
      if (result?.secure_url) {
        company.signature = result.secure_url;
      }
    } catch (uploadError) {
      console.error("⚠️ Signature upload failed:", uploadError.message);
    }
  }

  company.updatedBy = userId;
  company.lastActivity = new Date();
  await company.save();

  res.status(200).json({
    status: "success",
    data: {
      company,
    },
  });
});