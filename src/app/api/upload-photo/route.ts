import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import path from "path";
import fs from "fs/promises";

export const runtime = "nodejs";

function getDigitsFromFilename(filename: string) {
  // "0210.jpg" -> "0210"
  // "0050" -> "0050"
  const base = filename.replace(/\.[^/.]+$/, ""); // remove extension
  const m = base.match(/(\d+)\s*$/);
  return m?.[1] ?? "";
}

function extFromMime(mime: string) {
  if (mime === "image/png") return ".png";
  if (mime === "image/webp") return ".webp";
  return ".jpg"; // default jpeg
}

function isAllowedMime(type: string) {
  return ["image/jpeg", "image/png", "image/webp"].includes(type);
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const files = formData.getAll("files") as File[];

    if (!files || files.length === 0) {
      return NextResponse.json(
        { success: false, error: "No files provided" },
        { status: 400 }
      );
    }

    const uploadDir = path.join(process.cwd(), "public", "uploads", "employees");
    await fs.mkdir(uploadDir, { recursive: true });

    const results = {
      total: files.length,
      success: 0,
      failed: 0,
      items: [] as Array<{
        file: string;
        digits?: string;
        employeeId?: string;
        photoPath?: string;
        status: "success" | "failed";
        reason?: string;
      }>,
    };

    for (const file of files) {
      const originalName = (file as any).name || "unknown";

      try {
        if (!isAllowedMime(file.type)) {
          results.failed++;
          results.items.push({
            file: originalName,
            status: "failed",
            reason: "Only JPG/PNG/WEBP allowed",
          });
          continue;
        }

        const digits = getDigitsFromFilename(originalName);
        if (!digits) {
          results.failed++;
          results.items.push({
            file: originalName,
            status: "failed",
            reason: "Could not extract digits from filename",
          });
          continue;
        }

        // ✅ Find employee whose employeeId ends with these digits (HRPSP/BI/0210 -> endsWith "0210")
        const emp = await prisma.employee.findFirst({
          where: { employeeId: { endsWith: digits } },
          select: { employeeId: true },
        });

        if (!emp) {
          results.failed++;
          results.items.push({
            file: originalName,
            digits,
            status: "failed",
            reason: `No employee found with employeeId ending in ${digits}`,
          });
          continue;
        }

        // Save file as /uploads/employees/<digits>.<ext>
        const ext = extFromMime(file.type);
        const fileName = `${digits}${ext}`;
        const filePath = path.join(uploadDir, fileName);

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // overwrite allowed ✅
        await fs.writeFile(filePath, buffer);

        const publicUrl = `/uploads/employees/${fileName}`;

        await prisma.employee.update({
          where: { employeeId: emp.employeeId },
          data: { photoPath: publicUrl },
        });

        results.success++;
        results.items.push({
          file: originalName,
          digits,
          employeeId: emp.employeeId,
          photoPath: publicUrl,
          status: "success",
        });
      } catch (e: any) {
        results.failed++;
        results.items.push({
          file: originalName,
          status: "failed",
          reason: e?.message || "Upload failed",
        });
      }
    }

    return NextResponse.json({ success: true, data: results });
  } catch (error) {
    console.error("Bulk upload error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to upload photos" },
      { status: 500 }
    );
  }
}
