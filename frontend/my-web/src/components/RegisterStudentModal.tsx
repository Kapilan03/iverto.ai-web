import { useState } from "react";
import { X, UserPlus } from "lucide-react";
import { useStudents } from "../context/StudentContext";
import toast from "react-hot-toast";

interface RegisterStudentModalProps {
  onClose: () => void;
}

export default function RegisterStudentModal({ onClose }: RegisterStudentModalProps) {
  const { addStudent } = useStudents();
  const [form, setForm] = useState({
    name: "",
    class: "",
    rollNo: "",
    parentEmail: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = "Name is required";
    if (!form.class.trim()) errs.class = "Class is required";
    if (!form.rollNo.trim()) errs.rollNo = "Roll No is required";
    if (!form.parentEmail.trim()) errs.parentEmail = "Parent email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.parentEmail))
      errs.parentEmail = "Enter a valid email";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    addStudent({
      name: form.name.trim(),
      class: form.class.trim(),
      rollNo: form.rollNo.trim(),
      parentEmail: form.parentEmail.trim(),
    });

    toast.success(`${form.name} registered successfully!`, {
      style: { background: "#1e3a5f", color: "#fff" },
      iconTheme: { primary: "#10b981", secondary: "#fff" },
    });

    onClose();
  };

  const updateField = (field: string, value: string) => {
    setForm((p) => ({ ...p, [field]: value }));
    if (errors[field]) setErrors((p) => ({ ...p, [field]: "" }));
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm overlay-enter" />
      <div
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden modal-enter"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-navy-800 to-navy-600 px-6 py-5 text-white">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
              <UserPlus className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Register New Student</h2>
              <p className="text-white/60 text-sm">Add unrecognized person to database</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <FormField label="Full Name" id="reg-name" value={form.name} error={errors.name}
            onChange={(v) => updateField("name", v)} placeholder="e.g. Ravi Kumar" />
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Class" id="reg-class" value={form.class} error={errors.class}
              onChange={(v) => updateField("class", v)} placeholder="e.g. 10-A" />
            <FormField label="Roll No" id="reg-roll" value={form.rollNo} error={errors.rollNo}
              onChange={(v) => updateField("rollNo", v)} placeholder="e.g. 01" />
          </div>
          <FormField label="Parent Email" id="reg-email" type="email" value={form.parentEmail}
            error={errors.parentEmail} onChange={(v) => updateField("parentEmail", v)}
            placeholder="e.g. parent@school.com" />

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
              Cancel
            </button>
            <button type="submit"
              className="flex-1 py-2.5 rounded-xl bg-navy-800 text-white text-sm font-semibold hover:bg-navy-700 transition-colors shadow-md">
              Register Student
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function FormField({
  label, id, value, error, onChange, placeholder, type = "text",
}: {
  label: string; id: string; value: string; error?: string;
  onChange: (val: string) => void; placeholder: string; type?: string;
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full px-3.5 py-2.5 rounded-xl border text-sm transition-all outline-none ${
          error
            ? "border-red-300 bg-red-50/50 focus:border-red-400 focus:ring-2 focus:ring-red-100"
            : "border-gray-200 bg-gray-50/50 focus:border-navy-400 focus:ring-2 focus:ring-navy-100"
        }`}
      />
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}
