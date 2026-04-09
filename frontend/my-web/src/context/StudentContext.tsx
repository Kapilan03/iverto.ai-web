import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { type Student } from "../data/mockData";
import { supabase } from "../lib/supabase";

interface StudentContextType {
  students: Student[];
  addStudent: (student: Omit<Student, "id" | "photo" | "attendance">) => Promise<void>;
  getStudentById: (id: string) => Student | undefined;
  searchStudents: (query: string) => Student[];
  isLoading: boolean;
}

const StudentContext = createContext<StudentContextType | null>(null);

export function StudentProvider({ children }: { children: ReactNode }) {
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Only fetch once relative to Auth State ideally, but on mount is fine for now
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        fetchStudents();
      } else {
        setIsLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        fetchStudents();
      } else {
        setStudents([]);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchStudents = async () => {
    setIsLoading(true);
    const { data, error } = await supabase.from('students').select('*');
    if (!error && data) {
      const mapped = data.map(d => ({
        ...d,
        parentEmail: d.parent_email,
        rollNo: d.roll_no,
      }));
      setStudents(mapped as Student[]);
    } else {
      console.error(error);
    }
    setIsLoading(false);
  };

  const addStudent = async (data: Omit<Student, "id" | "photo" | "attendance">) => {
    const newId = `STU${String(students.length + 1).padStart(3, "0")}`;
    const { error } = await supabase.from('students').insert({
      id: newId,
      name: data.name,
      class: data.class,
      roll_no: data.rollNo,
      parent_email: data.parentEmail,
      photo: "",
      attendance: "0%"
    });

    if (!error) {
      await fetchStudents(); // Refresh the list
    } else {
      console.error("Failed to add student", error);
    }
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
    <StudentContext.Provider value={{ students, addStudent, getStudentById, searchStudents, isLoading }}>
      {children}
    </StudentContext.Provider>
  );
}

export function useStudents() {
  const ctx = useContext(StudentContext);
  if (!ctx) throw new Error("useStudents must be used within StudentProvider");
  return ctx;
}
