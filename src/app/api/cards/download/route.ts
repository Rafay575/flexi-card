import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import archiver from "archiver";
import { createReadStream, existsSync } from "fs";
import path from "path";
import { Readable } from "stream";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const employeeIds: string[] = body.employeeIds || [];

    // Get employees with generated cards
    const employees = await prisma.employee.findMany({
      where: {
        ...(employeeIds.length > 0 ? { id: { in: employeeIds } } : {}),
        cardGenerated: true,
        isActive: true,
      },
    });

    if (employees.length === 0) {
      return NextResponse.json(
        { success: false, error: "No cards found to download" },
        { status: 404 }
      );
    }

    // Create ZIP archive
    const archive = archiver("zip", { zlib: { level: 9 } });
    const chunks: Buffer[] = [];

    archive.on("data", (chunk) => chunks.push(chunk));

    // Add card files to archive
    for (const employee of employees) {
      if (employee.cardFrontPath) {
        const frontPath = path.join(process.cwd(), "public", employee.cardFrontPath);
        if (existsSync(frontPath)) {
          archive.file(frontPath, { name: `${employee.employeeId}_${employee.firstName}_${employee.lastName}_front.png` });
        }
      }
      if (employee.cardBackPath) {
        const backPath = path.join(process.cwd(), "public", employee.cardBackPath);
        if (existsSync(backPath)) {
          archive.file(backPath, { name: `${employee.employeeId}_${employee.firstName}_${employee.lastName}_back.png` });
        }
      }
    }

    await archive.finalize();

    const buffer = Buffer.concat(chunks);

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="employee_cards_${Date.now()}.zip"`,
      },
    });
  } catch (error) {
    console.error("Error downloading cards:", error);
    return NextResponse.json(
      { success: false, error: "Failed to download cards" },
      { status: 500 }
    );
  }
}
