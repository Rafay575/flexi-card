import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string): string {
  const d = new Date(date);
  const day = d.getDate();
  const month = d.toLocaleString("en-US", { month: "short" });
  const year = d.getFullYear();
  return `${day}-${month}-${year}`;
}

export function formatEmployeeId(id: number | string): string {
  return String(id).padStart(4, "0");
}

export function generateEmployeeId(): string {
  return String(Math.floor(Math.random() * 9000000) + 1000000);
}

export function parseCSVDate(dateStr: string): Date {
  // Handle various date formats
  const formats = [
    /^(\d{1,2})-(\w{3})-(\d{4})$/, // 10-Jul-2025
    /^(\d{4})-(\d{2})-(\d{2})$/, // 2025-07-10
    /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/, // 10/07/2025 or 7/10/2025
  ];

  for (const format of formats) {
    const match = dateStr.match(format);
    if (match) {
      return new Date(dateStr);
    }
  }
  return new Date(dateStr);
}

export function sanitizeFilename(filename: string): string {
  return filename.replace(/[^a-z0-9.-]/gi, "_").toLowerCase();
}
