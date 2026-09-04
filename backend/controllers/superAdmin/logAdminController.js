import asyncHandler from "../../utils/asyncHandler.js";

const sampleLogs = [
    {
        companyId: "CMP-1001",
        userId: "USR-204",
        action: "CREATE_LR",
        module: "LR",
        details: "Created LR #1023 for Agra Logistics",
        ipAddress: "103.45.67.89",
        createdAt: "2026-06-02T10:15:23.000Z",
    },
    {
        companyId: "CMP-1002",
        userId: "USR-118",
        action: "UPDATE_LR",
        module: "LR",
        details: "Updated consignee details for LR #1041",
        ipAddress: "182.12.44.11",
        createdAt: "2026-06-02T09:42:05.000Z",
    },
    {
        companyId: "CMP-1001",
        userId: "USR-204",
        action: "LOGIN",
        module: "AUTH",
        details: "Admin login from dashboard",
        ipAddress: "14.96.29.73",
        createdAt: "2026-06-02T08:20:14.000Z",
    },
    {
        companyId: "CMP-1003",
        userId: "USR-301",
        action: "CREATE_PAYMENT",
        module: "PAYMENT",
        details: "Payment entry recorded for invoice INV-5001",
        ipAddress: "41.87.24.70",
        createdAt: "2026-06-01T18:55:40.000Z",
    },
    {
        companyId: "CMP-1004",
        userId: "USR-410",
        action: "CREATE_PARTY",
        module: "PARTY",
        details: "Added new party record for Delhi Traders",
        ipAddress: "91.66.30.12",
        createdAt: "2026-06-01T17:08:11.000Z",
    },
    {
        companyId: "CMP-1002",
        userId: "USR-118",
        action: "DELETE_LR",
        module: "LR",
        details: "Removed draft LR #1038 from queue",
        ipAddress: "182.12.44.11",
        createdAt: "2026-05-31T15:14:29.000Z",
    },
    {
        companyId: "CMP-1001",
        userId: "USR-204",
        action: "EXPORT_REPORT",
        module: "REPORT",
        details: "Exported transaction summary for May 2026",
        ipAddress: "103.45.67.89",
        createdAt: "2026-05-31T11:03:02.000Z",
    },
    {
        companyId: "CMP-1005",
        userId: "USR-512",
        action: "UPDATE_COMPANY",
        module: "COMPANY",
        details: "Updated company profile and contact info",
        ipAddress: "203.0.113.45",
        createdAt: "2026-05-30T13:21:55.000Z",
    },
    {
        companyId: "CMP-1004",
        userId: "USR-410",
        action: "CREATE_LR",
        module: "LR",
        details: "Created LR #1054 for Delhi Traders",
        ipAddress: "91.66.30.12",
        createdAt: "2026-05-30T09:47:18.000Z",
    },
    {
        companyId: "CMP-1003",
        userId: "USR-301",
        action: "LOGIN",
        module: "AUTH",
        details: "User login from mobile app",
        ipAddress: "41.87.24.70",
        createdAt: "2026-05-29T07:35:06.000Z",
    },
];

export const getAllLogs = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, search = "" } = req.query;

    const pageNum = Number(page);
    const limitNum = Number(limit);

    const keyword = String(search || "").trim().toLowerCase();
    const filteredLogs = sampleLogs.filter((log) => {
        if (!keyword) return true;

        return [
            log.companyId,
            log.userId,
            log.action,
            log.module,
            log.details,
            log.ipAddress,
            log.createdAt,
        ]
            .join(" ")
            .toLowerCase()
            .includes(keyword);
    });

    const totalLogs = filteredLogs.length;
    const totalPages = Math.max(1, Math.ceil(totalLogs / limitNum) || 1);
    const currentPage = Math.min(pageNum, totalPages);
    const startIndex = (currentPage - 1) * limitNum;
    const pagedLogs = filteredLogs.slice(startIndex, startIndex + limitNum);

    const uniqueModules = [...new Set(filteredLogs.map((log) => log.module))];
    const uniqueUsers = [...new Set(filteredLogs.map((log) => log.userId))];

    res.status(200).json({
        status: "success",
        results: pagedLogs.length,
        pagination: {
            currentPage,
            totalPages,
            totalLogs,
        },
        stats: {
            totalLogs,
            totalModules: uniqueModules.length,
            totalUsers: uniqueUsers.length,
        },
        data: {
            logs: pagedLogs,
        },
    });
});
