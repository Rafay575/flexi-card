import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateAndSaveCards } from "@/lib/card-generator";
import archiver from "archiver";
import { createReadStream } from "fs";
import path from "path";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const employeeIds: string[] = body.employeeIds || [];

    // Get employees
    const employees = await prisma.employee.findMany({
      where: employeeIds.length > 0
        ? { id: { in: employeeIds } }
        : { isActive: true },
    });

    if (employees.length === 0) {
      return NextResponse.json(
        { success: false, error: "No employees found" },
        { status: 404 }
      );
    }

    // Get active templates
    const [frontTemplate, backTemplate] = await Promise.all([
      prisma.template.findFirst({ where: { type: "front", isActive: true } }),
      prisma.template.findFirst({ where: { type: "back", isActive: true } }),
    ]);

    const results = {
      success: 0,
      failed: 0,
      errors: [] as string[],
    };

    // Generate cards for each employee
    for (const employee of employees) {
      try {
        const { frontPath, backPath } = await generateAndSaveCards(
          employee,
          frontTemplate,
          backTemplate
        );

        await prisma.employee.update({
          where: { id: employee.id },
          data: {
            cardGenerated: true,
            cardFrontPath: frontPath,
            cardBackPath: backPath,
          },
        });

        results.success++;
      } catch (error) {
        results.failed++;
        results.errors.push(`Failed to generate card for ${employee.employeeId}`);
      }
    }

    return NextResponse.json({ success: true, data: results });
  } catch (error) {
    console.error("Error batch generating cards:", error);
    return NextResponse.json(
      { success: false, error: "Failed to batch generate cards" },
      { status: 500 }
    );
  }
}
