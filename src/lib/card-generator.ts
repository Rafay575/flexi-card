import path from "path";
import fs from "fs/promises";

/**
 * Extract last digits from employeeId:
 * "HRPSP/BI/0210" -> "0210"
 * "8009654" -> "8009654"
 */
function lastDigits(employeeId: string) {
  const m = String(employeeId || "").match(/(\d+)\s*$/);
  return m?.[1] ?? "";
}

/**
 * Safe base name fallback (Windows-safe)
 */
function safeBaseName(employeeId: string) {
  return String(employeeId || "")
    .trim()
    .replace(/[\/\\]/g, "_")
    .replace(/[:*?"<>|]/g, "_")
    .replace(/\s+/g, "_");
}

/**
 * Create a clean file base for saving images.
 * Prefer digits; fallback to sanitized employeeId.
 */
function getFileBase(employeeId: string) {
  return lastDigits(employeeId) || safeBaseName(employeeId) || `emp_${Date.now()}`;
}

/**
 * This expects your Prisma employee + template records.
 * It generates FRONT + BACK images, saves in public/generated, and returns URLs.
 *
 * NOTE:
 * - This code uses "canvas". If you don't have it: npm i canvas
 */
export async function generateAndSaveCards(
  employee: any,
  frontTemplate: any,
  backTemplate: any
): Promise<{ frontPath: string; backPath: string }> {
  // ✅ ensure node env
  // ✅ ensure output dir exists
  const outDir = path.join(process.cwd(), "public", "generated");
  await fs.mkdir(outDir, { recursive: true });

  const base = getFileBase(employee.employeeId); // ✅ "0210"

  const frontFile = `${base}_front.png`;
  const backFile = `${base}_back.png`;

  const frontAbs = path.join(outDir, frontFile);
  const backAbs = path.join(outDir, backFile);

  // Public URLs (what your UI will use in <img src="...">)
  const frontUrl = `/generated/${frontFile}`;
  const backUrl = `/generated/${backFile}`;

  // ---- Render images using canvas ----
  // If canvas is missing, throw a clean error message
  let createCanvas: any, loadImage: any;
  try {
    const canvasMod = await import("canvas");
    createCanvas = canvasMod.createCanvas;
    loadImage = canvasMod.loadImage;
  } catch (e) {
    throw new Error(
      "Missing dependency: canvas. Run: npm i canvas"
    );
  }

  // Templates should have image paths
  // Example:
  // frontTemplate.path = "/template/1.png" OR "public/template/1.png"
  // backTemplate.path  = "/template/2.png"
  const resolveTemplatePath = (templatePath: string) => {
    if (!templatePath) return "";
    // If stored like "/template/1.png" -> public/template/1.png
    if (templatePath.startsWith("/")) {
      return path.join(process.cwd(), "public", templatePath);
    }
    // If stored like "template/1.png"
    if (!templatePath.includes(":") && !templatePath.startsWith(process.cwd())) {
      return path.join(process.cwd(), "public", templatePath);
    }
    return templatePath;
  };

  const frontTemplateAbs = resolveTemplatePath(frontTemplate?.path || "/template/1.png");
  const backTemplateAbs = resolveTemplatePath(backTemplate?.path || "/template/2.png");

  // Load template images
  const frontTplImg = await loadImage(frontTemplateAbs);
  const backTplImg = await loadImage(backTemplateAbs);

  // Create canvas based on template size
  const frontCanvas = createCanvas(frontTplImg.width, frontTplImg.height);
  const frontCtx = frontCanvas.getContext("2d");

  const backCanvas = createCanvas(backTplImg.width, backTplImg.height);
  const backCtx = backCanvas.getContext("2d");

  // Draw templates
  frontCtx.drawImage(frontTplImg, 0, 0, frontTplImg.width, frontTplImg.height);
  backCtx.drawImage(backTplImg, 0, 0, backTplImg.width, backTplImg.height);

  // -----------------------------
  // ✅ TEXT OVERLAYS (EDIT POSITIONS)
  // -----------------------------
  // You said templates are ready, so we only place text on top.
  // Adjust these x/y values to match your template design.

  // FRONT
  frontCtx.fillStyle = "#0B4B57";
  frontCtx.font = "bold 52px Arial";
  frontCtx.textAlign = "center";
  frontCtx.fillText(`${employee.firstName || ""} ${employee.lastName || ""}`.trim(), frontTplImg.width / 2, 520);

  frontCtx.font = "bold 22px Arial";
  frontCtx.fillStyle = "#0B4B57";
  frontCtx.fillText((employee.designation || "").toUpperCase(), frontTplImg.width / 2, 600);

  frontCtx.font = "20px Arial";
  frontCtx.fillStyle = "#ffffff";
  frontCtx.fillText(String(employee.employeeId || "—"), frontTplImg.width / 2, frontTplImg.height - 80);

  // PHOTO (front) – optional
  // If you store employee.photoPath like "/uploads/employees/0210.jpg"
  // we can draw it on template.
  if (employee.photoPath) {
    try {
      const photoAbs = resolveTemplatePath(employee.photoPath); // works for /uploads/... too
      const photoImg = await loadImage(photoAbs);

      // Example photo box position (adjust to your template)
      const photoX = (frontTplImg.width / 2) - 110;
      const photoY = 220;
      const photoW = 220;
      const photoH = 290; // 3/4-ish

      frontCtx.drawImage(photoImg, photoX, photoY, photoW, photoH);
    } catch {
      // ignore photo error
    }
  }

  // BACK
  backCtx.fillStyle = "#ffffff";
  backCtx.textAlign = "left";

  backCtx.font = "22px Arial";
  backCtx.fillText(`Employee ID: ${employee.employeeId || "—"}`, 80, 260);
  backCtx.fillText(`Department: ${employee.department || "—"}`, 80, 310);
  backCtx.fillText(`City: ${employee.city || "—"}`, 80, 360);

  backCtx.fillText(`CNIC: ${employee.cnic || "—"}`, 80, 430);
  backCtx.fillText(`Blood: ${employee.bloodGroup || "—"}`, 80, 480);
  backCtx.fillText(`Mobile: ${employee.mobileNumber || employee.contactNumber || "—"}`, 80, 530);
  backCtx.fillText(`Emergency: ${employee.emergencyContact || "—"}`, 80, 580);

  // Convert to buffers
  const frontBuffer = frontCanvas.toBuffer("image/png");
  const backBuffer = backCanvas.toBuffer("image/png");

  // Save files ✅ (folder exists)
  await fs.writeFile(frontAbs, frontBuffer);
  await fs.writeFile(backAbs, backBuffer);

  return {
    frontPath: frontUrl,
    backPath: backUrl,
  };
}
