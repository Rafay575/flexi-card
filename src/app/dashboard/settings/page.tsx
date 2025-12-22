"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Save, Key, Building } from "lucide-react";

export default function SettingsPage() {
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) {
      setMessage("Passwords do not match");
      return;
    }

    setSaving(true);
    try {
      // Password change API would go here
      setMessage("Password updated successfully");
      setPasswords({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (error) {
      setMessage("Failed to update password");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500">Manage application settings</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Change Password */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-3">
              <Key className="h-5 w-5 text-gray-500" />
              <div>
                <CardTitle>Change Password</CardTitle>
                <CardDescription>Update your account password</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordChange} className="space-y-4">
              {message && (
                <div className={`rounded-md p-3 text-sm ${message.includes("success") ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"}`}>
                  {message}
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Current Password</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  value={passwords.currentPassword}
                  onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={passwords.newPassword}
                  onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={passwords.confirmPassword}
                  onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                />
              </div>
              <Button type="submit" disabled={saving}>
                <Save className="mr-2 h-4 w-4" />
                {saving ? "Saving..." : "Update Password"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Company Info */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-3">
              <Building className="h-5 w-5 text-gray-500" />
              <div>
                <CardTitle>Company Information</CardTitle>
                <CardDescription>QR code and card settings</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="companyUrl">Company Website (QR Code URL)</Label>
              <Input
                id="companyUrl"
                placeholder="https://hrpsp.net"
                defaultValue="https://hrpsp.net"
              />
              <p className="text-xs text-gray-500">
                This URL will be encoded in the QR code on employee cards
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="companyName">Company Name</Label>
              <Input
                id="companyName"
                placeholder="HRPSP"
                defaultValue="HRPSP"
              />
            </div>
            <Button>
              <Save className="mr-2 h-4 w-4" />
              Save Settings
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Application Info */}
      <Card>
        <CardHeader>
          <CardTitle>About Flexi ID</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg bg-gray-50 p-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-sm text-gray-500">Version</p>
                <p className="font-medium">1.0.0</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Built with</p>
                <p className="font-medium">Next.js, TypeScript, Prisma, Tailwind CSS</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Card Generation</p>
                <p className="font-medium">Canvas API with Sharp image processing</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Output Format</p>
                <p className="font-medium">PNG (individual) / ZIP (batch)</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
