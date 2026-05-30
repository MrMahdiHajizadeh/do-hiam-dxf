import React from 'react';
import GithubConnector from './GithubConnector';
import ProjectSelector from './ProjectSelector';
import ResumePreview from './ResumePreview';
import ResumeExporter from './ResumeExporter';
import { Sparkles } from 'lucide-react';

export default function ResumeDashboard() {
  return (
    <div className="flex-1 w-full h-full flex flex-col md:flex-row min-h-0 overflow-hidden bg-zinc-950 p-4 md:p-6 gap-6 relative">
      {/* Dynamic tech-background grids */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f293705_1px,transparent_1px),linear-gradient(to_bottom,#1f293705_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none z-0"></div>

      {/* Left Column: Settings and Connections */}
      <div className="w-full md:w-[350px] flex flex-col gap-4 flex-shrink-0 min-h-0 overflow-y-auto z-10 select-none">
        
        {/* Connection Widget */}
        <GithubConnector />

        {/* Selected Project Grid Selector */}
        <div className="flex-1 min-h-[350px] md:min-h-0 p-5 rounded-xl border border-zinc-800 bg-zinc-900/50 backdrop-blur-md overflow-hidden flex flex-col shadow-lg shadow-black/35">
          <ProjectSelector />
        </div>

        {/* Exporter Block */}
        <ResumeExporter />
      </div>

      {/* Right Column: Live Interactive Previewer */}
      <div className="flex-1 min-h-[500px] md:min-h-0 rounded-xl border border-zinc-800 bg-zinc-900/20 backdrop-blur-sm p-4 flex flex-col overflow-hidden shadow-lg shadow-black/30 z-10">
        <div className="flex items-center gap-2 mb-3 px-2 flex-shrink-0">
          <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse"></div>
          <span className="text-[10px] font-extrabold uppercase text-white tracking-widest flex items-center gap-1.5">
            Real-Time CV Canvas 
            <span className="text-zinc-500 font-semibold">(Click text fields directly to customize)</span>
          </span>
        </div>
        
        <div className="flex-1 min-h-0 overflow-y-auto">
          <ResumePreview />
        </div>
      </div>
    </div>
  );
}
