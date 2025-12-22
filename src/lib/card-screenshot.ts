import path from "path";
import fs from "fs/promises";

export function getBaseUrl(req?: Request) {
  // Best: set NEXT_PUBLIC_APP_URL in .env (recommended)
  // Example:
  // NEXT_PUBLIC_APP_URL=http://localhost:3000
  const envUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (envUrl) return envUrl.replace(/\/$/, "");

  // Fallback: derive from request headers if possible
  if (req) {
    const host = req.headers.get("host");
    const proto = req.headers.get("x-forwarded-proto") || "http";
    if (host) return `${proto}://${host}`;
  }

  return "http://localhost:3000";
}

// "HRPSP/BI/0210" -> "0210"
export function fileBaseFromEmployeeId(employeeId: string) {
  const s = String(employeeId || "").trim();
  const m = s.match(/(\d+)\s*$/);
 return (m?.[1] ?? s.replace(/[\/\\:*?"<>|\s]+/g, "_")) || `emp_${Date.now()}`;

}

export async function ensureGeneratedDir() {
  const outDir = path.join(process.cwd(), "public", "generated");
  await fs.mkdir(outDir, { recursive: true });
  return outDir;
}

export function absGeneratedPath(fileName: string) {
  return path.join(process.cwd(), "public", "generated", fileName);
}

export function publicGeneratedUrl(fileName: string) {
  return `/generated/${fileName}`;
}
