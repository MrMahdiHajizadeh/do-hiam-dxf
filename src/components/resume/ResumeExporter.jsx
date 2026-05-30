import React, { useState } from 'react';
import { useResumeStore } from '../../store/resumeStore';
import { Download, Share2, Globe, Cpu, CheckCircle2, ChevronRight } from 'lucide-react';

export default function ResumeExporter() {
  const { personalInfo, skills, projects, experience, education, selectedTheme } = useResumeStore();
  const [isExporting, setIsExporting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // 1. PDF Print function
  const handlePrint = () => {
    // Inject print-friendly style sheet dynamically
    const style = document.createElement('style');
    style.innerHTML = `
      @media print {
        body * {
          visibility: hidden;
        }
        #resume-print-target, #resume-print-target * {
          visibility: visible;
        }
        #resume-print-target {
          position: absolute;
          left: 0;
          top: 0;
          width: 100% !important;
          max-width: 100% !important;
          padding: 0 !important;
          border: none !important;
          box-shadow: none !important;
          background: white !important;
          color: black !important;
        }
        /* Ensure dark-mode elements display as black text on white backgrounds */
        h1, h2, h3, h4, span, p, li, a {
          color: #0c0a09 !important;
        }
        /* Hide unnecessary interactive highlights */
        svg, button, .edit-indicator {
          display: none !important;
        }
      }
    `;
    document.head.appendChild(style);
    
    // Trigger standard browser print window
    window.print();
    
    // Clean up
    document.head.removeChild(style);
  };

  // 2. Standalone SPA HTML Compiler
  const handleExportHtml = () => {
    setIsExporting(true);
    setSuccessMsg('');

    const highlightedProjects = projects.filter(p => p.isHighlighted);

    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${personalInfo.fullName} | AI Portfolio & Resume</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
  <script src="https://unpkg.com/lucide@latest"></script>
  <style>
    body {
      font-family: 'Plus Jakarta Sans', sans-serif;
      background-color: #09090b;
      color: #f4f4f5;
    }
    .glass-panel {
      background: rgba(24, 24, 27, 0.75);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border: 1px solid rgba(63, 63, 70, 0.3);
    }
  </style>
</head>
<body class="min-h-screen py-10 px-4 select-none relative overflow-x-hidden">
  <!-- Aesthetic Glowing background layout dots -->
  <div class="absolute top-[10%] left-[10%] w-96 h-96 rounded-full bg-cyan-500/10 blur-[120px] pointer-events-none"></div>
  <div class="absolute bottom-[20%] right-[10%] w-96 h-96 rounded-full bg-blue-500/10 blur-[120px] pointer-events-none"></div>

  <div class="max-w-4xl mx-auto space-y-8 relative z-10">
    
    <!-- Unified Hub Navigation Header -->
    <header class="glass-panel p-6 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-xl shadow-black/35">
      <div>
        <div class="flex items-center gap-2 mb-1.5">
          <h1 class="text-2xl font-extrabold text-white tracking-wide uppercase">${personalInfo.fullName}</h1>
          <span class="px-2 py-0.5 rounded text-[9px] font-extrabold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 uppercase tracking-widest">Verified Portfolio</span>
        </div>
        <p class="text-xs font-bold text-cyan-400 tracking-wider uppercase">${personalInfo.jobTitle}</p>
      </div>

      <!-- Links Grid -->
      <div class="grid grid-cols-2 gap-x-6 gap-y-2 text-xs font-semibold text-zinc-300">
        <div class="flex items-center gap-2">
          <i data-lucide="mail" class="w-4 h-4 text-zinc-500"></i>
          <span>${personalInfo.email}</span>
        </div>
        <div class="flex items-center gap-2">
          <i data-lucide="phone" class="w-4 h-4 text-zinc-500"></i>
          <span>${personalInfo.phone}</span>
        </div>
        <div class="flex items-center gap-2 col-span-2">
          <i data-lucide="map-pin" class="w-4 h-4 text-zinc-500"></i>
          <span>${personalInfo.location}</span>
        </div>
        <div class="flex items-center gap-2 col-span-2">
          <i data-lucide="link" class="w-4 h-4 text-zinc-500"></i>
          <a href="${personalInfo.website}" target="_blank" class="hover:text-cyan-400 transition-colors">${personalInfo.website}</a>
        </div>
      </div>
    </header>

    <!-- Bio Panel -->
    <section class="glass-panel p-6 rounded-2xl shadow-lg">
      <h2 class="text-xs font-extrabold text-white tracking-widest uppercase border-b border-zinc-800 pb-2 mb-4">Executive Summary</h2>
      <p class="text-xs text-zinc-400 font-medium leading-relaxed">${personalInfo.bio}</p>
    </section>

    <!-- Tech Stack Grid -->
    <section class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="glass-panel p-5 rounded-2xl">
        <h3 class="text-[10px] font-extrabold text-zinc-500 tracking-widest uppercase mb-3">Languages</h3>
        <div class="flex flex-wrap gap-1.5">
          ${skills.languages.map(l => `<span class="px-2.5 py-1 rounded bg-zinc-950/80 border border-zinc-800 text-xs font-bold text-zinc-300">${l}</span>`).join('')}
        </div>
      </div>
      <div class="glass-panel p-5 rounded-2xl">
        <h3 class="text-[10px] font-extrabold text-zinc-500 tracking-widest uppercase mb-3">Frameworks</h3>
        <div class="flex flex-wrap gap-1.5">
          ${skills.frameworks.map(f => `<span class="px-2.5 py-1 rounded bg-zinc-950/80 border border-zinc-800 text-xs font-bold text-zinc-300">${f}</span>`).join('')}
        </div>
      </div>
      <div class="glass-panel p-5 rounded-2xl">
        <h3 class="text-[10px] font-extrabold text-zinc-500 tracking-widest uppercase mb-3">Tools & Methods</h3>
        <div class="flex flex-wrap gap-1.5">
          ${skills.tools.map(t => `<span class="px-2.5 py-1 rounded bg-zinc-950/80 border border-zinc-800 text-xs font-bold text-zinc-300">${t}</span>`).join('')}
        </div>
      </div>
    </section>

    <!-- Showcased Projects -->
    <section class="glass-panel p-6 rounded-2xl">
      <h2 class="text-xs font-extrabold text-white tracking-widest uppercase border-b border-zinc-800 pb-2 mb-6">Highlighted Showcases</h2>
      <div class="space-y-6">
        ${highlightedProjects.map(proj => `
        <div class="group relative">
          <div class="flex justify-between items-start mb-2">
            <div class="flex items-center gap-2.5">
              <div class="p-1 rounded bg-cyan-500/10 text-cyan-400">
                <i data-lucide="file-code" class="w-4 h-4"></i>
              </div>
              <h3 class="text-sm font-bold text-white group-hover:text-cyan-400 transition-colors">${proj.name}</h3>
              <span class="px-1.5 py-0.5 rounded text-[8px] font-extrabold bg-zinc-800 text-zinc-400 border border-zinc-700 uppercase">${proj.language}</span>
            </div>
            ${proj.githubUrl ? `
            <a href="${proj.githubUrl}" target="_blank" class="text-[10px] font-bold text-cyan-400 hover:underline flex items-center gap-1">
              Source Code <i data-lucide="external-link" class="w-3 h-3"></i>
            </a>` : ''}
          </div>
          <p class="text-xs text-zinc-400 font-medium leading-relaxed mb-3">${proj.description}</p>
          <ul class="space-y-1.5 pl-6">
            ${proj.advantages.map(adv => `<li class="text-xs text-zinc-300 font-medium list-disc leading-relaxed">${adv}</li>`).join('')}
          </ul>
        </div>
        `).join('<div class="h-[1px] bg-zinc-800/80 my-5"></div>')}
      </div>
    </section>

    <!-- Work Experience -->
    <section class="glass-panel p-6 rounded-2xl">
      <h2 class="text-xs font-extrabold text-white tracking-widest uppercase border-b border-zinc-800 pb-2 mb-6">Work Experience</h2>
      <div class="space-y-6">
        ${experience.map(exp => `
        <div>
          <div class="flex justify-between items-center mb-2 flex-wrap gap-2">
            <div>
              <h3 class="text-sm font-bold text-white">${exp.role}</h3>
              <span class="text-xs font-bold text-cyan-400">${exp.company}</span>
            </div>
            <span class="text-xs font-bold text-zinc-500 flex items-center gap-1">
              <i data-lucide="calendar" class="w-3.5 h-3.5"></i>
              ${exp.duration}
            </span>
          </div>
          <ul class="space-y-1.5 pl-6">
            ${exp.bullets.map(b => `<li class="text-xs text-zinc-400 font-medium list-disc leading-relaxed">${b}</li>`).join('')}
          </ul>
        </div>
        `).join('<div class="h-[1px] bg-zinc-800/80 my-5"></div>')}
      </div>
    </section>

    <!-- Education Grid -->
    <section class="glass-panel p-6 rounded-2xl">
      <h2 class="text-xs font-extrabold text-white tracking-widest uppercase border-b border-zinc-800 pb-2 mb-4">Education</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        ${education.map(edu => `
        <div class="p-4 rounded-xl bg-zinc-950/40 border border-zinc-800/50">
          <h3 class="text-xs font-bold text-white">${edu.degree}</h3>
          <div class="flex justify-between items-center text-[10px] text-zinc-400 font-semibold mt-1">
            <span>${edu.school}</span>
            <span class="text-zinc-500">${edu.year}</span>
          </div>
        </div>
        `).join('')}
      </div>
    </section>

    <!-- Footer Command -->
    <footer class="text-center text-[10px] font-bold text-zinc-600 tracking-wider">
      COMPILATION PIPELINE COGNITIVE V1.0 • SHIFTING STANDARDS
    </footer>

  </div>

  <script>
    // Initialize all Lucide Icons in the standalone template!
    lucide.createIcons();
  </script>
</body>
</html>`;

    // Download dynamic compiled file
    const element = document.createElement("a");
    const file = new Blob([htmlContent], { type: 'text/html' });
    element.href = URL.createObjectURL(file);
    element.download = `${personalInfo.fullName.replace(' ', '_')}_Interactive_Resume.html`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);

    setTimeout(() => {
      setIsExporting(false);
      setSuccessMsg('Portfolio compiled successfully! File downloaded.');
    }, 800);
  };

  return (
    <div className="p-5 rounded-xl border border-zinc-800 bg-zinc-900/50 backdrop-blur-md relative overflow-hidden shadow-lg shadow-black/30">
      <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-blue-500/5 blur-3xl pointer-events-none"></div>

      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 rounded-lg bg-zinc-800 text-blue-400">
          <Globe className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-sm font-extrabold text-white tracking-wide uppercase">Publishing Core</h3>
          <p className="text-xs text-zinc-400 font-medium">Export print-ready PDFs or self-contained pages</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={handlePrint}
          className="h-10 px-4 rounded-lg bg-zinc-800 hover:bg-zinc-700 border border-zinc-700/50 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
        >
          <Download className="w-3.5 h-3.5 text-zinc-400" />
          <span>Print / Save PDF</span>
        </button>
        <button
          onClick={handleExportHtml}
          disabled={isExporting}
          className="h-10 px-4 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 disabled:opacity-50"
        >
          <Share2 className="w-3.5 h-3.5" />
          <span>Export Web App</span>
        </button>
      </div>

      {successMsg && (
        <div className="mt-3 p-2.5 rounded-lg bg-blue-950/30 border border-blue-800/40 text-xs font-medium text-blue-300 flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-blue-400" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Deploy instructions accordion */}
      <div className="mt-4 pt-4 border-t border-zinc-800/60">
        <span className="text-[9px] font-extrabold uppercase text-zinc-500 tracking-wider mb-2 block">Vercel & Github Pages Deployment</span>
        <div className="p-3 rounded-lg bg-zinc-950 text-[10px] font-semibold text-zinc-400 leading-normal border border-zinc-900 flex flex-col gap-1.5">
          <div className="flex items-center gap-1.5 text-white">
            <Cpu className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
            <span>Hosting Steps:</span>
          </div>
          <div className="flex items-start gap-1">
            <ChevronRight className="w-3 h-3 text-cyan-500 mt-0.5 flex-shrink-0" />
            <span>Drag & drop the exported `.html` file onto **Netlify Drop** or **Vercel** for instant 2-second live hosting.</span>
          </div>
          <div className="flex items-start gap-1">
            <ChevronRight className="w-3 h-3 text-cyan-500 mt-0.5 flex-shrink-0" />
            <span>Rename the exported file to `index.html`, push to a new repo, and enable **GitHub Pages**!</span>
          </div>
        </div>
      </div>
    </div>
  );
}
