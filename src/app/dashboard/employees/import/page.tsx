"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowLeft, Upload, Download, FileText, CheckCircle, XCircle } from "lucide-react";

interface ImportResult {
  success: number;
  failed: number;
  errors: string[];
}

export default function ImportEmployeesPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type !== "text/csv" && !selectedFile.name.endsWith(".csv")) {
        setError("Please upload a CSV file");
        return;
      }
      setFile(selectedFile);
      setError("");
      setResult(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a file first");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/employees/import", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        setResult(data.data);
      } else {
        setError(data.error || "Import failed");
      }
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const downloadTemplate = () => {
    const headers = [
      "employeeId",
      "firstName",
      "lastName",
      "designation",
      "department",
      "city",
      "contactNumber",
      "mobileNumber",
      "cnic",
      "bloodGroup",
      "emergencyContact",
      "dateOfBirth",
      "dateOfJoining",
    ];

    const sampleData = [
      "8009654",
      "Muhammad",
      "Talha",
      "Graphic Designer",
      "Product",
      "Islamabad",
      "+92 345 778 9876",
      "+92 321 456 7890",
      "31201-9822345-5",
      "B-",
      "+92 345 678 9900",
      "1994-04-08",
      "2025-07-10",
    ];

    const csvContent = [headers.join(","), sampleData.join(",")].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "employee_template.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Link href="/dashboard/employees">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Import Employees</h1>
          <p className="text-gray-500">Bulk import employees from CSV file</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Upload CSV File</CardTitle>
            <CardDescription>
              Select a CSV file containing employee data
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">
                {error}
              </div>
            )}

            <div className="rounded-lg border-2 border-dashed border-gray-300 p-6">
              <div className="flex flex-col items-center">
                <Upload className="h-10 w-10 text-gray-400" />
                <p className="mt-2 text-sm text-gray-500">
                  {file ? file.name : "Select a CSV file to upload"}
                </p>
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileChange}
                  className="mt-4"
                />
              </div>
            </div>

            <Button
              onClick={handleUpload}
              disabled={!file || loading}
              className="w-full"
            >
              {loading ? "Importing..." : "Import Employees"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>CSV Template</CardTitle>
            <CardDescription>
              Download the template file for reference
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg bg-gray-50 p-4">
              <h4 className="font-medium">Required Columns</h4>
              <ul className="mt-2 space-y-1 text-sm text-gray-600">
                <li>• employeeId - Unique employee ID</li>
                <li>• firstName, lastName - Employee name</li>
                <li>• designation - Job title</li>
                <li>• department - Department name</li>
                <li>• city - City of residence</li>
                <li>• contactNumber - Primary contact (front card)</li>
                <li>• mobileNumber - Mobile (back card)</li>
                <li>• cnic - National ID number</li>
                <li>• bloodGroup - Blood type (A+, B-, etc.)</li>
                <li>• emergencyContact - Emergency phone</li>
                <li>• dateOfBirth - Format: YYYY-MM-DD</li>
                <li>• dateOfJoining - Format: YYYY-MM-DD</li>
              </ul>
            </div>

            <Button variant="outline" onClick={downloadTemplate} className="w-full">
              <Download className="mr-2 h-4 w-4" />
              Download Template
            </Button>
          </CardContent>
        </Card>
      </div>

      {result && (
        <Card>
          <CardHeader>
            <CardTitle>Import Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="flex items-center space-x-3 rounded-lg bg-green-50 p-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
                <div>
                  <p className="text-2xl font-bold text-green-600">{result.success}</p>
                  <p className="text-sm text-green-700">Successfully imported</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 rounded-lg bg-red-50 p-4">
                <XCircle className="h-8 w-8 text-red-600" />
                <div>
                  <p className="text-2xl font-bold text-red-600">{result.failed}</p>
                  <p className="text-sm text-red-700">Failed to import</p>
                </div>
              </div>
            </div>

            {result.errors.length > 0 && (
              <div className="mt-4">
                <h4 className="font-medium text-red-600">Errors:</h4>
                <ul className="mt-2 space-y-1 text-sm text-red-600">
                  {result.errors.map((err, i) => (
                    <li key={i}>• {err}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="mt-4">
              <Button onClick={() => router.push("/dashboard/employees")}>
                View Employees
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
