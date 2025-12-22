import React from "react";

type Props = {
  templateSrc?: string; // "/images/templates/1.png"
  employee: {
    firstName?: string;
    lastName?: string;
    designation?: string;
    employeeId?: string | number;
    department?: string;
    phone?: string;
    photoUrl?: string;
  };
};

export function EmployeeCardFrontTemplateOnly({
  templateSrc = "/images/templates/1.png",
  employee,
}: Props) {
  const fullName =
    `${employee.firstName ?? ""} ${employee.lastName ?? ""}`.trim() || "—";

  return (
    <div className="relative w-[450px] h-[750px] overflow-hidden rounded-[22px] shadow-xl bg-white">
      {/* TEMPLATE (complete design) */}
      <img
        src={templateSrc}
        alt="Card template"
        className="absolute inset-0 h-full w-full object-cover"
        draggable={false}
      />

<div
  className="absolute "
  style={{
    left: "50%",
    top: "180px",
    transform: "translateX(-50%)",
    width: "217px",
    height: "224px", // ✅ 3:4 ratio
    borderRadius: "30px",
    overflow: "hidden",

  }}
  
>
  <img
    src={employee.photoUrl || "/placeholder-user.jpg"}
    alt="Employee"
    className="h-full w-full object-cover"
    draggable={false}
  />
</div>


      {/* NAME (centered) */}
      <div
        className="absolute left-0 right-0 text-center"
        style={{
          top: "440px",
          paddingLeft: "24px",
          paddingRight: "24px",
        }}
      >
        <h2 className="text-[#0B4B57] font-semibold leading-[1.05] text-[44px]">
          {employee.firstName || "Muhammad"}
          <br />
          {employee.lastName || "Talha"}
        </h2>
      </div>

      {/* DESIGNATION (text only, template already has yellow pill) */}
      <div
        className="absolute left-0 right-0 text-center"
        style={{
          top: "610px",
          letterSpacing: "0.25em",
        }}
      >
        <span className="text-[#0B4B57] mt-10 font-extrabold text-[14px]">
          {(employee.designation || "GRAPHIC DESIGNER").toUpperCase()}
        </span>
      </div>

      {/* BOTTOM DETAILS (template already has dark bar) */}
      <div
        className="absolute left-0 right-0 text-center text-white"
        style={{
          bottom: "30px",
          paddingLeft: "24px",
          paddingRight: "24px",
        }}
      >
        <div className="w-fit mx-auto text-left space-y-1">
          <p className="text-[12px] font-semibold">
            EMPLOYEE ID:{" "}
            <span className="font-normal">{employee.employeeId ?? "—"}</span>
          </p>
          <p className="text-[12px] font-semibold">
            DEPARTMENT:{" "}
            <span className="font-normal">{employee.department ?? "—"}</span>
          </p>
          <p className="text-[12px] font-semibold">
            CONTACT:{" "}
            <span className="font-normal">{employee.phone ?? "—"}</span>
          </p>
        </div>
      </div>
    </div>
  );
}
