import React from 'react';
import { useDXFStore } from './store/DXFStore';
import { useResumeStore } from './store/resumeStore';
import FileUpload from './components/FileUpload';
import Sidebar from './components/Sidebar';
import CanvasViewer from './components/CanvasViewer';
import ResumeDashboard from './components/resume/ResumeDashboard';
import { Cpu, Compass, Layers, Briefcase, FileCode } from 'lucide-react';

export default function App() {
  const dxfData = useDXFStore(state => state.dxfData);
  const { activeWorkspace, setActiveWorkspace } = useResumeStore();

  return (
    <div className="w-full h-full min-h-screen flex flex-col bg-zinc-950 text-zinc-100 overflow-hidden font-sans">
      {/* Top Banner Navigation Bar */}
      <header className="h-14 border-b border-zinc-900 bg-zinc-950 px-6 flex items-center justify-between flex-shrink-0 z-30 shadow-md shadow-black/15 select-none">
        <div className="flex items-center gap-6">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="p-1.5 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-900/10">
              <Compass className="w-5 h-5 animate-pulse" />
            </div>
            <span className="font-extrabold text-sm tracking-widest text-white uppercase bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
              DO HIAM <span className="text-cyan-400 font-medium">SHOWCASE</span>
            </span>
          </div>

          {/* Core Unified Workspace Switcher Tabs */}
          <div className="flex items-center bg-zinc-900/80 border border-zinc-800 p-0.5 rounded-lg">
            <button
              onClick={() => setActiveWorkspace('resume')}
              className={`px-3 py-1.5 rounded-md text-[10px] font-extrabold uppercase tracking-widest flex items-center gap-1.5 transition-all cursor-pointer ${
                activeWorkspace === 'resume'
                  ? 'bg-cyan-500 text-white shadow-md shadow-cyan-950/20'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Briefcase className="w-3.5 h-3.5" />
              <span>AI Resume & Portfolio</span>
            </button>
            <button
              onClick={() => setActiveWorkspace('cad')}
              className={`px-3 py-1.5 rounded-md text-[10px] font-extrabold uppercase tracking-widest flex items-center gap-1.5 transition-all cursor-pointer ${
                activeWorkspace === 'cad'
                  ? 'bg-cyan-500 text-white shadow-md shadow-cyan-950/20'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>3D CAD viewer</span>
            </button>
          </div>
        </div>

        {/* Dynamic GPU context widgets */}
        {activeWorkspace === 'cad' && dxfData ? (
          <div className="flex items-center gap-4 text-xs font-bold text-zinc-500">
            <div className="flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-zinc-300">GPU Accelerated Renderer</span>
            </div>
            <div className="h-3 w-[1px] bg-zinc-800"></div>
            <div className="flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-zinc-300">Layer Enforcer v1.0</span>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-widest text-zinc-500">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>AI Resume Orchestrator active</span>
          </div>
        )}
      </header>

      {/* Main Content Workspace */}
      <main className="flex-1 w-full h-full flex min-h-0 overflow-hidden relative">
        {activeWorkspace === 'resume' ? (
          /* Workspace 1: Interactive Resume builder dashboard */
          <ResumeDashboard />
        ) : (
          /* Workspace 2: High performance 3D/2D CAD Viewer */
          !dxfData ? (
            <div className="flex-1 h-full w-full flex items-center justify-center relative overflow-y-auto px-4 py-8">
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f293708_1px,transparent_1px),linear-gradient(to_bottom,#1f293708_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>
              <div className="absolute top-[20%] left-[10%] w-72 h-72 rounded-full bg-cyan-600/5 blur-[120px] pointer-events-none"></div>
              <div className="absolute bottom-[20%] right-[10%] w-72 h-72 rounded-full bg-blue-600/5 blur-[120px] pointer-events-none"></div>
              
              <FileUpload />
            </div>
          ) : (
            <div className="flex-1 w-full h-full flex min-h-0 overflow-hidden">
              <Sidebar />
              <CanvasViewer />
            </div>
          )
        )}
      </main>
    </div>
  );
}

// Sparkles helper import missing above, adding mock element
const Sparkles = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
    <path d="m5 3 1 2.5L8.5 6 6 7 5 9.5 4 7 1.5 6 4 5.5 5 3Z"/>
    <path d="m19 17 1 2.5 2.5.5-2.5 1-1 2.5-1-2.5-2.5-1 2.5-1 1-2.5Z"/>
  </svg>
);

