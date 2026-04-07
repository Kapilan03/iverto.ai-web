import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useStudents } from "../context/StudentContext";
import StudentDetailModal from "../components/StudentDetailModal";
import AccessDeniedModal from "../components/AccessDeniedModal";
import RegisterStudentModal from "../components/RegisterStudentModal";
import type { Student } from "../data/mockData";
import { Camera, Circle, UserPlus, AlertTriangle, Users } from "lucide-react";

// Predefined clickable zones on the CCTV feed
const CCTV_ZONES = [
  { id: "STU001", x: "12%", y: "35%", w: "18%", h: "50%", label: "Zone A" },
  { id: "STU002", x: "35%", y: "30%", w: "16%", h: "55%", label: "Zone B" },
  { id: "STU003", x: "58%", y: "38%", w: "17%", h: "48%", label: "Zone C" },
  { id: "unknown", x: "78%", y: "40%", w: "15%", h: "45%", label: "Unknown" },
];

export default function DashboardPage() {
  const { user } = useAuth();
  const { students, getStudentById } = useStudents();
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [showAccessDenied, setShowAccessDenied] = useState(false);
  const [showRegister, setShowRegister] = useState(false);

  const handleZoneClick = (zoneId: string) => {
    if (zoneId === "unknown") {
      if (user?.role === "parent") {
        setShowAccessDenied(true);
      } else {
        setShowRegister(true);
      }
      return;
    }

    const student = getStudentById(zoneId);
    if (!student) return;

    // Parent can only see their own child
    if (user?.role === "parent") {
      if (user.studentId === zoneId) {
        setSelectedStudent(student);
      } else {
        setShowAccessDenied(true);
      }
    } else {
      setSelectedStudent(student);
    }
  };

  const now = new Date();
  const timeStr = now.toLocaleTimeString("en-US", { hour12: false });
  const dateStr = now.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Live Monitoring</h1>
          <p className="text-sm text-gray-500 mt-0.5">Real-time CCTV feed with AI recognition</p>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-sm text-gray-500">
          <div className="flex items-center gap-1.5">
            <Circle className="w-2.5 h-2.5 fill-emerald-500 text-emerald-500" />
            <span className="font-medium text-emerald-600">System Online</span>
          </div>
          <span className="text-gray-300">|</span>
          <span>{students.length} Students Tracked</span>
        </div>
      </div>

      {/* CCTV Feed */}
      <div className="bg-gray-900 rounded-2xl overflow-hidden shadow-2xl border-2 border-gray-800 relative">
        {/* Top bar overlay */}
        <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-4 py-2.5 bg-gradient-to-b from-black/70 to-transparent">
          <div className="flex items-center gap-2">
            <Camera className="w-4 h-4 text-white/60" />
            <span className="text-xs font-medium text-white/80 tracking-wide">CAM-01 — Main Corridor</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-white/50 font-mono">{dateStr}</span>
            <span className="text-xs text-white/70 font-mono font-bold">{timeStr}</span>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-red-500 rec-blink" />
              <span className="text-[10px] font-bold text-red-400 uppercase tracking-wider">REC</span>
            </div>
          </div>
        </div>

        {/* The "feed" area */}
        <div className="cctv-scanline relative aspect-video bg-gradient-to-br from-gray-800 via-gray-900 to-gray-800">
          <div className="cctv-noise" />

          {/* Simulated classroom scene */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative w-full h-full">
              {/* Background elements for visual depth */}
              <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-gray-700/30 to-transparent" />
              <div className="absolute top-8 left-1/2 -translate-x-1/2 w-3/4 h-px bg-gray-600/30" />

              {/* Person silhouettes */}
              {CCTV_ZONES.map((zone) => {
                const isUnknown = zone.id === "unknown";
                const student = !isUnknown ? getStudentById(zone.id) : null;
                return (
                  <button
                    key={zone.id}
                    id={`zone-${zone.id}`}
                    onClick={() => handleZoneClick(zone.id)}
                    className="absolute group focus:outline-none"
                    style={{ left: zone.x, top: zone.y, width: zone.w, height: zone.h }}
                  >
                    {/* Silhouette */}
                    <div className="w-full h-full flex flex-col items-center justify-end">
                      <div className={`relative w-3/4 h-full rounded-t-full ${
                        isUnknown ? "bg-red-900/20" : "bg-navy-800/20"
                      }`}>
                        {/* Head */}
                        <div className={`absolute -top-2 left-1/2 -translate-x-1/2 w-6 h-6 sm:w-8 sm:h-8 rounded-full border-2 ${
                          isUnknown
                            ? "border-red-500/60 bg-red-900/30"
                            : "border-emerald-500/60 bg-navy-800/30"
                        }`} />
                      </div>
                    </div>

                    {/* Bounding box & label */}
                    <div className={`absolute inset-0 border-2 rounded-lg transition-all ${
                      isUnknown
                        ? "border-red-500/50 group-hover:border-red-400 group-hover:shadow-[0_0_20px_rgba(239,68,68,0.2)]"
                        : "border-emerald-500/50 group-hover:border-emerald-400 group-hover:shadow-[0_0_20px_rgba(16,185,129,0.2)]"
                    } zone-pulse`}>
                      <div className={`absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap px-2 py-0.5 rounded text-[10px] font-bold tracking-wide ${
                        isUnknown
                          ? "bg-red-500/90 text-white"
                          : "bg-emerald-500/90 text-white"
                      }`}>
                        {isUnknown ? "UNKNOWN" : student?.name?.split(" ")[0]?.toUpperCase() || zone.label}
                      </div>
                      {/* Corner markers */}
                      <div className={`absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 rounded-tl ${isUnknown ? "border-red-400" : "border-emerald-400"}`} />
                      <div className={`absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 rounded-tr ${isUnknown ? "border-red-400" : "border-emerald-400"}`} />
                      <div className={`absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 rounded-bl ${isUnknown ? "border-red-400" : "border-emerald-400"}`} />
                      <div className={`absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 rounded-br ${isUnknown ? "border-red-400" : "border-emerald-400"}`} />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Bottom bar overlay */}
        <div className="absolute bottom-0 left-0 right-0 z-10 flex items-center justify-between px-4 py-2.5 bg-gradient-to-t from-black/70 to-transparent">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-xs text-white/70">
                <span className="font-bold text-emerald-400">{CCTV_ZONES.length - 1}</span> identified
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
              <span className="text-xs text-white/70">
                <span className="font-bold text-red-400">1</span> unknown
              </span>
            </div>
          </div>
          <span className="text-[10px] text-white/40 font-mono">Iverto.ai v2.4 — FPS: 30</span>
        </div>
      </div>

      {/* Quick info cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
        <QuickCard label="Total Students" value={String(students.length)} icon={Users} color="navy" />
        <QuickCard label="Identified" value={String(CCTV_ZONES.length - 1)} icon={Camera} color="emerald" />
        <QuickCard label="Unrecognized" value="1" icon={AlertTriangle} color="red" />
        <QuickCard label="Cameras Active" value="4" icon={Camera} color="blue" />
      </div>

      {/* Register prompt for admin/staff if they want */}
      {(user?.role === "admin" || user?.role === "staff") && (
        <div className="mt-6 p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-200/50 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-amber-800">Unrecognized Person Detected</p>
              <p className="text-xs text-amber-600 mt-0.5">Click the red zone or this button to register</p>
            </div>
          </div>
          <button
            id="register-new-student-btn"
            onClick={() => setShowRegister(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-navy-800 text-white text-sm font-medium hover:bg-navy-700 transition-colors shadow"
          >
            <UserPlus className="w-4 h-4" />
            Register
          </button>
        </div>
      )}

      {/* Modals */}
      {selectedStudent && (
        <StudentDetailModal student={selectedStudent} onClose={() => setSelectedStudent(null)} />
      )}
      {showAccessDenied && (
        <AccessDeniedModal onClose={() => setShowAccessDenied(false)} />
      )}
      {showRegister && (
        <RegisterStudentModal onClose={() => setShowRegister(false)} />
      )}
    </div>
  );
}

function QuickCard({
  label, value, icon: Icon, color,
}: {
  label: string; value: string; icon: typeof Camera; color: string;
}) {
  const colors: Record<string, string> = {
    navy: "bg-navy-50 border-navy-200 text-navy-700",
    emerald: "bg-emerald-50 border-emerald-200 text-emerald-700",
    red: "bg-red-50 border-red-200 text-red-700",
    blue: "bg-blue-50 border-blue-200 text-blue-700",
  };
  const iconColors: Record<string, string> = {
    navy: "text-navy-600",
    emerald: "text-emerald-600",
    red: "text-red-600",
    blue: "text-blue-600",
  };
  return (
    <div className={`rounded-xl border p-4 ${colors[color]}`}>
      <div className="flex items-center justify-between mb-2">
        <Icon className={`w-5 h-5 ${iconColors[color]}`} />
      </div>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs opacity-70 mt-0.5">{label}</p>
    </div>
  );
}
