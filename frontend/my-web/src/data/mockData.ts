export interface User {
  email: string;
  password: string;
  role: "admin" | "staff" | "parent";
  name: string;
  studentId?: string;
}

export interface Student {
  id: string;
  name: string;
  class: string;
  rollNo: string;
  parentEmail: string;
  photo: string;
  attendance: string;
}

export const MOCK_USERS: User[] = [
  { email: "admin@school.com", password: "admin123", role: "admin", name: "Admin User" },
  { email: "staff@school.com", password: "staff123", role: "staff", name: "Staff User" },
  { email: "parent@school.com", password: "parent123", role: "parent", name: "Parent User", studentId: "STU001" },
];

export const MOCK_STUDENTS: Student[] = [
  { id: "STU001", name: "Ravi Kumar", class: "10-A", rollNo: "01", parentEmail: "parent@school.com", photo: "", attendance: "92%" },
  { id: "STU002", name: "Priya Singh", class: "9-B", rollNo: "14", parentEmail: "other@school.com", photo: "", attendance: "87%" },
  { id: "STU003", name: "Ankit Sharma", class: "10-A", rollNo: "05", parentEmail: "ankit.parent@school.com", photo: "", attendance: "95%" },
  { id: "STU004", name: "Meera Patel", class: "8-C", rollNo: "22", parentEmail: "meera.parent@school.com", photo: "", attendance: "78%" },
  { id: "STU005", name: "Arjun Verma", class: "9-B", rollNo: "08", parentEmail: "arjun.parent@school.com", photo: "", attendance: "91%" },
  { id: "STU006", name: "Sneha Reddy", class: "10-A", rollNo: "11", parentEmail: "sneha.parent@school.com", photo: "", attendance: "89%" },
  { id: "STU007", name: "Karan Nair", class: "8-C", rollNo: "03", parentEmail: "karan.parent@school.com", photo: "", attendance: "94%" },
  { id: "STU008", name: "Divya Iyer", class: "9-B", rollNo: "19", parentEmail: "divya.parent@school.com", photo: "", attendance: "82%" },
];
