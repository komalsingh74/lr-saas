// 🔹 SUPER ADMIN ENDPOINTS

import asyncHandler from "../../utils/asyncHandler.js";
import AppError from "../../utils/appError.js";
import { Company } from "../../models/Company.js";
import Payment from "../../models/Payment.js";
import LR from "../../models/LR.js";


// Get all companies (Super Admin)
export const getAllCompanies = asyncHandler(async (req, res, next) => {
    const { page = 1, limit = 10, search, planType, status, expirySoon } = req.query;

    const query = {};

    if (search) {
        query.$or = [
            { companyName: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } },
            { phone: { $regex: search, $options: 'i' } },
        ];
    }

    if (planType && planType !== 'all') {
        const normalizedPlan = planType.toLowerCase();
        if (normalizedPlan === 'professional') {
            query.planType = 'PRO';
        } else if (normalizedPlan === 'pro') {
            query.planType = 'PRO';
        } else if (normalizedPlan === 'trial') {
            query.planType = 'TRIAL';
        } else {
            query.planType = planType.toUpperCase();
        }
    }

    if (status && status !== 'all') {
        query.companyStatus = status === 'active' ? 'ACTIVE' : 'SUSPENDED';
    }

    if (expirySoon === 'true') {
        const fiveDaysFromNow = new Date();
        fiveDaysFromNow.setDate(fiveDaysFromNow.getDate() + 5);
        query.planExpiryDate = { $lte: fiveDaysFromNow, $gte: new Date() };
    }

    const pageNum = Number(page);
    const limitNum = Number(limit);

    const companies = await Company.find(query)
        .populate('owner', 'name email')
        .populate('createdBy', 'name email')
        .sort({ createdAt: -1 })
        .limit(limitNum)
        .skip((pageNum - 1) * limitNum)
        .select('-__v');

    const total = await Company.countDocuments(query);

    const companyIds = companies.map((company) => company._id);
    const lrCounts = await LR.aggregate([
        { $match: { companyId: { $in: companyIds } } },
        { $group: { _id: "$companyId", count: { $sum: 1 } } },
    ]);
    const lrCountMap = lrCounts.reduce((acc, item) => {
        acc[item._id.toString()] = item.count;
        return acc;
    }, {});

    const paymentTotals = await Payment.aggregate([
        { $match: { companyId: { $in: companyIds }, status: 'paid' } },
        { $group: { _id: '$companyId', total: { $sum: '$amount' } } },
    ]);

    const paymentMap = paymentTotals.reduce((acc, item) => {
        acc[item._id.toString()] = item.total;
        return acc;
    }, {});

    const companiesWithLRs = companies.map((company) => {
        const companyObj = company.toObject();
        companyObj.totalLRs = lrCountMap[company._id.toString()] ?? companyObj.totalLRs ?? 0;
        companyObj.totalRevenueGenerated = paymentMap[company._id.toString()] ?? companyObj.totalRevenueGenerated ?? 0;
        return companyObj;
    });

    const globalStats = await Company.aggregate([
        {
            $group: {
                _id: null,
                totalCompanies: { $sum: 1 },
                activeCompanies: {
                    $sum: {
                        $cond: [{ $eq: ['$companyStatus', 'ACTIVE'] }, 1, 0],
                    },
                },
                expiredPlans: {
                    $sum: {
                        $cond: [{ $lt: ['$planExpiryDate', new Date()] }, 1, 0],
                    },
                },
                totalRevenue: { $sum: '$totalRevenueGenerated' },
                totalLRs: { $sum: '$totalLRs' },
            },
        },
    ]);

    const totalLRsCount = await LR.countDocuments();

    const revenueStats = await Payment.aggregate([
        { $match: { status: 'paid' } },
        {
            $group: {
                _id: null,
                totalRevenue: { $sum: '$amount' },
            },
        },
    ]);

    const stats = globalStats[0] || {
        totalCompanies: 0,
        activeCompanies: 0,
        expiredPlans: 0,
        totalRevenue: 0,
        totalLRs: 0,
    };

    const totalRevenue = revenueStats[0]?.totalRevenue ?? stats.totalRevenue;

    res.status(200).json({
        status: 'success',
        results: companies.length,
        pagination: {
            currentPage: pageNum,
            totalPages: Math.ceil(total / limitNum),
            totalCompanies: total,
        },
        stats: {
            totalCompanies: stats.totalCompanies,
            activeCompanies: stats.activeCompanies,
            expiredPlans: stats.expiredPlans,
            totalRevenue,
            totalLRs: totalLRsCount,
        },
        data: {
            companies: companiesWithLRs,
        },
    });
});

// Get company by ID (Super Admin)
export const getCompanyById = asyncHandler(async (req, res, next) => {
    const { id } = req.params;

    const company = await Company.findById(id)
        .populate('owner', 'name email phone')
        .populate('createdBy', 'name email');

    if (!company) {
        return next(new AppError('Company not found', 404));
    }

    res.status(200).json({
        status: 'success',
        data: {
            company,
        },
    });
});

// Update company by Super Admin
export const updateCompanyByAdmin = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const updates = req.body;

    const company = await Company.findById(id);

    if (!company) {
        return next(new AppError('Company not found', 404));
    }

    // Update allowed fields
    const allowedFields = [
        'companyName', 'email', 'phone', 'gstNumber', 'website',
        'fleetSize', 'numberOfBranches', 'businessType', 'establishedYear',
        'planType', 'subscriptionStatus', 'planStartDate', 'planExpiryDate',
        'subscriptionAmount', 'lastPaymentDate', 'nextBillingDate',
        'totalRevenueGenerated', 'totalLRs', 'selectedTemplate',
        'supportPriority', 'lastActivity', 'companyStatus'
    ];

    allowedFields.forEach(field => {
        if (updates[field] !== undefined) {
            company[field] = updates[field];
        }
    });

    // Update address if provided
    if (updates.address) {
        company.address = { ...company.address, ...updates.address };
    }

    company.updatedBy = req.user?.id;
    company.lastActivity = new Date();

    await company.save();

    res.status(200).json({
        status: 'success',
        data: {
            company,
        },
    });
});

// Delete company (Super Admin) - SOFT DELETE
export const deleteCompany = asyncHandler(async (req, res, next) => {
    const { id } = req.params;

    const company = await Company.findById(id);

    if (!company) {
        return next(new AppError('Company not found', 404));
    }

    // Soft delete - don't actually delete from database
    company.companyStatus = 'BLOCKED';
    company.subscriptionStatus = 'CANCELLED';
    company.updatedBy = req.user?.id;

    await company.save();

    res.status(200).json({
        status: 'success',
        message: 'Company has been deactivated (soft deleted)',
        data: {
            company,
        },
    });
});
