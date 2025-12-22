import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const employees = await prisma.employee.findMany({
      where: { isActive: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, data: employees });
  } catch (error) {
    console.error("Error fetching employees:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch employees" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Check if employee ID already exists
    const existing = await prisma.employee.findUnique({
      where: { employeeId: body.employeeId },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, error: "Employee ID already exists" },
        { status: 400 }
      );
    }

    const employee = await prisma.employee.create({
      data: {
        employeeId: body.employeeId,
        firstName: body.firstName,
        lastName: body.lastName,
        designation: body.designation,
        department: body.department,
        city: body.city,
        contactNumber: body.contactNumber,
        mobileNumber: body.mobileNumber,
        cnic: body.cnic,
        bloodGroup: body.bloodGroup,
        emergencyContact: body.emergencyContact,
        dateOfBirth: new Date(body.dateOfBirth),
        dateOfJoining: new Date(body.dateOfJoining),
        photoPath: body.photoPath || null,
      },
    });

    return NextResponse.json({ success: true, data: employee });
  } catch (error) {
    console.error("Error creating employee:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create employee" },
      { status: 500 }
    );
  }
}
