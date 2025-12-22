import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import Papa from "papaparse";

function clean(v: any) {
  return String(v ?? "").trim();
}

function splitName(fullName: string) {
  const name = clean(fullName).replace(/\s+/g, " ");
  if (!name) return { firstName: "—", lastName: "" };
  const parts = name.split(" ");
  if (parts.length === 1) return { firstName: parts[0], lastName: "" };
  return { firstName: parts[0], lastName: parts.slice(1).join(" ") };
}

function parseDateSmart(input?: string) {
  const raw = clean(input);
  if (!raw) return null;

  // Works for "Monday, 1 December 2025" and many others
  const d1 = new Date(raw);
  if (!Number.isNaN(d1.getTime())) return d1;

  // 10-Jul-2025
  const m1 = raw.match(/^(\d{1,2})-([A-Za-z]{3})-(\d{4})$/);
  if (m1) {
    const dd = parseInt(m1[1], 10);
    const mon = m1[2].toLowerCase();
    const yyyy = parseInt(m1[3], 10);
    const months: Record<string, number> = {
      jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
      jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11,
    };
    if (months[mon] !== undefined) return new Date(yyyy, months[mon], dd);
  }

  // dd/mm/yyyy or dd-mm-yyyy
  const m2 = raw.match(/^(\d{1,2})[\/-](\d{1,2})[\/-](\d{4})$/);
  if (m2) {
    const dd = parseInt(m2[1], 10);
    const mm = parseInt(m2[2], 10) - 1;
    const yyyy = parseInt(m2[3], 10);
    const d2 = new Date(yyyy, mm, dd);
    if (!Number.isNaN(d2.getTime())) return d2;
  }

  return null;
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ success: false, error: "No file provided" }, { status: 400 });
    }

    const text = await file.text();

    // ✅ Parse as rows (arrays), not objects
    const parsed = Papa.parse<string[]>(text, {
      header: false,
      skipEmptyLines: true,
    });

    if (parsed.errors.length > 0) {
      return NextResponse.json(
        { success: false, error: "Invalid CSV format", details: parsed.errors },
        { status: 400 }
      );
    }

    const rows = parsed.data;

    // ✅ Skip header rows (usually 1 row, but your file may have 2)
    // We’ll skip the first row if it contains "Employee Card Data" or similar.
    const startIndex =
      clean(rows[0]?.[0]).toLowerCase().includes("employee") ? 1 : 0;

    const results = { success: 0, failed: 0, errors: [] as string[] };

    for (let i = startIndex; i < rows.length; i++) {
      const r = rows[i];
      const rowNo = i + 1;

      try {
        // Map by column index
        const employeeIdRaw = clean(r[1]);
        const nameRaw = clean(r[2]);
        const designationRaw = clean(r[3]);
        const departmentRaw = clean(r[4]);
        const dojRaw = clean(r[5]);
        const cityRaw = clean(r[6]);
        const dobRaw = clean(r[7]);
        const contactRaw = clean(r[8]);
        const cnicRaw = clean(r[9]);
        const bloodRaw = clean(r[10]);
        const emergencyRaw = clean(r[11]);

        // required
        if (!nameRaw || !designationRaw) {
          results.failed++;
          results.errors.push(`Row ${rowNo}: Missing name/designation`);
          continue;
        }

        const employeeId = employeeIdRaw || String(Date.now() + i).slice(-7);

        const existing = await prisma.employee.findUnique({ where: { employeeId } });
        if (existing) {
          results.failed++;
          results.errors.push(`Row ${rowNo}: Employee ID ${employeeId} already exists`);
          continue;
        }

        const { firstName, lastName } = splitName(nameRaw);

        const dob = parseDateSmart(dobRaw) ?? new Date("1990-01-01");
        const doj = parseDateSmart(dojRaw) ?? new Date();

        await prisma.employee.create({
          data: {
            employeeId,
            firstName,
            lastName,
            designation: designationRaw || "—",
            department: departmentRaw || "General",
            city: cityRaw || "—",
            contactNumber: contactRaw || "—",
            mobileNumber: contactRaw || "—", // same for now
            cnic: cnicRaw || "—",
            bloodGroup: bloodRaw && bloodRaw !== "#N/A" ? bloodRaw : "—",
            emergencyContact: emergencyRaw || "—",
            dateOfBirth: dob,
            dateOfJoining: doj,
          },
        });

        results.success++;
      } catch (e) {
        results.failed++;
        results.errors.push(`Row ${rowNo}: Failed to import`);
      }
    }

    return NextResponse.json({ success: true, data: results });
  } catch (error) {
    console.error("Error importing employees:", error);
    return NextResponse.json({ success: false, error: "Failed to import employees" }, { status: 500 });
  }
}
