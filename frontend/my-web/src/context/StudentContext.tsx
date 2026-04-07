import { createContext, useContext, useState, type ReactNode } from "react";
import { MOCK_STUDENTS, type Student } from "../data/mockData";

interface StudentContextType {
  students: Student[];
  addStudent: (student: Omit<Student, "id" | "photo" | "attendance">) => void;
  getStudentById: (id: string) => Student | undefined;
  searchStudents: (query: string) => Student[];
}

const StudentContext = createContext<StudentContextType | null>(null);

export function StudentProvider({ children }: { children: ReactNode }) {
  const [students, setStudents] = useState<Student[]>(MOCK_STUDENTS);

  const addStudent = (data: Omit<Student, "id" | "photo" | "attendance">) => {
    const newStudent: Student = {
      ...data,
      id: `STU${String(students.length + 1).padStart(3, "0")}`,
      photo: "",
      attendance: "0%",
    };
    setStudents((prev) => [...prev, newStudent]);
  };

  const getStudentById = (id: string) => students.find((s) => s.id === id);

  const searchStudents = (query: string) => {
    if (!query.trim()) return students;
    const q = query.toLowerCase();
    return students.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.class.toLowerCase().includes(q) ||
        s.id.toLowerCase().includes(q)
    );
  };

  return (
    <StudentContext.Provider value={{ students, addStudent, getStudentById, searchStudents }}>
      {children}
    </StudentContext.Provider>
  );
}

export function useStudents() {
  const ctx = useContext(StudentContext);
  if (!ctx) throw new Error("useStudents must be used within StudentProvider");
  return ctx;
}
