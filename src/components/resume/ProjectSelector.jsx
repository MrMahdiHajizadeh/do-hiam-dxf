import React, { useState } from 'react';
import { useResumeStore } from '../../store/resumeStore';
import { Check, Plus, Trash2, Award, ExternalLink, Settings, Sparkles, FileCode, CheckSquare, Square } from 'lucide-react';

export default function ProjectSelector() {
  const { 
    projects, 
    toggleProjectHighlight, 
    addProject, 
    removeProject, 
    updateProject 
  } = useResumeStore();

  const [showAddModal, setShowAddModal] = useState(false);
  const [newProjName, setNewProjName] = useState('');
  const [newProjDesc, setNewProjDesc] = useState('');
  const [newProjLang, setNewProjLang] = useState('TypeScript');
  const [newProjTechs, setNewProjTechs] = useState('');
  const [newProjAdvantages, setNewProjAdvantages] = useState('');
  
  const [editProjId, setEditProjId] = useState(null);
  const [editProjAdvantages, setEditProjAdvantages] = useState('');

  const handleAddProject = (e) => {
    e.preventDefault();
    if (!newProjName) return;

    const parsedTechs = newProjTechs.split(',').map(t => t.trim()).filter(Boolean);
    const parsedAdvantages = newProjAdvantages.split('\n').map(a => a.trim()).filter(Boolean);

    // Dynamic heuristic scoring for custom projects
    let score = 85;
    if (newProjLang.toLowerCase() === 'rust') score = 96;
    if (newProjLang.toLowerCase() === 'c#') score = 94;
    if (newProjLang.toLowerCase() === 'assembly') score = 97;
    if (parsedTechs.includes('Three.js') || parsedTechs.includes('WebGL')) score = 98;
    if (newProjName.toLowerCase().includes('ide') || newProjName.toLowerCase().includes('editor')) score = 96;

    addProject({
      name: newProjName,
      description: newProjDesc,
      language: newProjLang,
      techStack: parsedTechs.length ? parsedTechs : [newProjLang],
      employabilityScore: score,
      isHighlighted: true,
      githubUrl: '',
      advantages: parsedAdvantages.length ? parsedAdvantages : [
        `Showcases architectural skills and software design using ${newProjLang}.`,
        `Integrated customized libraries configured in ${parsedTechs.join(', ') || newProjLang}.`,
        'Demonstrates clean development documentation and production ready standards.'
      ]
    });

    // Reset Form
    setNewProjName('');
    setNewProjDesc('');
    setNewProjLang('TypeScript');
    setNewProjTechs('');
    setNewProjAdvantages('');
    setShowAddModal(false);
  };

  const startEditAdvantages = (proj) => {
    setEditProjId(proj.id);
    setEditProjAdvantages(proj.advantages.join('\n'));
  };

  const saveEditAdvantages = (projId) => {
    const updatedAdvantages = editProjAdvantages.split('\n').map(a => a.trim()).filter(Boolean);
    updateProject(projId, { advantages: updatedAdvantages });
    setEditProjId(null);
  };

  // Helper for scoring coloring
  const getScoreColor = (score) => {
    if (score >= 95) return 'from-emerald-400 to-green-500 text-emerald-400 border-emerald-500/30';
    if (score >= 90) return 'from-cyan-400 to-blue-500 text-cyan-400 border-cyan-500/30';
    return 'from-amber-400 to-orange-500 text-amber-400 border-amber-500/30';
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Selector Header */}
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <div>
          <h3 className="text-sm font-extrabold text-white uppercase tracking-wider">Showcased Projects</h3>
          <p className="text-xs text-zinc-400 font-medium">Select and custom audit repositories for CV inclusion</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="h-8 px-3 rounded-lg bg-zinc-800 hover:bg-zinc-700 border border-zinc-700/50 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer hover:border-cyan-500/30"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Project</span>
        </button>
      </div>

      {/* Projects Grid Container */}
      <div className="flex-1 min-h-0 overflow-y-auto space-y-3 pr-1">
        {projects.map((project) => {
          const isSelected = project.isHighlighted;
          const scoreColor = getScoreColor(project.employabilityScore);

          return (
            <div 
              key={project.id}
              className={`p-4 rounded-xl border transition-all duration-300 relative ${
                isSelected 
                  ? 'bg-zinc-900/80 border-cyan-500/30 shadow-lg shadow-cyan-950/5' 
                  : 'bg-zinc-900/30 border-zinc-800/80 opacity-60 hover:opacity-90'
              }`}
            >
              {/* Highlight toggle check icon */}
              <button 
                onClick={() => toggleProjectHighlight(project.id)}
                className="absolute top-4 right-4 p-1 rounded-md text-zinc-500 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
                title={isSelected ? "Remove from CV" : "Include in CV"}
              >
                {isSelected ? (
                  <CheckSquare className="w-5 h-5 text-cyan-400" />
                ) : (
                  <Square className="w-5 h-5 text-zinc-600" />
                )}
              </button>

              <div className="flex gap-4">
                {/* Score Indicator Badge */}
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${scoreColor.replace('text', 'bg').replace('border', 'bg')}/10 border flex flex-col items-center justify-center font-bold text-center`}>
                  <span className={`text-base font-extrabold tracking-tighter ${scoreColor.split(' ')[2]}`}>
                    {project.employabilityScore}
                  </span>
                  <span className="text-[7px] font-extrabold uppercase text-zinc-500 leading-none">Impact</span>
                </div>

                <div className="flex-1 min-w-0 pr-6">
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    <h4 className="text-xs font-bold text-white tracking-wide truncate">{project.name}</h4>
                    {project.custom && (
                      <span className="px-1.5 py-0.5 rounded text-[8px] font-extrabold bg-purple-500/10 text-purple-400 border border-purple-500/20 uppercase tracking-widest">
                        Custom
                      </span>
                    )}
                    <span className={`px-1.5 py-0.5 rounded text-[8px] font-extrabold border uppercase tracking-wider ${
                      project.private 
                        ? 'bg-red-500/5 text-red-400 border-red-500/10' 
                        : 'bg-green-500/5 text-green-400 border-green-500/10'
                    }`}>
                      {project.private ? 'Private' : 'Public'}
                    </span>
                    <span className="px-1.5 py-0.5 rounded text-[8px] font-extrabold bg-zinc-800 text-zinc-400 border border-zinc-700/50 uppercase">
                      {project.language}
                    </span>
                  </div>

                  <p className="text-[11px] text-zinc-400 font-medium leading-relaxed mb-3">
                    {project.description}
                  </p>

                  {/* Dynamic Tech Badges */}
                  <div className="flex flex-wrap gap-1 mb-3">
                    {project.techStack.map((tech) => (
                      <span key={tech} className="px-2 py-0.5 rounded-md text-[9px] font-bold bg-zinc-950 text-zinc-400 border border-zinc-800">
                        {tech}
                      </span>
                    ))}
                  </div>

                  {/* Core Advantages List */}
                  <div className="mt-3 border-t border-zinc-800/80 pt-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-extrabold uppercase text-zinc-500 tracking-wider flex items-center gap-1">
                        <Award className="w-3 h-3 text-cyan-400" />
                        Key Employability Stature
                      </span>
                      {editProjId !== project.id ? (
                        <button 
                          onClick={() => startEditAdvantages(project)}
                          className="text-[9px] font-bold text-zinc-400 hover:text-white cursor-pointer flex items-center gap-1"
                        >
                          <Settings className="w-2.5 h-2.5" /> Edit Advantages
                        </button>
                      ) : (
                        <button 
                          onClick={() => saveEditAdvantages(project.id)}
                          className="text-[9px] font-bold text-cyan-400 hover:text-white cursor-pointer flex items-center gap-1"
                        >
                          <Check className="w-2.5 h-2.5" /> Save Advantages
                        </button>
                      )}
                    </div>

                    {editProjId === project.id ? (
                      <textarea
                        value={editProjAdvantages}
                        onChange={(e) => setEditProjAdvantages(e.target.value)}
                        className="w-full p-2 text-[10px] font-semibold bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-200 focus:outline-none focus:border-cyan-500"
                        rows={3}
                        placeholder="Enter each advantage on a new line"
                      />
                    ) : (
                      <ul className="space-y-1.5">
                        {project.advantages.map((adv, i) => (
                          <li key={i} className="text-[10px] font-semibold text-zinc-300 leading-normal flex items-start gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-cyan-500/80 mt-1 flex-shrink-0"></span>
                            <span>{adv}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  {/* Action buttons (Trash if custom) */}
                  {project.custom && (
                    <div className="mt-3 pt-3 border-t border-zinc-800/50 flex justify-end">
                      <button 
                        onClick={() => removeProject(project.id)}
                        className="p-1 rounded text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer"
                        title="Delete custom project"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Custom Project Modal Overlay */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-xl bg-zinc-900 border border-zinc-800 p-6 relative overflow-hidden animate-zoomIn">
            <h4 className="text-sm font-extrabold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              Add Custom Showcase Project
            </h4>
            
            <form onSubmit={handleAddProject} className="space-y-4 text-xs">
              <div>
                <label className="block text-zinc-400 font-bold mb-1">Project Name *</label>
                <input
                  type="text"
                  required
                  value={newProjName}
                  onChange={(e) => setNewProjName(e.target.value)}
                  placeholder="e.g. Sora Developer IDE"
                  className="w-full p-2.5 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-zinc-400 font-bold mb-1">Brief Description *</label>
                <textarea
                  required
                  value={newProjDesc}
                  onChange={(e) => setNewProjDesc(e.target.value)}
                  placeholder="High quality description of technical mechanics..."
                  rows={2}
                  className="w-full p-2.5 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-400 font-bold mb-1">Primary Language</label>
                  <select
                    value={newProjLang}
                    onChange={(e) => setNewProjLang(e.target.value)}
                    className="w-full p-2.5 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-200 focus:outline-none focus:border-cyan-500"
                  >
                    <option value="TypeScript">TypeScript</option>
                    <option value="Rust">Rust</option>
                    <option value="Assembly">Assembly</option>
                    <option value="C#">C#</option>
                    <option value="Dart">Dart</option>
                    <option value="Python">Python</option>
                    <option value="JavaScript">JavaScript</option>
                  </select>
                </div>
                <div>
                  <label className="block text-zinc-400 font-bold mb-1">Tech Stack (comma-separated)</label>
                  <input
                    type="text"
                    value={newProjTechs}
                    onChange={(e) => setNewProjTechs(e.target.value)}
                    placeholder="Three.js, React, Monaco"
                    className="w-full p-2.5 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-400 font-bold mb-1">Hiring Advantages (one per line)</label>
                <textarea
                  value={newProjAdvantages}
                  onChange={(e) => setNewProjAdvantages(e.target.value)}
                  placeholder="e.g. Optimized virtual window trees rendering (Three.js/WebGL)"
                  rows={3}
                  className="w-full p-2.5 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 h-9 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 h-9 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold cursor-pointer"
                >
                  Add Showcase
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
