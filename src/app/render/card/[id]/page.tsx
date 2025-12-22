// app/render/card/[id]/page.tsx
import { prisma } from "@/lib/prisma";
import { EmployeeCardFrontTemplateOnly } from "@/components/EmployeeCardFront";
import { EmployeeCardBackTemplateOnly } from "@/components/EmployeeCardBackTemplateOnly";

export const dynamic = "force-dynamic";

function formatDate(d: any) {
  if (!d) return "—";
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return "—";
  return dt.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default async function RenderCardPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { side?: "front" | "back" };
}) {
  const employee = await prisma.employee.findUnique({
    where: { id: params.id },
  });

  if (!employee) return <div>Employee not found</div>;

  const side = searchParams.side === "back" ? "back" : "front";

  return (
    <div style={{ margin: 0, padding: 0, background: "transparent" }}>
      {/* ✅ Playwright will screenshot THIS element only */}
      <div id="card-root" style={{ width: 450, height: 750 }}>
        {side === "front" ? (
          <EmployeeCardFrontTemplateOnly
            templateSrc="/template/1.png"
            employee={{
              firstName: employee.firstName,
              lastName: employee.lastName,
              designation: employee.designation,
              employeeId: employee.employeeId,
              department: employee.department,
              phone: employee.contactNumber,
              photoUrl: employee.photoPath || "/placeholder-user.jpg",
            }}
          />
        ) : (
          <EmployeeCardBackTemplateOnly
            templateSrc="/template/2.png"
            employee={{
              employeeId: employee.employeeId,
              department: employee.department,
              city: employee.city || "—",
              dateOfJoining: formatDate(employee.dateOfJoining),
              dateOfBirth: formatDate(employee.dateOfBirth),
              mobile: employee.mobileNumber || employee.contactNumber || "—",
              cnic: employee.cnic || "—",
              bloodGroup: employee.bloodGroup || "—",
              emergencyContact: employee.emergencyContact || "—",
            }}
          />
        )}
      </div>
    </div>
  );
}
