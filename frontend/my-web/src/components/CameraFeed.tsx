import { useStudents } from "../context/StudentContext";
import { useAuth } from "../context/AuthContext";
import type { Camera, Student } from "../data/mockData";
import { Camera as CameraIcon, Circle, Users, AlertTriangle, Wrench } from "lucide-react";
import { useState, useEffect } from "react";
import IvertoLogo from "./IvertoLogo";

interface CameraFeedProps {
  camera: Camera;
  onStudentClick: (student: Student) => void;
  onUnknownClick: () => void;
  onAccessDenied: () => void;
}

export default function CameraFeed({ camera, onStudentClick, onUnknownClick, onAccessDenied }: CameraFeedProps) {
  const { getStudentById } = useStudents();
  const { user } = useAuth();
  const [timeStr, setTimeStr] = useState("");
  const [dateStr, setDateStr] = useState("");

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString("en-US", { hour12: false }));
      setDateStr(now.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }));
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleZoneClick = (zoneId: string) => {
    if (zoneId === "unknown") {
      if (user?.role === "parent") {
        onAccessDenied();
      } else {
        onUnknownClick();
      }
      return;
    }

    const student = getStudentById(zoneId);
    if (!student) return;

    if (user?.role === "parent") {
      if (user.studentId === zoneId) {
        onStudentClick(student);
      } else {
        onAccessDenied();
      }
    } else {
      onStudentClick(student);
    }
  };

  const identifiedCount = camera.zones.filter((z) => z.id !== "unknown").length;
  const unknownCount = camera.zones.filter((z) => z.id === "unknown").length;

  const statusColors: Record<string, string> = {
    online: "fill-emerald-500 text-emerald-500",
    offline: "fill-red-500 text-red-500",
    maintenance: "fill-amber-500 text-amber-500",
  };

  const statusLabels: Record<string, string> = {
    online: "Live",
    offline: "Offline",
    maintenance: "Maintenance",
  };

  // Maintenance / Offline state
  if (camera.status !== "online") {
    return (
      <div className="bg-gray-900 rounded-2xl overflow-hidden shadow-2xl border-2 border-gray-800 relative w-full flex-shrink-0">
        <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-4 py-2.5 bg-gradient-to-b from-black/70 to-transparent">
          <div className="flex items-center gap-2">
            <CameraIcon className="w-4 h-4 text-white/60" />
            <span className="text-xs font-medium text-white/80 tracking-wide">{camera.id} — {camera.name}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Circle className={`w-2.5 h-2.5 ${statusColors[camera.status]}`} />
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
              {statusLabels[camera.status]}
            </span>
          </div>
        </div>

        <div className="aspect-video bg-gradient-to-br from-gray-800 via-gray-900 to-gray-800 flex flex-col items-center justify-center gap-3 relative">
           {/* Watermark */}
           <div className="absolute opacity-10">
              <IvertoLogo size={120} />
           </div>
          <div className="w-16 h-16 rounded-full bg-gray-700/50 flex items-center justify-center relative z-10">
            <Wrench className="w-8 h-8 text-gray-500" />
          </div>
          <p className="text-gray-500 text-sm font-medium relative z-10">
            Camera {camera.status === "maintenance" ? "Under Maintenance" : "Offline"}
          </p>
          <p className="text-gray-600 text-xs relative z-10">{camera.location}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 rounded-2xl overflow-hidden shadow-2xl border-2 border-gray-800 relative w-full flex-shrink-0">
      {/* Top bar overlay */}
      <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-4 py-2.5 bg-gradient-to-b from-black/70 to-transparent">
        <div className="flex items-center gap-2">
          <CameraIcon className="w-4 h-4 text-white/60" />
          <span className="text-xs font-medium text-white/80 tracking-wide">{camera.id} — {camera.name}</span>
          <span className="text-[10px] text-white/40 hidden sm:inline">({camera.location})</span>
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

        {/* Simulated scene */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative w-full h-full">
            {/* Background elements for visual depth */}
            <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-gray-700/30 to-transparent" />
            <div className="absolute top-8 left-1/2 -translate-x-1/2 w-3/4 h-px bg-gray-600/30" />
            
            {/* Watermark in feed */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.03]">
              <IvertoLogo size={200} />
            </div>

            {/* Person silhouettes */}
            {camera.zones.map((zone, idx) => {
              const isUnknown = zone.id === "unknown";
              const student = !isUnknown ? getStudentById(zone.id) : null;
              // For parent role: only highlight their child
              const isChildOfParent = user?.role === "parent" && user.studentId === zone.id;
              const dimmed = user?.role === "parent" && !isUnknown && !isChildOfParent;

              return (
                <button
                  key={`${zone.id}-${idx}`}
                  id={`zone-${camera.id}-${zone.id}-${idx}`}
                  onClick={() => handleZoneClick(zone.id)}
                  className={`absolute group focus:outline-none transition-opacity z-10 ${dimmed ? "opacity-40 cursor-not-allowed" : ""}`}
                  style={{ left: zone.x, top: zone.y, width: zone.w, height: zone.h }}
                >
                  {/* Silhouette */}
                  <div className="w-full h-full flex flex-col items-center justify-end">
                    <div className={`relative w-3/4 h-full rounded-t-full ${
                      isUnknown ? "bg-red-900/20" : "bg-gray-800/40 border border-gray-700/50"
                    }`}>
                      {/* Head */}
                      <div className={`absolute -top-2 left-1/2 -translate-x-1/2 w-6 h-6 sm:w-8 sm:h-8 rounded-full border-2 ${
                        isUnknown
                          ? "border-red-500/60 bg-red-900/30"
                          : isChildOfParent
                            ? "border-cyan-400/80 bg-cyan-900/40"
                            : "border-emerald-500/60 bg-gray-800/80"
                      }`} />
                    </div>
                  </div>

                  {/* Bounding box & label */}
                  <div className={`absolute inset-0 border-2 rounded-lg transition-all ${
                    isUnknown
                      ? "border-red-500/50 group-hover:border-red-400 group-hover:shadow-[0_0_20px_rgba(239,68,68,0.2)]"
                      : isChildOfParent
                        ? "border-cyan-400/70 group-hover:border-cyan-300 group-hover:shadow-[0_0_20px_rgba(34,211,238,0.3)]"
                        : "border-emerald-500/50 group-hover:border-emerald-400 group-hover:shadow-[0_0_20px_rgba(16,185,129,0.2)]"
                  } zone-pulse`}>
                    <div className={`absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap px-2 py-0.5 rounded text-[10px] font-bold tracking-wide flex items-center justify-center ${
                      isUnknown
                        ? "bg-red-500/90 text-white"
                        : isChildOfParent
                          ? "bg-cyan-500/90 text-white"
                          : "bg-emerald-500/90 text-white"
                    }`}>
                      {isUnknown
                        ? "UNKNOWN"
                        : isChildOfParent
                          ? `★ ${student?.name?.split(" ")[0]?.toUpperCase()}`
                          : student?.name?.split(" ")[0]?.toUpperCase() || zone.label}
                    </div>
                    {/* Corner markers */}
                    {(() => {
                      const color = isUnknown ? "border-red-400" : isChildOfParent ? "border-cyan-400" : "border-emerald-400";
                      return (
                        <>
                          <div className={`absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 rounded-tl ${color}`} />
                          <div className={`absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 rounded-tr ${color}`} />
                          <div className={`absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 rounded-bl ${color}`} />
                          <div className={`absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 rounded-br ${color}`} />
                        </>
                      );
                    })()}
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
              <span className="font-bold text-emerald-400">{identifiedCount}</span> identified
            </span>
          </div>
          {unknownCount > 0 && (
            <div className="flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
              <span className="text-xs text-white/70">
                <span className="font-bold text-red-400">{unknownCount}</span> unknown
              </span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
           <IvertoLogo size={14} />
           <span className="text-[10px] text-white/50 font-mono">iverto.ai v2.4 — FPS: {camera.fps}</span>
        </div>
      </div>
    </div>
  );
}
