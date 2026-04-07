import { X, BookOpen, Clock, UserCheck, Hash } from "lucide-react";
import type { Student } from "../data/mockData";

interface StudentDetailModalProps {
  student: Student;
  onClose: () => void;
}

export default function StudentDetailModal({ student, onClose }: StudentDetailModalProps) {
  const attendanceNum = parseInt(student.attendance);
  const attendanceColor =
    attendanceNum >= 90 ? "text-emerald-600 bg-emerald-50 border-emerald-200" :
    attendanceNum >= 80 ? "text-amber-600 bg-amber-50 border-amber-200" :
    "text-red-600 bg-red-50 border-red-200";

  const initials = student.name.split(" ").map((n) => n[0]).join("");

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm overlay-enter" />
      <div
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden modal-enter"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with colored bar */}
        <div className="bg-gradient-to-r from-navy-800 to-navy-600 px-6 py-5 text-white">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center text-2xl font-bold">
              {initials}
            </div>
            <div>
              <h2 className="text-xl font-bold">{student.name}</h2>
              <p className="text-white/70 text-sm mt-0.5">Student ID: {student.id}</p>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <InfoCard icon={BookOpen} label="Class" value={student.class} />
            <InfoCard icon={Hash} label="Roll No" value={student.rollNo} />
            <InfoCard icon={UserCheck} label="Parent" value={student.parentEmail.split("@")[0]} />
            <div className="flex flex-col gap-1 rounded-xl border border-gray-100 bg-gray-50/50 p-3">
              <div className="flex items-center gap-1.5 text-gray-400">
                <Clock className="w-3.5 h-3.5" />
                <span className="text-[11px] font-medium uppercase tracking-wider">Attendance</span>
              </div>
              <span className={`text-lg font-bold px-2 py-0.5 rounded-lg border w-fit ${attendanceColor}`}>
                {student.attendance}
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-navy-800 text-white text-sm font-semibold hover:bg-navy-700 transition-colors shadow-md"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

function InfoCard({ icon: Icon, label, value }: { icon: typeof BookOpen; label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 rounded-xl border border-gray-100 bg-gray-50/50 p-3">
      <div className="flex items-center gap-1.5 text-gray-400">
        <Icon className="w-3.5 h-3.5" />
        <span className="text-[11px] font-medium uppercase tracking-wider">{label}</span>
      </div>
      <span className="text-sm font-semibold text-gray-800 truncate">{value}</span>
    </div>
  );
}
