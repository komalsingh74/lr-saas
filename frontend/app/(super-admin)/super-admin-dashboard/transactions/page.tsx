"use client";
import { useEffect, useMemo, useState } from "react";
import {
  Search,
  CreditCard,
  CheckCircle,
  XCircle,
  Clock,
  Download,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import Pagination from "@/components/Pagination";
import api from "@/lib/api";

interface TransactionItem {
  id: string;
  company: string;
  plan: string;
  amount: number;
  status: string;
  method: string;
  date: string;
  razorpayPaymentId?: string;
  razorpayOrderId?: string;
}

export default function TransactionsPage() {
  const [search, setSearch] = useState("");
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalResults, setTotalResults] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    loadTransactions(page, limit);
  }, [page, limit]);

  const loadTransactions = async (pageNumber: number, pageSize: number) => {
    try {
      setLoading(true);
      const response = await api.get("/payment/transactions", {
        params: {
          page: pageNumber,
          limit: pageSize,
        },
      });

      setTransactions(
        response.data.results.map((item: any) => ({
          id: item.id,
          company: item.company,
          plan: item.plan,
          amount: item.amount,
          status: item.status === "paid" ? "Paid" : item.status === "failed" ? "Failed" : "Pending",
          method: item.method || "Razorpay",
          date: new Date(item.date).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          }),
          razorpayPaymentId: item.razorpayPaymentId,
          razorpayOrderId: item.razorpayOrderId,
        }))
      );

      setTotalResults(response.data.totalResults || 0);
      setTotalPages(response.data.totalPages || 1);
      setPage(response.data.page || pageNumber);
      setLimit(response.data.limit || pageSize);
    } catch (err: any) {
      console.error(err);
      setError(err?.response?.data?.message || err?.message || "Failed to load transactions");
    } finally {
      setLoading(false);
    }
  };

  const filteredTransactions = useMemo(() => {
    const lowered = search.toLowerCase();
    return transactions.filter((transaction) =>
      [transaction.company, transaction.plan, transaction.id, transaction.razorpayPaymentId]
        .filter(Boolean)
        .some((value) => value?.toLowerCase().includes(lowered))
    );
  }, [search, transactions]);

  const totalRevenue = useMemo(
    () => transactions.reduce((sum, transaction) => sum + (transaction.status === "Paid" ? transaction.amount : 0), 0),
    [transactions]
  );

  const totalTransactions = totalResults;
  const successful = transactions.filter((t) => t.status === "Paid").length;
  const failed = transactions.filter((t) => t.status === "Failed").length;

  const downloadInvoice = async (transaction: TransactionItem) => {
    const { jsPDF } = await import("jspdf");
    const doc = new jsPDF();
    const lineHeight = 10;
    let y = 20;

    doc.setFontSize(18);
    doc.text("Invoice", 20, y);
    y += 15;
    doc.setFontSize(11);
    doc.text(`Transaction ID: ${transaction.id}`, 20, y);
    y += lineHeight;
    doc.text(`Razorpay Payment ID: ${transaction.razorpayPaymentId || "-"}`, 20, y);
    y += lineHeight;
    doc.text(`Razorpay Order ID: ${transaction.razorpayOrderId || "-"}`, 20, y);
    y += lineHeight;
    doc.text(`Company: ${transaction.company}`, 20, y);
    y += lineHeight;
    doc.text(`Plan: ${transaction.plan}`, 20, y);
    y += lineHeight;
    doc.text(`Amount: ₹${transaction.amount}`, 20, y);
    y += lineHeight;
    doc.text(`Status: ${transaction.status}`, 20, y);
    y += lineHeight;
    doc.text(`Method: ${transaction.method}`, 20, y);
    y += lineHeight;
    doc.text(`Date: ${transaction.date}`, 20, y);

    doc.save(`invoice-${transaction.id}.pdf`);
  };

  return (
    <div className="p-1 space-y-4">
      <Card className="p-4">
        <h1 className="text-2xl font-bold">Transactions</h1>
        <p className="text-slate-500 text-sm">Track all payments and billing activity</p>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard title="Total Transactions" value={String(totalTransactions)} icon={<CreditCard />} />
        <StatCard title="Total Revenue" value={`₹${totalRevenue}`} icon={<CheckCircle />} />
        <StatCard title="Successful" value={String(successful)} icon={<CheckCircle />} />
        <StatCard title="Failed" value={String(failed)} icon={<XCircle />} />
      </div>

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center bg-white border rounded-lg px-3 py-2 w-full max-w-sm">
          <Search size={16} className="text-slate-400" />
          <input
            type="text"
            placeholder="Search transactions..."
            className="ml-2 outline-none w-full"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        {loading && <p className="text-sm text-slate-500">Loading transactions...</p>}
        {error && <p className="text-sm text-red-500">{error}</p>}
      </div>

      <div className="bg-white rounded-xl border overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="p-3 text-left">Transaction ID</th>
              <th className="p-3 text-left">Company</th>
              <th className="p-3 text-left">Plan</th>
              <th className="p-3 text-left">Amount</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">Method</th>
              <th className="p-3 text-left">Razorpay Payment ID</th>
              <th className="p-3 text-left">Date</th>
              <th className="p-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredTransactions.map((t) => (
              <tr key={t.id} className="border-t hover:bg-slate-50">
                <td className="p-3 font-mono text-xs text-slate-700 break-all">{t.id}</td>
                <td className="p-3 font-medium">{t.company}</td>
                <td className="p-3">{t.plan}</td>
                <td className="p-3 font-semibold">₹{t.amount}</td>
                <td className="p-3">
                  <span
                    className={`px-2 py-1 text-xs rounded flex items-center gap-1 w-fit ${t.status === "Paid"
                      ? "bg-green-100 text-green-600"
                      : t.status === "Pending"
                        ? "bg-yellow-100 text-yellow-600"
                        : "bg-red-100 text-red-600"
                      }`}
                  >
                    {t.status === "Paid" && <CheckCircle size={12} />}
                    {t.status === "Pending" && <Clock size={12} />}
                    {t.status === "Failed" && <XCircle size={12} />}
                    {t.status}
                  </span>
                </td>
                <td className="p-3">{t.method}</td>
                <td className="p-3 font-mono text-xs break-all">{t.razorpayPaymentId || "-"}</td>
                <td className="p-3 text-slate-500">{t.date}</td>
                <td className="p-3">
                  <button
                    className="inline-flex items-center gap-2 rounded-lg bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200"
                    onClick={() => downloadInvoice(t)}
                  >
                    <Download size={14} /> Invoice
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Pagination
        currentPage={page}
        totalPages={totalPages}
        pageSize={limit}
        totalResults={totalResults}
        onPageChange={(newPage) => setPage(newPage)}
        onPageSizeChange={(newPageSize) => {
          setLimit(newPageSize);
          setPage(1);
        }}
      />
    </div>
  );
}

/* 🔹 Stat Card */
function StatCard({ title, value, icon }: any) {
  return (
    <div className="bg-white p-4 rounded-xl border">
      <div className="flex justify-between items-center">
        <p className="text-sm text-slate-500">{title}</p>
        {icon}
      </div>
      <h2 className="text-xl font-bold mt-2">{value}</h2>
    </div>
  );
}