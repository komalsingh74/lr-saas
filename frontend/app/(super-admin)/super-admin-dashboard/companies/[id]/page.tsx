"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
    ArrowLeft,
    Edit,
    Trash2,
    Users,
    DollarSign,
    FileText,
    Calendar,
    Mail,
    Phone,
    MapPin,
    Building2,
    Clock,
    Shield,
    AlertTriangle
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import api from "@/lib/api";

export default function CompanyDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const [company, setCompany] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchCompanyDetails();
    }, [params.id]);

    const fetchCompanyDetails = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/company/admin/${params.id}`);
            setCompany(response.data.data.company);
        } catch (error) {
        }
    };

    const handleEdit = () => {
        // Navigate to edit page
        console.log("Edit company", params.id);
    };

    const handleDelete = () => {
        // Show confirmation and delete
        console.log("Delete company", params.id);
    };

    const getPlanColor = (plan) => {
        switch (plan?.toLowerCase()) {
            case "basic": return "bg-gray-100 text-gray-600";
            case "professional": return "bg-blue-100 text-blue-600";
            case "enterprise": return "bg-purple-100 text-purple-600";
            default: return "bg-slate-100 text-slate-600";
        }
    };

    if (loading) {
        return (
            <div className="p-6 flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6">
                <div className="text-center">
                    <AlertTriangle className="mx-auto h-12 w-12 text-red-500" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">Error</h3>
                    <p className="mt-1 text-sm text-gray-500">{error}</p>
                </div>
            </div>
        );
    }

    if (!company) {
        return (
            <div className="p-6">
                <div className="text-center">
                    <h3 className="mt-2 text-sm font-medium text-gray-900">Company not found</h3>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.back()}
                        className="flex items-center gap-2"
                    >
                        <ArrowLeft size={16} />
                        Back to Companies
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold">{company.companyName}</h1>
                        <p className="text-slate-500">Company ID: {company._id}</p>
                    </div>
                </div>

                <div className="flex gap-2">
                    <Button variant="outline" onClick={handleEdit}>
                        <Edit size={16} className="mr-2" />
                        Edit Company
                    </Button>
                    <Button variant="destructive" onClick={handleDelete}>
                        <Trash2 size={16} className="mr-2" />
                        Delete Company
                    </Button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="p-4">
                    <div className="flex items-center gap-3">
                        <FileText className="text-blue-600" size={24} />
                        <div>
                            <p className="text-sm text-slate-500">Total LRs</p>
                            <p className="text-2xl font-bold">{company.totalLRs || 0}</p>
                        </div>
                    </div>
                </Card>

                <Card className="p-4">
                    <div className="flex items-center gap-3">
                        <DollarSign className="text-green-600" size={24} />
                        <div>
                            <p className="text-sm text-slate-500">Monthly Revenue</p>
                            <p className="text-2xl font-bold">₹{company.totalRevenue?.toLocaleString() || 0}</p>
                        </div>
                    </div>
                </Card>

                <Card className="p-4">
                    <div className="flex items-center gap-3">
                        <Users className="text-purple-600" size={24} />
                        <div>
                            <p className="text-sm text-slate-500">Fleet Size</p>
                            <p className="text-2xl font-bold">{company.fleetSize || 0}</p>
                        </div>
                    </div>
                </Card>

                <Card className="p-4">
                    <div className="flex items-center gap-3">
                        <Building2 className="text-orange-600" size={24} />
                        <div>
                            <p className="text-sm text-slate-500">Branches</p>
                            <p className="text-2xl font-bold">{company.numberOfBranches || 0}</p>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Basic Info */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Basic Information */}
                    <Card className="p-6">
                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <Building2 size={20} className="text-blue-600" />
                            Basic Information
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium text-slate-500">Company Name</label>
                                <p className="text-lg font-semibold">{company.companyName}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-slate-500">Owner</label>
                                <p>{company.owner?.name || "N/A"}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-slate-500">Business Type</label>
                                <p>{company.businessType}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-slate-500">Established Year</label>
                                <p>{company.establishedYear}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-slate-500">GST Number</label>
                                <p>{company.gstNumber}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-slate-500">Website</label>
                                <p>{company.website || "Not provided"}</p>
                            </div>
                        </div>
                    </Card>

                    {/* Contact Information */}
                    <Card className="p-6">
                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <Mail size={20} className="text-green-600" />
                            Contact Information
                        </h3>
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <Mail size={16} className="text-slate-400" />
                                <div>
                                    <p className="text-sm text-slate-500">Email</p>
                                    <p>{company.email}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <Phone size={16} className="text-slate-400" />
                                <div>
                                    <p className="text-sm text-slate-500">Phone</p>
                                    <p>{company.phone}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <MapPin size={16} className="text-slate-400" />
                                <div>
                                    <p className="text-sm text-slate-500">Address</p>
                                    <p>{company.address}</p>
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* Business Details */}
                    <Card className="p-6">
                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <Shield size={20} className="text-purple-600" />
                            Business Details
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium text-slate-500">Plan</label>
                                <Badge className={getPlanColor(company.planType)}>
                                    {company.planType}
                                </Badge>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-slate-500">Status</label>
                                <Badge variant={company.isActive ? "default" : "secondary"}>
                                    {company.isActive ? "Active" : "Inactive"}
                                </Badge>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-slate-500">Expiry Date</label>
                                <p>{new Date(company.expiryDate).toLocaleDateString()}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-slate-500">Created By</label>
                                <p>{company.createdBy?.name || "N/A"}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-slate-500">Created At</label>
                                <p>{new Date(company.createdAt).toLocaleDateString()}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-slate-500">Last Activity</label>
                                <div className="flex items-center gap-2">
                                    <Clock size={14} className="text-slate-400" />
                                    <span>{company.lastLogin ? new Date(company.lastLogin).toLocaleString() : "Never"}</span>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Right Column - Additional Info */}
                <div className="space-y-6">
                    {/* Bank Details */}
                    <Card className="p-6">
                        <h3 className="text-lg font-semibold mb-4">Bank Details</h3>
                        <div className="space-y-3">
                            <div>
                                <label className="text-sm font-medium text-slate-500">Account Holder</label>
                                <p>{company.accountHolderName}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-slate-500">Account Number</label>
                                <p>{company.accountNumber}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-slate-500">Bank Name</label>
                                <p>{company.bankName}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-slate-500">IFSC Code</label>
                                <p>{company.ifscCode}</p>
                            </div>
                        </div>
                    </Card>

                    {/* Tax Details */}
                    <Card className="p-6">
                        <h3 className="text-lg font-semibold mb-4">Tax Details</h3>
                        <div className="space-y-3">
                            <div>
                                <label className="text-sm font-medium text-slate-500">CIN Number</label>
                                <p>{company.cinNumber}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-slate-500">MSME Number</label>
                                <p>{company.msmeNumber}</p>
                            </div>
                        </div>
                    </Card>

                    {/* Activity Summary */}
                    <Card className="p-6">
                        <h3 className="text-lg font-semibold mb-4">Activity Summary</h3>
                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <span className="text-sm text-slate-500">Total Revenue</span>
                                <span className="font-semibold">₹{company.totalRevenue?.toLocaleString() || 0}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm text-slate-500">Last Login</span>
                                <span className="text-sm">{new Date(company.lastLogin).toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm text-slate-500">Active Template</span>
                                <span className="text-sm">{company.selectedTemplate}</span>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}