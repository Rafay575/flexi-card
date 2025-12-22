import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { chromium } from "playwright";

import {
  absGeneratedPath,
  ensureGeneratedDir,
  fileBaseFromEmployeeId,
  getBaseUrl,
  publicGeneratedUrl,
} from "@/lib/card-screenshot";

export const runtime = "nodejs";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  let browser: any = null;

  try {
    const employee = await prisma.employee.findUnique({
      where: { id: params.id },
    });

    if (!employee) {
      return NextResponse.json(
        { success: false, error: "Employee not found" },
        { status: 404 }
      );
    }

    await ensureGeneratedDir();

    const base = fileBaseFromEmployeeId(employee.employeeId);
    const frontFile = `${base}_front.png`;
    const backFile = `${base}_back.png`;

    const frontAbs = absGeneratedPath(frontFile);
    const backAbs = absGeneratedPath(backFile);

    const baseUrl = getBaseUrl(request);

    // ✅ Your correct render route is: /render/card/[id]
    const frontUrl = `${baseUrl}/render/card/${employee.id}?side=front`;
    const backUrl = `${baseUrl}/render/card/${employee.id}?side=back`;

    browser = await chromium.launch({ headless: true });
    const page = await browser.newPage({
      viewport: { width: 520, height: 900 },
      deviceScaleFactor: 2,
    });

    // -------------------------
    // FRONT (element screenshot)
    // -------------------------
    await page.goto(frontUrl, { waitUntil: "networkidle" });
    await page.waitForSelector("#card-root", { state: "visible" });

    await page.waitForFunction(() => {
      const imgs = Array.from(document.querySelectorAll("#card-root img"));
      return imgs.every((img) => (img as HTMLImageElement).complete);
    });

    const frontEl = await page.$("#card-root");
    if (!frontEl) throw new Error("Card element not found (front)");

    await frontEl.screenshot({ path: frontAbs });

    // -------------------------
    // BACK (element screenshot)
    // -------------------------
    await page.goto(backUrl, { waitUntil: "networkidle" });
    await page.waitForSelector("#card-root", { state: "visible" });

    await page.waitForFunction(() => {
      const imgs = Array.from(document.querySelectorAll("#card-root img"));
      return imgs.every((img) => (img as HTMLImageElement).complete);
    });

    const backEl = await page.$("#card-root");
    if (!backEl) throw new Error("Card element not found (back)");

    await backEl.screenshot({ path: backAbs });

    await browser.close();
    browser = null;

    // Public URLs stored in DB
    const frontPath = publicGeneratedUrl(frontFile);
    const backPath = publicGeneratedUrl(backFile);

    const updatedEmployee = await prisma.employee.update({
      where: { id: employee.id },
      data: {
        cardGenerated: true,
        cardFrontPath: frontPath,
        cardBackPath: backPath,
      },
    });

    return NextResponse.json({
      success: true,
      data: { employee: updatedEmployee },
    });
  } catch (error: any) {
    console.error("Error generating card:", error);

    if (browser) {
      try {
        await browser.close();
      } catch {}
    }

    return NextResponse.json(
      { success: false, error: error?.message || "Failed to generate card" },
      { status: 500 }
    );
  }
}
