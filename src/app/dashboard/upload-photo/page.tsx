"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type ResultItem = {
  file: string;
  digits?: string;
  employeeId?: string;
  photoPath?: string;
  status: "success" | "failed";
  reason?: string;
};

export default function UploadPhotosBulkPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<null | {
    total: number;
    success: number;
    failed: number;
    items: ResultItem[];
  }>(null);

  const handlePickFolder = (e: any) => {
    const selected = Array.from(e.target.files || []) as File[];
    setFiles(selected);
    setResult(null);
  };

  const upload = async () => {
    if (!files.length) return alert("Please select a folder / files first");

    setLoading(true);
    setResult(null);

    try {
      const fd = new FormData();
      files.forEach((f) => fd.append("files", f));

      const res = await fetch("/api/upload-photo", {
        method: "POST",
        body: fd,
      });

      const data = await res.json();
      if (!data.success) {
        alert(data.error || "Upload failed");
        return;
      }

      setResult(data.data);
    } catch (e) {
      console.error(e);
      alert("Upload failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-3xl">
      <CardHeader>
        <CardTitle>Bulk Upload Employee Photos (Folder)</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Folder input */}
        <div className="space-y-2">
          <label className="text-sm font-medium">
            Select Folder (photos named like 0210.jpg, 0050.png, etc.)
          </label>

          {/* webkitdirectory works in Chrome/Edge */}
          <input
            type="file"
            multiple
            // @ts-ignore
            webkitdirectory="true"
            // @ts-ignore
            directory="true"
            accept="image/png,image/jpeg,image/webp"
            onChange={handlePickFolder}
            className="w-full"
          />

          <p className="text-xs text-gray-500">
            We match by filename digits. Example: <b>0210.jpg</b> → finds employeeId ending with <b>0210</b>.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button onClick={upload} disabled={loading || files.length === 0}>
            {loading ? "Uploading..." : `Upload ${files.length ? `(${files.length})` : ""}`}
          </Button>

          {files.length ? (
            <span className="text-sm text-gray-600">
              Selected: <b>{files.length}</b> files
            </span>
          ) : null}
        </div>

        {/* Result */}
        {result ? (
          <div className="rounded-md border p-3 space-y-2">
            <div className="text-sm">
              Total: <b>{result.total}</b> | Success: <b>{result.success}</b> | Failed:{" "}
              <b>{result.failed}</b>
            </div>

            <div className="max-h-80 overflow-auto border rounded-md">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-white border-b">
                  <tr>
                    <th className="text-left p-2">File</th>
                    <th className="text-left p-2">Digits</th>
                    <th className="text-left p-2">Employee ID</th>
                    <th className="text-left p-2">Status</th>
                    <th className="text-left p-2">Reason</th>
                  </tr>
                </thead>
                <tbody>
                  {result.items.map((it, idx) => (
                    <tr key={idx} className="border-b">
                      <td className="p-2">{it.file}</td>
                      <td className="p-2">{it.digits || "-"}</td>
                      <td className="p-2">{it.employeeId || "-"}</td>
                      <td className="p-2">
                        <span className={it.status === "success" ? "text-green-600" : "text-red-600"}>
                          {it.status}
                        </span>
                      </td>
                      <td className="p-2">{it.reason || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
