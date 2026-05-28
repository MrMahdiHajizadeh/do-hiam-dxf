import React from 'react';
import { useDXFStore } from './store/DXFStore';
import FileUpload from './components/FileUpload';
import Sidebar from './components/Sidebar';
import CanvasViewer from './components/CanvasViewer';
import { Cpu, Compass, Layers } from 'lucide-react';

export default function App() {
  const dxfData = useDXFStore(state => state.dxfData);

  return (
    <div className="w-full h-full min-h-screen flex flex-col bg-zinc-950 text-zinc-100 overflow-hidden font-sans">
      {/* Top Banner Navigation Bar */}
      <header className="h-14 border-b border-zinc-900 bg-zinc-950 px-6 flex items-center justify-between flex-shrink-0 z-30 shadow-md shadow-black/15">
        <div className="flex items-center gap-3">
          <div className="p-1.5 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-900/10">
            <Compass className="w-5 h-5 animate-pulse" />
          </div>
          <span className="font-extrabold text-sm tracking-widest text-white uppercase bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
            ANTIGRAVITY <span className="text-cyan-400 font-medium">DXF</span>
          </span>
        </div>

        {dxfData && (
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
        )}
      </header>

      {/* Main Content Workspace */}
      <main className="flex-1 w-full h-full flex min-h-0 overflow-hidden relative">
        {!dxfData ? (
          /* Landing Screen: Uploader workspace */
          <div className="flex-1 h-full w-full flex items-center justify-center relative overflow-y-auto px-4 py-8">
            {/* Subtle background tech grid layout */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f293708_1px,transparent_1px),linear-gradient(to_bottom,#1f293708_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>
            <div className="absolute top-[20%] left-[10%] w-72 h-72 rounded-full bg-cyan-600/5 blur-[120px] pointer-events-none"></div>
            <div className="absolute bottom-[20%] right-[10%] w-72 h-72 rounded-full bg-blue-600/5 blur-[120px] pointer-events-none"></div>
            
            <FileUpload />
          </div>
        ) : (
          /* Active CAD Workspace: Split Sidebar + 3D Canvas */
          <div className="flex-1 w-full h-full flex min-h-0 overflow-hidden">
            {/* Left Hand: Data Table Sidebar Panel */}
            <Sidebar />

            {/* Right Hand / Main Area: High performance 3D/2D WebGL R3F Canvas */}
            <CanvasViewer />
          </div>
        )}
      </main>
    </div>
  );
}
