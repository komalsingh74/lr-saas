"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { loadRazorpay } from "@/utils/loadRazorpay";
import api from "@/lib/api";

interface BuyButtonProps {
  plan: string;
}

const planDisplayNames: Record<string, string> = {
  basic: "Basic",
  pro: "Professional",
  enterprise: "Enterprise",
};

export default function BuyButton({
  plan,
}: BuyButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    if (loading) return;

    setLoading(true);

    try {
      const loaded = await loadRazorpay();

      if (!loaded) {
        alert("Razorpay SDK failed to load");
        setLoading(false);
        return;
      }

      const { data: order } = await api.post(
        "/payment/create-order",
        { plan },
        {
          showToast: true,
          successMessage: "Order created",
        } as any
      );

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        order_id: order.id,
        amount: order.amount,
        currency: order.currency || "INR",
        name: "LR SaaS",
        description: `${planDisplayNames[plan] || plan} Plan`,
        handler: async (response: any) => {
          try {
            const { data } = await api.post(
              "/payment/verify-payment",
              {
                ...response,
                plan,
              },
              {
                showToast: true,
                successMessage: "Payment verified",
              } as any
            );

            if (data.success) {
              router.push("/dashboard");
            } else {
              alert("Payment verification failed. Please contact support.");
              setLoading(false);
            }
          } catch (verificationError: any) {
            console.error(verificationError);
            alert(
              verificationError?.response?.data?.message ||
              verificationError?.message ||
              "Payment verification failed"
            );
            setLoading(false);
          }
        },
        modal: {
          ondismiss: () => {
            setLoading(false);
          },
        },
      };

      const razorpay = new (window as any).Razorpay(options);

      razorpay.on("payment.failed", function (response: any) {
        console.error(response.error);
        alert("Payment Failed");
        setLoading(false);
      });

      razorpay.open();
    } catch (error: any) {
      console.error(error);
      alert(
        error?.response?.data?.message ||
        error?.message ||
        "Payment initiation failed"
      );
      setLoading(false);
    }
  };

  return (
    <button
      disabled={loading}
      onClick={handlePayment}
      className="bg-blue-600 text-white px-6 py-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {loading ? "Processing..." : "Continue"}
    </button>
  );
}