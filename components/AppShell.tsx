'use client';
import { ReactNode } from "react";
import { Activity } from "lucide-react";
import { Link } from "wouter";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="h-screen w-screen bg-[#030305] text-slate-300 flex flex-col relative overflow-hidden">
      {/* Cyber Grid Background */}
      <div 
        className="absolute inset-0 pointer-events-none z-0 opacity-15"
        style={{ 
          backgroundImage: 'linear-gradient(rgba(0, 243, 255, 0.25) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 243, 255, 0.25) 1px, transparent 1px)', 
          backgroundSize: '40px 40px', 
          backgroundPosition: 'center center' 
        }}
      />
      
      {/* Deep gradient glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[400px] bg-cyan-500/10 blur-[120px] rounded-full pointer-events-none z-0" />

      {/* Top Navigation */}
      <header className="h-[72px] border-b border-cyan-500/20 bg-[#0A0A0F]/80 backdrop-blur-md z-50 flex items-center justify-between px-6 shrink-0 relative shadow-[0_0_20px_rgba(0,243,255,0.05)]">
        <Link href="/" className="flex items-center gap-3 text-cyan-400 font-display text-2xl font-bold tracking-[0.25em] hover:text-cyan-300 transition-colors cursor-pointer group">
          <div className="relative">
            <Activity className="h-7 w-7 group-hover:animate-pulse" />
            <div className="absolute inset-0 bg-cyan-400 blur-md opacity-40 group-hover:opacity-80 transition-opacity" />
          </div>
          AQUA-NET
        </Link>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-xs font-display tracking-widest text-green-400 bg-green-500/10 px-3 py-1.5 rounded-full border border-green-500/20">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            UPLINK SECURE
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col relative z-10 overflow-hidden">
        {children}
      </main>
    </div>
  );
}
