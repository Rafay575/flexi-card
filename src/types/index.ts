import { Employee, Template, User } from "@prisma/client";

export type { Employee, Template, User };

export interface EmployeeFormData {
  employeeId: string;
  firstName: string;
  lastName: string;
  designation: string;
  department: string;
  city: string;
  contactNumber: string;
  mobileNumber: string;
  cnic: string;
  bloodGroup: string;
  emergencyContact: string;
  dateOfBirth: string;
  dateOfJoining: string;
}

export interface CSVEmployee {
  employeeId?: string;
  firstName: string;
  lastName: string;
  designation: string;
  department: string;
  city: string;
  contactNumber: string;
  mobileNumber: string;
  cnic: string;
  bloodGroup: string;
  emergencyContact: string;
  dateOfBirth: string;
  dateOfJoining: string;
}

export interface FieldPosition {
  x: number;
  y: number;
  fontSize?: number;
  color?: string;
  fontWeight?: string;
  letterSpacing?: number;
  width?: number;
  height?: number;
  size?: number;
}

export interface TemplateFieldConfig {
  [key: string]: FieldPosition;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export type BloodGroup = "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-" | "O+" | "O-";

export const BLOOD_GROUPS: BloodGroup[] = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

export const DEPARTMENTS = [
  "Product",
  "Engineering",
  "Design",
  "Marketing",
  "Sales",
  "HR",
  "Finance",
  "Operations",
  "Support",
  "Legal",
];
