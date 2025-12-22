import React from "react";

type Props = {
  templateSrc?: string; // e.g. "/template/2.png"
  employee: {
    employeeId?: string | number;
    department?: string;
    city?: string;
    dateOfJoining?: string; // "10-Jul-2025"
    dateOfBirth?: string;   // "8-Apr-1994"
    mobile?: string;
    cnic?: string;
    bloodGroup?: string;
    emergencyContact?: string;
  };
};

export function EmployeeCardBackTemplateOnly({
  templateSrc = "/template/2.png",
  employee,
}: Props) {
  const rows: { label: string; value?: string | number }[] = [
    { label: "Employee ID:", value: employee.employeeId },
    { label: "Department:", value: employee.department },
    { label: "City:", value: employee.city },
    { label: "Date of Joining:", value: employee.dateOfJoining },
    { label: "Date of Birth:", value: employee.dateOfBirth },
    { label: "Mobile:", value: employee.mobile },
    { label: "CNIC:", value: employee.cnic },
    { label: "Blood Group:", value: employee.bloodGroup },
    { label: "Emergency #:", value: employee.emergencyContact },
  ];

  return (
    <div className="relative w-[450px] h-[750px] overflow-hidden rounded-[22px] shadow-xl bg-white">
      {/* TEMPLATE */}
      <img
        src={templateSrc}
        alt="Card back template"
        className="absolute inset-0 h-full w-full object-cover"
        draggable={false}
      />

      {/* OVERLAY DATA */}
      <div
        className="absolute left-[11%] right-0 mx-auto w-[78%]"
        style={{ top: "180px" }} // ✅ adjust a little if needed
      >
        <div className="space-y-2">
          {rows.map((r) => (
            <div
              key={r.label}
              className="grid grid-cols-[140px_1fr] items-center gap-4"
            >
              <div className="text-right font-bold text-[#0B4B57]">
                {r.label}
              </div>
              <div className="text-left font-medium text-[#0B4B57]">
                {r.value ?? "—"}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
