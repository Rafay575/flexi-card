"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Download,
  CreditCard,
  Eye,
  RefreshCw,
  CheckSquare,
  Square,
} from "lucide-react";
import type { Employee } from "@/types";

export default function CardsPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);

  const [generating, setGenerating] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<string[]>([]); // ✅ stores employee.id

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/employees", { cache: "no-store" });
      const data = await response.json();
      if (data.success) setEmployees(data.data);
    } catch (error) {
      console.error("Error fetching employees:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredEmployees = useMemo(() => {
    const s = search.toLowerCase().trim();
    if (!s) return employees;

    return employees.filter(
      (emp) =>
        emp.firstName.toLowerCase().includes(s) ||
        emp.lastName.toLowerCase().includes(s) ||
        String(emp.employeeId).toLowerCase().includes(s)
    );
  }, [employees, search]);

  const generatedCount = employees.filter((e) => e.cardGenerated).length;
  const pendingCount = employees.length - generatedCount;

  const toggleSelect = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (filteredEmployees.length === 0) return;

    if (selected.length === filteredEmployees.length) {
      setSelected([]);
    } else {
      setSelected(filteredEmployees.map((e) => e.id)); // ✅ employee.id
    }
  };

  // ✅ Generate only selected, OR all if none selected
  const handleGenerateBatch = async () => {
    setGenerating(true);
    try {
      const response = await fetch("/api/cards/batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employeeIds: selected.length > 0 ? selected : undefined, // ✅ ids
        }),
      });

      const data = await response.json();

      if (!data?.success) {
        alert(data?.error || "Failed to generate cards");
        return;
      }

      alert(`Generated ${data.data.success} cards successfully!`);
      setSelected([]);
      await fetchEmployees();
    } catch (error) {
      console.error("Error generating cards:", error);
      alert("Failed to generate cards");
    } finally {
      setGenerating(false);
    }
  };

  const handleDownloadBatch = async () => {
    setDownloading(true);
    try {
      const response = await fetch("/api/cards/download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employeeIds: selected.length > 0 ? selected : undefined, // ✅ ids
        }),
      });

      if (!response.ok) {
        const txt = await response.text();
        console.log("Download failed:", txt);
        alert("Download failed. Check console.");
        return;
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `employee_cards_${Date.now()}.zip`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading cards:", error);
      alert("Download failed");
    } finally {
      setDownloading(false);
    }
  };

  // ✅ Optional: generate single row card
  const handleGenerateOne = async (id: string) => {
    try {
      const res = await fetch(`/api/cards/generate/${id}`, { method: "POST" });
      const data = await res.json();
      if (!data?.success) {
        alert(data?.error || "Failed to generate card");
        return;
      }
      await fetchEmployees();
    } catch (e) {
      console.error(e);
      alert("Failed to generate card");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">ID Cards</h1>
          <p className="text-gray-500">Generate and download employee ID cards</p>
        </div>

        <div className="flex space-x-3">
          <Button
            variant="outline"
            onClick={handleGenerateBatch}
            disabled={generating || (employees.length === 0)}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${generating ? "animate-spin" : ""}`} />
            {generating
              ? "Generating..."
              : selected.length > 0
              ? `Generate Selected (${selected.length})`
              : "Generate All"}
          </Button>

          <Button onClick={handleDownloadBatch} disabled={downloading}>
            <Download className="mr-2 h-4 w-4" />
            {downloading
              ? "Preparing..."
              : selected.length > 0
              ? `Download Selected (${selected.length})`
              : "Download ZIP"}
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="flex items-center p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
              <CreditCard className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500">Total Employees</p>
              <p className="text-2xl font-bold">{employees.length}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
              <CheckSquare className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500">Cards Generated</p>
              <p className="text-2xl font-bold">{generatedCount}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-100">
              <Square className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500">Pending</p>
              <p className="text-2xl font-bold">{pendingCount}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Employee Cards</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search..."
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {loading ? (
            <div className="flex h-32 items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <input
                      type="checkbox"
                      checked={
                        filteredEmployees.length > 0 &&
                        selected.length === filteredEmployees.length
                      }
                      onChange={toggleSelectAll}
                      className="h-4 w-4 rounded border-gray-300"
                    />
                  </TableHead>
                  <TableHead>Employee</TableHead>
                  <TableHead>ID</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Preview</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {filteredEmployees.map((employee) => (
                  <TableRow key={employee.id}>
                    <TableCell>
                      <input
                        type="checkbox"
                        checked={selected.includes(employee.id)}
                        onChange={() => toggleSelect(employee.id)}
                        className="h-4 w-4 rounded border-gray-300"
                      />
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center space-x-3">
                        {employee.photoPath ? (
                          <img
                            src={employee.photoPath}
                            alt=""
                            className="h-8 w-8 rounded-full object-cover"
                          />
                        ) : (
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 text-xs">
                            {employee.firstName?.[0] ?? "?"}
                            {employee.lastName?.[0] ?? ""}
                          </div>
                        )}
                        <span>
                          {employee.firstName} {employee.lastName}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell className="font-mono">{employee.employeeId}</TableCell>
                    <TableCell>{employee.department}</TableCell>

                    <TableCell>
                      {employee.cardGenerated ? (
                        <Badge variant="success">Generated</Badge>
                      ) : (
                        <Badge variant="secondary">Pending</Badge>
                      )}
                    </TableCell>

                    {/* ✅ Show 2 images preview if generated */}
                    <TableCell>
                      {employee.cardGenerated ? (
                        <div className="flex gap-2">
                          {employee.cardFrontPath ? (
                            <img
                              src={employee.cardFrontPath}
                              alt="Front"
                              className="h-14 w-10 rounded border object-cover"
                            />
                          ) : (
                            <div className="h-14 w-10 rounded border bg-gray-100" />
                          )}

                          {employee.cardBackPath ? (
                            <img
                              src={employee.cardBackPath}
                              alt="Back"
                              className="h-14 w-10 rounded border object-cover"
                            />
                          ) : (
                            <div className="h-14 w-10 rounded border bg-gray-100" />
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-gray-500">—</span>
                      )}
                    </TableCell>

                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Link href={`/dashboard/cards/generate/${employee.id}`}>
                          <Button variant="ghost" size="sm">
                            <Eye className="mr-1 h-4 w-4" />
                            View
                          </Button>
                        </Link>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleGenerateOne(employee.id)}
                        >
                          <RefreshCw className="mr-1 h-4 w-4" />
                          Generate
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
