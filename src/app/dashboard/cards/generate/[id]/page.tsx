"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, RefreshCw, Printer, Download } from "lucide-react";
import type { Employee } from "@/types";

import { EmployeeCardFrontTemplateOnly } from "@/components/EmployeeCardFront";
import { EmployeeCardBackTemplateOnly } from "@/components/EmployeeCardBackTemplateOnly";

function formatDate(d: any) {
  if (!d) return "—";
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return "—";
  return dt.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

export default function GenerateCardPage() {
  const params = useParams<{ id: string }>();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  const id = params?.id;

  const fetchEmployee = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/employees/${id}`, { cache: "no-store" });
      const data = await res.json();
      setEmployee(data?.success ? data.data : null);
    } catch (e) {
      console.error(e);
      setEmployee(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployee();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleGenerate = async () => {
    if (!id) return;

    setGenerating(true);
    try {
      const res = await fetch(`/api/cards/generate/${id}`, { method: "POST" });
      const data = await res.json();

      if (!data?.success) {
        alert(data?.error || "Failed to generate card");
        return;
      }

      // best: backend returns updated employee
      if (data.data?.employee) setEmployee(data.data.employee);
      else await fetchEmployee();
    } catch (e) {
      console.error(e);
      alert("Failed to generate card");
    } finally {
      setGenerating(false);
    }
  };

  const handlePrint = () => window.print();

  const downloadImage = (url: string, name: string) => {
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    a.click();
  };

  const frontProps = useMemo(() => {
    if (!employee) return null;
    return {
      employee: {
        firstName: employee.firstName,
        lastName: employee.lastName,
        designation: employee.designation,
        employeeId: employee.employeeId,
        department: employee.department,
        phone: (employee as any).contactNumber ?? "—",
        photoUrl: (employee as any).photoPath || "/placeholder-user.jpg",
      },
      templateSrc: "/template/1.png",
    };
  }, [employee]);

  const backProps = useMemo(() => {
    if (!employee) return null;
    return {
      employee: {
        employeeId: employee.employeeId,
        department: employee.department,
        city: (employee as any).city ?? "—",
        dateOfJoining: formatDate((employee as any).dateOfJoining),
        dateOfBirth: formatDate((employee as any).dateOfBirth),
        mobile: (employee as any).mobileNumber ?? "—",
        cnic: (employee as any).cnic ?? "—",
        bloodGroup: (employee as any).bloodGroup ?? "—",
        emergencyContact: (employee as any).emergencyContact ?? "—",
      },
      templateSrc: "/template/2.png",
    };
  }, [employee]);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent" />
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="space-y-4">
        <Link href="/dashboard/cards">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="flex h-64 items-center justify-center">
          <p className="text-gray-500">Employee not found</p>
        </div>
      </div>
    );
  }

  const hasGenerated = !!employee.cardGenerated && !!employee.cardFrontPath;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/dashboard/cards">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>

          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {employee.firstName} {employee.lastName}
            </h1>
            <p className="text-gray-500">Employee ID: {employee.employeeId}</p>
          </div>
        </div>

        <div className="flex space-x-3">
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="mr-2 h-4 w-4" />
            Print
          </Button>

          <Button onClick={handleGenerate} disabled={generating}>
            <RefreshCw className={`mr-2 h-4 w-4 ${generating ? "animate-spin" : ""}`} />
            {generating ? "Generating..." : hasGenerated ? "Regenerate" : "Generate Card"}
          </Button>
        </div>
      </div>

      {/* ✅ If generated: show 2 real images. Else show template preview */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Front */}
        <Card className="rounded-lg bg-white shadow-lg">
          <CardContent className="flex flex-col items-center justify-center gap-3 p-6">
            {hasGenerated && employee.cardFrontPath ? (
              <>
                <img
                  src={employee.cardFrontPath}
                  alt="Generated Front"
                  className="max-h-[720px] rounded-lg shadow-lg"
                />
                <Button
                  variant="outline"
                  onClick={() =>
                    downloadImage(
                      employee.cardFrontPath!,
                      `${employee.employeeId}_${employee.firstName}_${employee.lastName}_front.png`
                    )
                  }
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download Front
                </Button>
              </>
            ) : (
              frontProps && <EmployeeCardFrontTemplateOnly {...frontProps} />
            )}
          </CardContent>
        </Card>

        {/* Back */}
        <Card className="rounded-lg bg-white shadow-lg">
          <CardContent className="flex flex-col items-center justify-center gap-3 p-6">
            {hasGenerated && employee.cardBackPath ? (
              <>
                <img
                  src={employee.cardBackPath}
                  alt="Generated Back"
                  className="max-h-[720px] rounded-lg shadow-lg"
                />
                <Button
                  variant="outline"
                  onClick={() =>
                    downloadImage(
                      employee.cardBackPath!,
                      `${employee.employeeId}_${employee.firstName}_${employee.lastName}_back.png`
                    )
                  }
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download Back
                </Button>
              </>
            ) : (
              backProps && <EmployeeCardBackTemplateOnly {...backProps} />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
