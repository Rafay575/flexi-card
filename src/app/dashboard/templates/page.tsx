"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Upload, Trash2, Check } from "lucide-react";
import { Template } from "@/types";

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [frontFile, setFrontFile] = useState<File | null>(null);
  const [backFile, setBackFile] = useState<File | null>(null);
  const [frontPreview, setFrontPreview] = useState<string | null>(null);
  const [backPreview, setBackPreview] = useState<string | null>(null);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const response = await fetch("/api/templates");
      const data = await response.json();
      if (data.success) {
        setTemplates(data.data);
      }
    } catch (error) {
      console.error("Error fetching templates:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: "front" | "back") => {
    const file = e.target.files?.[0];
    if (file) {
      if (type === "front") {
        setFrontFile(file);
        const reader = new FileReader();
        reader.onloadend = () => setFrontPreview(reader.result as string);
        reader.readAsDataURL(file);
      } else {
        setBackFile(file);
        const reader = new FileReader();
        reader.onloadend = () => setBackPreview(reader.result as string);
        reader.readAsDataURL(file);
      }
    }
  };

  const handleUpload = async (type: "front" | "back") => {
    const file = type === "front" ? frontFile : backFile;
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", type);
      formData.append("name", `${type.charAt(0).toUpperCase() + type.slice(1)} Template`);

      const response = await fetch("/api/upload/template", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (data.success) {
        fetchTemplates();
        if (type === "front") {
          setFrontFile(null);
          setFrontPreview(null);
        } else {
          setBackFile(null);
          setBackPreview(null);
        }
      }
    } catch (error) {
      console.error("Error uploading template:", error);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this template?")) return;

    try {
      const response = await fetch(`/api/templates/${id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        setTemplates(templates.filter((t) => t.id !== id));
      }
    } catch (error) {
      console.error("Error deleting template:", error);
    }
  };

  const handleSetActive = async (id: string) => {
    try {
      const response = await fetch(`/api/templates/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: true }),
      });
      if (response.ok) {
        fetchTemplates();
      }
    } catch (error) {
      console.error("Error activating template:", error);
    }
  };

  const frontTemplates = templates.filter((t) => t.type === "front");
  const backTemplates = templates.filter((t) => t.type === "back");
  const activeFront = frontTemplates.find((t) => t.isActive);
  const activeBack = backTemplates.find((t) => t.isActive);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Card Templates</h1>
        <p className="text-gray-500">Manage ID card template designs</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Front Template Upload */}
        <Card>
          <CardHeader>
            <CardTitle>Front Template</CardTitle>
            <CardDescription>Upload the front side design of the ID card</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border-2 border-dashed border-gray-300 p-6">
              <div className="flex flex-col items-center">
                {frontPreview ? (
                  <img src={frontPreview} alt="Preview" className="max-h-48 rounded" />
                ) : activeFront ? (
                  <img src={activeFront.imagePath} alt="Current" className="max-h-48 rounded" />
                ) : (
                  <Upload className="h-12 w-12 text-gray-400" />
                )}
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, "front")}
                  className="mt-4"
                />
              </div>
            </div>
            {frontFile && (
              <Button onClick={() => handleUpload("front")} disabled={uploading} className="w-full">
                {uploading ? "Uploading..." : "Upload Front Template"}
              </Button>
            )}
            {activeFront && (
              <div className="flex items-center space-x-2 text-sm text-green-600">
                <Check className="h-4 w-4" />
                <span>Active template: {activeFront.name}</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Back Template Upload */}
        <Card>
          <CardHeader>
            <CardTitle>Back Template</CardTitle>
            <CardDescription>Upload the back side design of the ID card</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border-2 border-dashed border-gray-300 p-6">
              <div className="flex flex-col items-center">
                {backPreview ? (
                  <img src={backPreview} alt="Preview" className="max-h-48 rounded" />
                ) : activeBack ? (
                  <img src={activeBack.imagePath} alt="Current" className="max-h-48 rounded" />
                ) : (
                  <Upload className="h-12 w-12 text-gray-400" />
                )}
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, "back")}
                  className="mt-4"
                />
              </div>
            </div>
            {backFile && (
              <Button onClick={() => handleUpload("back")} disabled={uploading} className="w-full">
                {uploading ? "Uploading..." : "Upload Back Template"}
              </Button>
            )}
            {activeBack && (
              <div className="flex items-center space-x-2 text-sm text-green-600">
                <Check className="h-4 w-4" />
                <span>Active template: {activeBack.name}</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Template History */}
      <Card>
        <CardHeader>
          <CardTitle>Template History</CardTitle>
          <CardDescription>All uploaded templates</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex h-32 items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent"></div>
            </div>
          ) : templates.length === 0 ? (
            <div className="flex h-32 items-center justify-center text-gray-500">
              No templates uploaded yet
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-4">
              {templates.map((template) => (
                <div key={template.id} className="relative rounded-lg border p-3">
                  <img
                    src={template.imagePath}
                    alt={template.name}
                    className="h-32 w-full rounded object-cover"
                  />
                  <div className="mt-2">
                    <div className="flex items-center justify-between">
                      <Badge variant={template.type === "front" ? "default" : "secondary"}>
                        {template.type}
                      </Badge>
                      {template.isActive && (
                        <Badge variant="success">Active</Badge>
                      )}
                    </div>
                    <p className="mt-1 text-sm font-medium truncate">{template.name}</p>
                  </div>
                  <div className="mt-2 flex space-x-2">
                    {!template.isActive && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSetActive(template.id)}
                      >
                        Set Active
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(template.id)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Template Guidelines */}
      <Card>
        <CardHeader>
          <CardTitle>Template Guidelines</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg bg-gray-50 p-4">
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• Recommended size: 638 x 1011 pixels (standard ID card ratio)</li>
              <li>• Supported formats: PNG, JPG, JPEG</li>
              <li>• Leave space for dynamic content (photo, name, details)</li>
              <li>• Front template: Include placeholders for photo, name, designation, employee ID, department, contact</li>
              <li>• Back template: Include space for QR code, employee details, and company footer</li>
              <li>• Only one template of each type can be active at a time</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
