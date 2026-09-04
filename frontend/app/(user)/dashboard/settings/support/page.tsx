"use client";

import { useState, useEffect } from "react";
import { Send, Mail, Phone, HelpCircle, User, MessageSquare, ArrowRight } from "lucide-react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import api from "@/lib/api";
import { showError, showSuccess } from "@/lib/toast";

export default function SupportPage() {
    const [form, setForm] = useState({
        name: "",
        email: "",
        phone: "",
        subject: "",
        category: "",
        message: "",
    });

    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const populateUserInfo = async () => {
            try {
                const response = await api.get("/users/me");
                const user = response.data.user;
                setForm((prev) => ({
                    ...prev,
                    name: user.name || "",
                    email: user.email || "",
                    phone: user.phone || "",
                }));
            } catch (err) {
                console.error("Failed to load user info for support form", err);
            }
        };

        populateUserInfo();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSelectChange = (name: string, value: string) => {
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!form.name || !form.email || !form.message) {
            showError("Please fill all required fields");
            return;
        }

        try {
            setLoading(true);
            const response = await api.post("/support", form, {
                showToast: true,
                successMessage: "Support request submitted successfully",
            } as any);

            if (response.status === 201) {
                showSuccess("Query submitted successfully! We'll get back to you soon.");
                setForm({
                    name: form.name,
                    email: form.email,
                    phone: form.phone,
                    subject: "",
                    category: "",
                    message: "",
                });
            }
        } catch (err: any) {
            console.error(err);
            showError(err.response?.data?.message || "Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        // ✅ Fixed height - no overflow
<div className="flex items-center justify-center px-4 bg-[#FAFAF8]">
    <div className="w-full max-w-6xl flex flex-col md:flex-row gap-0 rounded-2xl overflow-hidden shadow-[0_1px_3px_rgba(16,27,45,0.08)] border border-[#E7E3D9]">

        {/* Left Side - Info & Contact Cards */}
        <div className="md:w-2/5 flex flex-col justify-center gap-5 bg-[#101B2D] px-8 py-10 relative">
            {/* subtle route-line motif */}
            <div className="absolute top-0 right-0 h-full w-px bg-[repeating-linear-gradient(to_bottom,#D97D0D_0,#D97D0D_6px,transparent_6px,transparent_14px)] opacity-40 hidden md:block" />

            {/* Header */}
            <div>
                <div className="flex items-center gap-2.5 mb-4">
                    <div className="w-9 h-9 border border-[#D97D0D]/40 rounded-md flex items-center justify-center">
                        <HelpCircle size={18} className="text-[#D97D0D]" />
                    </div>
                    <span className="text-[11px] font-semibold text-[#D97D0D] uppercase tracking-[0.2em]">Support Desk</span>
                </div>
                <h1 className="text-[28px] md:text-[32px] font-bold text-white leading-[1.1] tracking-tight">
                    How can we<br />help you today?
                </h1>
                <p className="text-[#9CA6B8] text-sm mt-3 max-w-sm leading-relaxed">
                    Billing, LR generation, or account issues — send us a note
                    and we'll get back to you within 24 hours.
                </p>
            </div>

            {/* Contact Cards - ticket stub style */}
            <div className="grid grid-cols-2 gap-3 pt-2">
                <a href="https://wa.me/917453873443" className="group border border-white/10 rounded-lg p-3.5 hover:border-[#D97D0D]/50 transition-colors">
                    <div className="flex items-center gap-2 mb-2">
                        <Phone size={14} className="text-[#4ADE80]" />
                        <h4 className="font-semibold text-xs text-white">WhatsApp</h4>
                    </div>
                    <p className="text-[11px] text-[#9CA6B8] font-mono">+91 74538 73443</p>
                </a>
                <a href="mailto:ks232003@gmail.com" className="group border border-white/10 rounded-lg p-3.5 hover:border-[#D97D0D]/50 transition-colors">
                    <div className="flex items-center gap-2 mb-2">
                        <Mail size={14} className="text-[#7CA8E0]" />
                        <h4 className="font-semibold text-xs text-white">Email</h4>
                    </div>
                    <p className="text-[11px] text-[#9CA6B8] font-mono truncate">ks232003@gmail.com</p>
                </a>
            </div>
        </div>

        {/* Right Side - Form (the "ticket") */}
        <Card className="md:w-3/5 px-6 py-6 md:px-8 md:py-7 border-0 shadow-none bg-white flex flex-col rounded-none">
            <div className="flex-shrink-0 flex items-start justify-between border-b border-dashed border-[#E7E3D9] pb-4 mb-5">
                <div>
                    <h2 className="text-lg font-bold text-[#101B2D] tracking-tight">Send a message</h2>
                    <p className="text-xs text-[#6B7280] mt-0.5">We'll route this to the right team.</p>
                </div>
                <span className="text-[10px] font-mono text-[#D97D0D] bg-[#D97D0D]/10 px-2 py-1 rounded">
                    TCKT-{new Date().getTime().toString().slice(-6)}
                </span>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-semibold text-[#101B2D] mb-1.5">
                            Full name <span className="text-[#D97D0D]">*</span>
                        </label>
                        <div className="relative">
                            <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
                            <Input
                                name="name"
                                value={form.name}
                                onChange={handleChange}
                                placeholder="Your name"
                                className="pl-9 h-10 text-sm rounded-md border-[#E5E2D9] focus-visible:ring-1 focus-visible:ring-[#1E3A5F] focus-visible:border-[#1E3A5F]"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-[#101B2D] mb-1.5">
                            Email <span className="text-[#D97D0D]">*</span>
                        </label>
                        <div className="relative">
                            <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
                            <Input
                                type="email"
                                name="email"
                                value={form.email}
                                onChange={handleChange}
                                placeholder="your@email.com"
                                className="pl-9 h-10 text-sm rounded-md border-[#E5E2D9] focus-visible:ring-1 focus-visible:ring-[#1E3A5F] focus-visible:border-[#1E3A5F]"
                                required
                            />
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-semibold text-[#101B2D] mb-1.5">Phone number</label>
                        <div className="relative">
                            <Phone size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
                            <Input
                                type="tel"
                                name="phone"
                                value={form.phone}
                                onChange={handleChange}
                                placeholder="+91 98765 43210"
                                className="pl-9 h-10 text-sm rounded-md border-[#E5E2D9] focus-visible:ring-1 focus-visible:ring-[#1E3A5F] focus-visible:border-[#1E3A5F]"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-[#101B2D] mb-1.5">Category</label>
                        <Select value={form.category} onValueChange={(value) => handleSelectChange("category", value)}>
                            <SelectTrigger className="h-10 text-sm rounded-md border-[#E5E2D9] focus:ring-1 focus:ring-[#1E3A5F]">
                                <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="billing">Billing issue</SelectItem>
                                <SelectItem value="lr">LR generation</SelectItem>
                                <SelectItem value="technical">Technical issue</SelectItem>
                                <SelectItem value="account">Account help</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-semibold text-[#101B2D] mb-1.5">Subject</label>
                    <Input
                        name="subject"
                        value={form.subject}
                        onChange={handleChange}
                        placeholder="Brief subject of your query"
                        className="h-10 text-sm rounded-md border-[#E5E2D9] focus-visible:ring-1 focus-visible:ring-[#1E3A5F] focus-visible:border-[#1E3A5F]"
                    />
                </div>

                <div>
                    <label className="block text-xs font-semibold text-[#101B2D] mb-1.5">
                        Message <span className="text-[#D97D0D]">*</span>
                    </label>
                    <Textarea
                        name="message"
                        value={form.message}
                        onChange={handleChange}
                        rows={3}
                        placeholder="Describe your query in detail..."
                        className="resize-none text-sm min-h-[80px] rounded-md border-[#E5E2D9] focus-visible:ring-1 focus-visible:ring-[#1E3A5F] focus-visible:border-[#1E3A5F]"
                        required
                    />
                </div>

                <Button
                    type="submit"
                    disabled={loading}
                    className="cursor-pointer w-full h-11 bg-[#101B2D] hover:bg-[#1E3A5F] text-white font-semibold rounded-md transition-colors group text-sm"
                >
                    {loading ? (
                        <>
                            <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                            Sending...
                        </>
                    ) : (
                        <>
                            Send message
                            <ArrowRight size={15} className="ml-2 group-hover:translate-x-1 transition-transform" />
                        </>
                    )}
                </Button>

                <p className="text-[11px] text-[#9CA3AF] text-center">
                    We typically respond within 24 hours. For urgent issues, call us directly.
                </p>
            </form>
        </Card>
    </div>
</div>
    );
}