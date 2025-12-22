"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, CreditCard, FileImage, CheckCircle } from "lucide-react";

interface Stats {
  totalEmployees: number;
  cardsGenerated: number;
  templatesActive: number;
  pendingCards: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats>({
    totalEmployees: 0,
    cardsGenerated: 0,
    templatesActive: 0,
    pendingCards: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/stats");
      const data = await response.json();
      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: "Total Employees",
      value: stats.totalEmployees,
      description: "Registered in the system",
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "Cards Generated",
      value: stats.cardsGenerated,
      description: "Ready for download",
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: "Pending Cards",
      value: stats.pendingCards,
      description: "Awaiting generation",
      icon: CreditCard,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
    },
    {
      title: "Active Templates",
      value: stats.templatesActive,
      description: "Front and back designs",
      icon: FileImage,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500">Welcome to Flexi ID Card Generation System</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {stat.title}
              </CardTitle>
              <div className={`rounded-full p-2 ${stat.bgColor}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? "..." : stat.value}
              </div>
              <CardDescription>{stat.description}</CardDescription>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks you can perform</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <a
              href="/dashboard/employees/new"
              className="flex items-center rounded-lg border p-3 hover:bg-gray-50"
            >
              <Users className="mr-3 h-5 w-5 text-blue-600" />
              <div>
                <p className="font-medium">Add New Employee</p>
                <p className="text-sm text-gray-500">Register a new employee</p>
              </div>
            </a>
            <a
              href="/dashboard/employees/import"
              className="flex items-center rounded-lg border p-3 hover:bg-gray-50"
            >
              <FileImage className="mr-3 h-5 w-5 text-green-600" />
              <div>
                <p className="font-medium">Bulk Import</p>
                <p className="text-sm text-gray-500">Import employees from CSV</p>
              </div>
            </a>
            <a
              href="/dashboard/cards"
              className="flex items-center rounded-lg border p-3 hover:bg-gray-50"
            >
              <CreditCard className="mr-3 h-5 w-5 text-purple-600" />
              <div>
                <p className="font-medium">Generate Cards</p>
                <p className="text-sm text-gray-500">Create ID cards for employees</p>
              </div>
            </a>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Information</CardTitle>
            <CardDescription>About Flexi ID</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="rounded-lg bg-gray-50 p-4">
              <h4 className="font-medium">Features</h4>
              <ul className="mt-2 space-y-1 text-sm text-gray-600">
                <li>• Employee registration and management</li>
                <li>• Bulk CSV import support</li>
                <li>• Custom template upload (front & back)</li>
                <li>• Dynamic field positioning</li>
                <li>• QR code generation</li>
                <li>• Individual PNG download</li>
                <li>• Batch ZIP download</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
