import { useState, useEffect, useRef } from "react";
import { AlertCircle, Loader2, RefreshCw } from "lucide-react";

interface MJPEGPlayerProps {
  url: string;
}

export default function MJPEGPlayer({ url }: MJPEGPlayerProps) {
  const [status, setStatus] = useState<"loading" | "connected" | "error">("loading");
  const imgRef = useRef<HTMLImageElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    // For MJPEG streams, the onLoad event fires when the first frame arrives.
    // But if the server is down, it may hang forever. Set a timeout to detect that.
    setStatus("loading");

    timeoutRef.current = setTimeout(() => {
      // If still loading after 8 seconds, assume error
      if (status === "loading") {
        setStatus("error");
      }
    }, 8000);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [url]);

  const handleRetry = () => {
    setStatus("loading");
    // Force reload the image by appending a cache-busting param
    if (imgRef.current) {
      const separator = url.includes("?") ? "&" : "?";
      imgRef.current.src = `${url}${separator}t=${Date.now()}`;
    }
  };

  return (
    <div className="absolute inset-0 w-full h-full bg-black flex items-center justify-center overflow-hidden">
      {/* Loading spinner */}
      {status === "loading" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-gray-900/80 backdrop-blur-sm text-white/80">
          <Loader2 className="w-8 h-8 animate-spin mb-3 text-emerald-500" />
          <span className="text-xs font-mono tracking-[0.2em] font-semibold">
            CONNECTING TO CAMERA...
          </span>
        </div>
      )}

      {/* Error state */}
      {status === "error" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-gray-900/90 p-4">
          <AlertCircle className="w-10 h-10 text-red-500 mb-3" />
          <span className="text-sm font-bold text-red-400 text-center uppercase tracking-wide">
            Camera Offline
          </span>
          <span className="text-xs font-mono text-white/50 mt-2 text-center max-w-[250px] leading-relaxed">
            Could not connect to the camera stream. Make sure the Python server
            is running on port 5000.
          </span>
          <button
            onClick={handleRetry}
            className="mt-4 flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white/80 text-xs font-semibold transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Retry Connection
          </button>
        </div>
      )}

      {/* The MJPEG stream — browsers natively support multipart/x-mixed-replace */}
      <img
        ref={imgRef}
        src={url}
        alt="Live CCTV Feed"
        className="w-full h-full object-cover"
        style={{
          opacity: status === "connected" ? 1 : 0,
          transition: "opacity 0.5s ease",
        }}
        onLoad={() => {
          if (timeoutRef.current) clearTimeout(timeoutRef.current);
          setStatus("connected");
        }}
        onError={() => {
          if (timeoutRef.current) clearTimeout(timeoutRef.current);
          setStatus("error");
        }}
      />
    </div>
  );
}
