import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const [totalEmployees, cardsGenerated, templatesActive] = await Promise.all([
      prisma.employee.count({ where: { isActive: true } }),
      prisma.employee.count({ where: { cardGenerated: true, isActive: true } }),
      prisma.template.count({ where: { isActive: true } }),
    ]);

    const pendingCards = totalEmployees - cardsGenerated;

    return NextResponse.json({
      success: true,
      data: {
        totalEmployees,
        cardsGenerated,
        templatesActive,
        pendingCards,
      },
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}
