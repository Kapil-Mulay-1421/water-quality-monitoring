import { Loader2 } from "lucide-react";

export function LoadingScreen({ message = "ESTABLISHING UPLINK..." }: { message?: string }) {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-transparent relative z-50">
      <div className="relative w-24 h-24 mb-8">
        <div className="absolute inset-0 border-4 border-cyan-900 rounded-full"></div>
        <div className="absolute inset-0 border-4 border-t-cyan-400 border-r-cyan-400/50 border-b-transparent border-l-transparent rounded-full animate-spin shadow-[0_0_15px_rgba(0,243,255,0.4)]"></div>
        <div className="absolute inset-2 border-4 border-b-green-400 border-l-green-400/50 border-t-transparent border-r-transparent rounded-full animate-spin direction-reverse" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
        <Loader2 className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-6 w-6 text-cyan-400 animate-pulse" />
      </div>
      <div className="text-cyan-400 font-display text-lg tracking-[0.4em] animate-pulse drop-shadow-[0_0_8px_rgba(0,243,255,0.8)]">
        {message}
      </div>
    </div>
  );
}
