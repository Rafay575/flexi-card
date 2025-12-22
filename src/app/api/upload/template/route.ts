import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const type = formData.get("type") as string; // "front" or "back"
    const name = formData.get("name") as string;

    if (!file || !type) {
      return NextResponse.json(
        { success: false, error: "File and type are required" },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create templates directory if it doesn't exist
    const uploadDir = path.join(process.cwd(), "public", "uploads", "templates");
    await mkdir(uploadDir, { recursive: true });

    // Generate unique filename
    const ext = path.extname(file.name);
    const filename = `${type}_${Date.now()}${ext}`;
    const filepath = path.join(uploadDir, filename);

    await writeFile(filepath, buffer);

    // Deactivate previous templates of the same type
    await prisma.template.updateMany({
      where: { type, isActive: true },
      data: { isActive: false },
    });

    // Create new template record
    const template = await prisma.template.create({
      data: {
        name: name || `${type} template`,
        type,
        imagePath: `/uploads/templates/${filename}`,
        isActive: true,
      },
    });

    return NextResponse.json({ success: true, data: template });
  } catch (error) {
    console.error("Error uploading template:", error);
    return NextResponse.json(
      { success: false, error: "Failed to upload template" },
      { status: 500 }
    );
  }
}
