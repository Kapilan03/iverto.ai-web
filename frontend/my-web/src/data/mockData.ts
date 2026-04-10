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

export interface CameraZone {
  id: string;
  x: string;
  y: string;
  w: string;
  h: string;
  label: string;
}

export interface Camera {
  id: string;
  name: string;
  location: string;
  status: "online" | "offline" | "maintenance";
  fps: number;
  zones: CameraZone[];
  /** Which roles can view this camera */
  allowedRoles: ("admin" | "staff" | "parent")[];
  /** For parent-only cameras, which studentId is relevant */
  linkedStudentId?: string;
  /** Live WebRTC stream URL (e.g., http://localhost:8889/cam1) */
  streamUrl?: string;
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

export const MOCK_CAMERAS: Camera[] = [
  {
    id: "CAM-01",
    name: "Main Corridor",
    location: "Building A — Ground Floor",
    status: "online",
    fps: 30,
    streamUrl: "/cam1",
    allowedRoles: ["admin", "staff", "parent"],
    zones: [
      { id: "STU001", x: "12%", y: "35%", w: "18%", h: "50%", label: "Zone A" },
      { id: "STU002", x: "35%", y: "30%", w: "16%", h: "55%", label: "Zone B" },
      { id: "STU003", x: "58%", y: "38%", w: "17%", h: "48%", label: "Zone C" },
      { id: "unknown", x: "78%", y: "40%", w: "15%", h: "45%", label: "Unknown" },
    ],
  },
  {
    id: "CAM-02",
    name: "Playground",
    location: "Outdoor — East Wing",
    status: "online",
    fps: 25,
    allowedRoles: ["admin", "staff"],
    zones: [
      { id: "STU004", x: "8%", y: "32%", w: "17%", h: "52%", label: "Zone A" },
      { id: "STU005", x: "30%", y: "36%", w: "16%", h: "48%", label: "Zone B" },
      { id: "STU006", x: "52%", y: "30%", w: "18%", h: "54%", label: "Zone C" },
      { id: "STU007", x: "74%", y: "34%", w: "17%", h: "50%", label: "Zone D" },
    ],
  },
  {
    id: "CAM-03",
    name: "Library",
    location: "Building B — First Floor",
    status: "online",
    fps: 30,
    allowedRoles: ["admin", "staff"],
    zones: [
      { id: "STU008", x: "15%", y: "38%", w: "20%", h: "48%", label: "Zone A" },
      { id: "STU001", x: "42%", y: "32%", w: "18%", h: "52%", label: "Zone B" },
      { id: "unknown", x: "68%", y: "36%", w: "16%", h: "50%", label: "Unknown" },
    ],
  },
  {
    id: "CAM-04",
    name: "Cafeteria",
    location: "Building A — Ground Floor",
    status: "online",
    fps: 30,
    allowedRoles: ["admin", "staff", "parent"],
    zones: [
      { id: "STU002", x: "10%", y: "34%", w: "16%", h: "50%", label: "Zone A" },
      { id: "STU003", x: "32%", y: "30%", w: "18%", h: "54%", label: "Zone B" },
      { id: "STU005", x: "55%", y: "38%", w: "15%", h: "46%", label: "Zone C" },
      { id: "STU004", x: "76%", y: "32%", w: "17%", h: "52%", label: "Zone D" },
    ],
  },
  {
    id: "CAM-05",
    name: "Main Gate",
    location: "Entrance — Security Post",
    status: "online",
    fps: 30,
    allowedRoles: ["admin"],
    zones: [
      { id: "unknown", x: "20%", y: "30%", w: "18%", h: "55%", label: "Unknown 1" },
      { id: "unknown", x: "50%", y: "35%", w: "16%", h: "50%", label: "Unknown 2" },
    ],
  },
  {
    id: "CAM-06",
    name: "Science Lab",
    location: "Building C — Second Floor",
    status: "maintenance",
    fps: 0,
    allowedRoles: ["admin", "staff"],
    zones: [],
  },
];

/** Role-based permissions config */
export const ROLE_PERMISSIONS = {
  admin: {
    label: "Administrator",
    canViewAllCameras: true,
    canViewAllStudents: true,
    canRegisterStudents: true,
    canViewUnknown: true,
    canAccessSettings: true,
    canExportData: true,
    description: "Full system access with administrative controls",
  },
  staff: {
    label: "Staff Member",
    canViewAllCameras: false, // only cameras with staff in allowedRoles
    canViewAllStudents: true,
    canRegisterStudents: false,
    canViewUnknown: true,
    canAccessSettings: false,
    canExportData: false,
    description: "Monitor cameras and manage student records",
  },
  parent: {
    label: "Parent / Guardian",
    canViewAllCameras: false, // only cameras with parent in allowedRoles
    canViewAllStudents: false,
    canRegisterStudents: false,
    canViewUnknown: false,
    canAccessSettings: false,
    canExportData: false,
    description: "View your child's activity and attendance",
  },
} as const;
