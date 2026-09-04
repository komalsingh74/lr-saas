"use client";

import { useState } from "react";
import {
  Search,
  Eye,
  MessageSquare,
  AlertTriangle,
  CheckCircle,
  Clock,
} from "lucide-react";

const tickets = [
  {
    id: "TKT-1001",
    company: "Agra Logistics",
    user: "Rahul Sharma",
    subject: "Unable to Generate LR",
    priority: "High",
    status: "Open",
    createdAt: "2026-06-01",
  },
  {
    id: "TKT-1002",
    company: "Delhi Transport",
    user: "Amit Kumar",
    subject: "Payment Successful but Plan Not Activated",
    priority: "Critical",
    status: "In Progress",
    createdAt: "2026-06-01",
  },
  {
    id: "TKT-1003",
    company: "Speed Cargo",
    user: "Vikas Singh",
    subject: "Bulk Upload Error",
    priority: "Medium",
    status: "Resolved",
    createdAt: "2026-05-31",
  },
];

export default function SupportTicketsPage() {
  const [search, setSearch] = useState("");

  const filteredTickets = tickets.filter(
    (ticket) =>
      ticket.subject.toLowerCase().includes(search.toLowerCase()) ||
      ticket.company.toLowerCase().includes(search.toLowerCase()) ||
      ticket.user.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Support Tickets</h1>
        <p className="text-gray-500">
          Manage all customer support requests
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          title="Total Tickets"
          value="245"
          icon={<MessageSquare className="h-6 w-6" />}
        />
        <StatCard
          title="Open"
          value="34"
          icon={<AlertTriangle className="h-6 w-6" />}
        />
        <StatCard
          title="In Progress"
          value="18"
          icon={<Clock className="h-6 w-6" />}
        />
        <StatCard
          title="Resolved"
          value="193"
          icon={<CheckCircle className="h-6 w-6" />}
        />
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search tickets..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full border rounded-lg pl-10 pr-4 py-3"
        />
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border bg-white">
        <table className="w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-4 text-left">Ticket ID</th>
              <th className="p-4 text-left">Company</th>
              <th className="p-4 text-left">User</th>
              <th className="p-4 text-left">Subject</th>
              <th className="p-4 text-left">Priority</th>
              <th className="p-4 text-left">Status</th>
              <th className="p-4 text-left">Date</th>
              <th className="p-4 text-center">Action</th>
            </tr>
          </thead>

          <tbody>
            {filteredTickets.map((ticket) => (
              <tr key={ticket.id} className="border-t">
                <td className="p-4">{ticket.id}</td>
                <td className="p-4">{ticket.company}</td>
                <td className="p-4">{ticket.user}</td>
                <td className="p-4">{ticket.subject}</td>

                <td className="p-4">
                  <span className="px-3 py-1 rounded-full text-sm bg-red-100 text-red-600">
                    {ticket.priority}
                  </span>
                </td>

                <td className="p-4">
                  <span className="px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-600">
                    {ticket.status}
                  </span>
                </td>

                <td className="p-4">{ticket.createdAt}</td>

                <td className="p-4 text-center">
                  <button className="border rounded-lg px-3 py-2 hover:bg-gray-100">
                    <Eye size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="bg-white border rounded-xl p-5 flex items-center justify-between">
      <div>
        <p className="text-gray-500">{title}</p>
        <h2 className="text-3xl font-bold">{value}</h2>
      </div>
      {icon}
    </div>
  );
}