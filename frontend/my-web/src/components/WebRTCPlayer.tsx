import { useEffect, useRef, useState } from "react";
import { AlertCircle, Loader2 } from "lucide-react";

interface WebRTCPlayerProps {
  url: string;
}

export default function WebRTCPlayer({ url }: WebRTCPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let pc: RTCPeerConnection | null = null;
    let isMounted = true;

    const connect = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Initialize Peer Connection (STUN server helps if camera/server is behind NAT)
        pc = new RTCPeerConnection({
          iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
        });

        // Setup transceiver to receive video ONLY (we don't send anything)
        pc.addTransceiver("video", { direction: "recvonly" });

        // When server sends video stream, attach it to our <video> element
        pc.ontrack = (event) => {
          if (videoRef.current && event.streams && event.streams[0]) {
            videoRef.current.srcObject = event.streams[0];
            setIsLoading(false);
          }
        };

        // 1. Create WebRTC Offer
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);

        // 2. Send Offer to MediaMTX using the WHEP protocol endpoint
        const serverUrl = url.endsWith("/whep") ? url : `${url}/whep`;

        const response = await fetch(serverUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/sdp",
          },
          body: offer.sdp,
        });

        if (!response.ok) {
          throw new Error(`Media Server Error: ${response.status} ${response.statusText}`);
        }

        const answerSdp = await response.text();

        // 3. Set the remote description returned by MediaMTX
        await pc.setRemoteDescription({
          type: "answer",
          sdp: answerSdp,
        });

      } catch (err: any) {
        if (isMounted) {
          setError(err.message || "Failed to establish WebRTC connection");
          setIsLoading(false);
          console.error("WebRTC Error:", err);
        }
      }
    };

    connect();

    // Cleanup connection when component unmounts
    return () => {
      isMounted = false;
      if (pc) {
        pc.close();
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    };
  }, [url]);

  return (
    <div className="absolute inset-0 w-full h-full bg-black flex items-center justify-center overflow-hidden">
      {/* Loading state overlays */}
      {isLoading && !error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-gray-900/80 backdrop-blur-sm text-white/80">
          <Loader2 className="w-8 h-8 animate-spin mb-3 text-emerald-500" />
          <span className="text-xs font-mono tracking-[0.2em] font-semibold">NEGOTIATING WEBRTC...</span>
        </div>
      )}

      {/* Error state overlays */}
      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-gray-900/90 p-4">
          <AlertCircle className="w-10 h-10 text-red-500 mb-3" />
          <span className="text-sm font-bold text-red-400 text-center uppercase tracking-wide">Connection Lost</span>
          <span className="text-xs font-mono text-white/50 mt-2 text-center max-w-[250px] leading-relaxed">
            {error}. Ensure MediaMTX is running and the RTSP feed is active.
          </span>
        </div>
      )}

      {/* The actual live video feed */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-full h-full object-cover transition-opacity duration-500"
        style={{ opacity: isLoading || error ? 0 : 1 }}
      />
    </div>
  );
}
