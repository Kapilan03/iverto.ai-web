import { useState } from "react";
import { AlertCircle, Loader2 } from "lucide-react";

interface MJPEGPlayerProps {
  url: string;
}

export default function MJPEGPlayer({ url }: MJPEGPlayerProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  return (
    <div className="absolute inset-0 w-full h-full bg-black flex items-center justify-center overflow-hidden">
      {/* Loading spinner */}
      {isLoading && !error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-gray-900/80 backdrop-blur-sm text-white/80">
          <Loader2 className="w-8 h-8 animate-spin mb-3 text-emerald-500" />
          <span className="text-xs font-mono tracking-[0.2em] font-semibold">
            CONNECTING TO CAMERA...
          </span>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-gray-900/90 p-4">
          <AlertCircle className="w-10 h-10 text-red-500 mb-3" />
          <span className="text-sm font-bold text-red-400 text-center uppercase tracking-wide">
            Camera Offline
          </span>
          <span className="text-xs font-mono text-white/50 mt-2 text-center max-w-[250px] leading-relaxed">
            Could not connect to the camera stream. Make sure the Python server is running.
          </span>
        </div>
      )}

      {/* The MJPEG stream — it's just an <img> tag! */}
      <img
        src={url}
        alt="Live CCTV Feed"
        className="w-full h-full object-cover transition-opacity duration-500"
        style={{ opacity: isLoading || error ? 0 : 1 }}
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setIsLoading(false);
          setError(true);
        }}
      />
    </div>
  );
}
