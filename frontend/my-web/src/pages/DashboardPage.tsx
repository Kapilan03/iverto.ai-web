import { useState, useRef, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { useStudents } from "../context/StudentContext";
import CameraFeed from "../components/CameraFeed";
import StudentDetailModal from "../components/StudentDetailModal";
import AccessDeniedModal from "../components/AccessDeniedModal";
import RegisterStudentModal from "../components/RegisterStudentModal";
import type { Student } from "../data/mockData";
import { ROLE_PERMISSIONS, type Camera as CameraType } from "../data/mockData";
import { supabase } from "../lib/supabase";
import {
  Camera,
  Circle,
  UserPlus,
  AlertTriangle,
  Users,
  ChevronLeft,
  ChevronRight,
  Shield,
  Monitor,
  Lock,
} from "lucide-react";

export default function DashboardPage() {
  const { user } = useAuth();
  const { students } = useStudents();
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [showAccessDenied, setShowAccessDenied] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [activeCameraIndex, setActiveCameraIndex] = useState(0);
  const [dbCameras, setDbCameras] = useState<CameraType[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  const role = user?.role || "parent";
  const permissions = ROLE_PERMISSIONS[role];

  useEffect(() => {
    async function fetchCameras() {
      const { data, error } = await supabase.from('cameras').select('*, zones:camera_zones(*)');
      if (!error && data) {
        // Map of camera IDs to local stream URLs (proxied via Vite to Flask on port 5000)
        const LOCAL_STREAMS: Record<string, string> = {
          "CAM-01": "/cam1",
          // Add more cameras here:
          // "CAM-02": "/cam2",
        };

        const mapped = data.map((d: any) => ({
          ...d,
          allowedRoles: d.allowed_roles,
          linkedStudentId: d.linked_student_id,
          streamUrl: d.stream_url || LOCAL_STREAMS[d.id] || undefined,
        }));
        setDbCameras(mapped);
      }
    }
    fetchCameras();
  }, []);

  // Only show CAM-01 (live CCTV feed)
  const visibleCameras = dbCameras.filter((cam) => cam.id === "CAM-01");

  const lockedCameras = dbCameras.filter((cam) => {
    if (permissions.canViewAllCameras) return false;
    return !cam.allowedRoles.includes(role);
  });

  // Scroll to active camera
  const scrollToCamera = useCallback(
    (index: number) => {
      if (!scrollRef.current) return;
      const container = scrollRef.current;
      const children = container.children;
      if (children[index]) {
        const child = children[index] as HTMLElement;
        container.scrollTo({
          left: child.offsetLeft - container.offsetLeft,
          behavior: "smooth",
        });
      }
      setActiveCameraIndex(index);
    },
    []
  );

  // Handle scroll snap detection
  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    let timeout: ReturnType<typeof setTimeout>;
    const handleScroll = () => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        const scrollLeft = container.scrollLeft;
        const width = container.clientWidth;
        const index = Math.round(scrollLeft / width);
        setActiveCameraIndex(Math.min(index, visibleCameras.length - 1));
      }, 80);
    };

    container.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      container.removeEventListener("scroll", handleScroll);
      clearTimeout(timeout);
    };
  }, [visibleCameras.length]);

  const goNext = () => {
    if (activeCameraIndex < visibleCameras.length - 1) {
      scrollToCamera(activeCameraIndex + 1);
    }
  };

  const goPrev = () => {
    if (activeCameraIndex > 0) {
      scrollToCamera(activeCameraIndex - 1);
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft") goPrev();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  });

  // Stats
  const totalIdentified = visibleCameras.reduce(
    (sum, c) => sum + c.zones.filter((z) => z.id !== "unknown").length,
    0
  );
  const totalUnknown = visibleCameras.reduce(
    (sum, c) => sum + c.zones.filter((z) => z.id === "unknown").length,
    0
  );
  const onlineCameras = visibleCameras.filter((c) => c.status === "online").length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Live Monitoring</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Real-time CCTV feed with AI recognition
            <span className="mx-2 text-gray-300">·</span>
            <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full border ${
              role === "admin"
                ? "bg-amber-500/10 text-amber-700 border-amber-500/30"
                : role === "staff"
                  ? "bg-emerald-500/10 text-emerald-700 border-emerald-500/30"
                  : "bg-blue-500/10 text-blue-700 border-blue-500/30"
            }`}>
              <Shield className="w-3 h-3" />
              {permissions.label}
            </span>
          </p>
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

      {/* Camera Carousel */}
      <div className="relative group/carousel">
        {/* Left Arrow */}
        {activeCameraIndex > 0 && (
          <button
            id="camera-prev-btn"
            onClick={goPrev}
            className="camera-nav-btn left-3"
            aria-label="Previous camera"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        )}

        {/* Right Arrow */}
        {activeCameraIndex < visibleCameras.length - 1 && (
          <button
            id="camera-next-btn"
            onClick={goNext}
            className="camera-nav-btn right-3"
            aria-label="Next camera"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        )}

        {/* Scrollable camera feeds */}
        <div
          ref={scrollRef}
          className="camera-carousel"
          id="camera-carousel"
        >
          {visibleCameras.map((camera) => (
            <div key={camera.id} className="camera-slide">
              <CameraFeed
                camera={camera}
                onStudentClick={setSelectedStudent}
                onUnknownClick={() => setShowRegister(true)}
                onAccessDenied={() => setShowAccessDenied(true)}
              />
            </div>
          ))}
        </div>

        {/* Dot indicators */}
        {visibleCameras.length > 1 && (
          <div className="flex items-center justify-center gap-2 mt-4">
            {visibleCameras.map((cam, i) => (
              <button
                key={cam.id}
                onClick={() => scrollToCamera(i)}
                className={`transition-all duration-300 rounded-full ${
                  i === activeCameraIndex
                    ? "w-8 h-2.5 bg-navy-700"
                    : "w-2.5 h-2.5 bg-gray-300 hover:bg-gray-400"
                }`}
                aria-label={`Go to ${cam.name}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Camera Thumbnail Strip */}
      {visibleCameras.length > 1 && (
        <div className="mt-5 overflow-x-auto pb-2 -mx-1">
          <div className="flex gap-3 px-1 min-w-max">
            {visibleCameras.map((cam, i) => (
              <button
                key={cam.id}
                id={`camera-thumb-${cam.id}`}
                onClick={() => scrollToCamera(i)}
                className={`camera-thumb ${i === activeCameraIndex ? "camera-thumb-active" : ""}`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  cam.status === "online"
                    ? i === activeCameraIndex
                      ? "bg-navy-700 text-white"
                      : "bg-gray-100 text-gray-500"
                    : "bg-amber-100 text-amber-600"
                }`}>
                  <Monitor className="w-4 h-4" />
                </div>
                <div className="text-left min-w-0">
                  <p className={`text-xs font-semibold truncate ${
                    i === activeCameraIndex ? "text-navy-800" : "text-gray-700"
                  }`}>
                    {cam.name}
                  </p>
                  <p className="text-[10px] text-gray-400 truncate">{cam.id}</p>
                </div>
                <div className="ml-auto flex-shrink-0">
                  <Circle className={`w-2 h-2 ${
                    cam.status === "online"
                      ? "fill-emerald-500 text-emerald-500"
                      : cam.status === "maintenance"
                        ? "fill-amber-500 text-amber-500"
                        : "fill-red-500 text-red-500"
                  }`} />
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Locked Cameras (for non-admin roles) */}
      {lockedCameras.length > 0 && (
        <div className="mt-4 p-4 rounded-xl bg-gray-100/80 border border-gray-200/80">
          <div className="flex items-center gap-2 mb-3">
            <Lock className="w-4 h-4 text-gray-400" />
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Restricted Cameras ({lockedCameras.length})
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {lockedCameras.map((cam) => (
              <div
                key={cam.id}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-200/60 text-gray-400 text-xs font-medium"
              >
                <Lock className="w-3 h-3" />
                {cam.name}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick info cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
        <QuickCard
          label="Total Students"
          value={String(students.length)}
          icon={Users}
          color="navy"
        />
        <QuickCard
          label="Identified"
          value={String(totalIdentified)}
          icon={Camera}
          color="emerald"
        />
        <QuickCard
          label="Unrecognized"
          value={String(totalUnknown)}
          icon={AlertTriangle}
          color="red"
        />
        <QuickCard
          label="Cameras Online"
          value={`${onlineCameras}/${visibleCameras.length}`}
          icon={Camera}
          color="blue"
        />
      </div>

      {/* Register prompt for admin */}
      {(permissions.canRegisterStudents && totalUnknown > 0) && (
        <div className="mt-6 p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-200/50 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-amber-800">
                {totalUnknown} Unrecognized {totalUnknown === 1 ? "Person" : "People"} Detected
              </p>
              <p className="text-xs text-amber-600 mt-0.5">
                Click the red zone on any camera or this button to register
              </p>
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

      {/* Parent info banner */}
      {role === "parent" && (
        <div className="mt-6 p-4 rounded-xl bg-blue-50 border border-blue-200 flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-200/50 flex items-center justify-center flex-shrink-0 mt-0.5">
            <Shield className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-blue-800">Parent Access Mode</p>
            <p className="text-xs text-blue-600 mt-0.5 leading-relaxed">
              You are viewing cameras where your child may appear. Your child is highlighted with a
              <span className="inline-block mx-1 px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-700 font-bold text-[10px]">★ CYAN</span>
              border. Other students' details are restricted for privacy.
            </p>
          </div>
        </div>
      )}

      {/* Modals */}
      {selectedStudent && (
        <StudentDetailModal
          student={selectedStudent}
          onClose={() => setSelectedStudent(null)}
        />
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
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string;
  value: string;
  icon: typeof Camera;
  color: string;
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
