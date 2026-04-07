import { useState } from "react";
import { useStudents } from "../context/StudentContext";
import StudentDetailModal from "../components/StudentDetailModal";
import type { Student } from "../data/mockData";
import { Search, Users, GraduationCap } from "lucide-react";

export default function StudentsPage() {
  const { searchStudents, students } = useStudents();
  const [query, setQuery] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  const filtered = searchStudents(query);

  // Get unique classes for stats
  const uniqueClasses = [...new Set(students.map((s) => s.class))];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Student Directory</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage and view all registered students</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-navy-50 border border-navy-200">
            <Users className="w-4 h-4 text-navy-600" />
            <span className="text-sm font-semibold text-navy-700">{students.length}</span>
            <span className="text-xs text-navy-500">students</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200">
            <GraduationCap className="w-4 h-4 text-emerald-600" />
            <span className="text-sm font-semibold text-emerald-700">{uniqueClasses.length}</span>
            <span className="text-xs text-emerald-500">classes</span>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          id="student-search"
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name, class, or student ID..."
          className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 bg-white text-sm outline-none focus:border-navy-500 focus:ring-2 focus:ring-navy-100 transition-all shadow-sm"
        />
        {query && (
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-gray-400">
            {filtered.length} result{filtered.length !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Student</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden sm:table-cell">ID</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Class</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Roll No</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">Parent Email</th>
                <th className="text-right px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Attendance</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((student, i) => {
                const attendanceNum = parseInt(student.attendance);
                const attendanceColor =
                  attendanceNum >= 90 ? "text-emerald-600 bg-emerald-50" :
                  attendanceNum >= 80 ? "text-amber-600 bg-amber-50" :
                  "text-red-600 bg-red-50";

                return (
                  <tr
                    key={student.id}
                    id={`student-row-${student.id}`}
                    onClick={() => setSelectedStudent(student)}
                    className={`border-b border-gray-50 cursor-pointer transition-colors hover:bg-navy-50/50 ${
                      i % 2 === 0 ? "bg-white" : "bg-gray-50/30"
                    }`}
                  >
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-navy-100 flex items-center justify-center text-navy-700 text-xs font-bold flex-shrink-0">
                          {student.name.split(" ").map((n) => n[0]).join("")}
                        </div>
                        <span className="font-medium text-gray-800">{student.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-gray-500 font-mono text-xs hidden sm:table-cell">{student.id}</td>
                    <td className="px-5 py-3.5">
                      <span className="px-2 py-0.5 rounded-md bg-gray-100 text-gray-700 text-xs font-medium">{student.class}</span>
                    </td>
                    <td className="px-5 py-3.5 text-gray-500 hidden md:table-cell">{student.rollNo}</td>
                    <td className="px-5 py-3.5 text-gray-500 text-xs hidden lg:table-cell">{student.parentEmail}</td>
                    <td className="px-5 py-3.5 text-right">
                      <span className={`px-2 py-0.5 rounded-md text-xs font-bold ${attendanceColor}`}>
                        {student.attendance}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && (
          <div className="px-5 py-12 text-center text-gray-400">
            <Search className="w-8 h-8 mx-auto mb-3 opacity-40" />
            <p className="text-sm font-medium">No students found</p>
            <p className="text-xs mt-1">Try a different search term</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {selectedStudent && (
        <StudentDetailModal student={selectedStudent} onClose={() => setSelectedStudent(null)} />
      )}
    </div>
  );
}
