import React, { useState, useCallback } from 'react';
import { UploadCloud, AlertCircle, FileCode, Cpu, CheckCircle } from 'lucide-react';
import DxfParser from 'dxf-parser';
import { useDXFStore } from '../store/DXFStore';
import { processEntity } from '../utils/DXFParserUtils';

export default function FileUpload() {
  const setDxfData = useDXFStore((state) => state.setDxfData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  const handleDxfText = useCallback((text, fileName) => {
    setLoading(true);
    setError(null);

    // Run parser in a microtask to let the UI render the spinner first
    setTimeout(() => {
      try {
        const parser = new DxfParser();
        const parsed = parser.parseSync(text);

        if (!parsed || !parsed.entities) {
          throw new Error("Invalid DXF structure: Missing entities table.");
        }

        // Process and enrich all parsed entities with mathematical bounds
        const enriched = parsed.entities.map((entity, idx) => 
          processEntity(entity, idx)
        );

        setDxfData(parsed, enriched);
      } catch (err) {
        console.error("Error parsing DXF file:", err);
        setError(`Failed to parse DXF: ${err.message || 'Unknown error'}`);
      } finally {
        setLoading(false);
      }
    }, 50);
  }, [setDxfData]);

  const onDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const onDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    setError(null);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (!file.name.toLowerCase().endsWith('.dxf')) {
        setError("Only .dxf files are supported.");
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (event) => {
        handleDxfText(event.target.result, file.name);
      };
      reader.onerror = () => {
        setError("Failed to read the file.");
      };
      reader.readAsText(file);
    }
  }, [handleDxfText]);

  const onFileChange = useCallback((e) => {
    setError(null);
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        handleDxfText(event.target.result, file.name);
      };
      reader.onerror = () => {
        setError("Failed to read the file.");
      };
      reader.readAsText(file);
    }
  }, [handleDxfText]);

  // Generates a mock DXF text content dynamically to demonstrate all features
  const loadSampleDxf = useCallback(() => {
    const sampleDxf = `0
SECTION
2
HEADER
9
$ACADVER
1
AC1021
0
ENDSEC
0
SECTION
2
ENTITIES
0
LINE
8
GRID_LAYER
62
5
10
0.0
20
0.0
30
0.0
11
100.0
21
100.0
31
0.0
0
LINE
8
GRID_LAYER
62
5
10
100.0
20
0.0
30
0.0
11
0.0
21
100.0
31
0.0
0
CIRCLE
8
CIRCLES_LAYER
62
1
10
50.0
20
50.0
30
0.0
40
25.0
0
ARC
8
ARCS_LAYER
62
3
10
50.0
20
50.0
30
0.0
40
35.0
50
45.0
51
225.0
0
SPLINE
8
SPLINES_LAYER
62
2
71
3
72
12
73
8
40
0.0
40
0.0
40
0.0
40
0.0
40
0.2
40
0.4
40
0.6
40
0.8
40
1.0
40
1.0
40
1.0
40
1.0
10
10.0
20
15.0
30
0.0
10
25.0
20
45.0
30
0.0
10
45.0
20
5.0
30
0.0
10
60.0
20
55.0
30
0.0
10
75.0
20
20.0
30
0.0
10
85.0
20
65.0
30
0.0
10
95.0
20
35.0
30
0.0
10
105.0
20
50.0
30
0.0
0
ENDSEC
0
EOF`;

    handleDxfText(sampleDxf, "sample_drawing.dxf");
  }, [handleDxfText]);

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-2xl px-6 py-12 mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-extrabold tracking-tight text-white mb-2 bg-gradient-to-r from-blue-400 via-cyan-400 to-indigo-400 bg-clip-text text-transparent">
          Vector DXF Analyzer & Interactive Renderer
        </h2>
        <p className="text-zinc-400 text-sm max-w-md mx-auto">
          High-performance 3D CAD drawing viewer. Upload any standard DXF file or load our high-fidelity sample model.
        </p>
      </div>

      <div
        onDragEnter={onDrag}
        onDragOver={onDrag}
        onDragLeave={onDrag}
        onDrop={onDrop}
        className={`relative w-full rounded-2xl border-2 border-dashed transition-all duration-300 p-10 flex flex-col items-center justify-center cursor-pointer glass-panel ${
          dragActive 
            ? "border-cyan-500 bg-cyan-950/20 scale-[1.01]" 
            : "border-zinc-700/80 hover:border-zinc-500 hover:bg-zinc-900/10"
        }`}
      >
        <input
          type="file"
          id="dxf-file-input"
          accept=".dxf"
          onChange={onFileChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          disabled={loading}
        />

        {loading ? (
          <div className="flex flex-col items-center justify-center py-6">
            <div className="relative w-16 h-16 mb-4">
              <div className="absolute inset-0 rounded-full border-4 border-cyan-500/20"></div>
              <div className="absolute inset-0 rounded-full border-4 border-t-cyan-400 animate-spin"></div>
            </div>
            <p className="text-cyan-400 font-semibold text-base animate-pulse">
              Parsing DXF Structure...
            </p>
            <p className="text-zinc-500 text-xs mt-2">
              Calculating exact curves and control coordinates
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center text-center">
            <div className="p-4 rounded-full bg-zinc-800/50 mb-4 border border-zinc-700/50 text-cyan-400">
              <UploadCloud className="w-10 h-10 animate-bounce" />
            </div>
            <p className="text-white font-medium text-lg mb-1">
              Drag & Drop your <span className="text-cyan-400 font-bold">.dxf</span> file here
            </p>
            <p className="text-zinc-500 text-xs mb-6">
              Supports LINE, POLYLINE, CIRCLE, ARC, SPLINE, and HATCH
            </p>
            
            <label
              htmlFor="dxf-file-input"
              className="px-6 py-2.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-sm transition-all shadow-lg shadow-cyan-900/25 border border-cyan-500/30 z-20 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
            >
              Browse Local Files
            </label>
          </div>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-3 w-full mt-6 p-4 rounded-xl border border-rose-900/50 bg-rose-950/20 text-rose-300 text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-400" />
          <span className="font-medium">{error}</span>
        </div>
      )}

      <div className="flex flex-col items-center mt-8 w-full">
        <div className="flex items-center gap-2 mb-3">
          <div className="h-[1px] w-12 bg-zinc-800"></div>
          <span className="text-xs text-zinc-500 font-bold uppercase tracking-wider">Quick Start Fallback</span>
          <div className="h-[1px] w-12 bg-zinc-800"></div>
        </div>
        
        <button
          onClick={loadSampleDxf}
          disabled={loading}
          className="flex items-center justify-center gap-2.5 px-8 py-3 rounded-xl border border-zinc-700/80 bg-zinc-900/80 hover:bg-zinc-800/90 text-zinc-200 font-semibold text-sm transition-all hover:border-cyan-500/40 hover:text-cyan-300 hover:scale-[1.02] active:scale-[0.98] shadow-md shadow-black/40"
        >
          <Cpu className="w-4 h-4 text-cyan-400 animate-pulse" />
          Load Vector Sample DXF
        </button>
      </div>
    </div>
  );
}
